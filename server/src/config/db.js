const mongoose = require("mongoose");

const connectDB = async () => {
  const atlasUri = process.env.MONGO_URI;
  const localUri = "mongodb://127.0.0.1:27017/streammate";

  try {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(atlasUri);
    console.log("MongoDB Connected to Atlas successfully!");
  } catch (error) {
    console.warn(`\nMongoDB Atlas connection failed: ${error.message}`);
    console.log(`Attempting fallback to local MongoDB (${localUri})...`);
    
    try {
      await mongoose.connect(localUri);
      console.log("MongoDB Connected to Local instance successfully!");
    } catch (localError) {
      console.error("\n====================================================================");
      console.error("❌ DATABASE CONNECTION FAILURE!");
      console.error("Could not connect to MongoDB Atlas OR local MongoDB.");
      console.error("\nHow to resolve this:");
      console.error("Option A (MongoDB Atlas):");
      console.error("  1. Go to MongoDB Atlas (https://cloud.mongodb.com/).");
      console.error("  2. In the left sidebar, click 'Network Access' under Security.");
      console.error("  3. Click 'Add IP Address' and choose 'Add Current IP Address' or 'Allow Access From Anywhere' (0.0.0.0/0) for testing.");
      console.error("  4. Wait for it to deploy (usually ~1 min) and try restarting the server.");
      console.error("\nOption B (Local MongoDB):");
      console.error("  1. Make sure MongoDB Community Server is installed (https://www.mongodb.com/try/download/community).");
      console.error("  2. Verify the MongoDB Service is running on your machine (listening on 127.0.0.1:27017).");
      console.error("====================================================================\n");
      process.exit(1);
    }
  }
};

module.exports = connectDB;