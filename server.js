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
      metaDescription: 'Login to your Waraqa account or register for a new one to access online Arabic, Quran, and Islamic Studies courses with native speakers.',
      metaKeywords: 'Waraqa, login, user login, online learning, Quran courses, Arabic courses, register, sign up, online Quran education, Islamic education, user registration, online courses login, Quran learning platform, Arabic language learning, online Quran registration, Waraqa login',
      ogImage: '/images/home-og-image.jpg',
      ogUrl: 'https://www.waraqaweb.com/login',
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
    const posts = await PosT.find({}, 'title slug thumbnail date').sort({ date: -1 }).skip(skip).limit(limit).exec(); // Fetch all posts

    // Render home page with posts and user data
    res.render("home", {
      pageTitle: 'Waraqa',
      metaDescription: 'Start your Quran, Arabic, and Islamic Studies journey with Waraqa. Learn from native-speaking teachers in flexible, interactive online classes tailored to your needs.',
      metaKeywords: 'Waraqa, Quran learning, Arabic language, online Quran courses, Islamic education, Quran recitation, Quran memorization, Arabic language courses, online Islamic studies, learn Quran online, al-Azhar University, Arabic teachers, Quranic studies, Islamic teaching, Quranic traditions, learn Arabic, flexible learning, interactive classrooms, native Arabic teachers, online Islamic courses, Quranic recitation, learn Quran and Arabic, Waraqa school',
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
app.get('/courses/quran-recitation/quran-recitation', (req, res) => {
  console.log("GET request to 'a subject page'");
  const user = req.user ? req.user.role : null;
  res.render('courses/quran-recitation/quran-recitation', { 
    pageTitle: 'Quran Recitation - Waraqa',
    metaDescription: 'Enhance your Quran recitation skills with Waraqa courses on Tajweed. Learn proper pronunciation, gain an Ijazah, and study the meanings of Quranic verses in a personalized, guided learning environment.',
    metaKeywords: 'Quran recitation, Quran tajweed, correct Quran pronunciation, Ijazah, Quranic meanings, recite the Quran, Quran recitation course, Quran study, Quranic verses, learn Quran recitation, Arabic pronunciation, Tajweed course, Quran learning, Quran for beginners, Quran practice, Quran recitation with teacher, Islamic education, Quran diploma',
    ogImage: '/images/home-og-image.jpg',
    ogUrl: 'https://www.waraqaweb.com/courses/quran-recitation',
    user });
});
app.get('/courses/quran-memorization/quran-memorization', (req, res) => {
  console.log("GET request to 'a subject page'");
  const user = req.user ? req.user.role : null;
  res.render('courses/quran-memorization/quran-memorization', { 
    pageTitle: 'Quran Memorization - Waraqa',
    metaDescription: 'Memorize the Quran effortlessly with Waraqa courses. Learn precise memorization techniques, understand the meanings of verses, and enhance your daily prayers with deeper connection to Allah.',
    metaKeywords: 'Quran memorization, memorize the Quran, Quran recitation, hifz Quran, Quran memorization techniques, understanding Quran verses, Quranic meanings, Quranic history, daily Quran recitation, Islamic education, Quran memorization course, Quran for prayer, elevate your prayer, Quran study, Quran learning, spiritual Quran connection, Waraqa courses',
    ogImage: '/images/home-og-image.jpg',
    ogUrl: 'https://www.waraqaweb.com/courses/quran-memorization',
    user });
});
app.get('/courses/arabic-language/arabic-language', (req, res) => {
  console.log("GET request to 'a subject page'");
  const user = req.user ? req.user.role : null;
  res.render('courses/arabic-language/arabic-language', { 
    pageTitle: 'Arabic Language - Waraqa',
    metaDescription: 'Improve your Arabic language skills with Waraqa courses. Whether you are a beginner or advanced, learn reading, writing, speaking, and comprehension from native-speaking instructors.',
    metaKeywords: 'learn Arabic, Arabic language courses, Arabic grammar, Arabic language online, Arabic for beginners, Quranic Arabic, Modern Standard Arabic, Arabic vocabulary, Arabic language classes, Arabic writing, Arabic reading, Arabic language lessons, Arabic pronunciation, Arabic speaking practice, Arabic language education, online Arabic courses, Arabic dialects',
    ogImage: '/images/home-og-image.jpg',
    ogUrl: 'https://www.waraqaweb.com/courses/arabic-language',
    user });
});
app.get('/courses/islamic-studies/islamic-studies', (req, res) => {
  console.log("GET request to 'a subject page'");
  const user = req.user ? req.user.role : null;
  res.render('courses/islamic-studies/islamic-studies', { 
    pageTitle: 'Islamic Studies - Waraqa',
    metaDescription: 'Expand your Islamic knowledge with Waraqa courses on Fiqh, Hadith, Tafsir, Aqidah, and Islamic History. Learn from expert scholars and deepen your understanding of Islamic teachings.',
    metaKeywords: 'Islamic studies, Quranic education, online Islamic courses, Quran recitation, Islamic knowledge, Arabic studies, Tajweed, Quranic Arabic, Islamic learning, Quran classes, Al-Azhar graduates, Quran education, Islamic history, Islamic philosophy, Islamic science, Quranic sciences, online Quran school, Islamic studies for beginners',
    ogImage: '/images/home-og-image.jpg',
    ogUrl: 'https://www.waraqaweb.com/courses/islamic-studies',
    user });
});

// Route for quran-recitation Courses
app.get('/courses/quran-recitation/foundation-level', (req, res) => {
  const user = req.user ? req.user.role : null;
  res.render('courses/quran-recitation/foundation-level', { 
    pageTitle: 'Foundation Level - Waraqa',
    metaDescription: 'Start your Quran recitation journey with Waraqa’s Foundation Level course. Learn Arabic letters, sounds, and pronunciation using the Noor al-Bayan approach. Receive a certificate of completion after passing the final exam.',
    metaKeywords: 'Foundation level, Quran recitation, Arabic reading, Noor al-Bayan approach, Arabic alphabet, Arabic pronunciation, diacritics, Arabic letters, learn Quran, Arabic diacritics, Quran learning, Arabic pronunciation rules, Arabic letter shapes, Arabic reading course, Quran recitation basics, Quran for beginners, learn Arabic, Waraqa approach, Arabic phonetics, Arabic language course, Arabic letter practice',
    ogImage: '/images/home-og-image.jpg',
    ogUrl: 'https://www.waraqaweb.com/courses/quran-recitation/foundation-level',
    user });
});
app.get('/courses/quran-recitation/khatmah-program', (req, res) => {
  const user = req.user ? req.user.role : null;
  res.render('courses/quran-recitation/khatmah-program', { 
    pageTitle: 'Khatmah Program - Waraqa',
    metaDescription: 'Complete your Quran recitation with Waraqa’s Khatmah program. Progress through the Quran with guidance and correction from expert teachers, and finish with a duaa blessed by angels.',
    metaKeywords: 'Khatmah program, Quran recitation, Quran classes, complete Quran recitation, online Quran course, Quran teacher, Quran progress, Quran study',
    ogImage: '/images/home-og-image.jpg',
    ogUrl: 'https://www.waraqaweb.com/courses/quran-recitation/khatmah-program',
    user });
});
app.get('/courses/quran-recitation/pre-reading-level', (req, res) => {
  const user = req.user ? req.user.role : null;
  res.render('courses/quran-recitation/pre-reading-level', { 
    pageTitle: 'Pre-reading Level - Waraqa',
    metaDescription: 'Improve your Quran recitation with Waraqa’s Pre-reading Level course. Focus on fluency, correct pronunciation, and mastering Arabic syllables to read with confidence.',
    metaKeywords: 'Pre-reading level, Quran recitation, Arabic fluency, Noor al-Bayan, Al-Futuhat Ar-Rabbaniyah, Arabic letters, Quran pronunciation, Arabic syllables, Quran reading',    
    ogImage: '/images/home-og-image.jpg',
    ogUrl: 'https://www.waraqaweb.com/courses/quran-recitation/pre-reading-level',
    user });
});
app.get('/courses/quran-recitation/qari-level', (req, res) => {
  const user = req.user ? req.user.role : null;
  res.render('courses/quran-recitation/qari-level', { 
    pageTitle: 'Qari Level - Waraqa',
    metaDescription: 'Master advanced Tajweed rules and perfect your Quran recitation with Waraqa’s Qari Level course. Prepare for the Ijazah License and learn the theory and practice of Quran recitation.',
    metaKeywords: 'Qari level, advanced Quran recitation, Tajweed course, Quran recitation course, Ijazah License, Quran tajweed rules, Quran articulation, Qiraat recitations',
    ogImage: '/images/home-og-image.jpg',
    ogUrl: 'https://www.waraqaweb.com/courses/quran-recitation/qari-level',
    user });
});
app.get('/courses/quran-recitation/tajweed-basics', (req, res) => {
  const user = req.user ? req.user.role : null;
  res.render('courses/quran-recitation/tajweed-basics', { 
    pageTitle: 'Tajweed Basics - Waraqa',
    metaDescription: 'Master the fundamentals of Tajweed with Waraqa’s course. Learn the key rules to correct your recitation and qualify for advanced levels in Quranic studies.',
    metaKeywords: 'Tajweed, Quran recitation, Tajweed rules, Noon and Meem Mushaddad, Qalqalah, Heavy Letters, Light Letters, Laam, Ra’ letter, Noon Sakinah, Meem Sakinah, Quranic Surahs, Quran study, Quran education, Tajweed basics',
    ogImage: '/images/home-og-image.jpg',
    ogUrl: 'https://www.waraqaweb.com/courses/quran-recitation/tajweed-basics',
    user });
});
app.get('/courses/quran-recitation/tajweed-intermediate', (req, res) => {
  const user = req.user ? req.user.role : null;
  res.render('courses/quran-recitation/tajweed-intermediate', { 
    pageTitle: 'Tajweed Intermediate - Waraqa',
    metaDescription: 'Elevate your Tajweed skills with Waraqa’s Intermediate course. Master the Quranic Medd rules and improve your recitation technique.',
    metaKeywords: 'Tajweed, Quran recitation, Medd rules, Quranic recitation, Medd Tabee, Medd Leen, Medd Badal, Medd Wajib Muttasil, Medd Jae’z Munfasil, Medd Aridh Lissukun, Medd Laazim Kalimi, Medd Laazim Harfee, Medd Silah, Medd Ewad, Medd Tamkeen, Quranic tajweed, Quranic vowels',
    
    ogImage: '/images/home-og-image.jpg',
    ogUrl: 'https://www.waraqaweb.com/courses/quran-recitation/tajweed-intermediate',
    user });
});

// quran-memorization Courses
app.get('/courses/quran-memorization/short-surahs', (req, res) => {
  const user = req.user ? req.user.role : null;
  res.render('courses/quran-memorization/short-surahs', { 
    pageTitle: 'Short Surahs - Waraqa',
    metaDescription: 'Start memorizing the second half of Juz’ 30 of the Quran with Waraqa’s Short Surahs course. Perfect your recitation with expert guidance and regular revisions.',
    metaKeywords: 'Short Surahs, Quran memorization, Juz’ 30, Quran recitation, memorization course, Quran revision, Quran exams, Quranic studies, surah memorization, Quran teacher' ,
    ogImage: '/images/home-og-image.jpg',
    ogUrl: 'https://www.waraqaweb.com/courses/quran-memorization/short-surahs',
    user });
});
app.get('/courses/quran-memorization/one-juz', (req, res) => {
  const user = req.user ? req.user.role : null;
  res.render('courses/quran-memorization/one-juz', { 
    pageTitle: 'One Juz - Waraqa',
    metaDescription: 'Memorize a Juz’ or Surah of the Quran with Waraqa’s course. Perfect your recitation with expert guidance, and learn the meanings and interpretations of your selected Surah or Juz’.',
    metaKeywords: 'One Juz, Quran memorization, Surah memorization, Quran recitation, Juz’ memorization, Quran interpretation, Quran teacher, memorization course, Quran study' ,
    ogImage: '/images/home-og-image.jpg',
    ogUrl: 'https://www.waraqaweb.com/courses/quran-memorization/one-juz',
    user });
});
app.get('/courses/quran-memorization/hafez-program', (req, res) => {
  const user = req.user ? req.user.role : null;
  res.render('courses/quran-memorization/hafez-program', { 
    pageTitle: 'Hafez Program - Waraqa',
    metaDescription: 'Memorize the entire Quran with Waraqa’s advanced Hafez Program. Progress through each surah with expert guidance, and review previous memorization to retain what you’ve learned.',
    metaKeywords: 'Hafez program, Quran memorization, advanced memorization, Quran recitation, memorization course, Quran Hafez, Islamic studies, Quran learning, Hafez course' ,
    ogImage: '/images/home-og-image.jpg',
    ogUrl: 'https://www.waraqaweb.com/courses/quran-memorization/hafez-program',
    user });
});
app.get('/courses/quran-memorization/ijazah-program', (req, res) => {
  const user = req.user ? req.user.role : null;
  res.render('courses/quran-memorization/ijazah-program', { 
    pageTitle: 'Ijazah Program - Waraqa',
    metaDescription: 'Embark on a spiritual journey to memorize the Quran with proper Tajweed and earn your Ijazah. Choose your Qiraah and receive certification from an authorized sheikh with an unbroken chain to Prophet Muhammad (PBUH).',
    metaKeywords: 'Ijazah program, Quran memorization, Tajweed, Qiraat, Quran recitation, Ijazah in Quran, Quran certification, Ijazah course, Quran learning, Islamic education' ,
    ogImage: '/images/home-og-image.jpg',
    ogUrl: 'https://www.waraqaweb.com/courses/quran-memorization/ijazah-program',
    user });
});

// Arabic Language Courses pages
app.get('/courses/arabic-language/arabic-basics', (req, res) => {
  const user = req.user ? req.user.role : null;
  res.render('courses/arabic-language/arabic-basics', { 
    pageTitle: 'Arabic Basic Level - Waraqa',
    metaDescription: 'Start your Arabic language journey with Waraqa’s Arabic Basics course. Learn essential vocabulary and grammar for everyday conversations and improve your speaking and writing skills in Arabic.',
    metaKeywords: 'Arabic basics, learn Arabic, Arabic language course, Arabic grammar, everyday Arabic, Arabic vocabulary, Arabic conversation, Arabic study, Arabic speaking, Waraqa Arabic course' ,
    ogImage: '/images/home-og-image.jpg',
    ogUrl: 'https://www.waraqaweb.com/courses/arabic-language/arabic-basics',
    user });
});

app.get('/courses/arabic-language/classical-arabic', (req, res) => {
  const user = req.user ? req.user.role : null;
  res.render('courses/arabic-language/classical-arabic', { 
    pageTitle: 'Classical Arabic Books - Waraqa',
    metaDescription: 'Study Classical Arabic with Waraqa’s advanced course. Learn traditional Arabic used in classical texts and scholarly works, and understand key works in syntax, morphology, rhetoric, and literature.',
    metaKeywords: 'Classical Arabic, Mutoon, Arabic syntax, Arabic morphology, Alfiyt Bin Malik, Dala\'il al I\'Jaz, Al Kamel Fi al-Adab, Arabic literature, Arabic rhetoric, learn Classical Arabic, advanced Arabic course, Waraqa Classical Arabic' ,
    ogImage: '/images/home-og-image.jpg',
    ogUrl: 'https://www.waraqaweb.com/courses/arabic-language/classical-arabic',
    user });
});

app.get('/courses/arabic-language/intermediate-arabic', (req, res) => {
  const user = req.user ? req.user.role : null;
  res.render('courses/arabic-language/intermediate-arabic', { 
    pageTitle: 'Intermediate	Arabic - Waraqa',
    metaDescription: 'Advance your Arabic language skills with Waraqa’s Intermediate Arabic course. Improve listening, reading, speaking, and writing while mastering fundamental grammar, sentence structure, and advanced vocabulary.',
    metaKeywords: 'Intermediate Arabic, learn Arabic, Arabic grammar, Arabic vocabulary, Arabic sentence structure, improve Arabic skills, Arabic speaking course, Arabic writing course, Arabic listening course, Arabic reading course, Waraqa Arabic courses, Arabic language learning',
    ogImage: '/images/home-og-image.jpg',
    ogUrl: 'https://www.waraqaweb.com/courses/arabic-language/intermediate-arabic',
    user });
});
app.get('/courses/arabic-language/upper-intermediate-arabic', (req, res) => {
  const user = req.user ? req.user.role : null;
  res.render('courses/arabic-language/upper-intermediate-arabic', { 
    pageTitle: 'Upper intermediate Arabic- Waraqa',
    metaDescription: 'Elevate your Arabic language skills with Waraqa’s Upper Intermediate Arabic course. Dive into specialized grammar, vocabulary, syntax, and morphology to master the formal language of books, newspapers, and advanced expressions.',
    metaKeywords: 'Upper Intermediate Arabic, advanced Arabic grammar, Arabic vocabulary, syntax, morphology, formal Arabic, Arabic newspapers, Arabic literature, rhetoric, Arabic writing, Arabic reading, Waraqa Arabic courses, learn advanced Arabic, Arabic language skills',
    ogImage: '/images/home-og-image.jpg',
    ogUrl: 'https://www.waraqaweb.com/courses/arabic-language/upper-intermediate-arabic',
    user });
});

// Islamic Studies Courses
app.get('/courses/islamic-studies/established-facts', (req, res) => {
  const user = req.user ? req.user.role : null;
  res.render('courses/islamic-studies/established-facts', { 
    pageTitle: 'Established Facts of Religion Level - Waraqa',
    metaDescription: 'Explore the Indisputable Established Facts of Religion with Waraqa’s comprehensive courses. Learn Islamic fundamentals, including faith pillars, ethics, Quranic Surahs, Hadiths, prayer practices, and Islamic diversity with nuanced instruction from Al-Azhar-trained scholars.',
    metaKeywords: 'Indisputable facts of religion, Islamic Studies courses, pillars of faith, Islamic ethics, Quranic Surahs, Hadith, Dhikr, Sadaqah, prayer guidance, diversity in Islam, Muslim identity, Waraqa courses, Al-Azhar scholars, beginner Islamic courses, Muslim children, new Muslims, Islamic fundamentals',
    ogImage: '/images/home-og-image.jpg',
    ogUrl: 'https://www.waraqaweb.com/courses/islamic-studies/established-facts',
    user });
  });
  app.get('/courses/islamic-studies/introduction-to-classical-books', (req, res) => {
    const user = req.user ? req.user.role : null;
    res.render('courses/islamic-studies/introduction-to-classical-books', { 
      pageTitle: 'Introductionto Classical Books Level - Waraqa',
      metaDescription: 'Explore Islamic Classical Books with Waraqa’s comprehensive introductory course. Build a solid foundation in Islamic studies, covering Tafseer, Hadith, ‘Aqidah, Fiqh, Islamic history, and Prophets’ stories. Gain insights from Darussalam’s renowned twelve-book series by Maulvi Abdul Aziz.',
      metaKeywords: 'Islamic classical books, introductory Islamic studies, Tafseer, Quran interpretation, Hadith, Prophetic Sunnah, ‘Aqidah, Islamic creed, Fiqh, Islamic jurisprudence, Prophets’ stories, Du’a, Islamic history, Darussalam book series, Maulvi Abdul Aziz, Waraqa courses, beginner Islamic studies',
      ogImage: '/images/home-og-image.jpg',
      ogUrl: 'https://www.waraqaweb.com/courses/islamic-studies/introduction-to-classical-books',
      user });
    });
  app.get('/courses/islamic-studies/advanced-islamic-studies', (req, res) => {
      const user = req.user ? req.user.role : null;
      res.render('courses/islamic-studies/advanced-islamic-studies', { 
        pageTitle: 'Advanced Islamic Studies - Waraqa',
        metaDescription: 'Delve into Advanced Islamic Studies with Waraqa. Choose from classical books in Hadith, Fiqh, Tafsir, and ‘Aqidah, guided by an Azhari scholar. Study with expert linguists and gain profound insights into timeless Islamic knowledge.',
        metaKeywords: 'Advanced Islamic studies, classical Islamic books, Hadith, Fiqh, Tafsir, Quran interpretation, Aqidah, Islamic creed, Sayyid Sabiq, Fiqh as-Sunnah, Forty Hadiths of an-Nawawi, Ibn Kathir, Stories of the Prophets, al-’Aqidah at-Tahawiyah, Abu Ja\'far al-Tahawi, Azhari scholar, Waraqa courses, Islamic education',
        ogImage: '/images/home-og-image.jpg',
        ogUrl: 'https://www.waraqaweb.com/courses/islamic-studies/advanced-islamic-studies',
        user });
    });
    
//
app.get('/pricing', (req, res) => {
  console.log("GET request to '/pricing'");
  res.render('pricing', { 
    pageTitle: ' Pricing - Waraqa',
    metaDescription: 'Discover affordable Waraqa course pricing with high-quality instruction, bilingual Al-Azhar-certified teachers, flexible schedules, and well-developed curricula. Enjoy learning Arabic and Islamic studies from the comfort of your home.',
    metaKeywords: 'Waraqa pricing, Arabic courses pricing, Islamic studies pricing, affordable online learning, Al-Azhar certified teachers, flexible schedules, bilingual teachers, online education, progress evaluations, secure payments, high-quality teaching, curriculum milestones',
    ogImage: '/images/home-og-image.jpg',
    ogUrl: 'https://www.waraqaweb.com/pricing',
    user }); // Pass the user variable to the pricing view
});
app.get('/about', (req, res) => {
  console.log("GET request to '/about'");
  res.render('about', { 
    pageTitle: 'About us - Waraqa',
    metaDescription: 'Learn about Waraqa, a dedicated online Quran and Arabic school founded by Al-Azhar graduates. Discover our mission to spread Islamic knowledge and empower Muslims worldwide with quality Quran recitation, Tajweed, and Quranic Arabic education.',
    metaKeywords: 'About Waraqa, online Quran school, Quranic Arabic education, Tajweed classes, Al-Azhar graduates, Quran recitation, Islamic studies, Quran education for all levels, Quran classes online, Islamic knowledge, Quranic sciences, Quran teaching experts, 10 Qiraat recitation, flexible Quran learning',
    ogImage: '/images/home-og-image.jpg',
    ogUrl: 'https://www.waraqaweb.com/about',
    user });
});
app.get('/book-evaluation', (req, res) => {
  console.log("GET request to '/book evaluation'");
  res.render('book-evaluation', { 
    pageTitle: 'Book Evaluation - Waraqa',
    metaDescription: 'Book your free evaluation with Waraqa to unlock your learning potential. Discover our Quran, Arabic, and Islamic Studies programs tailored for all ages and skill levels. Start your educational journey today with expert teachers from Al-Azhar.',
    metaKeywords: 'Waraqa, free evaluation, Quran classes, Arabic lessons, Islamic Studies, online Quran school, Quran recitation, Tajweed, Quranic Arabic, Quran courses, Arabic learning, Islamic education, free trial, Al-Azhar graduates, educational evaluation',
    ogImage: '/images/home-og-image.jpg',
    ogUrl: 'https://www.waraqaweb.com/book-evaluation',
    user });
});
app.get('/contact', (req, res) => {
  console.log("GET request to '/contact'");
  res.render('contact', { 
    pageTitle: 'Contact us - Waraqa',
    metaDescription: 'Get in touch with Waraqa for any questions, feedback, or inquiries. Find our contact details, including phone, email, and social media links, along with our location on the map.',
    metaKeywords: 'contact us, Waraqa, contact information, phone number, email address, social media, Facebook, Instagram, LinkedIn, Twitter, online Quran school, Islamic education, Quran classes, feedback',
    ogImage: '/images/home-og-image.jpg',
    ogUrl: 'https://www.waraqaweb.com/contact',
    user });
});

// Blog Page
app.get('/blog', async (req, res) => {
  const cacheKey = 'posts-page-' + (parseInt(req.query.page) || 1);
  if (cache[cacheKey]) {
      return res.render('blog', cache[cacheKey]);
  }
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 17; // Display up to 17 posts per page
    const skip = (page - 1) * limit;

    // Fetch posts for the current page
    const posts = await PosT.find()
    .select('title slug thumbnail date')  // Only fetch the needed fields
    .sort({ date: -1 })
    .skip(skip)
    .limit(limit)
    .exec();
    const totalPosts = await PosT.countDocuments(); // Count total posts for pagination

    res.render('blog', {
      pageTitle: 'Blog - Waraqa',
      metaDescription: 'Read the latest articles and insights from Waraqa on Quranic studies, Arabic language, Islamic teachings, and more. Stay informed with our expert-authored blog posts.',
      metaKeywords: 'Waraqa, blog, Quranic studies, Arabic language, Islamic teachings, Islamic blog, Arabic education, Quran recitation, Arabic learning, Islamic studies blog',
      ogImage: '/images/home-og-image.jpg',
      ogUrl: 'https://www.waraqaweb.com/blog',
      user: req.session.username || "Guest",
      posts: posts,
      sposts: sortedPosts,
      fpost: posts[0] || null,
      date: Date.now(),
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit)
    },
    // Store the result in cache for 10 minutes
    cache[cacheKey] = pageData;
    setTimeout(() => delete cache[cacheKey], 600000);  // Cache expires in 10 minutes

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
      metaDescription: 'Access your personalized dashboard on Waraqa. Manage your courses, track progress, and explore learning resources all in one place.',
      metaKeywords: 'dashboard, Waraqa, student dashboard, course management, learning progress, online education, Quran recitation, Arabic courses, Islamic studies dashboard',
      ogImage: '/images/home-og-image.jpg',
      ogUrl: 'https://www.waraqaweb.com/dashboard',
      user
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
      ogUrl: 'https://www.waraqaweb.com/compose',
      user: req.session.username, 
    }); // Render compose page
  }
});
// Preprocess slug: Replace spaces with dashes and ensure lowercase
const formatSlug = (slug) => {
  return slug
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "") // Remove invalid characters
      .replace(/\s+/g, "-"); // Replace spaces with hyphens
};

