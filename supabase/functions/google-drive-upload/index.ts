
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Interface for Google Drive API responses
interface DriveFile {
  id: string;
  name: string;
  webViewLink?: string;
  webContentLink?: string;
}

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🚀 Starting Google Drive upload process')

    // Verificar autenticação - Bearer token no header Authorization
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('❌ Missing or invalid Authorization header')
      return new Response(
        JSON.stringify({ error: 'Authorization header with Bearer token required' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const token = authHeader.split(' ')[1]
    console.log('✅ Token received:', token.substring(0, 20) + '...')

    // Obter credenciais do Google Service Account das variáveis de ambiente
    const serviceAccountEmail = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_EMAIL')
    const serviceAccountPrivateKey = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY')
    const driveFolderId = Deno.env.get('DRIVE_FOLDER_ID')

    if (!serviceAccountEmail || !serviceAccountPrivateKey || !driveFolderId) {
      console.error('❌ Missing Google Drive configuration')
      return new Response(
        JSON.stringify({ 
          error: 'Google Drive configuration missing',
          details: 'GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY, and DRIVE_FOLDER_ID must be set'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('✅ Google Drive credentials loaded')

    // Parse do multipart/form-data
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      console.error('❌ No file provided in request')
      return new Response(
        JSON.stringify({ error: 'No file provided. Send file as multipart/form-data with key "file"' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`📄 File received: ${file.name} (${file.size} bytes, ${file.type})`)

    // Converter o arquivo para buffer
    const fileBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(fileBuffer)

    console.log('🔑 Generating Google OAuth token...')

    // Gerar JWT para autenticação com Google APIs
    const now = Math.floor(Date.now() / 1000)
    const jwtHeader = {
      "alg": "RS256",
      "typ": "JWT"
    }

    const jwtPayload = {
      "iss": serviceAccountEmail,
      "scope": "https://www.googleapis.com/auth/drive.file",
      "aud": "https://oauth2.googleapis.com/token",
      "exp": now + 3600,
      "iat": now
    }

    // Função para codificar em base64url
    function base64urlEncode(data: string): string {
      return btoa(data)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '')
    }

    // Preparar dados para assinatura JWT
    const headerEncoded = base64urlEncode(JSON.stringify(jwtHeader))
    const payloadEncoded = base64urlEncode(JSON.stringify(jwtPayload))
    const signatureInput = `${headerEncoded}.${payloadEncoded}`

    // Importar a chave privada e assinar o JWT
    const privateKeyPem = serviceAccountPrivateKey.replace(/\\n/g, '\n')
    const pemHeader = "-----BEGIN PRIVATE KEY-----"
    const pemFooter = "-----END PRIVATE KEY-----"
    const pemContents = privateKeyPem.replace(pemHeader, "").replace(pemFooter, "").replace(/\s/g, "")
    
    const binaryDer = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0))
    
    const cryptoKey = await crypto.subtle.importKey(
      "pkcs8",
      binaryDer,
      {
        name: "RSASSA-PKCS1-v1_5",
        hash: "SHA-256"
      },
      false,
      ["sign"]
    )

    const signature = await crypto.subtle.sign(
      "RSASSA-PKCS1-v1_5",
      cryptoKey,
      new TextEncoder().encode(signatureInput)
    )

    const signatureBase64url = base64urlEncode(
      String.fromCharCode(...new Uint8Array(signature))
    )

    const jwt = `${signatureInput}.${signatureBase64url}`

    console.log('🔐 JWT generated, requesting access token...')

    // Trocar JWT por access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('❌ Token request failed:', errorText)
      throw new Error(`Failed to get access token: ${errorText}`)
    }

    const tokenData: GoogleTokenResponse = await tokenResponse.json()
    console.log('✅ Access token obtained')

    // Upload do arquivo para o Google Drive
    console.log('📤 Uploading file to Google Drive...')

    const boundary = '----formdata-boundary-' + Math.random().toString(36)
    const delimiter = `\r\n--${boundary}\r\n`
    const close_delim = `\r\n--${boundary}--`

    const metadata = {
      name: file.name,
      parents: [driveFolderId]
    }

    let multipartRequestBody = delimiter
    multipartRequestBody += 'Content-Type: application/json\r\n\r\n'
    multipartRequestBody += JSON.stringify(metadata) + delimiter
    multipartRequestBody += `Content-Type: ${file.type || 'application/octet-stream'}\r\n\r\n`

    const multipartRequestBodyBytes = new TextEncoder().encode(multipartRequestBody)
    const closeDelimBytes = new TextEncoder().encode(close_delim)

    // Combinar partes do multipart
    const fullBody = new Uint8Array(
      multipartRequestBodyBytes.length + uint8Array.length + closeDelimBytes.length
    )
    fullBody.set(multipartRequestBodyBytes, 0)
    fullBody.set(uint8Array, multipartRequestBodyBytes.length)
    fullBody.set(closeDelimBytes, multipartRequestBodyBytes.length + uint8Array.length)

    const uploadResponse = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
        'Content-Length': fullBody.length.toString(),
      },
      body: fullBody
    })

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text()
      console.error('❌ Upload failed:', errorText)
      throw new Error(`Upload failed: ${uploadResponse.status} ${errorText}`)
    }

    const uploadResult: DriveFile = await uploadResponse.json()
    console.log('✅ File uploaded successfully:', uploadResult.id)

    // Tornar o arquivo público (opcional, remova se não necessário)
    console.log('🌐 Making file publicly accessible...')
    
    const permissionResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${uploadResult.id}/permissions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role: 'reader',
        type: 'anyone'
      })
    })

    if (!permissionResponse.ok) {
      console.warn('⚠️  Failed to make file public, but upload succeeded')
    } else {
      console.log('✅ File made publicly accessible')
    }

    // Gerar URL público do arquivo
    const publicUrl = `https://drive.google.com/file/d/${uploadResult.id}/view`
    const directDownloadUrl = `https://drive.google.com/uc?id=${uploadResult.id}&export=download`

    const result = {
      success: true,
      fileId: uploadResult.id,
      fileName: uploadResult.name,
      publicUrl: publicUrl,
      downloadUrl: directDownloadUrl,
      webViewLink: uploadResult.webViewLink,
      message: 'File uploaded successfully to Google Drive'
    }

    console.log('🎉 Upload process completed successfully')

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('💥 Error in Google Drive upload:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
