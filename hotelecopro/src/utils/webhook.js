/**
 * Utility to reliably dispatch booking payloads to n8n webhooks.
 * Handles both Production (/webhook/) and Test (/webhook-test/) endpoints,
 * as well as CORS fallback when necessary.
 */
export async function sendN8nBookingWebhook(payload, customUrl = null) {
    const primaryUrl = (customUrl && customUrl.trim())
        ? customUrl.trim()
        : (process.env.REACT_APP_N8N_BOOKING_WEBHOOK_URL || "https://ceylonnature01.app.n8n.cloud/webhook/bookingemail");

    // Prepare list of endpoints (e.g. try production first, then test mode if 404/failed)
    const urlsToTry = [primaryUrl];
    if (primaryUrl.includes("/webhook/")) {
        urlsToTry.push(primaryUrl.replace("/webhook/", "/webhook-test/"));
    } else if (primaryUrl.includes("/webhook-test/")) {
        urlsToTry.push(primaryUrl.replace("/webhook-test/", "/webhook/"));
    }

    console.log("🚀 Dispatching booking payload to n8n Webhook:", payload);

    for (const url of urlsToTry) {
        try {
            console.log(`📡 Sending POST request to: ${url}`);
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json, text/plain, */*"
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                console.log(`✅ n8n Webhook successfully received payload at: ${url}`);
                return { success: true, url, status: response.status };
            }

            console.warn(`⚠️ n8n Webhook at ${url} returned status ${response.status}: ${response.statusText}`);
        } catch (fetchErr) {
            console.warn(`⚠️ Direct fetch failed for ${url}:`, fetchErr);

            // Network / CORS fallback attempt using text/plain content-type
            try {
                await fetch(url, {
                    method: "POST",
                    mode: "no-cors",
                    headers: { "Content-Type": "text/plain" },
                    body: JSON.stringify(payload)
                });
                console.log(`✅ n8n Webhook payload dispatched via no-cors fallback to: ${url}`);
                return { success: true, url, fallback: true };
            } catch (fallbackErr) {
                console.error(`❌ Fallback also failed for ${url}:`, fallbackErr);
            }
        }
    }

    return { success: false };
}
