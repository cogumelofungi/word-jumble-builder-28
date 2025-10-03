import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log(`${req.method} ${req.url} - Starting delete user account request`);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Missing environment variables:', { supabaseUrl: !!supabaseUrl, serviceRoleKey: !!serviceRoleKey });
      throw new Error('Server configuration error - missing environment variables');
    }

    // Create admin client with service role key for all operations
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Get and validate authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('No authorization header or invalid format');
      throw new Error('Unauthorized - No valid authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('Validating user token...');

    // Validate the user token using admin client
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !user) {
      console.error('Token validation failed:', userError?.message);
      throw new Error('Unauthorized - Invalid or expired token');
    }

    console.log(`Token validated for user: ${user.id} (${user.email})`);

    // Parse request body to determine target user
    let targetUserId = user.id; // Default to self-deletion
    let isAdminDeletion = false;
    
    try {
      const requestText = await req.text();
      if (requestText) {
        const requestBody = JSON.parse(requestText);
        console.log('Request body:', requestBody);
        
        if (requestBody?.target_user_id && requestBody.target_user_id !== user.id) {
          console.log(`Admin deletion requested: ${user.id} wants to delete ${requestBody.target_user_id}`);
          
          // Verify admin permissions for deleting other users
          const { data: hasAdminRole, error: adminCheckError } = await supabaseAdmin.rpc('has_role', {
            _user_id: user.id,
            _role: 'admin'
          });
          
          if (adminCheckError) {
            console.error('Admin role check failed:', adminCheckError);
            throw new Error('Permission check failed');
          }
          
          if (!hasAdminRole) {
            console.error(`User ${user.id} does not have admin role`);
            throw new Error('Unauthorized - Admin access required to delete other users');
          }
          
          targetUserId = requestBody.target_user_id;
          isAdminDeletion = true;
          console.log(`Admin deletion authorized for user: ${targetUserId}`);
        }
      }
    } catch (e) {
      console.log('No request body or invalid JSON, proceeding with self-deletion');
    }

    console.log(`Starting deletion process for user: ${targetUserId} (${isAdminDeletion ? 'admin deletion' : 'self deletion'})`);

    // Step 1: Cancel Stripe subscriptions if user has email
    console.log('Step 1: Checking and cancelling Stripe subscriptions...');
    
    try {
      // Get user email for Stripe operations
      const { data: userData, error: userDataError } = await supabaseAdmin
        .from('profiles')
        .select('email')
        .eq('id', targetUserId)
        .maybeSingle();

      if (userDataError) {
        console.error('Error fetching user email:', userDataError);
      } else if (userData?.email) {
        const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
        if (stripeKey) {
          console.log(`Attempting to cancel Stripe subscriptions for email: ${userData.email}`);
          
          try {
            // Import Stripe dynamically to avoid issues if not available
            const Stripe = (await import('https://esm.sh/stripe@18.5.0')).default;
            const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

            // Find customer by email
            const customers = await stripe.customers.list({ email: userData.email, limit: 1 });
            
            if (customers.data.length > 0) {
              const customerId = customers.data[0].id;
              console.log(`Found Stripe customer: ${customerId}`);

              // Cancel all active subscriptions immediately
              const subscriptions = await stripe.subscriptions.list({
                customer: customerId,
                status: 'active',
                limit: 10,
              });

              for (const subscription of subscriptions.data) {
                console.log(`Cancelling subscription: ${subscription.id}`);
                await stripe.subscriptions.cancel(subscription.id);
                console.log(`✓ Cancelled subscription: ${subscription.id}`);
              }

              console.log(`✓ Successfully cancelled ${subscriptions.data.length} subscription(s)`);
            } else {
              console.log('No Stripe customer found for this email');
            }
          } catch (stripeError) {
            console.error('Error cancelling Stripe subscriptions:', stripeError);
            // Continue with account deletion even if Stripe operations fail
          }
        } else {
          console.log('STRIPE_SECRET_KEY not configured, skipping Stripe operations');
        }
      }
    } catch (error) {
      console.error('Error in Stripe cancellation step:', error);
      // Continue with account deletion even if Stripe operations fail
    }

    // Step 2: Delete all related data using admin client (bypasses RLS)
    console.log('Step 2: Deleting user-related data from public schema...');
    
    const deleteOperations = [
      // Delete user apps
      supabaseAdmin.from('apps').delete().eq('user_id', targetUserId),
      // Delete user roles
      supabaseAdmin.from('user_roles').delete().eq('user_id', targetUserId),
      // Delete user status
      supabaseAdmin.from('user_status').delete().eq('user_id', targetUserId),
      // Delete user profile (this should be last as other tables might reference it)
      supabaseAdmin.from('profiles').delete().eq('id', targetUserId)
    ];

    // Execute all delete operations
    const results = await Promise.allSettled(deleteOperations);
    
    // Log results of each operation
    const tableNames = ['apps', 'user_roles', 'user_status', 'profiles'];
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        console.log(`✓ Deleted ${tableNames[index]} records for user ${targetUserId}`);
      } else {
        console.error(`✗ Failed to delete ${tableNames[index]}:`, result.reason);
      }
    });

    // Check if any critical operations failed
    const criticalFailures = results.filter(result => result.status === 'rejected');
    if (criticalFailures.length > 0) {
      console.error('Some delete operations failed, but continuing with auth deletion...');
    }

    // Step 3: Delete user from auth.users
    console.log('Step 3: Deleting user from auth.users...');
    
    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(targetUserId);
    
    if (deleteAuthError) {
      console.error('Failed to delete user from auth.users:', deleteAuthError);
      throw new Error(`Failed to delete user from authentication: ${deleteAuthError.message}`);
    }

    console.log(`✓ Successfully deleted user ${targetUserId} from auth.users`);
    console.log(`🎉 User deletion completed successfully for: ${targetUserId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'User account deleted successfully',
        userId: targetUserId,
        deletionType: isAdminDeletion ? 'admin' : 'self'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );

  } catch (error) {
    console.error('❌ Error in delete-user-account function:', error);
    console.error('Error stack:', error.stack);
    
    // Return user-friendly error message
    const errorMessage = error.message || 'Unknown error occurred';
    
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