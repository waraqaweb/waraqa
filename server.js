// Importing required libraries
const express = require("express"); // Importing the Express framework
const mongoose = require("mongoose"); // Importing Mongoose for MongoDB interactions
const path = require("path"); // Importing Path module for file path utilities
const ejs = require("ejs"); // Importing EJS template engine
const sessions = require("express-session"); // Importing express-session for session management

const app = express(); // Initializing an Express application
console.log("Express application initialized");

// Mongoose configuration
mongoose.set("strictQuery", true);
console.log("Mongoose strictQuery set to true");

// Importing data models
// const collection = require("./mongodb"); // Commented out MongoDB collection import
console.log("Initialization: Skipping MongoDB collection import");

const PosT = require("./src/postdb"); // Importing Post model
if (PosT) {
  console.log("Initialization: PosT model loaded successfully");
} else {
  console.error("Initialization: Failed to load PosT model");
}

const Profile = require("./src/profiledb"); // Importing Profile model
if (Profile) {
  console.log("Initialization: Profile model loaded successfully");
} else {
  console.error("Initialization: Failed to load Profile model");
}

let imagename; // Variable to hold the image name
console.log("Initialization: Image name variable declared");

const multer = require("multer"); // Importing multer for file uploads

const { send, title } = require("process"); // Importing process-related utilities (not used here)
console.log("Initialization: Process utilities loaded");

const { profile } = require("console"); // Importing console profile (not used here)
console.log("Initialization: Console utilities loaded");

// Setting up multer storage for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("Setting multer destination.");
    cb(null, "./public/thumbnails"); // Specify upload destination
  },
  filename: (req, file, cb) => {
    console.log("Saving file with original name.");
    cb(null, file.originalname); // Keep the original file name
    imagename = file.originalname; // Store the image name globally
  },
});

const upload = multer({ storage: storage }); // Creating an upload instance with defined storage
console.log("Multer configured with custom storage");
let user; // Variable for storing user data (not used directly)

// Middleware setup
app.use(express.json());
console.log("JSON middleware added");

// Set the views directory
app.set('views', path.join(__dirname, 'views'));
app.set("view engine", "ejs"); // Setting EJS as the templating engine
console.log("EJS set as the view engine");

app.use(express.static('public')); // Serving static files from the public directory
console.log("Static files served from the 'public' directory");

app.use(express.urlencoded({ extended: false })); // Parsing URL-encoded request bodies
console.log("URL-encoded middleware added");

app.use(
  sessions({ // Session management middleware
    secret: "secret key", // Secret key for session
    saveUninitialized: true, // Save uninitialized sessions
    resave: false, // Don't resave sessions that haven't been modified
  })
);
console.log("Session middleware configured");

// Mongoose schema for visits
const visitSchema = new mongoose.Schema({
  visits: Number // Field to store visit count
});
// Mongoose model for visits
const visits = mongoose.model("visits", visitSchema);
console.log("Visits schema and model initialized");

// Route for the login page
app.get("/login", (req, res) => { 
  console.log("GET request to '/login'");
  res.render("login", {
      pageTitle: 'Login - Waraqa',
      metaDescription: 'Discover our online courses in Arabic, Quran, and Islamic Studies.',
      metaKeywords: 'Arabic, Quran, Islamic Studies, online courses',
      ogImage: '/images/home-og-image.jpg',
      ogUrl: 'https://www.waraqaweb.com/home',
  }); 
});
// Route to redirect signup attempts to login
app.get("/signup", (req, res) => {
  console.log("GET request to '/signup'");
  res.redirect("/login"); // Redirect to login page
});

// Route for user signup
app.post("/signup", async (req, res) => {
  console.log("POST request to '/signup'");
  const userExists = await Profile.exists({ username: req.body.name }); // Check if user already exists

  if (!userExists) {
    console.log("User does not exist, creating new profile");
    // If user doesn't exist, create new profile
    const profileData = {
      username: req.body.name,
      email: req.body.email,
      password: req.body.password,
      type: "user",
      fullname: req.body.name,
      dp: "",
      bio: "",
      weblink: "",
      facebook: "",
      whatsapp: "",
      twitter: "",
      instagram: "",
      phoneno: "",
    };

    await Profile.insertMany(profileData); // Save new profile to database
    req.session.useremail = req.body.email; // Set session email
    console.log("New profile created and session updated");
    req.session.username = req.body.name; // Set session username
    res.redirect("/login"); // Redirect to home page
  } else {
    // Alert if user already exists
    console.log("User already exists");
    res.send("<script>alert('User already exists');window.location.href = '/'</script>");
  }
});

