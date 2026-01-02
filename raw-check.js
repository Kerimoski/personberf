const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

async function check() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const res = await client.query('SELECT id, title, "isPublished" FROM "Product"');
        console.log('Products:', JSON.stringify(res.rows, null, 2));

        const unpublished = res.rows.filter(r => !r.isPublished);
        if (unpublished.length > 0) {
            console.log(`Found ${unpublished.length} unpublished products. Fixing...`);
            await client.query('UPDATE "Product" SET "isPublished" = true');
            console.log('All products marked as published.');
        }
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
}

check();
