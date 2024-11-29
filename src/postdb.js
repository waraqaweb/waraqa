const mongoose = require("mongoose");

async function main() {
  try {
    // Connect to the MongoDB database
    await mongoose.connect(
      "mongodb+srv://arjuncvinod:gdozFKJP7i12I87s@cluster0.yjxy0xp.mongodb.net/todoListDB",
      { useNewUrlParser: true, useUnifiedTopology: true }
    );
    console.log("Post   : Database connected");
  } catch (err) {
    console.error("PostDB: Error connecting to the database:", err.message);
  }
}

// Call the connection function
main();

const postSchema = new mongoose.Schema({
  author: String,
  title: String,
  content: String,
  thumbnail: String,
  date: Number,
  like: Number,
  likedby: [String],
});

// Log schema initialization
console.log("PostDB: Post schema initialized");

const PosT = mongoose.model("post", postSchema);

// Log model creation
console.log("PostDB: Post model created");

module.exports = PosT;