// Route for logging out
app.get("/logout", (req, res) => {
  console.log("GET request to '/logout'");
  req.session.destroy(); // Destroy session
  imagename = null; // Clear the image name
  res.redirect("/login"); // Redirect to login page
  console.log("Session destroyed, redirected to '/login'");
});

// Route for home page
app.get("/", async (req, res) => {
  console.log("GET request to '/'");
  try {
    const posts = await PosT.find().exec(); // Fetch all posts
    const sortedPosts = await PosT.find().sort({ like: "desc" }).exec(); // Fetch posts sorted by likes

    // Render home page with posts and user data
    res.render("home", {
      pageTitle: 'Welcome to Waraqa',
      metaDescription: 'Discover our online courses in Arabic, Quran, and Islamic Studies.',
      metaKeywords: 'Arabic, Quran, Islamic Studies, online courses',
      ogImage: '/images/home-og-image.jpg',
      ogUrl: 'https://www.waraqaweb.com/home',
      user: req.session.username || "Guest", // Provide a default username for guests
      posts: posts,
      date: Date.now(),
      sposts: sortedPosts,
    });
    console.log("Home page rendered");
  } catch (err) {
    console.error("Error fetching posts for home:", err);
    res.render("error", { error: "Error fetching posts" }); // Render error page
  }
});

// Route for Subjects Main pages
app.get('/courses/quran-recitation', (req, res) => {
  console.log("GET request to 'a subject page'");
  const user = req.user ? req.user.role : null;
  res.render('courses/quran-recitation/quran-recitation', { 
    pageTitle: 'Quran Recitation - Waraqa',
    metaDescription: 'Discover our online courses in Arabic, Quran, and Islamic Studies.',
    metaKeywords: 'Arabic, Quran, Islamic Studies, online courses',
    ogImage: '/images/home-og-image.jpg',
    ogUrl: 'https://www.waraqaweb.com/home',
    user });
});
app.get('/courses/quran-memorization', (req, res) => {
  console.log("GET request to 'a subject page'");
  const user = req.user ? req.user.role : null;
  res.render('courses/quran-memorization/quran-memorization', { 
    pageTitle: 'Quran Memorization - Waraqa',
    metaDescription: 'Discover our online courses in Arabic, Quran, and Islamic Studies.',
    metaKeywords: 'Arabic, Quran, Islamic Studies, online courses',
    ogImage: '/images/home-og-image.jpg',
    ogUrl: 'https://www.waraqaweb.com/home',
    user });
});
app.get('/courses/arabic-language', (req, res) => {
  console.log("GET request to 'a subject page'");
  const user = req.user ? req.user.role : null;
  res.render('courses/arabic-language/arabic-language', { 
    pageTitle: 'Arabic Language - Waraqa',
    metaDescription: 'Discover our online courses in Arabic, Quran, and Islamic Studies.',
    metaKeywords: 'Arabic, Quran, Islamic Studies, online courses',
    ogImage: '/images/home-og-image.jpg',
    ogUrl: 'https://www.waraqaweb.com/home',
    user });
});
app.get('/courses/islamic-studies', (req, res) => {
  console.log("GET request to 'a subject page'");
  const user = req.user ? req.user.role : null;
  res.render('courses/islamic-studies/islamic-studies', { 
    pageTitle: 'Islamic Studies - Waraqa',
    metaDescription: 'Discover our online courses in Arabic, Quran, and Islamic Studies.',
    metaKeywords: 'Arabic, Quran, Islamic Studies, online courses',
    ogImage: '/images/home-og-image.jpg',
    ogUrl: 'https://www.waraqaweb.com/home',
    user });
});

