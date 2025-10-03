import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, apiUrl, apiKey, ...params } = await req.json()

    if (!apiUrl || !apiKey) {
      return new Response(
        JSON.stringify({ error: 'API URL and API Key are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate API URL format
    const urlPattern = /^https:\/\/[a-zA-Z0-9-]+\.api-us[0-9]+\.com$/
    if (!urlPattern.test(apiUrl)) {
      return new Response(
        JSON.stringify({ error: 'Invalid ActiveCampaign API URL format' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    let endpoint = ''
    let options: RequestInit = {
      headers: {
        'Api-Token': apiKey,
        'Content-Type': 'application/json',
      }
    }

    switch (action) {
      case 'test-connection':
        endpoint = `${apiUrl}/api/3/users/me`
        break
      
      case 'get-lists':
        endpoint = `${apiUrl}/api/3/lists`
        break
      
      case 'get-tags':
        endpoint = `${apiUrl}/api/3/tags`
        break
      
      case 'get-automations':
        endpoint = `${apiUrl}/api/3/automations`
        break
      
      case 'add-contact':
        endpoint = `${apiUrl}/api/3/contacts`
        options.method = 'POST'
        options.body = JSON.stringify({
          contact: {
            email: params.email,
            firstName: params.firstName,
            lastName: params.lastName,
            phone: params.phone,
          }
        })
        break
      
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
    }

    console.log(`Making request to: ${endpoint}`)
    
    const response = await fetch(endpoint, options)
    const data = await response.json()

    if (!response.ok) {
      // Handle specific ActiveCampaign errors
      if (response.status === 403) {
        return new Response(
          JSON.stringify({ 
            error: 'Invalid API credentials. Please check your API URL and API Key.',
            code: 'INVALID_CREDENTIALS'
          }),
          { 
            status: 403, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
      
      if (response.status === 401) {
        return new Response(
          JSON.stringify({ 
            error: 'Authentication failed. Please verify your API Key.',
            code: 'AUTH_FAILED'
          }),
          { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      return new Response(
        JSON.stringify({ 
          error: data.message || 'ActiveCampaign API error',
          code: 'API_ERROR',
          status: response.status
        }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data,
        isReal: true // Flag to indicate this is real data
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in ActiveCampaign API function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
        message: error.message
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})