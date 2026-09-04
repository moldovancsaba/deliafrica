import mongoose from 'mongoose';

const globalCache = globalThis.__deliMongo || { connection: null, promise: null };
globalThis.__deliMongo = globalCache;

export async function connectToDatabase() {
  // Vercel integrations may prefix the variable with the project name.
  const uri = process.env.MONGODB_URI || process.env.deli_MONGODB_URI;
  if (!uri) {
    return { connected: false, configured: false, state: 'Not configured' };
  }

  if (mongoose.connection.readyState === 1) {
    return { connected: true, configured: true, state: 'Connected' };
  }

  if (!globalCache.promise) {
    globalCache.promise = mongoose.connect(uri, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 4000,
      maxPoolSize: 10
    });
  }

  try {
    globalCache.connection = await globalCache.promise;
    return { connected: true, configured: true, state: 'Connected' };
  } catch (error) {
    globalCache.promise = null;
    return {
      connected: false,
      configured: true,
      state: 'Connection failed',
      error: error instanceof Error ? error.message : 'Unknown MongoDB error'
    };
  }
}

export function getMongoState() {
  const states = ['Disconnected', 'Connected', 'Connecting', 'Disconnecting'];
  return states[mongoose.connection.readyState] || 'Unknown';
}
