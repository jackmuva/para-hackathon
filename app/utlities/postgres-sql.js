import pg from 'pg';
const { Pool } = pg;
import 'dotenv/config';

const pool = new Pool({
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    database: process.env.PGDATABASE
});

export const insertRecord = async (record) => {
    let result = {}
    try {
        const text = 'INSERT INTO DRIVE_FILES(id, mimeType, fileName, content, link, email) VALUES($1, $2, $3, $4, $5, $6) RETURNING *'
        const values = [record.id, record.mimeType, record.fileName, record.content, record.link, record.email]

        const res = await pool.query(text, values);
        result = res.rows[0];
    } catch (err) {
        console.log("[POSTGRES] " + err);
    }
    return result;
}

process.on('SIGINT', async () => {
    console.log('SIGINT signal received.');
    const res = await pool.end();
    if (res || true) {
        process.exit(0);
    }
});

process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received.');
    const res = await pool.end();
    if (res || true) {
        process.exit(0);
    }
});
