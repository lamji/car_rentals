/**
 * Service to handle Facebook Messenger API interactions
 */

const PAGE_ACCESS_TOKEN = process.env.MESSENGER_PAGE_ACCESS_TOKEN;
const FACEBOOK_GRAPH_API_URL = "https://graph.facebook.com/v19.0";

export const messengerService = {
    /**
     * Verifies the webhook token during Meta discovery
     */
    verifyWebhook: (mode: string | null, token: string | null, challenge: string | null) => {
        const VERIFY_TOKEN = process.env.MESSENGER_VERIFY_TOKEN;

        if (mode === "subscribe" && token === VERIFY_TOKEN) {
            console.log("[MessengerService] Webhook Verified Successfully");
            return challenge;
        }
        
        console.error("[MessengerService] Webhook Verification Failed");
        return null;
    },

    /**
     * Handles incoming message events from the webhook
     */
    processIncomingEvent: async (body: { object: string; entry: any[] }) => {
        if (body.object === "page") {
            for (const entry of body.entry) {
                const webhookEvent = entry.messaging[0];
                const senderId = webhookEvent.sender.id;

                if (webhookEvent.message) {
                    await messengerService.handleMessage(senderId, webhookEvent.message);
                } else if (webhookEvent.postback) {
                    await messengerService.handlePostback(senderId, webhookEvent.postback);
                }
            }
            return true;
        }
        return false;
    },

    /**
     * Logic for handling text messages
     */
    handleMessage: async (senderId: string, receivedMessage: { text?: string }) => {
        console.log(`[MessengerService] Message received from ${senderId}:`, receivedMessage.text);
        
        // Example: Automated Greeting 
        if (receivedMessage.text) {
            await messengerService.sendTextMessage(senderId, "Hello! Thank you for contacting our Car Rental service. How can we help you today?");
        }
    },

    /**
     * Logic for handling button postbacks
     */
    handlePostback: async (senderId: string, receivedPostback: { payload?: string }) => {
        console.log(`[MessengerService] Postback received from ${senderId}:`, receivedPostback.payload);
        // Handle specific button clicks here
    },

    /**
     * Sends a text message back to the user via Facebook Graph API
     */
    sendTextMessage: async (recipientId: string, text: string) => {
        const payload = {
            recipient: { id: recipientId },
            message: { text: text },
        };

        try {
            const response = await fetch(`${FACEBOOK_GRAPH_API_URL}/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("[MessengerService] API Error:", errorData);
            }
        } catch (error) {
            console.error("[MessengerService] Network Error:", error);
        }
    }
};