// Route for quran-recitation Courses
app.get('/courses/quran-recitation/foundation-level', (req, res) => {
  const user = req.user ? req.user.role : null;
  res.render('courses/quran-recitation/foundation-level', { 
    pageTitle: 'Foundation Level - Waraqa',
    metaDescription: 'Discover our online courses in Arabic, Quran, and Islamic Studies.',
    metaKeywords: 'Arabic, Quran, Islamic Studies, online courses',
    ogImage: '/images/home-og-image.jpg',
    ogUrl: 'https://www.waraqaweb.com/home',
    user });
});
app.get('/courses/quran-recitation/khatmah-program', (req, res) => {
  const user = req.user ? req.user.role : null;
  res.render('courses/quran-recitation/khatmah-program', { 
    pageTitle: 'Khatmah Program - Waraqa',
    metaDescription: 'Discover our online courses in Arabic, Quran, and Islamic Studies.',
    metaKeywords: 'Arabic, Quran, Islamic Studies, online courses',
    ogImage: '/images/home-og-image.jpg',
    ogUrl: 'https://www.waraqaweb.com/home',
    user });
});
app.get('/courses/quran-recitation/pre-reading-level', (req, res) => {
  const user = req.user ? req.user.role : null;
  res.render('courses/quran-recitation/pre-reading-level', { 
    pageTitle: 'Pre-reading Level - Waraqa',
    metaDescription: 'Discover our online courses in Arabic, Quran, and Islamic Studies.',
    metaKeywords: 'Arabic, Quran, Islamic Studies, online courses',
    ogImage: '/images/home-og-image.jpg',
    ogUrl: 'https://www.waraqaweb.com/home',
    user });
});
app.get('/courses/quran-recitation/qari-level', (req, res) => {
  const user = req.user ? req.user.role : null;
  res.render('courses/quran-recitation/qari-level', { 
    pageTitle: 'Qari Level - Waraqa',
    metaDescription: 'Discover our online courses in Arabic, Quran, and Islamic Studies.',
    metaKeywords: 'Arabic, Quran, Islamic Studies, online courses',
    ogImage: '/images/home-og-image.jpg',
    ogUrl: 'https://www.waraqaweb.com/home',
    user });
});
app.get('/courses/quran-recitation/tajweed-basics', (req, res) => {
  const user = req.user ? req.user.role : null;
  res.render('courses/quran-recitation/tajweed-basics', { 
    pageTitle: 'Tajweed Basics - Waraqa',
    metaDescription: 'Discover our online courses in Arabic, Quran, and Islamic Studies.',
    metaKeywords: 'Arabic, Quran, Islamic Studies, online courses',
    ogImage: '/images/home-og-image.jpg',
    ogUrl: 'https://www.waraqaweb.com/home',
    user });
});
app.get('/courses/quran-recitation/tajweed-intermediate', (req, res) => {
  const user = req.user ? req.user.role : null;
  res.render('courses/quran-recitation/tajweed-intermediate', { 
    pageTitle: 'Tajweed Intermediate - Waraqa',
    metaDescription: 'Discover our online courses in Arabic, Quran, and Islamic Studies.',
    metaKeywords: 'Arabic, Quran, Islamic Studies, online courses',
    ogImage: '/images/home-og-image.jpg',
    ogUrl: 'https://www.waraqaweb.com/home',
    user });
});

