import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, chapa-signature",
};

interface ChapaWebhookPayload {
  event: string;
  tx_ref: string;
  status: string;
  amount: number;
  currency: string;
  charge: number;
  mode: string;
  created_at: string;
  reference: string;
  first_name: string;
  last_name: string;
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body: ChapaWebhookPayload = await req.json();
    console.log("Chapa webhook received:", body);

    // Verify the transaction with Chapa
    const chapaSecretKey = Deno.env.get("CHAPA_SECRET_KEY");
    if (!chapaSecretKey) {
      throw new Error("Chapa secret key not configured");
    }

    const verifyResponse = await fetch(
      `https://api.chapa.co/v1/transaction/verify/${body.tx_ref}`,
      {
        headers: {
          "Authorization": `Bearer ${chapaSecretKey}`,
        },
      }
    );

    const verifyData = await verifyResponse.json();
    console.log("Chapa verify response:", verifyData);

    if (verifyData.status === "success" && verifyData.data?.status === "success") {
      // Update order payment status
      const { data: orders, error: fetchError } = await supabase
        .from("orders")
        .select("id, merchant_id, farmer_id, total_amount, profiles!orders_merchant_id_fkey(full_name)")
        .eq("payment_reference", body.tx_ref);

      if (fetchError) {
        console.error("Error fetching orders:", fetchError);
        throw fetchError;
      }

      if (orders && orders.length > 0) {
        // Update payment status
        const { error: updateError } = await supabase
          .from("orders")
          .update({ 
            payment_status: "paid",
            status: "confirmed"
          })
          .eq("payment_reference", body.tx_ref);

        if (updateError) {
          console.error("Error updating orders:", updateError);
          throw updateError;
        }

        // Create notifications for farmers
        const notifications = orders.map((order: any) => ({
          user_id: order.farmer_id,
          title_en: "Payment Received!",
          title_am: "ክፍያ ተቀብሏል!",
          message_en: `Payment of ${order.total_amount} ETB received for your order from ${order.profiles?.full_name}`,
          message_am: `${order.profiles?.full_name} ${order.total_amount} ብር ክፍያ ተቀብሏል`,
          type: "payment",
          metadata: { order_id: order.id, tx_ref: body.tx_ref },
        }));

        const { error: notifError } = await supabase
          .from("notifications")
          .insert(notifications);

        if (notifError) {
          console.error("Notification error:", notifError);
        }

        console.log("Orders updated successfully");
      }
    } else {
      // Payment failed - update status
      await supabase
        .from("orders")
        .update({ payment_status: "failed" })
        .eq("payment_reference", body.tx_ref);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in chapa-webhook function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
