const dotenv = require('dotenv');
const path = require('path');

// Load .env file from the project root
dotenv.config({ path: path.resolve(__dirname, '.env') });

const express = require('express');
const mongoose = require('mongoose');
// other imports...

const app = express();
const PORT = process.env.PORT || 5000;

// Log environment variables for debugging (remove in production)
console.log('Environment variables loaded:');
console.log('MONGODB_URI exists:', process.env.MONGODB_URI ? 'Yes' : 'No');
console.log('NODE_ENV:', process.env.NODE_ENV);

// Connect to MongoDB with fallback and better error handling
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/counseling-platform';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('MongoDB connected successfully');
})
.catch(err => {
  console.error('Error connecting to MongoDB:', err.message);
  console.log('Please check your .env file and ensure MONGODB_URI is correctly set.');
  process.exit(1);
});

// Sample counselors
const counselors = [
    {
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@example.com',
        password: 'Password123',
        role: 'counselor',
        bio: 'Licensed clinical psychologist with 10 years of experience in cognitive behavioral therapy. Specializes in anxiety, depression, and trauma.',
        specialties: ['Anxiety', 'Depression', 'Trauma', 'CBT']
    },
    {
        name: 'Dr. Michael Chen',
        email: 'michael.chen@example.com',
        password: 'Password123',
        role: 'counselor',
        bio: 'Family therapist with extensive experience in couples counseling and relationship issues. Compassionate approach to helping families heal and grow together.',
        specialties: ['Couples Therapy', 'Family Counseling', 'Relationship Issues']
    },
    {
        name: 'Dr. Amara Patel',
        email: 'amara.patel@example.com',
        password: 'Password123',
        role: 'counselor',
        bio: 'Specialized in adolescent psychology and youth development. Dedicated to helping young people navigate challenging life transitions and mental health issues.',
        specialties: ['Adolescent Psychology', 'Youth Counseling', 'School Issues']
    }
];

// Sample clients
const clients = [
    {
        name: 'John Smith',
        email: 'john.smith@example.com',
        password: 'Password123',
        role: 'client'
    },
    {
        name: 'Emily Wilson',
        email: 'emily.wilson@example.com',
        password: 'Password123',
        role: 'client'
    }
];

// Admin user
const admin = {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'AdminPassword123',
    role: 'admin'
};

// Hash password function
const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

// Seed database function
const seedDatabase = async () => {
    try {
        // Clear existing data
        await User.deleteMany({});
        console.log('Cleared existing users');

        // Hash passwords for all users
        const counselorsWithHashedPasswords = await Promise.all(
            counselors.map(async (counselor) => ({
                ...counselor,
                password: await hashPassword(counselor.password)
            }))
        );

        const clientsWithHashedPasswords = await Promise.all(
            clients.map(async (client) => ({
                ...client,
                password: await hashPassword(client.password)
            }))
        );

        admin.password = await hashPassword(admin.password);

        // Insert counselors
        const insertedCounselors = await User.insertMany(counselorsWithHashedPasswords);
        console.log(`${insertedCounselors.length} counselors seeded`);

        // Insert clients
        const insertedClients = await User.insertMany(clientsWithHashedPasswords);
        console.log(`${insertedClients.length} clients seeded`);

        // Insert admin
        const insertedAdmin = await User.create(admin);
        console.log('Admin user seeded');

        console.log('✅ Database seeded successfully!');
        console.log('\nSample login credentials:');
        console.log('Counselor: sarah.johnson@example.com / Password123');
        console.log('Client: john.smith@example.com / Password123');
        console.log('Admin: admin@example.com / AdminPassword123');
    } catch (error) {
        console.error('Error seeding database:', error.message);
    } finally {
        // Close database connection
        await mongoose.connection.close();
        console.log('Database connection closed');
    }
};

// Run the seed function with proper error handling
seedDatabase()
    .catch(err => {
        console.error('Fatal error during seeding:', err);
        process.exit(1);
    }); 