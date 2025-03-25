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
   - Add the necessary environment variables (e.g., database connection strings, API keys).

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
