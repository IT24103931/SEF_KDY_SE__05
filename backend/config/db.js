import mongoose from 'mongoose';

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not configured');
  }

  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: 'cleansl'
  });

  console.log('MongoDB connected');
};

export default connectDB;