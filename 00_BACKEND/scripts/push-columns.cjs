const { execSync } = require('child_process');
const config = require('../appwrite.config.json');

const DB_ID = '6a4c8598001da3b0d7f0';
const SLEEP_MS = 1500;
const SLEEP_LONG_MS = 3000;

function run(cmd, label) {
    try {
        const out = execSync(cmd, { encoding: 'utf8', timeout: 30000, stdio: ['pipe', 'pipe', 'pipe'] });
        console.log(`  ✓ ${label}`);
        return out;
    } catch (e) {
        const msg = (e.stderr || e.stdout || e.message || '').toString();
        if (msg.includes('already exists') || msg.includes('already in use')) {
            console.log(`  ∼ ${label} (already exists)`);
            return '';
        }
        console.log(`  ✗ ${label}: ${msg.slice(0, 300).replace(/\n/g, ' ')}`);
        return '';
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function bool(v) {
    return v ? 'true' : 'false';
}

async function createColumns(tableId, columns) {
    for (const col of columns) {
        let cmd;
        const base = `appwrite tables-db --database-id ${DB_ID} --table-id ${tableId}`;

        switch (col.type) {
            case 'string': {
                if (col.elements && col.elements.length > 0) {
                    const elems = col.elements.map(e => `"${e}"`).join(' ');
                    cmd = `appwrite tables-db create-enum-column --database-id ${DB_ID} --table-id ${tableId} --key ${col.key} --elements ${elems} --required ${bool(col.required)}`;
                    if (col.default !== null && col.default !== undefined) {
                        cmd += ` --xdefault "${col.default}"`;
                    }
                } else {
                    cmd = `appwrite tables-db create-string-column --database-id ${DB_ID} --table-id ${tableId} --key ${col.key} --size ${col.size || 255} --required ${bool(col.required)}`;
                    if (col.default !== null && col.default !== undefined) {
                        cmd += ` --xdefault "${col.default}"`;
                    }
                    if (col.encrypt === false) {
                        cmd += ` --encrypt false`;
                    }
                    if (col.array) {
                        cmd += ` --array true`;
                    }
                }
                break;
            }
            case 'integer':
                cmd = `appwrite tables-db create-integer-column --database-id ${DB_ID} --table-id ${tableId} --key ${col.key} --required ${bool(col.required)}`;
                if (col.default !== null && col.default !== undefined) {
                    cmd += ` --xdefault ${col.default}`;
                }
                if (col.min !== null && col.min !== undefined) cmd += ` --min ${col.min}`;
                if (col.max !== null && col.max !== undefined) cmd += ` --max ${col.max}`;
                if (col.array) cmd += ` --array true`;
                break;
            case 'double':
                cmd = `appwrite tables-db create-float-column --database-id ${DB_ID} --table-id ${tableId} --key ${col.key} --required ${bool(col.required)}`;
                if (col.default !== null && col.default !== undefined) {
                    cmd += ` --xdefault ${col.default}`;
                }
                if (col.min !== null && col.min !== undefined) cmd += ` --min ${col.min}`;
                if (col.max !== null && col.max !== undefined) cmd += ` --max ${col.max}`;
                if (col.array) cmd += ` --array true`;
                break;
            case 'boolean':
                cmd = `appwrite tables-db create-boolean-column --database-id ${DB_ID} --table-id ${tableId} --key ${col.key} --required ${bool(col.required)}`;
                if (col.default !== null && col.default !== undefined) {
                    cmd += ` --xdefault ${col.default}`;
                }
                if (col.array) cmd += ` --array true`;
                break;
            case 'datetime':
                cmd = `appwrite tables-db create-datetime-column --database-id ${DB_ID} --table-id ${tableId} --key ${col.key} --required ${bool(col.required)}`;
                if (col.array) cmd += ` --array true`;
                break;
            default:
                console.log(`  ? Unknown type ${col.type} for ${col.key}, skipping`);
                continue;
        }

        run(cmd, `${tableId}.${col.key} (${col.type})`);
        await sleep(SLEEP_MS);
    }
}

async function createIndexes(tableId, indexes) {
    for (const idx of indexes) {
        const cols = idx.columns || idx.attributes || [];
        const orders = idx.orders || [];
        let cmd = `appwrite tables-db create-index --database-id ${DB_ID} --table-id ${tableId} --key ${idx.key} --type ${idx.type} --columns ${cols.join(' ')}`;
        if (orders.length > 0) {
            cmd += ` --orders ${orders.join(' ')}`;
        }
        run(cmd, `${tableId}.idx_${idx.key}`);
        await sleep(SLEEP_MS);
    }
}

async function main() {
    const tables = config.tables.filter(t => t.columns && t.columns.length > 0);
    console.log(`Pushing columns for ${tables.length} tables...\n`);

    for (const t of tables) {
        console.log(`\n── ${t.name} (${t['$id']}) ──`);
        console.log(`  Columns: ${t.columns.length}, Indexes: ${(t.indexes || []).length}`);

        await createColumns(t['$id'], t.columns);
        await sleep(SLEEP_LONG_MS);

        if (t.indexes && t.indexes.length > 0) {
            await createIndexes(t['$id'], t.indexes);
        }
    }

    console.log('\nDone.');
}

main().catch(console.error);
