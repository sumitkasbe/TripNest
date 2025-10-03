const User = require("../models/user");

// SIGNUP FORM
module.exports.renderSignUpForm = (req, res) => {
    res.render("./users/signup.ejs");
};

// SIGNUP LOGIC
module.exports.userSignUp = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const newUser = new User({ username, email });
        const registeredUser = await User.register(newUser, password);

        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash("success", "Welcome to TripNest!");
            res.redirect("/listings");
        });
    } catch (err) {
        req.flash("error", err.message);
        res.redirect("/signup");
    }
};

// LOGIN FORM
module.exports.renderLoginForm = (req, res) => {
    res.render("./users/login.ejs");
};

// LOGIN LOGIC
module.exports.userLogin = (req, res) => {
    req.flash("success", "Welcome back to TripNest!");
    const redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};

// LOGOUT
module.exports.userLogOut = (req, res, next) => {
    req.logOut(err => {
        if (err) return next(err);
        req.flash("success", "You are logged out!");
        res.redirect("/listings");
    });
};
