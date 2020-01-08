// DEPENDENCIES 

var express = require("express");
var app = express();

var bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    methodOverride = require("method-override"),
    flash = require("connect-flash"),
    sanitizer = require("express-sanitizer");
// express-session is required below 

// MODELS
var User = require("./models/user");

//var middleware = require("./middleware");


//var seedDB = require("./seeds");
//seedDB();

// require routes files
// var mtgRoutes = require("./routes/mtg"),
//     wishlistRoutes = require("./routes/wishlist");


const PORT = process.env.PORT || 3000

mongoose.connect("mongodb://localhost/playtest");
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public")); // for a shortcut to the public folder
app.use(methodOverride("_method")); // for PUT and DELETE
app.use(flash());
app.use(sanitizer());


app.use(require("express-session")({
    secret: "Freesh Ava Cadoo",
    resave: false,
    saveUninitialized: false,
    cookie: {expires: new Date(253402300000000)}
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//middleware used on every route call 
app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    res.locals.baseUrl = "http://localhost:3000";
    next();
});

app.get("/", function (req, res) {
    //show user's decks
    res.render("home", {});
});

app.get("/register", function (req, res) {
    var username = req.query.username;
    res.render("account/register", {username: username});
});

app.post("/register", function (req, res) {
    var username = req.body.username;
    if (req.body.password === req.body.password2) {
        var newUser = new User({ username: req.body.username });
        User.register(newUser, req.body.password, function (err, user) {
            if (err) {
                req.flash("error", err.message);
                if (username && username != "") {
                    res.redirect("/register?username=" + encodeURIComponent(username));
                } else {
                    res.redirect("/register");
                }
            }
            passport.authenticate("local")(req, res, function () {
                req.flash("success", "Account created! Welcome!");
                res.redirect("/");
            });
        });
    } else {
        req.flash("error", "Passwords don't match");
        res.redirect("/register?username=" + encodeURIComponent(username));
    }
});

app.post("/login", passport.authenticate("local",
    {
        successRedirect: "/",
        failureRedirect: "/",
        failureFlash: true,
        successFlash: "Login successful"
    }), function (req, res) {}
);

app.get("/logout", function (req, res) {
    req.logout();
    req.flash("success", "You have been successfully signed out.");
    res.redirect("/");
});

// app.use routes files
// app.use(mtgRoutes);
// app.use(wishlistRoutes);

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
