// Importing required libraries
const express = require("express"); // Importing the Express framework
const mongoose = require("mongoose"); // Importing Mongoose for MongoDB interactions
const app = express(); // Initializing an Express application
const path = require("path"); // Importing Path module for file path utilities
const ejs = require("ejs"); // Importing EJS template engine
const sessions = require("express-session"); // Importing express-session for session management

// Set Mongoose to use strictQuery
mongoose.set('strictQuery', true);

// Importing data models
// const collection = require("./mongodb"); // Commented out MongoDB collection import
const PosT = require("./src/postdb"); // Importing Post model
const Profile = require("./src/profiledb"); // Importing Profile model

let imagename; // Variable to hold the image nam

const multer = require("multer"); // Importing multer for file uploads
const { send, title } = require("process"); // Importing process-related utilities (not used here)
const { profile } = require("console"); // Importing console profile (not used here)

// Setting up multer storage for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/thumbnails"); // Specify upload destination
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Keep the original file name
    imagename = file.originalname; // Store the image name globally
  },
});

const upload = multer({ storage: storage }); // Creating an upload instance with defined storage
let user; // Variable for storing user data (not used directly)

// Middleware setup
app.use(express.json()); // Parsing JSON request bodies
app.set("view engine", "ejs"); // Setting EJS as the templating engine
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: false })); // Parsing URL-encoded request bodies
app.use(
  sessions({ // Session management middleware
    secret: "secret key", // Secret key for session
    saveUninitialized: true, // Save uninitialized sessions
    resave: false, // Don't resave sessions that haven't been modified
  })
);

// Mongoose schema for visits
const visitSchema = new mongoose.Schema({
  visits: Number // Field to store visit count
});

// Mongoose model for visits
const visits = mongoose.model("visits", visitSchema);

// Route for the footer page
app.get("..views/layout/head", (req, res) => { 
  res.render("head"); // Render the head page
});

// Route for the header page
app.get("..views/layout", (req, res) => { 
  res.render("header"); // Render the header page
});
app.get("..views/layout/header", (req, res) => { 
  res.render("header"); // Render the header page
});

// Route for the footer page
app.get("..views/layout/footer", (req, res) => { 
  res.render("footer"); // Render the footer page
});




// Route for the login page
app.get("/login", (req, res) => { 
  res.render("login"); 
});


// Route for logging out
app.get("/logout", (req, res) => {
  req.session.destroy(); // Destroy session
  imagename = null; // Clear the image name
  res.redirect("/login"); // Redirect to login page
});

// Route to redirect signup attempts to login
app.get("/signup", (req, res) => {
  res.redirect("/login"); // Redirect to login page
});

// Route for user signup
app.post("/signup", async (req, res) => {
  const userExists = await Profile.exists({ username: req.body.name }); // Check if user already exists

  if (!userExists) {
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
    req.session.username = req.body.name; // Set session username
    res.redirect("/login"); // Redirect to home page
  } else {
    // Alert if user already exists
    res.send("<script>alert('User already exists');window.location.href = '/'</script>");
  }
});

// Route for home page
app.get("/", async (req, res) => { // Change "/" to "/"
  try {
    const posts = await PosT.find().exec(); // Fetch all posts
    const sortedPosts = await PosT.find().sort({ like: "desc" }).exec(); // Fetch posts sorted by likes

    // Render home page with posts and user data
    res.render("home", {
      user: req.session.username || "Guest", // Provide a default username for guests
      posts: posts,
      date: Date.now(),
      sposts: sortedPosts,
    });
  } catch (err) {
    console.log(err); // Log errors
    res.render("error", { error: "Error fetching posts" }); // Render error page
  }
});

// Route for Subjects Main pages
app.get('/courses/quran-recitation', (req, res) => {
  const user = req.user ? req.user.role : null;
  res.render('courses/quran-recitation/quran-recitation', { user });
});
app.get('/courses/quran-memorization', (req, res) => {
  const user = req.user ? req.user.role : null;
  res.render('courses/quran-memorization/quran-memorization', { user });
});
app.get('/courses/arabic-language', (req, res) => {
  const user = req.user ? req.user.role : null;
  res.render('courses/arabic-language/arabic-language', { user });
});
app.get('/courses/islamic-studies', (req, res) => {
  const user = req.user ? req.user.role : null;
  res.render('courses/islamic-studies/islamic-studies', { user });
});

