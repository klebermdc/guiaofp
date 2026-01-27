import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";
import { encode as encodeBase64 } from "https://deno.land/std@0.190.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PushPayload {
  title: string;
  body: string;
  tag?: string;
  data?: Record<string, any>;
  actions?: Array<{ action: string; title: string }>;
}

interface SendPushRequest {
  user_ids?: string[];
  payload: PushPayload;
}

// Convert URL-safe base64 to standard base64
function urlBase64ToBase64(urlBase64: string): string {
  let base64 = urlBase64.replace(/-/g, '+').replace(/_/g, '/');
  const padding = (4 - base64.length % 4) % 4;
  base64 += '='.repeat(padding);
  return base64;
}

// Convert base64 to Uint8Array
function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Convert Uint8Array to URL-safe base64
function uint8ArrayToUrlBase64(array: Uint8Array): string {
  const base64 = encodeBase64(array.buffer as ArrayBuffer);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Generate ECDH shared secret and encrypt payload
async function encryptPayload(
  payload: string,
  p256dh: string,
  auth: string
): Promise<{ ciphertext: Uint8Array; salt: Uint8Array; localPublicKey: Uint8Array }> {
  // Generate local key pair for ECDH
  const localKeyPair = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveBits']
  );

  // Import subscriber's public key
  const subscriberPublicKeyBytes = base64ToUint8Array(urlBase64ToBase64(p256dh));
  const subscriberPublicKey = await crypto.subtle.importKey(
    'raw',
    new Uint8Array(subscriberPublicKeyBytes).buffer as ArrayBuffer,
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    []
  );

  // Derive shared secret
  const sharedSecret = await crypto.subtle.deriveBits(
    { name: 'ECDH', public: subscriberPublicKey },
    localKeyPair.privateKey,
    256
  );

  // Export local public key
  const localPublicKeyExported = await crypto.subtle.exportKey('raw', localKeyPair.publicKey);
  const localPublicKey = new Uint8Array(localPublicKeyExported);

  // Generate random salt (16 bytes)
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // Auth secret
  const authSecret = base64ToUint8Array(urlBase64ToBase64(auth));

  // Derive encryption key using HKDF
  const sharedSecretKey = await crypto.subtle.importKey(
    'raw',
    sharedSecret,
    { name: 'HKDF' },
    false,
    ['deriveBits', 'deriveKey']
  );

  // PRK = HKDF-Extract(auth, sharedSecret)
  const authInfo = new TextEncoder().encode('Content-Encoding: auth\0');
  const prkBits = await crypto.subtle.deriveBits(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: new Uint8Array(authSecret).buffer as ArrayBuffer,
      info: authInfo,
    },
    sharedSecretKey,
    256
  );

  const prk = await crypto.subtle.importKey(
    'raw',
    prkBits,
    { name: 'HKDF' },
    false,
    ['deriveBits', 'deriveKey']
  );

  // Create context for key derivation
  const keyLabel = new TextEncoder().encode('Content-Encoding: aes128gcm\0');
  const nonceLabel = new TextEncoder().encode('Content-Encoding: nonce\0');

  // Derive content encryption key (CEK) - 16 bytes for AES-128-GCM
  const cekBits = await crypto.subtle.deriveBits(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: new Uint8Array(salt).buffer as ArrayBuffer,
      info: keyLabel,
    },
    prk,
    128
  );

  const cek = await crypto.subtle.importKey(
    'raw',
    cekBits,
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );

  // Derive nonce - 12 bytes
  const nonceBits = await crypto.subtle.deriveBits(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: new Uint8Array(salt).buffer as ArrayBuffer,
      info: nonceLabel,
    },
    prk,
    96
  );

  const nonce = new Uint8Array(nonceBits);

  // Encode payload with padding
  const payloadBytes = new TextEncoder().encode(payload);
  const paddingLength = 0;
  const paddedPayload = new Uint8Array(payloadBytes.length + 1 + paddingLength);
  paddedPayload.set(payloadBytes);
  paddedPayload[payloadBytes.length] = 2; // Record delimiter

  // Encrypt
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: nonce },
    cek,
    paddedPayload
  );

  return {
    ciphertext: new Uint8Array(encrypted),
    salt,
    localPublicKey,
  };
}

// Build the encrypted request body in aes128gcm format
function buildAes128gcmBody(
  ciphertext: Uint8Array,
  salt: Uint8Array,
  localPublicKey: Uint8Array,
  recordSize: number = 4096
): ArrayBuffer {
  // Header: salt (16) + rs (4) + idlen (1) + keyid (65 for uncompressed P-256)
  const header = new Uint8Array(16 + 4 + 1 + 65);
  header.set(salt, 0);
  
  // Record size as big-endian 32-bit
  const rsView = new DataView(header.buffer, 16, 4);
  rsView.setUint32(0, recordSize, false);
  
  // Key ID length and key
  header[20] = 65;
  header.set(localPublicKey, 21);

  // Combine header and ciphertext
  const body = new Uint8Array(header.length + ciphertext.length);
  body.set(header, 0);
  body.set(ciphertext, header.length);

  return body.buffer as ArrayBuffer;
}

