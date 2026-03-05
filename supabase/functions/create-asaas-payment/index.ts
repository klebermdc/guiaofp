import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ASAAS_API_KEY = Deno.env.get("ASAAS_API_KEY");
const ASAAS_BASE_URL = "https://api.asaas.com/v3"; // Production
// const ASAAS_BASE_URL = "https://sandbox.asaas.com/api/v3"; // Sandbox for testing

interface PaymentRequest {
  email: string;
  customerName: string;
  cpf?: string;
  cpfCnpj?: string;
  phone?: string;
  planKey: string;
  amountCents: number;
  originalAmountCents?: number;
  discountAmountCents?: number;
  couponCode?: string | null;
  paymentMethod?: "pix" | "boleto" | "credit_card";
  billingType?: "PIX" | "BOLETO" | "CREDIT_CARD";
  creditCard?: {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
  };
  creditCardHolderInfo?: {
    name: string;
    email: string;
    cpfCnpj: string;
    postalCode: string;
    addressNumber: string;
    phone: string;
  };
  termsAccepted?: boolean;
  termsVersion?: string;
  trackingContext?: {
    fbp?: string | null;
    fbc?: string | null;
    client_id?: string | null;
    event_id?: string | null;
    user_agent?: string | null;
    page_location?: string | null;
  };
}

async function createOrGetCustomer(email: string, name: string, cpf: string): Promise<string> {
  // First, try to find existing customer by CPF
  const searchResponse = await fetch(`${ASAAS_BASE_URL}/customers?cpfCnpj=${cpf}`, {
    headers: {
      "access_token": ASAAS_API_KEY!,
      "Content-Type": "application/json",
    },
  });

  const searchData = await searchResponse.json();
  
  if (searchData.data && searchData.data.length > 0) {
    const existingCustomer = searchData.data[0];
    console.log("Found existing customer:", existingCustomer.id);

    // Update name and email if they changed
    if (existingCustomer.name !== name || existingCustomer.email !== email) {
      console.log("Updating customer data:", { name, email });
      await fetch(`${ASAAS_BASE_URL}/customers/${existingCustomer.id}`, {
        method: "PUT",
        headers: {
          "access_token": ASAAS_API_KEY!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email }),
      });
    }

    return existingCustomer.id;
  }

  // Create new customer
  const createResponse = await fetch(`${ASAAS_BASE_URL}/customers`, {
    method: "POST",
    headers: {
      "access_token": ASAAS_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      email,
      cpfCnpj: cpf.replace(/\D/g, ""),
    }),
  });

  const createData = await createResponse.json();
  
  if (!createResponse.ok) {
    console.error("Error creating customer:", createData);
    throw new Error(createData.errors?.[0]?.description || "Failed to create customer");
  }

  console.log("Created new customer:", createData.id);
  return createData.id;
}

