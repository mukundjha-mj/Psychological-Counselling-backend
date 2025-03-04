const { transporter } = require('../config/email');

/**
 * Send appointment confirmation to client
 * @param {Object} appointment - The appointment object
 * @param {Object} client - The client user object
 * @param {Object} counselor - The counselor user object
 */
exports.sendAppointmentConfirmation = async (appointment, client, counselor) => {
    try {
        const appointmentDate = new Date(appointment.date).toLocaleString();

        await transporter.sendMail({
            from: `"Counseling Platform" <${process.env.EMAIL_FROM}>`,
            to: client.email,
            subject: 'Appointment Confirmation',
            html: `
        <h1>Appointment Confirmation</h1>
        <p>Hello ${client.name},</p>
        <p>Your appointment with ${counselor.name} has been confirmed for:</p>
        <p><strong>${appointmentDate}</strong></p>
        <p>Duration: ${appointment.duration} minutes</p>
        ${appointment.notes ? `<p>Notes: ${appointment.notes}</p>` : ''}
        <p>If you need to cancel or reschedule, please do so at least 24 hours in advance.</p>
        <p>Thank you for using our platform!</p>
      `,
        });

        // Also notify the counselor
        await transporter.sendMail({
            from: `"Counseling Platform" <${process.env.EMAIL_FROM}>`,
            to: counselor.email,
            subject: 'New Appointment Scheduled',
            html: `
        <h1>New Appointment</h1>
        <p>Hello ${counselor.name},</p>
        <p>A new appointment has been scheduled with ${client.name} for:</p>
        <p><strong>${appointmentDate}</strong></p>
        <p>Duration: ${appointment.duration} minutes</p>
        ${appointment.notes ? `<p>Notes: ${appointment.notes}</p>` : ''}
        <p>Please ensure you're available at this time.</p>
      `,
        });

        return true;
    } catch (error) {
        console.error('Email sending error:', error);
        return false;
    }
};

/**
 * Send appointment reminder to both client and counselor
 * @param {Object} appointment - The appointment object
 * @param {Object} client - The client user object
 * @param {Object} counselor - The counselor user object
 */
exports.sendAppointmentReminder = async (appointment, client, counselor) => {
    try {
        const appointmentDate = new Date(appointment.date).toLocaleString();

        // Remind the client
        await transporter.sendMail({
            from: `"Counseling Platform" <${process.env.EMAIL_FROM}>`,
            to: client.email,
            subject: 'Upcoming Appointment Reminder',
            html: `
        <h1>Appointment Reminder</h1>
        <p>Hello ${client.name},</p>
        <p>This is a reminder about your upcoming appointment with ${counselor.name}:</p>
        <p><strong>${appointmentDate}</strong></p>
        <p>Duration: ${appointment.duration} minutes</p>
        <p>If you need to cancel, please do so as soon as possible.</p>
      `,
        });

        // Remind the counselor
        await transporter.sendMail({
            from: `"Counseling Platform" <${process.env.EMAIL_FROM}>`,
            to: counselor.email,
            subject: 'Upcoming Appointment Reminder',
            html: `
        <h1>Appointment Reminder</h1>
        <p>Hello ${counselor.name},</p>
        <p>This is a reminder about your upcoming appointment with ${client.name}:</p>
        <p><strong>${appointmentDate}</strong></p>
        <p>Duration: ${appointment.duration} minutes</p>
      `,
        });

        return true;
    } catch (error) {
        console.error('Email sending error:', error);
        return false;
    }
};

/**
 * Send welcome email to new users
 * @param {Object} user - The user object
 * @param {Boolean} isCounselor - Whether the user is a counselor
 */
exports.sendWelcomeEmail = async (user, isCounselor = false) => {
    try {
        await transporter.sendMail({
            from: `"Counseling Platform" <${process.env.EMAIL_FROM}>`,
            to: user.email,
            subject: 'Welcome to Counseling Platform',
            html: `
        <h1>Welcome to Counseling Platform!</h1>
        <p>Hello ${user.name},</p>
        <p>Thank you for joining our platform. We're excited to have you ${isCounselor ? 'as a counselor' : 'with us'}!</p>
        ${isCounselor
                    ? '<p>Please complete your profile by adding your bio and specialties so clients can find you easily.</p>'
                    : '<p>You can now browse available counselors and book appointments.</p>'}
        <p>If you have any questions, please don't hesitate to contact our support team.</p>
      `,
        });

        return true;
    } catch (error) {
        console.error('Email sending error:', error);
        return false;
    }
};