// quran-memorization Courses
app.get('/courses/quran-memorization/short-surahs', (req, res) => {
  const user = req.user ? req.user.role : null;
  res.render('courses/quran-memorization/short-surahs', { 
    pageTitle: 'Short Surahs - Waraqa',
    metaDescription: 'Discover our online courses in Arabic, Quran, and Islamic Studies.',
    metaKeywords: 'Arabic, Quran, Islamic Studies, online courses',
    ogImage: '/images/home-og-image.jpg',
    ogUrl: 'https://www.waraqaweb.com/home',
    user });
});
app.get('/courses/quran-memorization/one-juz', (req, res) => {
  const user = req.user ? req.user.role : null;
  res.render('courses/quran-memorization/one-juz', { 
    pageTitle: 'One Juz - Waraqa',
    metaDescription: 'Discover our online courses in Arabic, Quran, and Islamic Studies.',
    metaKeywords: 'Arabic, Quran, Islamic Studies, online courses',
    ogImage: '/images/home-og-image.jpg',
    ogUrl: 'https://www.waraqaweb.com/home',
    user });
});
app.get('/courses/quran-memorization/hafez-program', (req, res) => {
  const user = req.user ? req.user.role : null;
  res.render('courses/quran-memorization/hafez-program', { 
    pageTitle: 'Hafez Program - Waraqa',
    metaDescription: 'Discover our online courses in Arabic, Quran, and Islamic Studies.',
    metaKeywords: 'Arabic, Quran, Islamic Studies, online courses',
    ogImage: '/images/home-og-image.jpg',
    ogUrl: 'https://www.waraqaweb.com/home',
    user });
});
app.get('/courses/quran-memorization/ijazah-program', (req, res) => {
  const user = req.user ? req.user.role : null;
  res.render('courses/quran-memorization/ijazah-program', { 
    pageTitle: 'Ijazah Program - Waraqa',
    metaDescription: 'Discover our online courses in Arabic, Quran, and Islamic Studies.',
    metaKeywords: 'Arabic, Quran, Islamic Studies, online courses',
    ogImage: '/images/home-og-image.jpg',
    ogUrl: 'https://www.waraqaweb.com/home',
    user });
});

// Arabic Language Courses pages
app.get('/courses/arabic-language/arabic-basics', (req, res) => {
  const user = req.user ? req.user.role : null;
  res.render('courses/arabic-language/arabic-basics', { 
    pageTitle: 'Arabic Basic Level - Waraqa',
    metaDescription: 'Discover our online courses in Arabic, Quran, and Islamic Studies.',
    metaKeywords: 'Arabic, Quran, Islamic Studies, online courses',
    ogImage: '/images/home-og-image.jpg',
    ogUrl: 'https://www.waraqaweb.com/home',
    user });
});

app.get('/courses/arabic-language/classical-books', (req, res) => {
  const user = req.user ? req.user.role : null;
  res.render('courses/arabic-language/classical-books', { 
    pageTitle: 'Classical Arabic Books - Waraqa',
    metaDescription: 'Discover our online courses in Arabic, Quran, and Islamic Studies.',
    metaKeywords: 'Arabic, Quran, Islamic Studies, online courses',
    ogImage: '/images/home-og-image.jpg',
    ogUrl: 'https://www.waraqaweb.com/home',
    user });
});
app.get('/courses/arabic-language/intermediate-arabic', (req, res) => {
  const user = req.user ? req.user.role : null;
  res.render('courses/arabic-language/intermediate-arabic', { 
    pageTitle: 'Intermediate	Arabic - Waraqa',
    metaDescription: 'Discover our online courses in Arabic, Quran, and Islamic Studies.',
    metaKeywords: 'Arabic, Quran, Islamic Studies, online courses',
    ogImage: '/images/home-og-image.jpg',
    ogUrl: 'https://www.waraqaweb.com/home',
    user });
});
app.get('/courses/arabic-language/upper-intermediate-arabic', (req, res) => {
  const user = req.user ? req.user.role : null;
  res.render('courses/arabic-language/upper-intermediate-arabic', { 
    pageTitle: 'Upper intermediate Arabic- Waraqa',
    metaDescription: 'Discover our online courses in Arabic, Quran, and Islamic Studies.',
    metaKeywords: 'Arabic, Quran, Islamic Studies, online courses',
    ogImage: '/images/home-og-image.jpg',
    ogUrl: 'https://www.waraqaweb.com/home',
    user });
});

