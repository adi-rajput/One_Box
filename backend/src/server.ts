import express from 'express';
import dotenv from 'dotenv';
import { Request, Response } from 'express';
import { indexer, searchEmails } from './config/es.config';
import { startImapSync } from './services/imap.services';
import cors from 'cors';
import { run } from './config/vectordb.config';
import { suggestReplies } from './services/suggestions.services';
dotenv.config();

const app = express();
app.use(cors())
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


const PORT = process.env.PORT || 3000;

app.get('/search', async (req: Request, res: Response) => {
    try {
        const query = req.query.q as string;
        // Basic validation
        if (!query) {
            return res.status(400).json({ error: 'Query parameter "q" is required' });
        }

        // Query Elasticsearch
        const esQuery = {
            query: {
                multi_match: {
                    query,
                    fields: ["subject", "body_text", "from.address", "category", "to.address", "folder", "accountId"]
                }
            }
        };

        const output = await searchEmails(esQuery);

        res.status(200).json(output.hits.hits.map((hit: any) => hit._source));
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/get-all-email', async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string, 10) || 1

        const pageSize = 100;
        const from = (page - 1) * pageSize;

        const esQuery = {
            from: from,
            size: pageSize,
            query: {
                match_all: {}
            },
            sort: [
                { date: { order: "desc" } }
            ]
        }

        const output = await searchEmails(esQuery);

        res.status(200).json(output.hits.hits.map((hit: any) => hit._source));
    } catch (error) {
        console.error('Error in root endpoint:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

app.get("/get-filtered-emails", async (req: Request, res: Response) => {
    try {
        const { category, accountId, folder, page = 1 } = req.query;
        const filters: any[] = [];
        if (category) {
            filters.push({ term: { category } });
        }
        if (accountId) {
            filters.push({ term: { accountId } });
        }
        if (folder) {
            filters.push({ term: { folder } });
        }
        const from = (Number(page) - 1) * 100;
        const esQuery: any = {
            from: from,
            size: 100,
            bool: {
                filters: filters
            },
            sort: [
                { date: { order: "desc" } }
            ]
        }

        const output = await searchEmails(esQuery);
        res.status(200).json(output.hits.hits.map((hit: any) => hit._source));
    } catch (error) {
        console.error('Error in /get-filtered-emails endpoint:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get("/suggest-replies", async (req: Request, res: Response) => {
    try {
        const { subject, body_text } = req.query;
        if (!body_text || (body_text as string).trim() === '') {
            return res.status(200).json({ replies: [] });
        }
        const email = { subject: subject as string || '', body_text: body_text as string || '' };

        const replies = await suggestReplies(email);
        res.status(200).json({ replies });
    } catch (error) {
        console.error('Error in /suggest-replies endpoint:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

async function startServer() {
    try {
        // await run(); // Pinecone setup(Run to populate the vector DB)
        await indexer();
        // await startImapSync();
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        })
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();