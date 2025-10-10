import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';
dotenv.config();

const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY || '',
});


const knowledgeBase = [
    // Interview Scheduling & Availability
    {
        id: 'kb-01-scheduling-link',
        text: 'Action: When a recruiter asks to schedule an interview or a quick chat, politely share availability for the next few days. Example: "Sure! I’m available for a quick call on Wednesday or Thursday between 2–6 PM. Please let me know what works best for you."'
    },
    {
        id: 'kb-02-confirm-meeting',
        text: 'Action: After an interview is scheduled, confirm politely: "Got it, thank you for scheduling! Looking forward to our conversation. I’ll make sure to review the company’s work before the call."'
    },
    {
        id: 'kb-03-suggested-time',
        text: 'Response: If the recruiter suggests a specific time, confirm with appreciation. Example: "That works perfectly, thank you for coordinating. See you at [time/day]!"'
    },
    {
        id: 'kb-04-reschedule',
        text: 'Action: If you need to reschedule, be respectful and concise. Example: "Apologies for the short notice — something urgent came up at that time. Would it be possible to move our call to later this week?"'
    },

    // About the Candidate
    {
        id: 'kb-05-personal-summary',
        text: 'Profile Summary: I’m a Computer Science student passionate about building scalable backend systems and AI-integrated products. I’ve worked on projects involving Node.js, Golang, and Next.js, and I enjoy designing real-world systems with clean architecture.'
    },
    {
        id: 'kb-06-key-skills',
        text: 'Technical Skills: Node.js, Express, Go, PostgreSQL, MongoDB, Redis, Elasticsearch, Docker, AWS, and RESTful APIs. Comfortable with DSA and common problem-solving patterns.'
    },
    {
        id: 'kb-07-project-highlight',
        text: 'Project Example: Built a distributed ticket-booking microservice system using Node.js and RabbitMQ. Designed for fault-tolerant service communication and scalable event-driven flow.'
    },
    {
        id: 'kb-08-ai-project',
        text: 'Project Example: Developed an AI-powered mail platform that uses LLMs for email classification, Slack notifications, and RAG-based reply suggestions.'
    },

    // Responding to Recruiters
    {
        id: 'kb-09-reply-to-job-interest',
        text: 'Response: "Thank you for reaching out! I’m really interested in learning more about this opportunity. Could you please share a bit more about the role and the tech stack your team uses?"'
    },
    {
        id: 'kb-10-follow-up-after-apply',
        text: 'Action: When following up after submitting an application: "Hi [Name], I applied for the [Role] position last week and wanted to check if there’s any update. I’m very enthusiastic about the opportunity to contribute to your team."'
    },
    {
        id: 'kb-11-after-no-reply',
        text: 'Action: If there’s been no response for a week or two: "Hi [Name], hope you’re doing well. Just following up on my previous email regarding the [Role] position. I’d love to explore how my experience aligns with your team’s goals."'
    },
    {
        id: 'kb-12-thank-you-interview',
        text: 'Response: After an interview: "Thank you for the insightful conversation today. I really enjoyed learning more about the role and your team’s work on [specific project/tech]. Looking forward to hearing the next steps!"'
    },
    {
        id: 'kb-13-feedback-request',
        text: 'Action: If you didn’t get selected but want feedback: "Thank you for the update. I appreciate the opportunity to interview. If possible, I’d love to hear any feedback that could help me improve for future roles."'
    },

    // Handling Common Recruiter Scenarios
    {
        id: 'kb-14-internship-timeline',
        text: 'Information: If asked about availability, respond: "I’m currently available for a full-time internship starting [Month, Year], and can transition to part-time or full-time based on academic schedule."'
    },
    {
        id: 'kb-15-relocation-availability',
        text: 'Response: If asked about relocation: "I’m open to both remote and in-office opportunities. Relocation is not an issue for the right opportunity."'
    },
    {
        id: 'kb-16-salary-expectation',
        text: 'Response: For internship roles, it’s best to keep it open-ended. "I’m primarily focused on learning and contributing meaningfully. I’m open to discussing compensation based on the company’s structure."'
    },

    // Follow-Up & Next Steps
    {
        id: 'kb-17-follow-up-after-call',
        text: 'Action: After a recruiter call: "Thanks for taking the time to speak with me today. I really appreciated learning about [Company]’s vision and culture. Excited about the possibility of contributing to your team!"'
    },
    {
        id: 'kb-18-follow-up-after-offer',
        text: 'Action: After receiving an offer: "Thank you for the offer! I’m genuinely excited about joining [Company]. I’d love to go through the details and timeline whenever convenient."'
    },
    {
        id: 'kb-19-check-in-future',
        text: 'Action: If a recruiter says to check back later: "Sure! I’ll reconnect around [Month] as suggested. Really appreciate your time, and I’ll keep an eye on future openings."'
    },

    // General / Miscellaneous
    {
        id: 'kb-20-company-research',
        text: 'Action: Before replying, always check the company’s recent blog posts or product updates to personalize your reply — mentioning something specific often stands out.'
    },
    {
        id: 'kb-21-career-page',
        text: 'Action: If someone refers you to apply officially, thank them and respond with: "Thank you! I’ll submit my application through the official careers page right away and follow up once done."'
    },
    {
        id: 'kb-22-networking-followup',
        text: 'Response: After an informal chat or networking intro: "It was great connecting with you. I’ll stay in touch and would love to explore potential collaboration or internship opportunities in the future."'
    }
];


export const pineconeIndex = pc.Index(process.env.PINECONE_INDEX_NAME || 'one-box-kb', process.env.PINECONE_HOST || '');

export const run = async () => {
    try {
        const ns = pineconeIndex.namespace("general")
        const response = await ns.upsertRecords(knowledgeBase);
        console.log('Pinecone upsert response:', response);
    } catch (error) {
        console.error('Error upserting records to Pinecone:', error);
    }
};
