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
    CREATE TABLE DRIVE_FILES (
        id VARCHAR(255),
        mimeType VARCHAR(255),
        fileName VARCHAR(255),
        content TEXT,
        link VARCHAR(255)
    )
`);

await pgClient.end();