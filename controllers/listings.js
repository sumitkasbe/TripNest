const Listing = require("../models/listing.js");

// INDEX - show all listings
module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
};

// RENDER NEW LISTING FORM
module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

// SHOW LISTING DETAILS
module.exports.showListing = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: { path: "author" }
        })
        .populate("owner");

    if (!listing) {
        req.flash('error', 'The listing you requested does not exist!');
        return res.redirect("/listings");
    }

    res.render("listings/show.ejs", { listing });
};

// CREATE LISTING
module.exports.createListing = async (req, res) => {
    const { listing } = req.body;
    const newListing = new Listing(listing);
    newListing.owner = req.user._id;

    if (req.file) {
        newListing.image = {
            url: req.file.path,
            filename: req.file.filename
        };
    }

    await newListing.save();
    req.flash('success', 'Listing created successfully!');
    res.redirect("/listings");
};

// RENDER EDIT FORM
module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash('error', 'The listing you requested does not exist!');
        return res.redirect("/listings");
    }

    // Optional smaller preview image
    let originalImageUrl = listing.image?.url;
    if (originalImageUrl) {
        originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
    }

    res.render("listings/edit.ejs", { listing, originalImageUrl });
};

// UPDATE LISTING
module.exports.updateListing = async (req, res) => {
    const { id } = req.params;
    const { listing } = req.body;

    const updatedListing = await Listing.findByIdAndUpdate(id, { ...listing }, { new: true });

    // Only update image if a new file is uploaded
    if (req.file) {
        updatedListing.image = {
            url: req.file.path,
            filename: req.file.filename
        };
        await updatedListing.save();
    }

    req.flash('success', 'Listing updated successfully!');
    res.redirect(`/listings/${id}`);
};

// DELETE LISTING
module.exports.destroyListing = async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash('success', 'Listing deleted successfully!');
    res.redirect("/listings");
};

// LISTINGS BY CATEGORY
module.exports.listingsByCategory = async (req, res) => {
    const { categoryName } = req.params;
    const listings = await Listing.find({ category: categoryName });

    if (!listings || listings.length === 0) {
        req.flash('error', `No listings found for category: ${categoryName}`);
        return res.redirect('/listings');
    }

    res.render("listings/index.ejs", { allListings: listings });
};

// SEARCH LISTINGS
module.exports.searchListings = async (req, res) => {
    const { q } = req.query;
    const query = q ? q.trim().replace(/[“”‘’]/g, '"') : "";

    if (!query) {
        req.flash("error", "Please enter something to search!");
        return res.redirect("/listings");
    }

    const listings = await Listing.find({
        $or: [
            { title: { $regex: query, $options: "i" } },
            { location: { $regex: query, $options: "i" } },
            { country: { $regex: query, $options: "i" } },
            { category: { $regex: query, $options: "i" } }
        ]
    });

    if (listings.length === 0) {
        req.flash("error", `No results found for "${query}"`);
        return res.redirect("/listings");
    }

    res.render("listings/index.ejs", { allListings: listings });
};