// Islamic Studies Courses
app.get('/courses/islamic-studies/advanced-islamic-studies', (req, res) => {
  const user = req.user ? req.user.role : null;
  res.render('courses/islamic-studies/advanced-islamic-studies', { 
    pageTitle: 'Advanced Islamic Studies - Waraqa',
    metaDescription: 'Discover our online courses in Arabic, Quran, and Islamic Studies.',
    metaKeywords: 'Arabic, Quran, Islamic Studies, online courses',
    ogImage: '/images/home-og-image.jpg',
    ogUrl: 'https://www.waraqaweb.com/home',
    user });
});
app.get('/courses/islamic-studies/established-facts', (req, res) => {
  const user = req.user ? req.user.role : null;
  res.render('courses/islamic-studies/established-facts', { 
    pageTitle: 'Established Facts of Religion Level - Waraqa',
    metaDescription: 'Discover our online courses in Arabic, Quran, and Islamic Studies.',
    metaKeywords: 'Arabic, Quran, Islamic Studies, online courses',
    ogImage: '/images/home-og-image.jpg',
    ogUrl: 'https://www.waraqaweb.com/home',
    user });
});
app.get('/courses/islamic-studies/introduction-to-classical-books', (req, res) => {
  const user = req.user ? req.user.role : null;
  res.render('courses/islamic-studies/introduction-to-classical-books', { 
    pageTitle: 'Introductionto Classical Books Level - Waraqa',
    metaDescription: 'Discover our online courses in Arabic, Quran, and Islamic Studies.',
    metaKeywords: 'Arabic, Quran, Islamic Studies, online courses',
    ogImage: '/images/home-og-image.jpg',
    ogUrl: 'https://www.waraqaweb.com/home',
    user });
});

//
app.get('/pricing', (req, res) => {
  console.log("GET request to '/pricing'");
  res.render('pricing', { 
    pageTitle: ' Pricing - Waraqa',
    metaDescription: 'Discover our online courses in Arabic, Quran, and Islamic Studies.',
    metaKeywords: 'Arabic, Quran, Islamic Studies, online courses',
    ogImage: '/images/home-og-image.jpg',
    ogUrl: 'https://www.waraqaweb.com/home',
    user }); // Pass the user variable to the pricing view
});
app.get('/about', (req, res) => {
  console.log("GET request to '/about'");
  res.render('about', { 
    pageTitle: 'About us - Waraqa',
    metaDescription: 'Discover our online courses in Arabic, Quran, and Islamic Studies.',
    metaKeywords: 'Arabic, Quran, Islamic Studies, online courses',
    ogImage: '/images/home-og-image.jpg',
    ogUrl: 'https://www.waraqaweb.com/home',
    user });
});
app.get('/book-evaluation', (req, res) => {
  console.log("GET request to '/book evaluation'");
  res.render('book-evaluation', { 
    pageTitle: 'Book Evaluation - Waraqa',
    metaDescription: 'Discover our online courses in Arabic, Quran, and Islamic Studies.',
    metaKeywords: 'Arabic, Quran, Islamic Studies, online courses',
    ogImage: '/images/home-og-image.jpg',
    ogUrl: 'https://www.waraqaweb.com/home',
    user });
});
app.get('/contact', (req, res) => {
  console.log("GET request to '/contact'");
  res.render('contact', { 
    pageTitle: 'Contact us - Waraqa',
    metaDescription: 'Discover our online courses in Arabic, Quran, and Islamic Studies.',
    metaKeywords: 'Arabic, Quran, Islamic Studies, online courses',
    ogImage: '/images/home-og-image.jpg',
    ogUrl: 'https://www.waraqaweb.com/home',
    user });
});

// Blog Page
app.get('/blog', async (req, res) => {
  console.log("GET request to '/blog'");
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 17; // Display up to 17 posts per page
    const skip = (page - 1) * limit;

    // Fetch posts for the current page
    const posts = await PosT.find().sort({ date: -1 }).skip(skip).limit(limit).exec();
    const totalPosts = await PosT.countDocuments(); // Count total posts for pagination

    const sortedPosts = await PosT.find().sort({ like: -1 }).limit(5).exec(); // Top liked posts

    res.render('blog', {
      pageTitle: 'Blog - Waraqa',
      metaDescription: 'Discover our online courses in Arabic, Quran, and Islamic Studies.',
      metaKeywords: 'Arabic, Quran, Islamic Studies, online courses',
      ogImage: '/images/home-og-image.jpg',
      ogUrl: 'https://www.waraqaweb.com/home',
      user: req.session.username || "Guest",
      posts: posts,
      sposts: sortedPosts,
      fpost: posts[0] || null,
      date: Date.now(),
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit)
    });
    console.log("Blog page rendered successfully");

  } catch (err) {
    console.error("Error fetching blog posts:", err);
    res.render('error', { error: "Error fetching posts" });
  }
});



