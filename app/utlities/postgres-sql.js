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

export const insertRecord = async(record) => {
    let result = {}
    try {
        await pgClient.connect();

        const text = 'INSERT INTO DRIVE_FILES(id, mimeType, fileName, content, link) VALUES($1, $2, $3, $4, $5) RETURNING *'
        const values = [record.id, record.mimeType, record.fileName, record.content, record.link]

        const res = await pgClient.query(text, values);
        result = res.rows[0];
    } catch(err){
        console.log("[POSTGRES] " + err);
    } finally{
        await pgClient.end();
        return result;
    }
}