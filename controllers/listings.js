const Listing = require("../models/listing");
const ExpressError = require("../utils/ExpressError");

// INDEX
module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("./listings/index.ejs", { allListings });
};

// NEW FORM
module.exports.renderNewForm = (req, res) => {
    res.render("./listings/new.ejs");
};

// SHOW
module.exports.showListing = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({ path: "reviews", populate: { path: "author" } })
        .populate("owner");

    if (!listing) throw new ExpressError(404, "Listing Not Found!");
    res.render("./listings/show.ejs", { listing });
};

// CREATE
module.exports.createListing = async (req, res) => {
    if (req.file) {
        req.body.listing.image = { url: req.file.path, filename: req.file.filename };
    }
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    await newListing.save();

    req.flash("success", "New Listing Created!");
    res.redirect(`/listings/${newListing._id}`);
};

// EDIT FORM
module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) throw new ExpressError(404, "Listing Not Found!");

    const originalImgUrl = listing.image.url.replace("/upload/", "/upload/w_300,h_300,c_fill,g_auto/");
    res.render("./listings/edit.ejs", { listing, originalImgUrl });
};

// UPDATE
module.exports.updateListing = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    if (!listing) throw new ExpressError(404, "Listing Not Found for Update!");

    if (req.file) {
        listing.image = { url: req.file.path, filename: req.file.filename };
        await listing.save();
    }

    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};

// DELETE
module.exports.destroyListing = async (req, res) => {
    const { id } = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);

    if (!deletedListing) throw new ExpressError(404, "Listing Not Found for Deletion!");

    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
};

// FILTER BY CATEGORY
module.exports.listingsByCategory = async (req, res) => {
    const { categoryName } = req.params;
    const filteredListings = await Listing.find({ category: categoryName });

    if (!filteredListings.length) {
        req.flash('error', `No listings found for category: ${categoryName}`);
        return res.redirect('/listings');
    }

    res.render("listings/index.ejs", { allListings: filteredListings });
};

// SEARCH
module.exports.searchListings = async (req, res) => {
    const query = req.query.q?.trim().replace(/[“”‘’]/g, '"') || "";

    if (!query) {
        req.flash("error", "Please enter something to search!");
        return res.redirect("/listings");
    }

    const orConditions = [
        { title: { $regex: query, $options: "i" } },
        { location: { $regex: query, $options: "i" } },
        { country: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
    ];

    if (!isNaN(query)) orConditions.push({ price: Number(query) });

    const listings = await Listing.find({ $or: orConditions });

    if (!listings.length) {
        req.flash("error", `No results found for "${query}"`);
        return res.redirect("/listings");
    }

    res.render("listings/index.ejs", { allListings: listings });
};
