const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod = null;

const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI;

    // If no URI is provided in .env, fallback to in-memory server
    if (!uri || uri.trim() === '') {
      try {
        mongod = await MongoMemoryServer.create();
        uri = mongod.getUri();
        console.log('No MONGO_URI found in .env. Using fallback In-Memory Database.');
      } catch (err) {
        console.error('MongoMemoryServer failed to start, using global Virtual Memory Database instead:', err.message);
        global.useVirtualDB = true;
        return;
      }
    }

    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}. Activating Virtual Memory Database.`);
    global.useVirtualDB = true;
  }
};

module.exports = connectDB;
