var router = require("express").Router();
//let { ensureAuth, ensureGuest } = require("../middleware/auth");
var auth = require('../config/auth');
var user = require("routes/controller/user");
var userObj = new user();


// export the routes to our application
module.exports = {
    router: router,
};

// Render UI application
router.get("/", function(req, res) {
    //ensureGuest,
    res.render("home");
});

router.get("/home", function(req, res) {
    let responseObject = { home: "Go to Home page router" };
    //   res.render("home", {
    //     name: req.user.displayName,
    //   });
    res.json(responseObject);
});

//logout user
// router.get("/logout", (req, res) => {
//     req.logOut();
//     res.redirect("/");
// });

/* User APIs */
//auth.authenticate,  
router.post("/api/addGoogleUser", userObj.addGoogleUser);


router.post("/api/login", userObj.login);
router.post("/api/logout",auth.authenticate, userObj.logout);

router.post("/api/register_user",auth.authenticate, userObj.registerUser);
router.get("/api/getusers",  userObj.getUsers); // calling from both Android and Web 
router.post("/api/delete_user", auth.authenticate, userObj.deleteUser);

router.post("/api/dashboard_details", auth.authenticate, userObj.getDashboardData);

router.post("/api/save_configdata", auth.authenticate, userObj.saveConfigData);
router.get("/api/getsave_configdata", userObj.getSaveConfigData); // calling from Android 

router.post("/api/save_smsinfo", auth.authenticate, userObj.saveSMSData);
router.get("/api/getsave_smsinfo", userObj.getSaveSMSData); // calling from Android 