// Route to handle post submission
app.post("/compose", upload.single("image"), async (req, res) => {
  const { postTitle, postBody, postSlug } = req.body;

  // Preprocess slug: Replace spaces with dashes and ensure lowercase
  const formattedSlug = formatSlug(postSlug || postTitle);

  // Validate the processed slug
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/; // URL-friendly slug validation
  if (!slugRegex.test(formattedSlug)) {
    return res.send(
      "<script>alert('Invalid Slug. Use lowercase letters, numbers, and hyphens only.');window.location.href = '/compose'</script>"
    );
  }

  // Check for duplicate title
  try {
    const existingPost = await PosT.findOne({ title: postTitle });
    if (existingPost) {
      return res.send(
        "<script>alert('Post title already exists. Please choose a unique title.');window.location.href = '/compose'</script>"
      );
    }

    // Check for duplicate slug
    const existingSlug = await PosT.findOne({ slug: formattedSlug });
    if (existingSlug) {
      return res.send(
        "<script>alert('Slug already exists. Please choose a different title or slug.');window.location.href = '/compose'</script>"
      );
    }
  } catch (err) {
    console.error("Error checking for duplicates:", err);
    return res.send(
      "<script>alert('An error occurred while checking for duplicates. Please try again.');window.location.href = '/compose'</script>"
    );
  }

  // Prepare the post data
  const postData = {
    author: req.session.username,
    title: postTitle,
    slug: formattedSlug, // Save the processed slug
    content: postBody,
    thumbnail: req.file ? req.file.filename : null,
    date: Date.now(),
    like: 0,
  };

  try {
    // Save the post to the database
    await PosT.create(postData);
    res.redirect("/admin"); // Redirect to the admin page
  } catch (err) {
    console.error("Error saving the post:", err);
    res.send(
      "<script>alert('Error saving the post.');window.location.href = '/compose'</script>"
    );
  }
});
//--------------------------------------------------------------------------------------------------------------------------------

