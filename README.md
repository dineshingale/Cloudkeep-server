# ☁️ Cloudkeep Server

The backend REST API for the Cloudkeep application, handling data persistence, authentication, and file storage. Built with Node.js, Express, and MongoDB, and integrates with Cloudinary for media assets.

## 🚀 Features

-   **RESTful API**: Structured endpoints for Thoughts and Notes management.
-   **Cloud Database**: Data storage using MongoDB (via Mongoose).
-   **File Storage**: Integration with Cloudinary for image and file uploads.
-   **Middleware**: Custom middleware for error handling and request processing.
-   **CORS Support**: Configured for secure cross-origin requests.

## 🛠️ Tech Stack

-   **Runtime**: [Node.js](https://nodejs.org/)
-   **Framework**: [Express.js](https://expressjs.com/)
-   **Database**: [MongoDB](https://www.mongodb.com/) (Mongoose ODM)
-   **Storage**: [Cloudinary](https://cloudinary.com/)
-   **Utilities**: [Multer](https://github.com/expressjs/multer) (file handling), [Dotenv](https://github.com/motdotla/dotenv)

## 📦 Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/dineshingale/Cloudkeep-server.git
    cd Cloudkeep-server
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Setup:**
    Create a `.env` file in the root directory and configure the following variables:
    ```env
    PORT=5000
    MONGODB_URI=your_mongodb_connection_string
    CLOUDINARY_CLOUD_NAME=your_cloud_name
    CLOUDINARY_API_KEY=your_api_key
    CLOUDINARY_API_SECRET=your_api_secret
    ```

4.  **Run Development Server:**
    ```bash
    npm run dev
    ```
    The server will start on `http://localhost:5000`.

5.  **Run in Production:**
    ```bash
    npm start
    ```

## 📂 Project Structure

```
src/
├── config/          # Configuration files (DB, Cloudinary)
├── controllers/     # Route logic
├── models/          # Mongoose schemas
├── routes/          # API route definitions
├── middleware/      # Express middleware
├── utils/           # Helper functions
└── server.js        # Entry point
```

## 📡 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/thoughts` | Retrieve all thoughts |
| `POST` | `/api/thoughts` | Create a new thought |
| `PATCH` | `/api/thoughts/:id` | Update a thought |
| `DELETE` | `/api/thoughts/:id` | Delete a thought |
*(Note: Refer to `routes/` for the complete API map)*

## 🤝 Contributing

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/new-api`).
3.  Commit your changes (`git commit -m 'feat: add new endpoint'`).
4.  Push to the branch (`git push origin feature/new-api`).
5.  Open a Pull Request.
