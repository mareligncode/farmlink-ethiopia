import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentRequest {
  amount: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  tx_ref: string;
  return_url: string;
  order_ids: string[];
}

interface ChapaInitResponse {
  status: string;
  message: string;
  data?: {
    checkout_url: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const chapaSecretKey = Deno.env.get("CHAPA_SECRET_KEY");
    if (!chapaSecretKey) {
      throw new Error("Chapa secret key not configured");
    }

    const url = new URL(req.url);
    const action = url.pathname.split("/").pop();

    // Verify JWT and get user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "initialize" || req.method === "POST") {
      const body: PaymentRequest = await req.json();
      
      // Validate required fields
      if (!body.amount || !body.email || !body.first_name || !body.tx_ref || !body.return_url) {
        return new Response(
          JSON.stringify({ error: "Missing required fields" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Initialize payment with Chapa
      const chapaPayload = {
        amount: body.amount.toString(),
        currency: "ETB",
        email: body.email,
        first_name: body.first_name,
        last_name: body.last_name || "",
        phone_number: body.phone_number || "",
        tx_ref: body.tx_ref,
        callback_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/chapa-payment/callback`,
        return_url: body.return_url,
        customization: {
          title: "AgriConnect Payment",
          description: "Payment for agricultural products",
        },
      };

      console.log("Initializing Chapa payment:", chapaPayload);

      const chapaResponse = await fetch("https://api.chapa.co/v1/transaction/initialize", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${chapaSecretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(chapaPayload),
      });

      const chapaData: ChapaInitResponse = await chapaResponse.json();
      console.log("Chapa response:", chapaData);

      if (chapaData.status !== "success" || !chapaData.data?.checkout_url) {
        throw new Error(chapaData.message || "Failed to initialize payment");
      }

      // Store payment reference in orders
      if (body.order_ids && body.order_ids.length > 0) {
        const { error: updateError } = await supabase
          .from("orders")
          .update({ 
            payment_reference: body.tx_ref,
            payment_status: "pending"
          })
          .in("id", body.order_ids);

        if (updateError) {
          console.error("Error updating orders:", updateError);
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          checkout_url: chapaData.data.checkout_url,
          tx_ref: body.tx_ref,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in chapa-payment function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