const fs = require('fs');

app.get("/sitemap.xml", async (req, res) => {
  try {
    const baseUrl = "https://www.waraqaweb.com";

    // Static pages with priority and change frequency
    const staticPages = [
      { loc: "", priority: "1.0", changefreq: "daily" }, // Home
      { loc: "blog", priority: "0.8", changefreq: "daily" }, // Blog page
      { loc: "posts", priority: "0.6", changefreq: "yearly" }, // Individual posts
      { loc: "about", priority: "0.8", changefreq: "yearly" }, // About Us
      { loc: "pricing", priority: "0.7", changefreq: "monthly" }, // Pricing
      { loc: "contact", priority: "0.7", changefreq: "yearly" }, // Contact
      { loc: "book-evaluation", priority: "0.9", changefreq: "weekly" }, // Book Evaluation
    ];
    

    // Fetch dynamic routes (posts) with default priority and frequency
    const posts = await PosT.find({}, "slug date").exec();
    const dynamicPosts = posts.map(post => ({
      loc: `posts/${post.slug}`,
      priority: "0.6",
      changefreq: "yearly",
    }));

// Helper function to recursively get all `.ejs` files from views
const getEjsFiles = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);

  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);

    if (stat && stat.isDirectory()) {
      // Recursively get files in subdirectories
      results = results.concat(getEjsFiles(file));
    } else if (file.endsWith(".ejs")) {
      // Check if the file path matches any static page location and exclude it
      const filePath = file.replace(dir, '').replace('.ejs', '').toLowerCase();
      const isStaticPage = staticPages.some(page => page.loc.toLowerCase() === filePath);

      if (!isStaticPage) {
        results.push(file);
      }
    }
  }); 
  
  return results;
};

    // Excluded pages that shouldn't appear in the sitemap
    const excludedPages = [
      "profile.ejs", //Not important
      "blog.ejs", //to avoid duplication
      "about.ejs", //to avoid duplication
      "pricing.ejs", //to avoid duplication
      "contact.ejs", //to avoid duplication
      "book-evaluation.ejs", //to avoid duplication
      "posts.ejs", //to avoid duplication
      "notfound.ejs", //Not important
      "edit-profile.ejs", //Not important
      "edit-post.ejs", //Not important
      "dashboard.ejs", //Not important
      "compose.ejs", //Not important
      "Layout/header.ejs", //Not important
      "Layout/head.ejs", //Not important
      "Layout/footer.ejs", //Not important
    ];
    // Get all `.ejs` files, filter out excluded ones, and map to routes
    const ejsFiles = getEjsFiles(path.join(__dirname, "views")).filter((file) => {
      // Get relative path and normalize to exclude unnecessary files
      const relativePath = path.relative(path.join(__dirname, "views"), file).replace(/\\/g, "/");
      return !excludedPages.includes(relativePath); // Keep only non-excluded files
    }).map((file) => {
      const relativePath = path.relative(path.join(__dirname, "views"), file).replace(/\\/g, "/");
      return relativePath.replace(".ejs", ""); // Convert to route format
    });
    // Log excluded pages for debugging (optional)
    console.log("Excluded pages:", excludedPages);

    // Log included routes for the sitemap (optional)
    console.log("Included routes:", ejsFiles);

    // Convert file paths to routes with default priority and frequency
    const dynamicRoutes = ejsFiles.map(file => {
      const relativePath = path.relative(path.join(__dirname, "views"), file);
      return {
        loc: relativePath.replace(/\\/g, "/").replace(".ejs", ""),
        priority: "0.5",
        changefreq: "monthly",
      };
    });

    // Combine all routes into a single sitemap
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Add static pages
    staticPages.forEach(page => {
      sitemap += `<url>
        <loc>${baseUrl}/${page.loc}</loc>
        <priority>${page.priority}</priority>
        <changefreq>${page.changefreq}</changefreq>
      </url>\n`;
    });

    // Add dynamic posts
    dynamicPosts.forEach(post => {
      sitemap += `<url>
        <loc>${baseUrl}/${post.loc}</loc>
        <priority>${post.priority}</priority>
        <changefreq>${post.changefreq}</changefreq>
      </url>\n`;
    });

    // Add dynamic routes from the views directory
    dynamicRoutes.forEach(route => {
      sitemap += `<url>
        <loc>${baseUrl}/${route.loc}</loc>
        <priority>${route.priority}</priority>
        <changefreq>${route.changefreq}</changefreq>
      </url>\n`;
    });

    sitemap += `</urlset>`;

    // Send the sitemap as XML
    res.header("Content-Type", "application/xml");
    res.send(sitemap);
  } catch (error) {
    console.error("Error generating sitemap:", error);
    res.status(500).send("Error generating sitemap.");
  }
});