async function sendWebPushNotification(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: PushPayload,
  vapidPublicKey: string,
  vapidPrivateKey: string
): Promise<{ success: boolean; status?: number; error?: string }> {
  try {
    const payloadString = JSON.stringify(payload);
    
    // Encrypt the payload
    const { ciphertext, salt, localPublicKey } = await encryptPayload(
      payloadString,
      subscription.p256dh,
      subscription.auth
    );

    // Build the body in aes128gcm format
    const body = buildAes128gcmBody(ciphertext, salt, localPublicKey);

    // Create VAPID authorization
    const endpoint = new URL(subscription.endpoint);
    const audience = `${endpoint.protocol}//${endpoint.host}`;
    const expiration = Math.floor(Date.now() / 1000) + 12 * 60 * 60; // 12 hours

    // Create JWT header and payload
    const header = { typ: 'JWT', alg: 'ES256' };
    const jwtPayload = {
      aud: audience,
      exp: expiration,
      sub: 'mailto:contato@ofpplanejador.com'
    };

    const headerB64 = uint8ArrayToUrlBase64(new TextEncoder().encode(JSON.stringify(header)));
    const payloadB64 = uint8ArrayToUrlBase64(new TextEncoder().encode(JSON.stringify(jwtPayload)));
    const unsignedToken = `${headerB64}.${payloadB64}`;

    // Import private key for signing
    const privateKeyBytes = base64ToUint8Array(urlBase64ToBase64(vapidPrivateKey));
    const publicKeyBytes = base64ToUint8Array(urlBase64ToBase64(vapidPublicKey));
    
    // Public key is 65 bytes: 0x04 || x (32 bytes) || y (32 bytes)
    const x = publicKeyBytes.slice(1, 33);
    const y = publicKeyBytes.slice(33, 65);

    const jwk = {
      kty: 'EC',
      crv: 'P-256',
      d: uint8ArrayToUrlBase64(privateKeyBytes),
      x: uint8ArrayToUrlBase64(x),
      y: uint8ArrayToUrlBase64(y),
    };

    const signingKey = await crypto.subtle.importKey(
      'jwk',
      jwk,
      { name: 'ECDSA', namedCurve: 'P-256' },
      false,
      ['sign']
    );

    // Sign the token
    const signatureArrayBuffer = await crypto.subtle.sign(
      { name: 'ECDSA', hash: 'SHA-256' },
      signingKey,
      new TextEncoder().encode(unsignedToken)
    );

    const signature = new Uint8Array(signatureArrayBuffer);
    const signatureB64 = uint8ArrayToUrlBase64(signature);
    const jwt = `${unsignedToken}.${signatureB64}`;

    // Build authorization header
    const authorization = `vapid t=${jwt}, k=${vapidPublicKey}`;

    console.log('Sending push to:', subscription.endpoint);
    console.log('Body length:', body.byteLength);

    const response = await fetch(subscription.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Encoding': 'aes128gcm',
        'Content-Length': body.byteLength.toString(),
        'TTL': '86400',
        'Authorization': authorization,
      },
      body: body,
    });

    console.log('Push response status:', response.status);

    if (response.status === 201 || response.status === 200) {
      await response.text();
      return { success: true, status: response.status };
    }

    const responseText = await response.text();
    console.log('Push error response:', responseText);

    if (response.status === 404 || response.status === 410) {
      return { success: false, status: response.status, error: 'Subscription expired' };
    }

    return { success: false, status: response.status, error: responseText };
  } catch (error: any) {
    console.error('Error sending push notification:', error);
    return { success: false, error: error.message };
  }
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY")!;
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY")!;
    
    if (!vapidPublicKey || !vapidPrivateKey) {
      throw new Error('VAPID keys not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { user_ids, payload }: SendPushRequest = await req.json();

    console.log('Received push request for user_ids:', user_ids);
    console.log('Payload:', JSON.stringify(payload));

    let query = supabase.from('push_subscriptions').select('*');
    
    if (user_ids && user_ids.length > 0) {
      query = query.in('user_id', user_ids);
    }

    const { data: subscriptions, error: subError } = await query;

    if (subError) {
      throw new Error(`Error fetching subscriptions: ${subError.message}`);
    }

    console.log('Found subscriptions:', subscriptions?.length || 0);

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: 'No subscriptions found' }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const results = {
      sent: 0,
      failed: 0,
      expired: [] as string[],
      errors: [] as string[],
    };

    for (const sub of subscriptions) {
      console.log(`Sending to user ${sub.user_id}, endpoint: ${sub.endpoint.substring(0, 50)}...`);
      
      const result = await sendWebPushNotification(
        {
          endpoint: sub.endpoint,
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
        payload,
        vapidPublicKey,
        vapidPrivateKey
      );

      if (result.success) {
        console.log(`Successfully sent to ${sub.user_id}`);
        results.sent++;
      } else {
        console.log(`Failed to send to ${sub.user_id}: ${result.error}`);
        if (result.status === 404 || result.status === 410) {
          results.expired.push(sub.id);
        }
        results.failed++;
        results.errors.push(`${sub.user_id}: ${result.error}`);
      }
    }

    if (results.expired.length > 0) {
      console.log('Cleaning up expired subscriptions:', results.expired);
      await supabase
        .from('push_subscriptions')
        .delete()
        .in('id', results.expired);
    }

    return new Response(
      JSON.stringify({
        success: true,
        sent: results.sent,
        failed: results.failed,
        expired_cleaned: results.expired.length,
        errors: results.errors,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-push-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
