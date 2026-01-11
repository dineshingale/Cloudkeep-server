import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import recordRoutes from './routes/record.routes';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json()); // For parsing JSON bodies
app.use(express.urlencoded({ extended: true })); // For parsing URL-encoded data

// Routes
app.use('/api/records', recordRoutes);

// Root Endpoint
app.get('/', (req: Request, res: Response) => {
    res.send('CloudKeep Server is Running');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
