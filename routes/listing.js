const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
// const {validateListing} = require("../middleware.js");
// const {isLoggedIn} = require("../middleware.js");
const { isOwner, isLoggedIn, validateListing } = require("../middleware.js");

const listingController = require("../controllers/listings.js");
const multer = require('multer')
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

//Search Route to get Listings
router.get("/search", wrapAsync(listingController.searchListings));

//Index route & Create route
router
    .route("/")
    .get(wrapAsync(listingController.index)) //index route
    .post(isLoggedIn, upload.single('listing[image]'), validateListing, wrapAsync(listingController.createListing)); //create route 

//New Route
router.get("/new", isLoggedIn, listingController.renderNewForm);

//show, update & delete route
router
    .route("/:id")
    .get(wrapAsync(listingController.showListing)) //show route
    .put(isLoggedIn, isOwner, upload.single('listing[image]'), validateListing, wrapAsync(listingController.updateListing)) //update route
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing)); //delete route

//Edit Route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

module.exports = router;  