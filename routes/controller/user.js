const auth = require("config/auth");
const userImpl = require("services/db/userImpl.js");
const userImplObj = new userImpl();
const responseError = require("routes/errorHandler.js");
const config = require("config/config");
const logger = require("config/logger");
const util = require("util");
const bcrypt = require("bcrypt");
const _ = require("underscore");

var bcryptHash = util.promisify(bcrypt.hash);

var routes = function() {};

module.exports = routes;

/******* User Controller ******/

/**
 * This method is for login
 */
routes.prototype.login = async function(req, res) {
    let user;
    var token;
    var responseObject = {
        status: true,
        responseCode: 200,
        data: {},
        token: "",
    };

    if (req.body.user == "guest") {
        user = {
            password: "p@ssw0rd",
            mail: "guest@test.com",
            role: "Guest",
            nxfID: "guest123",
        };

        token = auth.generateToken(user);
        responseObject.message = "Login successful!";
        responseObject.token = token;
        responseObject.data = user;
        //auth.traceUserActivity(req, responseObject, "Login");
        res.json(responseObject);
    } else {
        var email = req.body.email;
        var password = req.body.password;

        user = {
            email: email,
            password:password
        };

        console.log("--> Login req body >> ", req.body);
        try {
            // hashing the password to provide security (so no one except the user knows it :)
            // let passwordHash = await bcryptHash(password, saltRounds);
            // checking the user
            let newUser = await userImplObj.login(user);
            // console.log("new user-", newUser);
            if (newUser) {
                token = auth.generateToken(user);
                responseObject.message = "Login successful!";
                responseObject.token = token;
                responseObject.data = newUser;
                //auth.traceUserActivity(req, responseObject, "Login");
                res.json(responseObject);
            }
        } catch (err) {
            console.log("loginError : ", err);
            responseError(res, responseObject, err);
        }
    }
};

routes.prototype.logout = async function(req, res) {
    const authHeader = req.headers["authorization"];
    var responseObject = {
        status: true,
        responseCode: 200,
        user: '',
    };

    try {
        //let user = {email: req.body.email,password:req.body.password,};
        // Logout the user
        let resMsg = await userImplObj.logout(authHeader);
        console.log("--> Logout MSG >> ",resMsg);
        responseObject.message = "Logout successful!";
        responseObject.user = req.body.email;
        //auth.traceUserActivity(req, responseObject, "Logout");
        res.json(responseObject);
    } catch (err) {
        console.log("loginError : ", err);
        responseError(res, responseObject, "Unable to logout");
    }
};

routes.prototype.addGoogleUser = async function(req, res) {
    //console.log("req.body >>", req.body);
    let dataObj = req.body.userData;

    var responseObject = {
        status: true,
        responseCode: 200,
    };

    try {
        //console.log("dataObj.googleId >>", dataObj[0].googleId);
        let query = { googleId: dataObj[0].googleId };
        let users = await userImplObj.getUser(query);
        console.log("User Found -->", users);

        if (users !== null && users.googleId === dataObj[0].googleId) {
            responseError(res, responseObject, "User already present");
        } else {
            let newUser = await userImplObj.insertUser(dataObj[0]);
            responseObject.message = "User added successfully!";
            res.json(responseObject);
        }
    } catch (err) {
        console.log("addGoogleUser : ", err);
        responseError(res, responseObject, err);
    }
};

routes.prototype.registerUser = async function(req, res) {
    console.log("--> registerUser req.body >>", req.body);
    let email = req.body.email;
    let mobile = req.body.mobile;
    let obj = req.body;
    let query = { email: req.body.email,mobile:req.body.mobile };
    
    var responseObject = {
        status: true,
        responseCode: 200,
    };

    try {
        let users = await userImplObj.getRegisteredUsers(query);
        console.log("   ==> User Found -->", users);

        if (users.length != 0) {
            if(users[0].email === email || users[0].mobile === mobile){
                responseObject.responseCode = 409;
                responseError(res, responseObject, "User already exists");
            }                
        } else {
            let newUser = await userImplObj.addRegisteredUsers(obj);
            console.log("   ==> InsertedId >> ", newUser.insertedId);
            responseObject.message = "Registered successfully!";
            res.json(responseObject);
        }
    } catch (err) {
        console.log("registerUser : ", err);
        responseError(res, responseObject, err);
    }
};

routes.prototype.getUsers = async function(req, res) {
    var responseObject = {
        status: true,
        responseCode: 200,
        data: [],
    };

    try {
        let query = {};
        let users = await userImplObj.getRegisteredUsers(query);
        responseObject.message = "Registered Users list";
        responseObject.elements = users.length;
        responseObject.data = users;
        res.json(responseObject);
    } catch (err) {
        console.log("getUsers : ", err);
        responseError(res, responseObject, "!! Unable to get Users");
    }
};

routes.prototype.deleteUser = async function(req, res) {
    let query = { email: req.body.email,mobile:req.body.mobile };
    var responseObject = {
        status: true,
        responseCode: 200,
        data: [],
    };

    try {
        let users = await userImplObj.deleteUsers(query);
        responseObject.message = "Users Deleted";
        res.json(responseObject);
    } catch (err) {
        console.log("getUsers : ", err);
        responseError(res, responseObject, "!! Unable to Delete Users");
    }
};