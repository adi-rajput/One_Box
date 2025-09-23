import { Client } from '@elastic/elasticsearch';
import dotenv from 'dotenv';
dotenv.config();

const ES_PORT = process.env.ES_PORT || 'http://localhost:9200';
const ES_INDEX = process.env.ES_INDEX || 'reachinbox_emails';

export const es = new Client({ node: ES_PORT });

export async function indexer() {
    const exists = await es.indices.exists({ index: ES_INDEX });
    if (!exists) {
        await es.indices.create({ index: ES_INDEX });
        console.log(`Created index ${ES_INDEX}`);
    } else {
        console.log(`Index ${ES_INDEX} exists`);
    }
}

export async function indexEmail(doc: any) {
    const id = `${doc.accountId}_${doc.uid}`;
    await es.index({
        index: ES_INDEX,
        id,
        body: doc
    });
}

export async function searchEmails(query: any) {
    return es.search({
        index: ES_INDEX,
        body: query
    });
}
