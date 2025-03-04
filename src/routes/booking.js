const express = require('express');
const {
    bookAppointment,
    getAppointments,
    getAppointment,
    updateAppointment,
    deleteAppointment
} = require('../controllers/booking');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, authorize('client'), bookAppointment);
router.get('/', protect, getAppointments);
router.get('/:id', protect, getAppointment);
router.put('/:id', protect, updateAppointment);
router.delete('/:id', protect, authorize('client', 'admin'), deleteAppointment);

module.exports = router;