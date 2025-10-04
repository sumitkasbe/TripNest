const Listing = require("../models/listing.js");
const Review = require("../models/review");

// module.exports.createReview = async (req, res, next) => {
//     let { id } = req.params;
//     let listing = await Listing.findById(req.params.id);
//     let newReview = new Review(req.body.review);
//     newReview.author = req.user._id;// review with associative author...
//     listing.reviews.push(newReview);
//     console.log(newReview);

//     await newReview.save();
//     await listing.save();
//      req.flash("success", "New Review Created!"); 
//     res.redirect(`/listings/${id}`);
// };

module.exports.createReview = async(req,res) => {
    let listings = await Listing.findById(req.params.id);
    if (!listings) {
        throw new ExpressError(404, "Listing not found");
    }
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    listings.reviews.push(newReview);

    await newReview.save();
    await listings.save();
    req.flash('success','Review submitted successfully!');

    res.redirect(`/listings/${listings._id}`);
};

module.exports.destroyReview = async (req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
     req.flash("success", "Review Deleted!");
    res.redirect(`/listings/${id}`);
};