import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function for debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    // Create a Supabase client using the anon key
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Parse request body
    const { planId, billingCycle = "monthly" } = await req.json();
    if (!planId) throw new Error("Plan ID is required");
    logStep("Request parsed", { planId, billingCycle });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Check if a Stripe customer already exists for this user
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing Stripe customer", { customerId });
    } else {
      logStep("No existing customer found, will create new one in checkout");
    }

    // Map plan IDs to Stripe price IDs (using correct price IDs)
    const planPriceMapping: Record<string, { monthly: string, yearly: string }> = {
      "032abf21-7e33-4f8f-95fd-ef5663657b77": { 
        monthly: "price_1S8tZrCOewOtyI3vC885sATh", 
        yearly: "price_1S9Dt9COewOtyI3voL5pMweg" 
      }, // Essencial
      "7f0d0db4-e737-49be-ab41-f2003f908f9e": { 
        monthly: "price_1S8tacCOewOtyI3vbf66tyn5", 
        yearly: "price_1S9DtuCOewOtyI3vZjroZmSA" 
      }, // Profissional  
      "d5d63472-a5a6-4fec-a4e0-1abb12fe9cb7": { 
        monthly: "price_1S8tbCCOewOtyI3vDBtmjQQY", 
        yearly: "price_1S9DuXCOewOtyI3vPhYIn62j" 
      }, // Empresarial
    };

    const planPrices = planPriceMapping[planId];
    if (!planPrices) {
      throw new Error(`No Stripe price found for plan ID: ${planId}`);
    }
    
    const stripePriceId = billingCycle === "yearly" ? planPrices.yearly : planPrices.monthly;
    logStep("Mapped plan to Stripe price", { planId, billingCycle, stripePriceId });

    // Create the checkout session
    const origin = req.headers.get("origin") || "http://localhost:3000";
    
    // Check if this is the Essencial plan to add trial period
    const isEssencialPlan = planId === "032abf21-7e33-4f8f-95fd-ef5663657b77";
    
    const sessionConfig: any = {
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing`,
      metadata: {
        user_id: user.id,
        plan_id: planId,
        billing_cycle: billingCycle,
      },
    };

    // Add trial period only for Essencial plan
    if (isEssencialPlan) {
      sessionConfig.subscription_data = {
        trial_period_days: 7,
      };
      logStep("Added 7-day trial for Essencial plan");
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-checkout", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});