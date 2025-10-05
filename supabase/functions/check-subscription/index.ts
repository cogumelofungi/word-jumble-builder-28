import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function for enhanced debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
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

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    logStep("Authenticating user with token");
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { data: userStatus } = await supabaseClient
      .from('user_status')
      .select('bypass_stripe_check, plan_id')
      .eq('user_id', user.id)
      .single();
    
    // Se tem bypass_stripe_check = true, NÃO atualizar via Stripe
    if (userStatus?.bypass_stripe_check) {
      logStep("User has bypass_stripe_check, skipping Stripe sync");
      
      // Retornar o plano do Supabase ao invés do Stripe
      const { data: planData } = await supabaseClient
        .from('user_status')
        .select(`
          plan_id,
          plans (
            name,
            price
          )
        `)
        .eq('user_id', user.id)
        .single();
      
      return new Response(JSON.stringify({
        subscribed: planData?.plan_id !== null,
        planName: planData?.plans?.name || "Gratuito",
        product_id: null,
        subscription_end: null,
        bypass_stripe: true
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
        
        const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
        const customers = await stripe.customers.list({ email: user.email, limit: 1 });
        
        if (customers.data.length === 0) {
          logStep("No customer found, updating unsubscribed state");
          // Update user status to free plan
          await supabaseClient
            .from('user_status')
            .upsert({ 
              user_id: user.id, 
              plan_id: null, 
              is_active: true 
            });
          
          return new Response(JSON.stringify({ subscribed: false, planName: "Gratuito" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });
    const hasActiveSub = subscriptions.data.length > 0;
    let planId = null;
    let planName = "Gratuito";
    let productId = null;
    let subscriptionEnd = null;

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      logStep("Active subscription found", { subscriptionId: subscription.id, endDate: subscriptionEnd });
      
      // Get the product ID from subscription
      productId = subscription.items.data[0].price.product;
      
      // Get the price ID and map to our plan
      const priceId = subscription.items.data[0].price.id;
      const planMapping: Record<string, { id: string, name: string }> = {
        // Planos mensais
        "price_1S8tZrCOewOtyI3vC885sATh": { id: "032abf21-7e33-4f8f-95fd-ef5663657b77", name: "Essencial" },
        "price_1S8tacCOewOtyI3vbf66tyn5": { id: "7f0d0db4-e737-49be-ab41-f2003f908f9e", name: "Profissional" },
        "price_1S8tbCCOewOtyI3vDBtmjQQY": { id: "d5d63472-a5a6-4fec-a4e0-1abb12fe9cb7", name: "Empresarial" },
        // Planos anuais
        "price_1S9Dt9COewOtyI3voL5pMweg": { id: "032abf21-7e33-4f8f-95fd-ef5663657b77", name: "Essencial" },
        "price_1S9DtuCOewOtyI3vZjroZmSA": { id: "7f0d0db4-e737-49be-ab41-f2003f908f9e", name: "Profissional" },
        "price_1S9DuXCOewOtyI3vPhYIn62j": { id: "d5d63472-a5a6-4fec-a4e0-1abb12fe9cb7", name: "Empresarial" },
      };
      
      const mappedPlan = planMapping[priceId];
      if (mappedPlan) {
        planId = mappedPlan.id;
        planName = mappedPlan.name;
        logStep("Determined subscription plan", { planId, planName, productId });
        
        // Update user status in Supabase
        await supabaseClient
          .from('user_status')
          .upsert({ 
            user_id: user.id, 
            plan_id: planId, 
            is_active: true 
          });
      }
    } else {
      logStep("No active subscription found");
      // Update user status to free plan
      await supabaseClient
        .from('user_status')
        .upsert({ 
          user_id: user.id, 
          plan_id: null, 
          is_active: true 
        });
    }

    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      planName: planName,
      product_id: productId,
      subscription_end: subscriptionEnd
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
