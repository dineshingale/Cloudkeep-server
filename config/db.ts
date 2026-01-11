import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
    try {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }
        await mongoose.connect(mongoUri);
        console.log('MongoDB Connected Successfully');
    } catch (err: any) {
        console.error('MongoDB Connection Failed:', err.message);
        process.exit(1);
    }
};

export default connectDB;
