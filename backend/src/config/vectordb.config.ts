import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';
dotenv.config();

const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY || '',
});


const knowledgeBase = [
    // Meeting Booking & Scheduling
    {
        id: 'kb-01-demo-link',
        text: 'Action: When a lead requests a demo, meeting, or call, provide the primary 30-minute booking link: https://cal.com/reachinbox-demo'
    },
    {
        id: 'kb-02-pricing-call',
        text: 'Action: If a lead specifically asks about pricing details, offer a shorter 15-minute pricing consultation call: https://cal.com/reachinbox-pricing-consultation'
    },
    {
        id: 'kb-03-suggested-time',
        text: 'Response: If a lead suggests a specific time to meet instead of using a link, confirm the time with them and send a manual calendar invite immediately.'
    },
    {
        id: 'kb-04-confirm-booked-demo',
        text: 'Action: After a demo is successfully booked, send a confirmation email saying "Looking forward to our chat! I will send over a brief pre-call agenda shortly."'
    },

    // Product Features & Value

    {
        id: 'kb-05-core-value-prop',
        text: 'Product Summary: ReachInbox is an all-in-one, AI-driven platform that automates cold outreach across email, LinkedIn, and Twitter to generate high-intent leads.'
    },
    {
        id: 'kb-06-feature-multi-channel',
        text: 'Feature Explanation: Our multi-channel capability allows you to create unified outreach sequences that engage prospects on their preferred platform, significantly boosting reply rates.'
    },
    {
        id: 'kb-07-feature-ai-personalization',
        text: 'Feature Explanation: The AI personalizes each message based on the lead\'s profile and online activity, making every outreach feel unique and relevant, not robotic.'
    },
    {
        id: 'kb-08-feature-lead-verification',
        text: 'Feature Explanation: ReachInbox includes a built-in lead verification system that cleans your lists and checks email validity to protect your domain reputation and improve deliverability.'
    },

    // Pricing & Plans

    {
        id: 'kb-09-pricing-inquiry',
        text: 'Response: For general pricing inquiries, state: "We offer several flexible plans tailored to your team\'s size and needs. Would you be open to a quick 15-minute call to determine the best fit for you?"'
    },
    {
        id: 'kb-10-no-price-list',
        text: 'Information: We do not send a static price list. Pricing is usage-based (per seat, per month) and is best discussed on a call to match features to the client\'s goals.'
    },
    // Handling Objections
    {
        id: 'kb-11-objection-not-interested',
        text: 'Response to "Not interested": "I understand. Thanks for the quick response. If you don\'t mind me asking, what is your team currently using for lead generation?"'
    },
    {
        id: 'kb-12-objection-competitor',
        text: 'Response to "We already use another tool": "That\'s great to hear you\'re already leveraging outreach tools. We often complement existing stacks by providing advanced AI personalization that other platforms lack. Would you be open to a 5-minute comparison?"'
    },
    {
        id: 'kb-13-objection-no-budget',
        text: 'Response to "No budget right now": "Completely understand that timing is key. Many of our clients see a significant ROI within the first quarter. Would it be okay if I reached out again in 3 months to see if things have changed?"'
    },
    // Technical & Security
    {
        id: 'kb-14-how-ai-works',
        text: 'Technical Explanation: Our AI uses a combination of generative models and data analysis to scan a prospect\'s public information (like LinkedIn profiles) to craft personalized icebreakers and follow-up messages.'
    },
    {
        id: 'kb-15-crm-integrations',
        text: 'Technical Information: We offer native integrations with popular CRMs like HubSpot and Salesforce, allowing for seamless lead and activity syncing.'
    },
    {
        id: 'kb-16-data-security',
        text: 'Security Policy: All customer data is encrypted both at rest and in transit. We are fully GDPR and CCPA compliant and do not share or sell any user data.'
    },
    // Follow-up & Next Steps
    {
        id: 'kb-17-follow-up-no-reply',
        text: 'Action: If a lead viewed the email but did not reply, send a short follow-up in 3 days: "Hi [Name], just wanted to gently bump this in your inbox. Any thoughts on setting up a quick demo?"'
    },
    {
        id: 'kb-18-check-back-later',
        text: 'Action: If a lead says "Check back in a few months," reply with: "Will do! I\'ll set a reminder to reach out in [Month]. In the meantime, feel free to check out our case studies here: [link]."'
    },
    // General Information
    {
        id: 'kb-19-who-we-are',
        text: 'Company Information: ReachInbox was founded by a team of sales professionals who were frustrated with manual, ineffective outreach. Our mission is to automate lead generation with intelligent software.'
    },
    {
        id: 'kb-20-job-inquiry',
        text: 'Action: For any inquiries about joining the team, direct them to our careers page for official openings: https://reachinbox.com/careers'
    }
];


export const pineconeIndex = pc.Index(process.env.PINECONE_INDEX_NAME || 'reach-inbox-kb', process.env.PINECONE_HOST || '');

export const run = async () => {
    try {
        const ns = pineconeIndex.namespace("general")
        const response = await ns.upsertRecords(knowledgeBase);
        console.log('Pinecone upsert response:', response);
    } catch (error) {
        console.error('Error upserting records to Pinecone:', error);
    }
};
