import { ImapFlow } from 'imapflow';
import { simpleParser, ParsedMail } from 'mailparser';
import { indexEmail } from '../config/es.config';
import { categorizeEmail } from './ai.services';
import { parse } from 'path';


// Code here is inspired by https://imapflow.com/module-imapflow-ImapFlow.html
// Might be really basic for now, but can be extended later

// Add AI categorization here later
// Add webhooks for slack to notify of interested emails

// Configuration
type ImapAccountConfig = {
    id: string;
    host: string;
    port: number;
    secure: boolean;
    auth: { user: string; pass: string };
};

// const IMAP_ACCOUNTS_JSON = process.env.IMAP_ACCOUNTS_JSON as string;
const accounts: ImapAccountConfig[] = [
    {
        id: "gmail",
        host: "imap.gmail.com",
        port: 993,
        secure: true,
        auth: {
            user: process.env.USER_EMAIL_1 ?? "",
            pass: process.env.USER_PASSWORD_1 ?? ""
        }
    }
    // {
    //     id: "outlook",
    //     host: "outlook.office365.com",
    //     port: 993,
    //     secure: true,
    //     auth: {
    //         user: "yourname@outlook.com",
    //         pass: "your-app-password"  
    //     }
    // }
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));


// Start the IMAP sync for all accounts
export async function startImapSync() {
    console.log("Starting IMAP sync for all accounts...");
    for (const account of accounts) {
        syncAccount(account).catch(err => {
            console.error(`[${account.id}] A critical error occurred:`, err);
        });
    }
}

// Main logic to sync an account
async function syncAccount(account: ImapAccountConfig) {
    const client = new ImapFlow({
        host: account.host,
        port: account.port,
        secure: account.secure,
        auth: account.auth,
        logger: false,
    });

    // Connect to the IMAP server
    await client.connect();
    console.log(`[${account.id}] Successfully connected to the IMAP server.`);

    // Only inbox for now
    const mailbox = 'INBOX';
    console.log(`[${account.id}] Starting sync for mailbox: ${mailbox}`);

    let lock = await client.getMailboxLock(mailbox);
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        console.log(`[${account.id}] Performing initial sync for emails since ${thirtyDaysAgo.toISOString()}...`);

        for await (const msg of client.fetch({ since: thirtyDaysAgo }, { uid: true, source: true })) {
            if (msg.source) {
                const parsedEmail: ParsedMail = await simpleParser(msg.source);
                const category = await categorizeEmail({ body_text: parsedEmail.text || '', subject: parsedEmail.subject || '' });

                const emailDoc = {
                    accountId: account.id,
                    uid: msg.uid,
                    folder: mailbox,
                    subject: parsedEmail.subject || '',
                    from: parsedEmail.from?.value[0] || { address: 'unknown' },
                    to: parsedEmail.to || [],
                    date: parsedEmail.date?.toISOString() || new Date().toISOString(),
                    body_text: parsedEmail.text || '',
                    category
                };
                await indexEmail(emailDoc as any);
                await delay(5000);
            }
        }
        console.log(`[${account.id}] Initial 30-day sync complete.`);
    } finally {
        lock.release();
    }

    console.log(`[${account.id}] Now listening for new emails...`);

    client.on('exists', async () => {
        console.log(`[${account.id}] New 'exists' event detected! Checking for new email...`);
        let lock = await client.getMailboxLock(mailbox);
        try {
            if (client.mailbox) {
                const latestMessage = await client.fetchOne(client.mailbox.exists, { uid: true, source: true });
                if (latestMessage && latestMessage.source) {

                    const parsedEmail: ParsedMail = await simpleParser(latestMessage.source);
                    const category = await categorizeEmail({ body_text: parsedEmail.text || '', subject: parsedEmail.subject || '' });

                    const emailDoc = {
                        accountId: account.id,
                        uid: latestMessage.uid,
                        folder: mailbox,
                        subject: parsedEmail.subject || '',
                        from: parsedEmail.from?.value[0] || { address: 'unknown' },
                        to: parsedEmail.to || [],
                        date: parsedEmail.date?.toISOString() || new Date().toISOString(),
                        body_text: parsedEmail.text || '',
                        category
                    };

                    await indexEmail(emailDoc as any);
                    await delay(2000);
                    console.log(`[${account.id}] Successfully indexed new email: "${emailDoc.subject}"`);
                }
            }
        } catch (err) {
            console.error(`[${account.id}] Error processing a new email:`, err);
        } finally {
            lock.release();
        }
    });

    client.on('error', err => console.error(`[${account.id}] IMAP client error:`, err));
    client.on('close', () => console.log(`[${account.id}] IMAP connection closed.`));
}