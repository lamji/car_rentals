import { NextRequest, NextResponse } from "next/server";
import { messengerService } from "@/lib/services/messengerService";

/**
 * GET Handler for Meta Webhook Verification
 * This is used for the "Verify and Save" step in Meta for Developers dashboard.
 */
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    const result = messengerService.verifyWebhook(mode, token, challenge);

    if (result) {
        return new Response(result, { status: 200 });
    }

    return new Response("Verification failed", { status: 403 });
}

/**
 * POST Handler for incoming Messenger events
 * This receives the actual messages sent by users to your FB Page.
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        
        // Log the full raw payload for debugging
        console.log("--- New Messenger Webhook Event ---");
        console.log(JSON.stringify(body, null, 2));
        console.log("------------------------------------");

        const success = await messengerService.processIncomingEvent(body);

        if (success) {
            return NextResponse.json({ message: "EVENT_RECEIVED" }, { status: 200 });
        }

        return NextResponse.json({ message: "NOT_A_PAGE_EVENT" }, { status: 404 });
    } catch (error) {
        console.error("[MessengerWebhook] Error processing POST:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
