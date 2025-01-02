import pg from 'pg';
const { Client } = pg;
import 'dotenv/config';

const pgClient = new Client({
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    database: process.env.PGDATABASE
});

await pgClient.connect();

const res = await pgClient.query(`
    CREATE TABLE IF NOT EXISTS DRIVE_FILES (
        id VARCHAR(255) PRIMARY KEY,
        mimeType VARCHAR(255),
        fileName VARCHAR(255),
        content TEXT,
        link VARCHAR(255),
        email VARCHAR(255)
    )
`);

const sec = await pgClient.query(`
    CREATE TABLE IF NOT EXISTS SALESFORCE_CONTACTS(
        id VARCHAR(255) PRIMARY KEY,
        full_name VARCHAR(255),
        title VARCHAR(255),
        contact_email VARCHAR(255),
        user_email VARCHAR(255)
    )
`);


await pgClient.end();
