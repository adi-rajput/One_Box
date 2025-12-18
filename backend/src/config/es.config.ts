import { Client } from '@elastic/elasticsearch';
import dotenv from 'dotenv';

dotenv.config();

const ES_NODE =
  process.env.ELASTICSEARCH_URL ||
  process.env.ES_PORT || // fallback for local dev
  'http://localhost:9200';

const ES_INDEX = process.env.ES_INDEX || 'reachinbox_emails';

// Choose auth based on environment
const esAuth =
  process.env.ELASTICSEARCH_USERNAME && process.env.ELASTICSEARCH_PASSWORD
    ? {
        username: process.env.ELASTICSEARCH_USERNAME,
        password: process.env.ELASTICSEARCH_PASSWORD
      }
    : process.env.ES_API_KEY
    ? {
        apiKey: process.env.ES_API_KEY
      }
    : undefined;

export const es = new Client({
  node: ES_NODE,
  auth: esAuth,
  sniffOnStart: false,
  maxRetries: 5,
  requestTimeout: 60000
});

// 🔐 SAFE STARTUP CHECK (DO NOT CRASH SERVER)
(async () => {
  try {
    await es.ping();
    console.log('Elasticsearch connected');
  } catch (err) {
    console.error('Elasticsearch unavailable, continuing without ES');
  }
})();

export async function indexer() {
  try {
    const exists = await es.indices.exists({ index: ES_INDEX });
    if (!exists) {
      await es.indices.create({ index: ES_INDEX });
      console.log(`Created index ${ES_INDEX}`);
    } else {
      console.log(`Index ${ES_INDEX} exists`);
    }
  } catch (err) {
    console.error('Indexer skipped: Elasticsearch unavailable');
  }
}

export async function indexEmail(doc: any) {
  try {
    const id = `${doc.accountId}_${doc.uid}`;
    await es.index({
      index: ES_INDEX,
      id,
      document: doc
    });
  } catch (err) {
    console.error('Indexing failed (ES down)');
  }
}

export async function searchEmails(query: any) {
  return es.search({
    index: ES_INDEX,
    body: query
  });
}
