# Psychological Counselling Backend

## Project Title
Psychological Counselling Backend

## Description
This project aims to provide a backend system for psychological counselling services. It includes features for managing appointments, storing patient records, and facilitating communication between counsellors and patients.

## Installation Instructions
1. Clone the repository:
   ```bash
   git clone https://github.com/mukundjha-mj/Psychological-Counselling-backend.git
   ```
2. Navigate to the project directory:
   ```bash
   cd Psychological-Counselling-backend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Set up the environment variables:
   - Create a `.env` file in the root directory.
   - Add the following environment variables:

     ```plaintext
     # Environment
     NODE_ENV=development

     # Server
     PORT=5000

     # MongoDB Connection
     MONGODB_URI='mongodb://localhost:27017/counseling-platform'

     # JWT
     JWT_SECRET=$(openssl rand -base64 64)
     JWT_EXPIRE=30d

     # Email Configuration
     SMTP_HOST=smtp.example.com
     SMTP_PORT=587
     SMTP_SECURE=false
     SMTP_USER=your_email@example.com
     SMTP_PASSWORD=your_password
     EMAIL_FROM=support@counselingplatform.com

     # Client URL (for CORS)
     CLIENT_URL=http://localhost:5000
     ```

5. Start the server:
   ```bash
   npm start
   ```

## Usage
- To create a new appointment, send a POST request to `/appointments` with the necessary details.
- To retrieve patient records, send a GET request to `/patients`.
- To communicate with a counsellor, use the `/messages` endpoint.

## Contributing
We welcome contributions from the community. To contribute, follow these steps:
1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes and commit them:
   ```bash
   git commit -m 'Add some feature'
   ```
4. Push to the branch:
   ```bash
   git push origin feature/your-feature-name
   ```
5. Open a pull request.

## License
This project is licensed under the MIT License.