//----------------------------------------------------------------------------------------------------------------------
// Route for individual post page
app.get("/posts/:slug", async (req, res) => {
  const { slug } = req.params; // Capture the slug from the URL
  try {
    // Find the post by its unique slug
    const post = await PosT.findOne({ slug });
    const posts = await PosT.find({}, 'title slug thumbnail date').sort({ date: -1 }).skip(skip).limit(limit).exec(); // Fetch all posts for the sidebar

    if (!post) {
      return res.send("<script>alert('Post not found');window.location.href = '/'</script>");
    }

    // Render the "posts" view and pass the post data to it
    res.render("posts", { 
      pageTitle: `Posts - ${post.title} - Waraqa`,
      metaDescription: `Read the latest post on Waraqa Blog: ${post.title}. Explore insights on Quranic studies, Islamic knowledge, and more. Written by ${post.author} on ${new Date(post.date).toLocaleDateString()}.`,
      metaKeywords: `Waraqa blog, Quranic studies, Islamic knowledge, ${post.title}, ${post.author}, latest blog post, Islamic blog, online education, religious studies, recent posts, Waraqa articles`,
      ogUrl: `http://localhost:3000/posts/${slug}`,
      ogImage: post.thumbnail ? `/thumbnails/${post.thumbnail}` : '/images/default-image.png', // Ensure ogImage is defined
      post,
      posts, // Pass recent posts
      user: req.session.username, 
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
      ogUrl: 'https://www.waraqaweb.com/update/:custom',
      user: req.session.username, 
      post: result }); // Render edit post page
    } else {
      res.render("notfound"); // Render not found page if user is not authorized
    }
  });
});

