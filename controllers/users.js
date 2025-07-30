const User = require("../models/user");

module.exports.renderSignUpForm = (req, res) => {
    res.render("./users/signup.ejs");
};

module.exports.userSignUp = async (req, res) => {
    try {
        let { username, email, password } = req.body;
        let newUser = new User({ username, email, password });
        const registeredUser = await User.register(newUser, password);
        console.log(registeredUser);

        req.login(registeredUser, (err) => {
            if (err) {
                return next(err); //after signup we dont need to login
            }
            req.flash("success", "Welcome to TripNest!");
            res.redirect("/listings");
        });

    } catch (err) {
        req.flash("error", err.message);
        res.redirect("/signup");
    };
};

module.exports.renderLoginForm = (req, res) => {
    res.render("./users/login.ejs");
};

module.exports.userLogin =  async (req, res) => {
    req.flash("success", "Welcome back to TripNest!");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};

module.exports.userLogOut = (req, res, next) => {
    req.logOut((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "you are logged out now!");
        res.redirect("/listings");
    });
};