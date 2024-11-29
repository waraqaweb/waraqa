const mongoose = require("mongoose");

async function main() {
  try {
    // Connect to the MongoDB database
    await mongoose.connect(
      "mongodb+srv://arjuncvinod:gdozFKJP7i12I87s@cluster0.yjxy0xp.mongodb.net/todoListDB",
      { useNewUrlParser: true, useUnifiedTopology: true }
    );
    console.log("Profile: Database connected");
  } catch (err) {
    console.error("ProfileDB: Error connecting to the database:", err.message);
  }
}

// Call the connection function
main();

const profileSchema = new mongoose.Schema({
  username: String,
  fullname: String,
  email: String,
  password: String,
  type: String,
  dp: String,
  bio: String,
  weblink: String,
  facebook: String,
  whatsapp: String,
  twitter: String,
  instagram: String,
  phoneno: String,
});

// Log schema initialization
console.log("ProfileDB: Profile schema initialized");

const Profile = mongoose.model("profile", profileSchema);

// Log model creation
console.log("ProfileDB: Profile model created");

module.exports = Profile;
