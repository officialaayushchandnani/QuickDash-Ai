import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://chandnaniaayush6:Aayush%40123@cluster0.ym847od.mongodb.net/quickdash-ai?retryWrites=true&w=majority';

export const connectDatabase = async (): Promise<void> => {
  try {
    if (mongoose.connection.readyState === 0) {
      console.log('Connecting to MongoDB...');
      await mongoose.connect(MONGODB_URI);
      console.log('✅ MongoDB connected successfully');
    }
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    // Don't throw error to prevent server crash
    console.log('Server will continue without database connection');
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('📥 MongoDB disconnected');
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error);
  }
};

export default mongoose;
