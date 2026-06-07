const express = require('express');
const router = express.Router();
const { getAll, getById, create, update, deleteRecord, sync } = require('../controllers/syncController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getAll);
router.get('/:id', getById);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', deleteRecord);

// Bulk sync endpoint
router.post('/bulk', sync);

module.exports = router;
