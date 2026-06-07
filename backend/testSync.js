const SyncService = require('./services/SyncService');

async function test() {
    try {
        console.log('Testing bulk sync...');
        const changes = {
            created: [{
                id: 'sync-item-1',
                type: 'NOTE',
                data: { title: 'Offline Note 1' },
                last_modified_at: new Date().toISOString()
            }],
            updated: [],
            deleted: []
        };
        
        // Admin user id is 4
        const result = await SyncService.processBulkSync(4, new Date(0).toISOString(), changes);
        console.log('Success:', JSON.stringify(result, null, 2));
    } catch (err) {
        console.error('Test Failed:', err);
    } finally {
        process.exit(0);
    }
}

test();
