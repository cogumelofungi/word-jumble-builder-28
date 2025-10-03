import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@18.5.0"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper logging function
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CANCEL-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  logStep(`${req.method} ${req.url} - Starting cancel subscription request`);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    
    if (!supabaseUrl || !serviceRoleKey || !stripeKey) {
      logStep('Missing environment variables', { supabaseUrl: !!supabaseUrl, serviceRoleKey: !!serviceRoleKey, stripeKey: !!stripeKey });
      throw new Error('Server configuration error - missing environment variables');
    }

    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Get and validate authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logStep('No authorization header or invalid format');
      throw new Error('Unauthorized - No valid authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    logStep('Validating user token...');

    // Validate the user token
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      logStep('Token validation failed', userError?.message);
      throw new Error('Unauthorized - Invalid or expired token');
    }

    logStep(`Token validated for user: ${user.id} (${user.email})`);

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Find Stripe customer by email
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep('No Stripe customer found for user');
      throw new Error('Nenhuma assinatura ativa encontrada para este usuário');
    }

    const customerId = customers.data[0].id;
    logStep('Found Stripe customer', { customerId });

    // Get active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 10,
    });

    if (subscriptions.data.length === 0) {
      logStep('No active subscriptions found');
      throw new Error('Nenhuma assinatura ativa encontrada para cancelar');
    }

    logStep(`Found ${subscriptions.data.length} active subscription(s)`);

    // Cancel all active subscriptions at period end
    const cancelledSubscriptions = [];
    for (const subscription of subscriptions.data) {
      logStep(`Cancelling subscription: ${subscription.id}`);
      
      const cancelledSub = await stripe.subscriptions.update(subscription.id, {
        cancel_at_period_end: true
      });
      
      cancelledSubscriptions.push({
        id: cancelledSub.id,
        cancel_at_period_end: cancelledSub.cancel_at_period_end,
        current_period_end: new Date(cancelledSub.current_period_end * 1000).toISOString()
      });
      
      logStep(`Subscription ${subscription.id} scheduled for cancellation`, {
        cancel_at_period_end: cancelledSub.cancel_at_period_end,
        period_end: new Date(cancelledSub.current_period_end * 1000).toISOString()
      });
    }

    logStep('All subscriptions cancelled successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Assinatura cancelada com sucesso. Você manterá acesso até o final do período pago.',
        cancelled_subscriptions: cancelledSubscriptions
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );

  } catch (error) {
    logStep('ERROR in cancel-subscription function', error);
    
    const errorMessage = error.message || 'Erro desconhecido';
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
})