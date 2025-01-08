// Import the mongoose library to interact with MongoDB
const mongoose = require("mongoose");
// Define an asynchronous function to connect to the database
async function main() {
  try {
    // Connect to the MongoDB database using mongoose
    // Replace the connection string with your MongoDB URI
    await mongoose.connect(
      "mongodb+srv://waraqaweb:kb40UWuV1mXJEE9i@cluster0.2ysyr.mongodb.net/",
      {
        // Use the new URL parser to avoid deprecation warnings
        useNewUrlParser: true,
        
        // Use the unified topology engine for better connection management
        useUnifiedTopology: true,
      }
    );
    
    // Log a success message when the database connection is successful
    console.log("Post   : Database connected");
  } catch (err) {
    // Log an error message if there is a problem connecting to the database
    console.error("PostDB: Error connecting to the database:", err.message);
  }
}

// Call the `main` function to establish the database connection
main();

// Define a schema for the "post" collection in MongoDB
const postSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true }, // Enforce unique title
  slug: { type: String, required: true, unique: true }, // Enforce unique slug
  content: { type: String, required: true },
  thumbnail: { type: String },
  date: { type: Date, default: Date.now },
  like: { type: Number, default: 0 },
  author: { type: String, required: true },
});

console.log("PostDB: Post schema updated with slug field");
//----------------------------------------------------------------------------------
// Add indexes for better performance
postSchema.index({ slug: 1 });
postSchema.index({ date: -1 });
postSchema.index({ like: -1 });
//----------------------------------------------------------------------------------


// Create a Mongoose model based on the `postSchema`
// This model allows interaction with the "post" collection in the database
const PosT = mongoose.model("post", postSchema);

// Log a message to indicate that the model has been created
console.log("PostDB: Post model created");

// Export the `PosT` model so it can be used in other parts of the application
module.exports = PosT;