// Dashboard (for admin/users)
app.get('/dashboard', (req, res) => {
  res.render('dashboard',{
      pageTitle: 'Dashboard - Waraqa',
      metaDescription: 'Discover our online courses in Arabic, Quran, and Islamic Studies.',
      metaKeywords: 'Arabic, Quran, Islamic Studies, online courses',
      ogImage: '/images/home-og-image.jpg',
      ogUrl: 'https://www.waraqaweb.com/home',
  });
});

// Route for user login
app.post("/login", async (req, res) => {
  console.log("Handling user login.");
  try {
    const check = await Profile.findOne({ email: req.body.email }); // Find user by email
    if (check.password === req.body.password) { // Check if password matches
      if (check.type === "admin") {
        req.session.useremail = check.email; // Set session variables for admin
        req.session.username = check.username;
        req.session.type = "admin";
        res.redirect("admin"); // Redirect to admin page
      } else {
        // Increment visit count for users
        visits.findOneAndUpdate(
          { _id: "640cb99cd1ab2ecb248598b4" },
          { $inc: { visits: 1 } },
          (err) => {}
        );
        req.session.useremail = check.email; // Set session variables for regular user
        req.session.username = check.username;
        req.session.type = "user";
        res.redirect("/"); // Redirect to home page
      }
    } else {
      // Alert if password is incorrect
      res.send("<script>alert('Wrong Password');window.location.href = '/'</script>");
    }
  } catch {
    // Alert if login details are wrong
    res.send("<script>alert('Wrong details');window.location.href = '/'</script>");
  }
});

// Route for composing a new post
app.get("/compose", (req, res) => {
  if (req.session.username) { // Check if user is logged in
    res.render("compose", {
      pageTitle: ' Compose - Waraqa',
      metaDescription: 'Discover our online courses in Arabic, Quran, and Islamic Studies.',
      metaKeywords: 'Arabic, Quran, Islamic Studies, online courses',
      ogImage: '/images/home-og-image.jpg',
      ogUrl: 'https://www.waraqaweb.com/home',
      user: req.session.username, 
    }); // Render compose page
  }
});

// Route to handle post submission
app.post("/compose", upload.single("image"), async (req, res) => {
  const { postTitle, postBody, postId } = req.body;
  const postIdRegex = /^[a-zA-Z0-9]+$/; // Alphanumeric only

  if (!postIdRegex.test(postId)) {
    return res.send("<script>alert('Invalid Post ID. Please use only alphanumeric characters (no spaces, dashes, etc.).');window.location.href = '/compose'</script>");
  }

  const postData = {
    postId: postId, // Add postId to the post data
    author: req.session.username,
    title: postTitle,
    content: postBody,
    thumbnail: imagename, // Use the uploaded image name
    date: Date.now(),
    like: 0, // Initialize likes to 0
  };

  try {
    await PosT.insertMany(postData); // Save the new post to the database
    res.redirect("/"); // Redirect to home page after post submission
  } catch (err) {
    console.log(err);
    res.send("<script>alert('Error saving the post.');window.location.href = '/compose'</script>");
  }
});

// Route for individual post page
app.get("/posts/:postId", async (req, res) => {
  const { postId } = req.params; // Capture the postId from the URL
  try {
    // Find the post by its unique ID
    const post = await PosT.findById(postId);

    if (!post) {
      return res.send("<script>alert('Post not found');window.location.href = '/'</script>");
    }

    // Render the "posts" view and pass the post data to it
    res.render("posts", { 
      pageTitle: ' Posts - Waraqa',
      metaDescription: 'Discover our online courses in Arabic, Quran, and Islamic Studies.',
      metaKeywords: 'Arabic, Quran, Islamic Studies, online courses',
      ogImage: '/images/home-og-image.jpg',
      ogUrl: 'https://www.waraqaweb.com/home',
      post: post,
    }); 
  } catch (err) {
    console.log(err);
    res.send("<script>alert('Error loading the post.');window.location.href = '/'</script>");
  }
});



