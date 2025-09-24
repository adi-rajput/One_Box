import express from 'express';
import dotenv from 'dotenv';
import { Request, Response } from 'express';
import { indexer, searchEmails } from './config/es.config';
import { startImapSync } from './services/imap.services';
import cors from 'cors';
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
                    fields: ["subject", "body_text", "from.address", "category"]
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

async function startServer() {
    try {
        await indexer();
        await startImapSync();
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        })
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();