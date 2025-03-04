const Appointment = require('../models/Appointment');
const User = require('../models/User');

// @desc    Book a new appointment
// @route   POST /api/booking
// @access  Private (clients only)
exports.bookAppointment = async (req, res, next) => {
    try {
        const { counselorId, date, duration, notes } = req.body;

        const counselor = await User.findOne({
            _id: counselorId,
            role: 'counselor'
        });

        if (!counselor) {
            return res.status(404).json({
                success: false,
                message: 'Counselor not found'
            });
        }

        const appointmentDate = new Date(date);
        if (appointmentDate <= new Date()) {
            return res.status(400).json({
                success: false,
                message: 'Appointment date must be in the future'
            });
        }

        const existingAppointment = await Appointment.findOne({
            counselorId,
            date: appointmentDate,
            status: 'scheduled'
        });

        if (existingAppointment) {
            return res.status(400).json({
                success: false,
                message: 'Counselor is already booked at this time'
            });
        }

        const appointment = await Appointment.create({
            clientId: req.user.id,
            counselorId,
            date: appointmentDate,
            duration: duration || 60,
            notes
        });

        res.status(201).json({
            success: true,
            data: appointment
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get all appointments for current user
// @route   GET /api/booking
// @access  Private
exports.getAppointments = async (req, res, next) => {
    try {
        let query = {};

        // If client, get their appointments
        if (req.user.role === 'client') {
            query.clientId = req.user.id;
        }

        // If counselor, get their appointments
        if (req.user.role === 'counselor') {
            query.counselorId = req.user.id;
        }

        const appointments = await Appointment.find(query)
            .sort({ date: 1 })
            .populate({
                path: req.user.role === 'client' ? 'counselorId' : 'clientId',
                select: 'name'
            });

        res.status(200).json({
            success: true,
            count: appointments.length,
            data: appointments
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get single appointment
// @route   GET /api/booking/:id
// @access  Private
exports.getAppointment = async (req, res, next) => {
    try {
        const appointment = await Appointment.findById(req.params.id)
            .populate({
                path: 'clientId counselorId',
                select: 'name'
            });

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        // Make sure user is either the client or counselor
        if (
            appointment.clientId._id.toString() !== req.user.id &&
            appointment.counselorId._id.toString() !== req.user.id &&
            req.user.role !== 'admin'
        ) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this appointment'
            });
        }

        res.status(200).json({
            success: true,
            data: appointment
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Update appointment status
// @route   PUT /api/booking/:id
// @access  Private
exports.updateAppointment = async (req, res, next) => {
    try {
        const { status, notes } = req.body;

        let appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        // Make sure user is either the client or counselor
        if (
            appointment.clientId.toString() !== req.user.id &&
            appointment.counselorId.toString() !== req.user.id &&
            req.user.role !== 'admin'
        ) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this appointment'
            });
        }

        // Only allow certain status updates based on role
        if (status) {
            if (req.user.role === 'client' && status === 'cancelled') {
                appointment.status = status;
            } else if (req.user.role === 'counselor' &&
                ['completed', 'cancelled', 'rescheduled'].includes(status)) {
                appointment.status = status;
            } else if (req.user.role === 'admin') {
                appointment.status = status;
            } else {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized to update status to ' + status
                });
            }
        }

        // Update notes if provided
        if (notes) {
            appointment.notes = notes;
        }

        await appointment.save();

        res.status(200).json({
            success: true,
            data: appointment
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete appointment
// @route   DELETE /api/booking/:id
// @access  Private
exports.deleteAppointment = async (req, res, next) => {
    try {
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        // Make sure user is either the client or admin
        if (
            appointment.clientId.toString() !== req.user.id &&
            req.user.role !== 'admin'
        ) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this appointment'
            });
        }

        // Only allow deletion if appointment is in the future
        const appointmentDate = new Date(appointment.date);
        if (appointmentDate <= new Date()) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete past appointments'
            });
        }

        await appointment.remove();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        next(err);
    }
};