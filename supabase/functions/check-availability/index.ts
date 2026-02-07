import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface AvailabilityRequest {
  restaurantId: string;
  date: string;
  partySize?: number;
  mealTime?: string;
}

async function checkDisneyAvailability(
  restaurantId: string,
  date: string,
  partySize: number = 4
) {
  try {
    const apiUrl =
      "https://disneyworld.disney.go.com/finder/api/v1/explorer-service/public/finder/dining-availability";

    const payload = {
      searchDate: date,
      partySize: partySize,
      entityId: restaurantId,
      searchTime: null,
    };

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Referer: "https://disneyworld.disney.go.com/",
        Origin: "https://disneyworld.disney.go.com",
        Accept: "application/json",
        "Accept-Language": "en-US,en;q=0.9",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(`Disney API error: ${response.status}`);
      return null;
    }

    const data = await response.json();

    const availableTimes: Array<{
      time: string;
      mealPeriod: string;
      offers: unknown[];
    }> = [];

    if (data.availability && Array.isArray(data.availability)) {
      for (const slot of data.availability) {
        if (slot.available) {
          availableTimes.push({
            time: slot.time,
            mealPeriod: slot.mealPeriod,
            offers: slot.offers || [],
          });
        }
      }
    }

    return {
      available: availableTimes.length > 0,
      times: availableTimes,
      checkedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error checking availability:", error);
    return null;
  }
}

async function sendNotification(
  supabase: ReturnType<typeof createClient>,
  alert: Record<string, unknown>,
  restaurantId: string,
  date: string,
  times: Array<{ time: string; mealPeriod: string; offers: unknown[] }>
) {
  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!resendKey) {
    console.error("RESEND_API_KEY not configured");
    return;
  }

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("name, location")
    .eq("id", restaurantId)
    .single();

  if (!restaurant) return;

  const profile = alert.profiles as Record<string, unknown> | null;
  const email = profile?.email as string | undefined;
  if (!email) {
    console.error("No email found for alert", alert.id);
    return;
  }

  const formattedDate = new Date(date).toLocaleDateString("pt-BR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const timesHtml = times
    .map(
      (t) =>
        `<div style="display:inline-block;background:#e8f5e9;color:#2e7d32;padding:8px 16px;border-radius:20px;margin:4px;font-weight:bold;">${t.time}</div>`
    )
    .join("");

  const disneyBookingUrl = `https://disneyworld.disney.go.com/dining/`;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Orlando FastPass <alerts@orlandofastpass.com.br>",
        to: email,
        subject: `🎉 Vaga disponível: ${restaurant.name}!`,
        html: `
          <!DOCTYPE html>
          <html>
          <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
          <body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
            <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;margin-top:20px;">
              <div style="background:linear-gradient(135deg,#1a237e,#4a148c);padding:30px;text-align:center;">
                <h1 style="color:#fff;margin:0;font-size:24px;">🎉 Encontramos uma vaga!</h1>
              </div>
              <div style="padding:30px;">
                <h2 style="color:#1a237e;margin-top:0;">${restaurant.name}</h2>
                <p style="color:#555;">📍 Local: ${restaurant.location || "Disney World"}</p>
                <p style="color:#555;">📅 Data: ${formattedDate}</p>
                <p style="color:#555;">👥 Pessoas: ${alert.party_size}</p>
                <div style="margin:20px 0;">
                  <h3 style="color:#2e7d32;">⏰ Horários disponíveis:</h3>
                  ${timesHtml}
                </div>
                <div style="background:#fff3e0;border-left:4px solid #ff9800;padding:15px;border-radius:4px;margin:20px 0;">
                  ⚠️ Atenção: As vagas podem esgotar em minutos! Reserve o quanto antes.
                </div>
                <div style="text-align:center;margin:25px 0;">
                  <a href="${disneyBookingUrl}" style="background:linear-gradient(135deg,#1a237e,#4a148c);color:#fff;padding:15px 40px;border-radius:25px;text-decoration:none;font-weight:bold;display:inline-block;">Reservar Agora →</a>
                </div>
                <p style="color:#888;font-size:12px;text-align:center;">Dica: Tenha sua conta Disney já logada para agilizar a reserva!</p>
              </div>
              <div style="background:#f5f5f5;padding:20px;text-align:center;">
                <p style="color:#999;font-size:11px;margin:0;">Você recebeu este email porque configurou um alerta no Orlando FastPass</p>
              </div>
            </div>
          </body>
          </html>
        `,
      }),
    });

    // Record notification sent
    await supabase.from("notifications_sent").insert({
      alert_id: alert.id,
      sent_at: new Date().toISOString(),
      method: "email",
      status: "sent",
    });

    console.log(`Notification sent for alert ${alert.id}`);
  } catch (error) {
    console.error("Error sending notification:", error);

    await supabase.from("notifications_sent").insert({
      alert_id: alert.id,
      sent_at: new Date().toISOString(),
      method: "email",
      status: "failed",
      error_message: String(error),
    });
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const {
      restaurantId,
      date,
      partySize = 4,
      mealTime = "any",
    }: AvailabilityRequest = await req.json();

    if (!restaurantId || !date) {
      return new Response(
        JSON.stringify({ error: "restaurantId and date are required" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    console.log(`Checking availability: ${restaurantId} on ${date}`);

    const result = await checkDisneyAvailability(restaurantId, date, partySize);

    if (!result) {
      return new Response(
        JSON.stringify({ error: "Failed to check availability" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    // Save to cache
    const { error: upsertError } = await supabase
      .from("availability_cache")
      .upsert(
        {
          restaurant_id: restaurantId,
          date: date,
          party_size: partySize,
          meal_time: mealTime,
          is_available: result.available,
          available_times: result.times,
          last_checked: result.checkedAt,
        },
        {
          onConflict: "restaurant_id,date,party_size,meal_time",
        }
      );

    if (upsertError) {
      console.error("Error saving to cache:", upsertError);
    }

    // If availability found, check matching alerts and notify
    if (result.available) {
      const { data: alerts } = await supabase
        .from("dining_alerts")
        .select("*, profiles!dining_alerts_user_id_fkey(*)")
        .eq("restaurant_id", restaurantId)
        .eq("desired_date", date)
        .lte("party_size", partySize)
        .eq("status", "active");

      if (alerts && alerts.length > 0) {
        console.log(`Found ${alerts.length} matching alerts`);
        for (const alert of alerts) {
          await sendNotification(
            supabase,
            alert,
            restaurantId,
            date,
            result.times
          );
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        available: result.available,
        times: result.times,
        cachedAt: result.checkedAt,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
