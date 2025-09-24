import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { Pinecone } from '@pinecone-database/pinecone';

interface EmailContent {
    subject: string;
    body_text: string;
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not defined in the environment variables.");
}

const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY || '',
});

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-lite",
    generationConfig: {
        responseMimeType: "application/json"
    },
});


export async function suggestReplies(email: EmailContent) {
    const ns = pc.index(process.env.PINECONE_INDEX_NAME || 'reach-inbox-kb', process.env.PINECONE_HOST || '').namespace("general");
    try {
        const { subject, body_text } = email;
        if (!body_text || body_text.trim() === '') {
            return [];
        }

        const qResponse = await ns.searchRecords({
            query: {
                topK: 3,
                inputs: { text: body_text },
            }
        })

        console.log("Pinecone Query Response:", qResponse);

        const kb = qResponse.result.hits.map(hit => hit.fields).join("\n");

        console.log("Knowledge Base Snippets:", kb);

        const prompt = `
        You are an expert email assistant for a sales team. 
        Based on the email content and the provided knowledge base snippets, suggest up to 3 concise and relevant reply options. 
        If none of the snippets are relevant, suggest a polite decline response.
        Email to respond to:
        Subject: ${subject}
        Body: ${body_text.substring(0, 4000)}
        Knowledge Base Snippets:
        ${kb}
        Provide the responses in a JSON array format like: {"replies": ["Option 1", "Option 2", "Option 3"]}
        `

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        console.log("AI Response:", responseText);
        const parsedResult = JSON.parse(responseText);
        return parsedResult.replies || [];
    } catch (error) {
        console.error("Error suggesting replies:", error);
        return [];
    }
}


