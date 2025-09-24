import express from 'express';
import dotenv from 'dotenv';
import { Request, Response } from 'express';
import { indexer } from './config/es.config';
import { startImapSync } from './services/imap.services';
import cors from 'cors';
dotenv.config();

const app = express();
app.use(cors())
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


const PORT = process.env.PORT || 3000;

app.get('/', (req: Request, res: Response) => {

    res.json({ "a": 'Hello, World!' });

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