// Route for quran-recitation Courses
app.get('/courses/quran-recitation/foundation-level', (req, res) => {
  const user = req.user ? req.user.role : null;
  res.render('courses/quran-recitation/foundation-level', { user });
});
app.get('/courses/quran-recitation/khatmah-program', (req, res) => {
  const user = req.user ? req.user.role : null;
  res.render('courses/quran-recitation/khatmah-program', { user });
});
app.get('/courses/quran-recitation/pre-reading-level', (req, res) => {
  const user = req.user ? req.user.role : null;
  res.render('courses/quran-recitation/pre-reading-level', { user });
});
app.get('/courses/quran-recitation/qari-level', (req, res) => {
  const user = req.user ? req.user.role : null;
  res.render('courses/quran-recitation/qari-level', { user });
});
app.get('/courses/quran-recitation/tajweed-basics', (req, res) => {
  const user = req.user ? req.user.role : null;
  res.render('courses/quran-recitation/tajweed-basics', { user });
});
app.get('/courses/quran-recitation/tajweed-intermediate', (req, res) => {
  const user = req.user ? req.user.role : null;
  res.render('courses/quran-recitation/tajweed-intermediate', { user });
});

// quran-memorization Courses
app.get('/courses/quran-memorization/short-surahs', (req, res) => {
  const user = req.user ? req.user.role : null;
  res.render('courses/quran-memorization/short-surahs', { user });
});
app.get('/courses/quran-memorization/one-juz', (req, res) => {
  const user = req.user ? req.user.role : null;
  res.render('courses/quran-memorization/one-juz', { user });
});
app.get('/courses/quran-memorization/hafez-program', (req, res) => {
  const user = req.user ? req.user.role : null;
  res.render('courses/quran-memorization/hafez-program', { user });
});
app.get('/courses/quran-memorization/ijazah-program', (req, res) => {
  const user = req.user ? req.user.role : null;
  res.render('courses/quran-memorization/ijazah-program', { user });
});

// Arabic Language Courses pages
app.get('/courses/arabic-language/arabic-basics', (req, res) => {
  const user = req.user ? req.user.role : null;
  res.render('courses/arabic-language/arabic-basics', { user });
});
app.get('/courses/arabic-language/classical-arabic', (req, res) => {
  const user = req.user ? req.user.role : null;
  res.render('courses/arabic-language/classical-arabic', { user });
});
app.get('/courses/arabic-language/classical-books', (req, res) => {
  const user = req.user ? req.user.role : null;
  res.render('courses/arabic-language/classical-books', { user });
});
app.get('/courses/arabic-language/intermediate-arabic', (req, res) => {
  const user = req.user ? req.user.role : null;
  res.render('courses/arabic-language/intermediate-arabic', { user });
});
app.get('/courses/arabic-language/upper-intermediate-arabic', (req, res) => {
  const user = req.user ? req.user.role : null;
  res.render('courses/arabic-language/upper-intermediate-arabic', { user });
});

// Islamic Studies Courses
app.get('/courses/islamic-studies/advanced-islamic-studies', (req, res) => {
  const user = req.user ? req.user.role : null;
  res.render('courses/islamic-studies/advanced-islamic-studies', { user });
});
app.get('/courses/islamic-studies/established-facts', (req, res) => {
  const user = req.user ? req.user.role : null;
  res.render('courses/islamic-studies/established-facts', { user });
});
app.get('/courses/islamic-studies/introduction-to-classical-books', (req, res) => {
  const user = req.user ? req.user.role : null;
  res.render('courses/islamic-studies/introduction-to-classical-books', { user });
});

//
app.get('/pricing', (req, res) => {
  res.render('pricing', { user }); // Pass the user variable to the pricing view
});
app.get('/about', (req, res) => {
  res.render('about', { user });
});
app.get('/book-evaluation', (req, res) => {
  res.render('book-evaluation', { user });
});
app.get('/contact', (req, res) => {
  res.render('contact', { user });
});

// Blog Page
app.get('/blog', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 17; // Display up to 17 posts per page
    const skip = (page - 1) * limit;

    // Fetch posts for the current page
    const posts = await PosT.find().sort({ date: -1 }).skip(skip).limit(limit).exec();
    const totalPosts = await PosT.countDocuments(); // Count total posts for pagination

    const sortedPosts = await PosT.find().sort({ like: -1 }).limit(5).exec(); // Top liked posts

    res.render('blog', {
      user: req.session.username || "Guest",
      posts: posts,
      sposts: sortedPosts,
      fpost: posts[0] || null,
      date: Date.now(),
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit)
    });

  } catch (err) {
    console.error(err);
    res.render('error', { error: "Error fetching posts" });
  }
});



// Dashboard (for admin/users)
app.get('/dashboard', (req, res) => {
  res.render('dashboard');
});

// Route for user login
app.post("/login", async (req, res) => {
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
    res.render("compose", { user: req.session.username }); // Render compose page
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
    res.render("posts", { post: post }); 
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
      res.render("edit-post", { user: req.session.username, post: result }); // Render edit post page
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
          res.render("edit-profile", { username: req.session.username, email: req.session.useremail, userdata: result }); // Render edit profile page
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
          res.render("admin", { profiles: profiles, posts: posts, visits: visits, username: req.session.username }); // Render admin dashboard
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
  console.log("Server started at port 3000"); // Log server start message
});
