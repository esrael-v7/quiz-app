const { adminPool } = require('./config/db');

async function run() {
    try {
        const query = `
        SELECT
            conrelid::regclass AS table_name,
            a.attname AS column_name,
            confdeltype
        FROM
            pg_constraint c
        JOIN
            pg_attribute a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid
        WHERE
            confrelid = 'users'::regclass;
        `;
        const { rows } = await adminPool.query(query);
        console.table(rows);
    } catch (err) {
        console.error(err);
    } finally {
        adminPool.end();
    }
}
run();
