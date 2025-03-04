const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    counselorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: [true, 'Please provide appointment date and time']
    },
    duration: {
        type: Number,
        required: [true, 'Please provide appointment duration in minutes'],
        default: 60
    },
    status: {
        type: String,
        enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
        default: 'scheduled'
    },
    notes: {
        type: String,
        maxlength: [500, 'Notes cannot be more than 500 characters']
    }
}, {
    timestamps: true
});

// Add an index for easier querying
AppointmentSchema.index({ clientId: 1, date: 1 });
AppointmentSchema.index({ counselorId: 1, date: 1 });

module.exports = mongoose.model('Appointment', AppointmentSchema);