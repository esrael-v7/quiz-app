const SyncModel = require('../models/SyncModel');
const SyncService = require('../services/SyncService');

exports.getAll = async (req, res) => {
    try {
        const records = await SyncModel.findAllByUser(req.user.id);
        res.json({ status: 'success', data: records });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const record = await SyncModel.findById(req.params.id);
        if (!record || record.user_id !== req.user.id) {
            return res.status(404).json({ status: 'error', message: 'Record not found' });
        }
        res.json({ status: 'success', data: record });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { id, type, data, last_modified_at } = req.body;
        if (!id || !type || !data) {
            return res.status(400).json({ status: 'error', message: 'Missing required fields' });
        }
        
        const record = await SyncModel.create({
            id,
            user_id: req.user.id,
            type,
            data,
            last_modified_at: last_modified_at || new Date().toISOString()
        });
        
        res.status(201).json({ status: 'success', data: record });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const { data, last_modified_at } = req.body;
        const record = await SyncModel.update(
            req.params.id, 
            req.user.id, 
            data, 
            last_modified_at || new Date().toISOString()
        );
        
        if (!record) {
            return res.status(404).json({ status: 'error', message: 'Record not found' });
        }
        res.json({ status: 'success', data: record });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

exports.deleteRecord = async (req, res) => {
    try {
        const record = await SyncModel.delete(req.params.id, req.user.id, new Date().toISOString());
        if (!record) {
            return res.status(404).json({ status: 'error', message: 'Record not found' });
        }
        res.json({ status: 'success', message: 'Record deleted' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

exports.sync = async (req, res) => {
    try {
        const { lastSyncTime, changes } = req.body;
        
        if (!changes) {
            return res.status(400).json({ status: 'error', message: 'Changes payload is required' });
        }

        const result = await SyncService.processBulkSync(req.user.id, lastSyncTime, changes);
        res.json(result);
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
