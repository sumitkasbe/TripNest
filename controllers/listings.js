const Listing = require("../models/listing");

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("./listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
    res.render("./listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate({
        path: "reviews",
        populate: {
            path: "author"
        },
    }).populate("owner");

    if (!listing) {
        req.flash("error", "Listing Not Found!");
        return res.redirect("/listings");
    }
    res.render("./listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    await newListing.save();

    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing Not Found!");
        return res.redirect("/listings");
    }

   let originalImgUrl = listing.image.url.replace("/upload/", "/upload/w_300,h_300,c_fill,g_auto/");
   console.log("Resized Image URL:", originalImgUrl);
    res.render("./listings/edit.ejs", { listing, originalImgUrl });
};

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }

    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    let deleteListing = await Listing.findByIdAndDelete(id);
    console.log(deleteListing);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
};


module.exports.searchListings = async (req, res) => {
    const { q } = req.query;

    // Trim and normalize input (removes extra spaces and smart quotes)
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