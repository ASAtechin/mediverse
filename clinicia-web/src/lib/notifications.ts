
/**
 * Communication Service — Twilio-powered SMS & WhatsApp
 * 
 * Required env vars:
 *   TWILIO_ACCOUNT_SID
 *   TWILIO_AUTH_TOKEN
 *   TWILIO_PHONE_NUMBER      — e.g. "+1234567890"
 *   TWILIO_WHATSAPP_NUMBER   — e.g. "whatsapp:+14155238886"
 * 
 * Falls back to console-log stubs when credentials are not configured.
 */

const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE = process.env.TWILIO_PHONE_NUMBER;
const TWILIO_WA = process.env.TWILIO_WHATSAPP_NUMBER;

const isTwilioConfigured = !!(TWILIO_SID && TWILIO_TOKEN && TWILIO_PHONE);

async function twilioSend(to: string, body: string, from: string) {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`;

    const params = new URLSearchParams();
    params.append("To", to);
    params.append("From", from);
    params.append("Body", body);

    const response = await fetch(url, {
        method: "POST",
        headers: {
            Authorization: "Basic " + Buffer.from(`${TWILIO_SID}:${TWILIO_TOKEN}`).toString("base64"),
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
    });

    if (!response.ok) {
        const err = await response.text();
        console.error("[TWILIO] Send failed:", err);
        throw new Error(`Twilio send failed: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, messageId: data.sid };
}

export async function sendSMS(to: string, message: string) {
    if (!isTwilioConfigured) {
        console.log(`[SMS STUB] Twilio not configured. Would send to ${to}: ${message}`);
        return { success: true, messageId: `stub_sms_${Date.now()}` };
    }

    try {
        return await twilioSend(to, message, TWILIO_PHONE!);
    } catch (error) {
        console.error("[SMS] Failed to send:", error);
        return { success: false, messageId: null, error: (error as Error).message };
    }
}

export async function sendWhatsApp(to: string, message: string) {
    if (!isTwilioConfigured || !TWILIO_WA) {
        console.log(`[WHATSAPP STUB] Twilio not configured. Would send to ${to}: ${message}`);
        return { success: true, messageId: `stub_wa_${Date.now()}` };
    }

    try {
        // WhatsApp requires "whatsapp:" prefix on the To number
        const waTo = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;
        return await twilioSend(waTo, message, TWILIO_WA);
    } catch (error) {
        console.error("[WHATSAPP] Failed to send:", error);
        return { success: false, messageId: null, error: (error as Error).message };
    }
}

export async function sendAppointmentConfirmation(patientName: string, phone: string, date: Date, token: number) {
    const msg = `Dear ${patientName}, your appointment is confirmed for ${date.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}. Token: #${token}. - Clinicia`;
    
    const results = await Promise.allSettled([
        sendSMS(phone, msg),
        sendWhatsApp(phone, msg),
    ]);

    const failures = results.filter(r => r.status === "rejected" || (r.status === "fulfilled" && !r.value.success));
    if (failures.length > 0) {
        console.warn(`[NOTIFICATION] ${failures.length}/2 channels failed for ${phone}`);
    }
}
