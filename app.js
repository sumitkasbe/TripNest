if(process.env.NODE_ENV != "production") {
    require('dotenv').config();
}

const express = require("express");
const app = express();
const port = 8080;
const methodOverride = require("method-override");
const path = require("path");
const ejsMate = require("ejs-mate");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js"); 

const mongoose = require("mongoose");
const ExpressError = require("./utils/ExpressError.js");

const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const Listing  =require("./models/listing.js")

const session = require("express-session"); // session 
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const { error } = require('console');

// Database connection

const dbUrl = process.env.ATLASDB_URL;

async function main() {
    await mongoose.connect(dbUrl);
}
main().then(() => console.log("Connection Successful..."))
    .catch(err => console.log("ERROR", err));

// Middleware — order matters
app.use(express.urlencoded({ extended: true }));   // parse form data
app.use(express.json());                           // parse JSON data (optional but good)
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// View engine
app.engine('ejs', ejsMate);                        // register ejsMate first
app.set("view engine", "ejs");                     //  set view engine
app.set("views", path.join(__dirname, "views"));   //  set views path


const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET
    },
    touchAfter: 24 * 3600,
});

store.on("error", () => {
    console.log("ERROR in MONGO SESSION STORE", error);
});

const sessionOptions = {
    store: store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expire: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    }
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//middleware for flash msg
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currentUser = req.user;
    // console.log(res.locals.success);
    next();
});

app.get('/', async (req, res) => {
  const allListings = await Listing.find({});
  res.render('listings/index.ejs', { allListings });
});

//Express Router
app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", userRouter);

app.use((err,req,res,next)=>{
    let {statusCode = 500 , message = "Something is wrong"} = err;
    res.render("views/listings/error.ejs", {message,statusCode});
    // res.status(statusCode).send(message);
});

app.listen(port, () => {
    console.log(`app is listening on a port ${port}`);
}); 