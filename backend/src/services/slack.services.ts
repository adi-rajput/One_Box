import axios from 'axios';

interface EmailNotificationData {
    subject?: string;
    from?: { address?: string };
    body_text?: string;
}

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
const AUTOMATION_WEBHOOK_URL = process.env.AUTOMATION_WEBHOOK_URL;

export async function sendSlackNotification(email: EmailNotificationData): Promise<void> {
    try {
        if (!SLACK_WEBHOOK_URL) {
            console.warn("Slack Webhook URL not configured. Skipping notification.");
            return;
        }
        const message = {
            text: `New Interested Lead!\n*From*: ${email.from?.address}\n*Subject*: ${email.subject}`,
        };
        await axios.post(SLACK_WEBHOOK_URL, message);
        console.log(`[Notification Service] Slack notification sent for "${email.subject}"`);
    } catch (error) {
        console.error("[Notification Service] Failed to send Slack notification:", error);
    }
}

export async function triggerWebhook(email: EmailNotificationData): Promise<void> {
    try {
        if (!AUTOMATION_WEBHOOK_URL) {
            console.warn("Automation Webhook URL not configured. Skipping webhook trigger.");
            return;
        }
        await axios.post(AUTOMATION_WEBHOOK_URL, email);
        console.log(`[Notification Service] Webhook triggered for "${email.subject}"`);
    } catch (error) {
        console.error("[Notification Service] Failed to trigger webhook:", error);
    }
}