// Handle post update form submission
app.post("/update/:custom", upload.single("image"), async (req, res) => {
  try {
      const formattedSlug = req.body.postSlug
          ? req.body.postSlug.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-")
          : null; // Use existing slug if no new slug is provided

      // Validate the slug
      const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
      if (!slugRegex.test(formattedSlug)) {
          return res.send(
              "<script>alert('Invalid Slug. Use lowercase letters, numbers, and hyphens only.');window.location.href = '/edit/" +
                  req.params.custom +
                  "'</script>"
          );
      }

      // Update post data
      const updateData = {
          title: req.body.postTitle, // Update post title
          content: req.body.postBody, // Update post content
          slug: formattedSlug, // Update slug
      };

      // Handle new image if uploaded
      if (req.file) {
          updateData.thumbnail = req.file.filename; // Update thumbnail
      }

      await PosT.findByIdAndUpdate(req.params.custom, updateData);
      res.redirect("/posts/" + formattedSlug); // Redirect to the updated post
  } catch (err) {
      console.error(err);
      res.send(
          "<script>alert('Error updating the post.');window.location.href = '/edit/" +
              req.params.custom +
              "'</script>"
      );
  }
});


// Route for delteing a post
app.get("/delete/:custom", (req, res) => {
  if (req.session.username) { // Check if user is logged in
    PosT.findById(req.params.custom, (err, results) => {
      if (err || !results) {
        console.error("Error finding post:", err);
        return res.status(404).render("notfound");
      }

      // Check if the user is authorized to delete the post
      if (
        req.session.username === results.author || 
        req.session.type === "admin"
      ) {
        PosT.findByIdAndRemove(req.params.custom, (err) => {
          if (err) {
            console.error("Error deleting post:", err);
            return res.status(500).send("Error deleting post.");
          }

          // Redirect based on user type
          const redirectUrl = req.session.type === "admin" ? "/admin" : "/";
          res.redirect(redirectUrl);
        });
      } else {
        res.status(403).render("notfound"); // Unauthorized access
      }
    });
  } else {
    res.redirect("/login"); // Redirect to login if not logged in
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
            ogUrl: 'https://www.waraqaweb.com//profile/:customRoute',
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
      if (err || !results) {
        return res.render("notfound"); // Render not found page if user not found or error occurs
      }

      if (req.session.username === results.username) {
        // If user is authorized, fetch user details and render edit profile page
        res.render("edit-profile", { 
          pageTitle: 'Edit Profile - Waraqa',
          metaDescription: 'Discover our online courses in Arabic, Quran, and Islamic Studies.',
          metaKeywords: 'Arabic, Quran, Islamic Studies, online courses',
          ogImage: '/images/home-og-image.jpg',
          ogUrl: 'https://www.waraqaweb.com/editprofile/:custom',
          username: req.session.username, 
          email: req.session.useremail, 
          userdata: results 
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
            ogUrl: 'https://www.waraqaweb.com/admin',
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
      if (err) {
        console.log(err); // Log any errors
        return res.status(500).render("error", { message: "Error removing user" });
      }
      // Delete all posts related to the user
      PosT.deleteMany({ author: req.params.custom }, (err) => {
        if (err) {
          console.log(err); // Log errors
          return res.status(500).render("error", { message: "Error deleting posts" });
        }
        res.redirect("/admin"); // Redirect to admin page after successful deletion
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
// Route for not found page
app.get("/notfound", (req, res) => {
  if (req.session.username) { // Check if user is logged in
    res.render("notfound", {
      pageTitle: ' Page Not Found - Waraqa',
      metaDescription: 'Page not found - Waraqa. The page you are looking for may have been moved, deleted, or possibly never existed. Return to the homepage for more options.',
      metaKeywords: '404 error, page not found, Waraqa, missing page, broken link, website error, page deleted, page moved, Waraqa error page, not found page',
      ogImage: '/images/home-og-image.jpg',
      ogUrl: 'https://www.waraqaweb.com/notfound',
      user: req.session.username, 
    }); // Render not found page
  }
});
// Start the server
app.listen(process.env.PORT || 3000, () => {
  console.log("Server started at http://localhost:3000"); // Log server start message
});