// Route to like or dislike a post
app.post("/posts/:custom", (req, res) => {
  const id = req.params.custom; // Extract post ID from URL
  var userid = req.session.username; // Get the current user's username

  PosT.findOne({ _id: { $eq: id } }, (err, result) => { // Find post by ID
    if (result.likedby.includes(userid)) { // If the user has already liked the post
      PosT.findOneAndUpdate(
        { _id: id },
        { $pull: { likedby: userid } }, // Remove user from likedby array
        { new: true }
      ).exec((err, result) => {
        if (err) {
          console.log(err); // Log any errors
        } else {
          // Decrement the like count
          PosT.findOneAndUpdate({ _id: id }, { $inc: { like: -1 } }, (err) => {
            if (err) {
              console.log(err); // Log any errors
            }
          });
        }
      });
    } else {
      PosT.findOneAndUpdate(
        { _id: id },
        { $push: { likedby: userid } }, // Add user to likedby array
        { new: true }
      ).exec((err, result) => {
        if (err) {
          console.log(err); // Log any errors
        } else {
          // Increment the like count
          PosT.findOneAndUpdate({ _id: id }, { $inc: { like: 1 } }, (err) => {
            if (err) {
              console.log(err); // Log any errors
            }
          });
        }
      });
    }
    if (err) {
      console.log(err); // Log any errors
    }
  });
});

// Route to get the edit post page
app.get("/update/:custom", (req, res) => {
  PosT.findById(req.params.custom, (err, result) => { // Find post by ID
    if (!result) {
      return res.render("notfound"); // Render not found page if post is not found
    }
    if (req.session.username === result.author || req.session.username === "admin") {
      // Allow access if the user is the author or an admin
      res.render("edit-post", { 
        pageTitle: 'Edit Post - Waraqa',
      metaDescription: 'Discover our online courses in Arabic, Quran, and Islamic Studies.',
      metaKeywords: 'Arabic, Quran, Islamic Studies, online courses',
      ogImage: '/images/home-og-image.jpg',
      ogUrl: 'https://www.waraqaweb.com/home',
      user: req.session.username, 
      post: result }); // Render edit post page
    } else {
      res.render("notfound"); // Render not found page if user is not authorized
    }
  });
});

// Handle post update form submission
app.post("/update/:custom", upload.single("image"), async (req, res) => {
  PosT.findByIdAndUpdate(
    req.params.custom, // Find post by ID
    {
      title: req.body.postTitle, // Update post title
      content: req.body.postBody, // Update post content
      thumbnail: imagename, // Update thumbnail if a new one is uploaded
    },
    (err) => {
      if (err) {
        console.log(err); // Log any errors
      }
    }
  );
  res.redirect("/posts/" + req.params.custom); // Redirect to the updated post
});

// Route to delete a post
app.get("/delete/:custom", (req, res) => {
  if (req.session.username) { // Check if user is logged in
    PosT.findById(req.params.custom, (err, results) => { // Find post by ID
      if (
        req.session.username === results.author || // Check if the user is the author
        req.session.type === "admin" // Or if the user is an admin
      ) {
        PosT.findByIdAndRemove(req.params.custom, (err) => { // Remove post from database
          if (req.session.username === "admin") {
            res.redirect("/admin"); // Redirect admin to admin page
          } else {
            res.redirect("/"); // Redirect user to home page
          }
        });
      } else {
        res.render("notfound"); // Render not found page if user is not authorized
      }
    });
  } else {
    res.redirect("/"); // Redirect to login page if not logged in
  }
});

// Route to view user profile
app.get("/profile/:customRoute", (req, res) => {
  if (req.session.username) { // Check if user is logged in
    const customRoute = req.params.customRoute; // Extract username from URL

    PosT.find({ author: customRoute }, (err, result) => { // Find posts by the author
      if (err) {
        console.log(err); // Log any errors
      } else {
        req.session.userposts = result; // Store user posts in session
        Profile.findOne({ username: customRoute }, (err, results) => { // Find user profile
          res.render("profile", {
            pageTitle: 'Profile - Waraqa',
            metaDescription: 'Discover our online courses in Arabic, Quran, and Islamic Studies.',
            metaKeywords: 'Arabic, Quran, Islamic Studies, online courses',
            ogImage: '/images/home-og-image.jpg',
            ogUrl: 'https://www.waraqaweb.com/home',
            username: req.session.username,
            posts: req.session.userposts,
            userdata: results,
            date: Date.now(),
          });
        });
      }
    });
  } else {
    res.redirect("/"); // Redirect to login page if not logged in
  }
});