async function createPayment(
  customerId: string,
  amountCents: number,
  paymentMethod: string,
  creditCard?: PaymentRequest["creditCard"],
  creditCardHolderInfo?: PaymentRequest["creditCardHolderInfo"]
): Promise<any> {
  const billingType = paymentMethod === "pix" ? "PIX" : paymentMethod === "boleto" ? "BOLETO" : "CREDIT_CARD";
  
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 3); // Due in 3 days

  const paymentData: any = {
    customer: customerId,
    billingType,
    value: amountCents / 100, // Asaas expects value in reais
    dueDate: dueDate.toISOString().split("T")[0],
    description: "Assinatura Guia Orlando em Família",
  };

  // Add credit card data if payment method is credit card
  if (paymentMethod === "credit_card" && creditCard && creditCardHolderInfo) {
    paymentData.creditCard = {
      holderName: creditCard.holderName,
      number: creditCard.number.replace(/\s/g, ""),
      expiryMonth: creditCard.expiryMonth,
      expiryYear: creditCard.expiryYear,
      ccv: creditCard.ccv,
    };
    paymentData.creditCardHolderInfo = {
      name: creditCardHolderInfo.name,
      email: creditCardHolderInfo.email,
      cpfCnpj: creditCardHolderInfo.cpfCnpj.replace(/\D/g, ""),
      postalCode: creditCardHolderInfo.postalCode.replace(/\D/g, ""),
      addressNumber: creditCardHolderInfo.addressNumber,
      phone: creditCardHolderInfo.phone.replace(/\D/g, ""),
    };
  }

  const response = await fetch(`${ASAAS_BASE_URL}/payments`, {
    method: "POST",
    headers: {
      "access_token": ASAAS_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(paymentData),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Error creating payment:", data);
    throw new Error(data.errors?.[0]?.description || "Failed to create payment");
  }

  console.log("Payment created:", data.id);
  return data;
}

async function getPixQrCode(paymentId: string): Promise<{ encodedImage: string; payload: string }> {
  const response = await fetch(`${ASAAS_BASE_URL}/payments/${paymentId}/pixQrCode`, {
    headers: {
      "access_token": ASAAS_API_KEY!,
    },
  });

  const data = await response.json();
  
  if (!response.ok) {
    console.error("Error getting PIX QR code:", data);
    throw new Error("Failed to get PIX QR code");
  }

  return {
    encodedImage: data.encodedImage,
    payload: data.payload,
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!ASAAS_API_KEY) {
      throw new Error("ASAAS_API_KEY not configured");
    }

    const payload: PaymentRequest = await req.json();
    
    // Normalize field names (accept both formats)
    const cpf = payload.cpf || payload.cpfCnpj;
    const paymentMethod = payload.paymentMethod || 
      (payload.billingType === "PIX" ? "pix" : 
       payload.billingType === "BOLETO" ? "boleto" : 
       payload.billingType === "CREDIT_CARD" ? "credit_card" : undefined);
    
    console.log("Received payment request:", { 
      ...payload, 
      cpf: cpf ? "[REDACTED]" : undefined,
      creditCard: payload.creditCard ? "[REDACTED]" : undefined 
    });

    // Validate required fields
    if (!payload.email || !payload.customerName || !cpf || !payload.planKey || !payload.amountCents || !paymentMethod) {
      throw new Error("Missing required fields: email, customerName, cpf/cpfCnpj, planKey, amountCents, paymentMethod/billingType");
    }

    // Create or get customer
    const customerId = await createOrGetCustomer(payload.email, payload.customerName, cpf);

    // Create payment
    const payment = await createPayment(
      customerId,
      payload.amountCents,
      paymentMethod,
      payload.creditCard,
      payload.creditCardHolderInfo
    );

    // Get PIX QR code if payment method is PIX
    let pixData = null;
    if (paymentMethod === "pix" && payment.id) {
      pixData = await getPixQrCode(payment.id);
    }

    // Save transaction to database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user by email to link transaction - list users and filter
    const { data: usersData } = await supabase.auth.admin.listUsers();
    const authUser = usersData?.users?.find(u => u.email === payload.email);
    
    const { data: transactionData, error: insertError } = await supabase.from("transactions").insert({
      user_id: authUser?.id || "00000000-0000-0000-0000-000000000000",
      email: payload.email,
      customer_name: payload.customerName,
      plan_key: payload.planKey,
      amount_cents: payload.amountCents,
      payment_method: paymentMethod,
      status: payment.status === "CONFIRMED" ? "confirmed" : "pending",
      asaas_customer_id: customerId,
      asaas_payment_id: payment.id,
      asaas_invoice_url: payment.invoiceUrl,
      asaas_pix_qr_code: pixData?.encodedImage,
      asaas_pix_payload: pixData?.payload,
      asaas_boleto_url: payment.bankSlipUrl,
      coupon_code: payload.couponCode || null,
      discount_amount_cents: payload.discountAmountCents || 0,
      metadata: {
        phone: payload.phone || payload.creditCardHolderInfo?.phone || null,
        cpf: cpf?.replace(/\D/g, '') || null,
        postal_code: payload.creditCardHolderInfo?.postalCode?.replace(/\D/g, '') || null,
        original_amount_cents: payload.originalAmountCents || payload.amountCents,
        tracking_context: payload.trackingContext || null,
      },
    }).select('id').single();

    if (insertError) {
      console.error("Error saving transaction:", insertError);
    }

    // Save terms acceptance if provided
    if (payload.termsAccepted && transactionData?.id) {
      const { error: termsError } = await supabase.from("terms_acceptances").insert({
        user_id: authUser?.id || "00000000-0000-0000-0000-000000000000",
        transaction_id: transactionData.id,
        document_version: payload.termsVersion || "1.0",
        accepted_at: new Date().toISOString(),
      });

      if (termsError) {
        console.error("Error saving terms acceptance:", termsError);
      }
    }

    // If credit card payment was confirmed immediately, enable access
    if (payment.status === "CONFIRMED") {
      // Update profile to enable access
      if (authUser?.id) {
        await supabase.from("profiles").update({
          is_access_enabled: true,
          plan_tier: payload.planKey,
        }).eq("user_id", authUser.id);

        // Send welcome email
        const { data: profile } = await supabase
          .from("profiles")
          .select("responsible_name")
          .eq("user_id", authUser.id)
          .single();

        await fetch(`${supabaseUrl}/functions/v1/notify-access-enabled`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({
            email: payload.email,
            nome_completo: profile?.responsible_name || payload.customerName,
          }),
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        paymentId: payment.id,
        status: payment.status,
        invoiceUrl: payment.invoiceUrl,
        bankSlipUrl: payment.bankSlipUrl,
        pixQrCode: pixData?.encodedImage,
        pixPayload: pixData?.payload,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in create-asaas-payment:", error);
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
