import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

export type EmailCategory = 'Interested' | 'Not Interested' | 'Meeting Booked' | 'Spam' | 'Out of Office';

interface EmailContent {
    subject: string;
    body_text: string;
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not defined in the environment variables.");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-lite",
    generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
            type: SchemaType.OBJECT,
            properties: {
                category: {
                    type: SchemaType.STRING,
                    description: "One of: Interested, Not Interested, Meeting Booked, Spam"
                }
            },
            required: ["category"]
        }
    },
});


export async function categorizeEmail(email: EmailContent) {
    const { subject, body_text } = email;

    if (!body_text || body_text.trim() === '') {
        return "Not Interested";
    }

    const prompt = `
        You are an expert email classifier for a student looking for job. 
        Analyze the email's subject and body to classify it into ONE of the following categories: 
        Interested, Not Interested, Meeting Booked, Spam.
        
        The JSON output should follow this schema: {"category": "CATEGORY_NAME"}.

        Email to classify:
        Subject: ${subject}
        Body: ${body_text.substring(0, 4000)}
    `;

    try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        console.log("AI Response:", responseText);

        const parsedResult = JSON.parse(responseText);
        const category = parsedResult.category;

        const validCategories: EmailCategory[] = ['Interested', 'Not Interested', 'Meeting Booked', 'Spam'];
        if (validCategories.includes(category)) {
            console.log(`Categorized "${subject}" as: ${category}`);
            return category;
        }

        return "Not Interested";

    } catch (error) {
        console.error("[AI Service/Gemini] Error categorizing email:", error);
    }
}