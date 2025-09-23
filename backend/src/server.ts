import express from 'express';
import dotenv from 'dotenv';
import { Request, Response } from 'express';
dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

app.get('/', (req: Request, res: Response) => {

    res.json({ "a": 'Hello, World!' });

});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});