// Route to get the edit profile page
app.get("/editprofile/:custom", (req, res) => {
  if (req.session.username) { // Check if user is logged in
    Profile.findOne({ username: req.params.custom }, (err, results) => {
      if (req.session.username === results.username) {
        Profile.findOne({ username: req.session.username }, (err, result) => {
          res.render("edit-profile", { 
            pageTitle: ' Edit Profile - Waraqa',
            metaDescription: 'Discover our online courses in Arabic, Quran, and Islamic Studies.',
            metaKeywords: 'Arabic, Quran, Islamic Studies, online courses',
            ogImage: '/images/home-og-image.jpg',
            ogUrl: 'https://www.waraqaweb.com/home',
            username: req.session.username, 
            email: req.session.useremail, 
            userdata: result }); // Render edit profile page
        });
      } else {
        res.render("notfound"); // Render not found page if user is not authorized
      }
    });
  } else {
    res.redirect("/"); // Redirect to login page if not logged in
  }
});

// Handle profile update form submission
app.post("/editprofile/:custom", upload.single("image"), async (req, res) => {
  const custom = req.params.custom; // Extract username from URL

  Profile.findOneAndUpdate(
    { username: req.session.username }, // Find the user by session username
    {
      fullname: req.body.fullname, // Update fullname
      email: req.session.useremail, // Update email
      dp: imagename, // Update display picture
      bio: req.body.bio, // Update bio
      weblink: req.body.weblink, // Update web link
      facebook: req.body.fb, // Update Facebook link
      whatsapp: req.body.wa, // Update WhatsApp link
      twitter: req.body.tw, // Update Twitter link
      instagram: req.body.insta, // Update Instagram link
      phoneno: req.body.phno, // Update phone number
    },
    (err) => {
      if (err) {
        console.log(err); // Log any errors
      }
    }
  );

  res.redirect("/profile/" + custom); // Redirect to the updated profile
});

// Route for admin dashboard
app.get("/admin", (req, res) => {
  if (req.session.type === "admin") { // Check if user is admin
    Profile.find((err, profiles) => { // Fetch all profiles
      PosT.find((err, posts) => { // Fetch all posts
        visits.find((err, visits) => { // Fetch visit data
          res.render("admin", { 
            pageTitle: ' Articles Dashboard - Waraqa',
            metaDescription: 'Discover our online courses in Arabic, Quran, and Islamic Studies.',
            metaKeywords: 'Arabic, Quran, Islamic Studies, online courses',
            ogImage: '/images/home-og-image.jpg',
            ogUrl: 'https://www.waraqaweb.com/home',
            profiles: profiles, 
            posts: posts, 
            visits: visits, 
            username: req.session.username }); // Render admin dashboard
        });
      });
    });
  } else {
    res.redirect("/"); // Redirect to login page if not admin
  }
});

// Route to remove a user
app.get("/removeuser/:custom", (req, res) => {
  if (req.session.type === "admin") { // Check if user is admin
    Profile.findByIdAndRemove(req.params.custom, (err) => { // Remove user profile
      PosT.deleteMany({ author: { $eq: req.query.user } }, (err) => { // Remove all posts by the user
        if (err) {
          console.log(err); // Log any errors
        } else {
          res.redirect("/admin"); // Redirect to admin page
        }
      });
    });
  } else {
    res.render("notfound"); // Render not found page if user is not authorized
  }
});

// Route to handle search functionality
app.post("/search", async (req, res) => {
  let payload = req.body.payload.trim(); // Get search query from request
  let search = await PosT.find({ title: { $regex: new RegExp('^' + payload + '.*', 'i') } }).exec(); // Search for posts matching title
  search = search.slice(0, 10); // Limit results to 10
  res.send({ payload: search }); // Send search results back to client
});

// Route for handling not found pages
app.get("/:custom", (req, res) => {
  res.render("notfound"); // Render not found page for unknown routes
});
app.get("/:custom/:custom2", (req, res) => {
  res.render("notfound"); // Render not found page for unknown routes with two parameters
});

// Start the server
app.listen(process.env.PORT || 3000, () => {
  console.log("Server started at http://localhost:3000"); // Log server start message
});
