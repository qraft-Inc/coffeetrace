import mongoose from 'mongoose';

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections from growing exponentially
 * during API Route usage.
 * 
 * This is especially important for Netlify Functions where each invocation
 * could create a new connection if not cached properly.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Establishes a connection to MongoDB Atlas
 * Uses connection pooling and caching for serverless environments
 * 
 * @returns {Promise<typeof mongoose>} Mongoose instance
 */
async function dbConnect() {
  // Return existing connection if available
  if (cached.conn) {
    return cached.conn;
  }

  // Create new connection promise if none exists
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Disable buffering for serverless
      maxPoolSize: 10,        // Limit connection pool size
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    if (!process.env.MONGODB_URI) {
      console.warn('⚠️ MONGODB_URI not defined - database operations will be skipped');
      cached.promise = Promise.resolve(null);
      return null;
    }

    cached.promise = mongoose.connect(process.env.MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ MongoDB connected successfully');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('❌ MongoDB connection error:', e);
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
