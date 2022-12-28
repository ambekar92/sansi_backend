const auth = require("config/auth");
const userImpl = require("services/db/userImpl.js");
const userImplObj = new userImpl();
const responseError = require("routes/errorHandler.js");
const config = require("config/config");
const logger = require("config/logger");
const util = require("util");
const bcrypt = require("bcrypt");
const _ = require("underscore");
const  ObjectID = require('mongodb').ObjectId;

var bcryptHash = util.promisify(bcrypt.hash);

var routes = function() {};

module.exports = routes;

/******* User Controller ******/

/**
 * This method is for login
 */
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
        var mobile = req.body.mobile;
        var password = req.body.password;

        let user = {
            mobile,
            password
        };
        let obj ={
            mobile
        }
        
        try {
            // hashing the password to provide security (so no one except the user knows it :)
            // let passwordHash = await bcryptHash(password, saltRounds);
            // checking the user
            let newUser = await userImplObj.login(user);
            if (newUser) {
                token = auth.generateToken(obj);
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
    const authHeader = req.headers["authorization"].split(" ")[1];
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

routes.prototype.registerUser = async function(req, res) {
    // console.log("--> registerUser req.body >>", req.body);
    let email = req.body.email;
    let mobile = req.body.mobile;
    let query = req.body; // get all request data
    let check = { mobile:req.body.mobile };
    
    var responseObject = {
        status: true,
        responseCode: 200,
    };

    try {
        if(query._id){
            const options = { upsert: true };
            let newUser = await userImplObj.addRegisteredUsers(query,options);
            console.log("   ==> Updated >> ", newUser.result);
            responseObject.message = "User Updated successfully!";
            res.json(responseObject);
        }else{
            let users = await userImplObj.getRegisteredUsers(check);
            if (users.length != 0) {
                console.log("   ==> User Found -->", users);
                if(users[0].email === email || users[0].mobile === mobile){
                    responseObject.responseCode = 409;
                    responseError(res, responseObject, "User already exists");
                }                
            } else {
                const options = { upsert: true };
                let newUser = await userImplObj.addRegisteredUsers(query,options);
                console.log("   ==> InsertedId >> ", newUser.result);
                responseObject.message = "Registered successfully!";
                res.json(responseObject);
            }
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
    let query = { "_id": ObjectID(req.body.id)};
    let table='registered_users';
    var responseObject = {
        status: true,
        responseCode: 200,
        data: [],
    };

    try {
        if(req.body.key === 'code'){
            table='code';
        }
        let users = await userImplObj.deleteUsers(query,table);
        // console.log(">> Delete users ", users);
        if(users.deletedCount > 0){
            responseObject.message = "Record Deleted";
            res.json(responseObject);
        }else{
            responseObject.responseCode = 409;
            responseObject.message = "Record Not Found";
            res.json(responseObject);
        }
        
    } catch (err) {
        console.log("getUsers : ", err);
        responseError(res, responseObject, "!! Unable to Delete Users");
    }
};

routes.prototype.getDashboardData = async function(req, res) {
    var responseObject = {
        status: true,
        responseCode: 200
    };
    try {
        let query = req.body;
        let users = await userImplObj.getRegisteredUsers(query);
        responseObject.message = "Dashboard Details";
        responseObject.users = users.length;
        res.json(responseObject);
    } catch (err) {
        console.log("getUsers : ", err);
        responseError(res, responseObject, "!! Unable to get Users");
    }
};

routes.prototype.saveConfigData = async function(req, res) {
    var responseObject = {
        status: true,
        responseCode: 200,
        data: [],
    };
    try {
        let query = req.body;
        const options = { upsert: true };
        let data = await userImplObj.saveConfigData(query,options);
        responseObject.message = "Saved Config Data in DB";
        responseObject.data = data.result;
        res.json(responseObject);
    } catch (err) {
        console.log("getUsers : ", err);
        responseError(res, responseObject, "!! Unable to get Users");
    }
};

routes.prototype.getSaveConfigData = async function(req, res) {
    var responseObject = {
        status: true,
        responseCode: 200
    };
    try {
        let query = req.body;
        let data = await userImplObj.getSaveConfigData(query);
        responseObject.message = "Config Data Details";
        responseObject.data = data;
        res.json(responseObject);
    } catch (err) {
        console.log("getUsers : ", err);
        responseError(res, responseObject, "!! Unable to get Users");
    }
};

routes.prototype.saveCode = async function(req, res) {
    var responseObject = {
        status: true,
        responseCode: 200,
        data: [],
    };
    try {
        let query = req.body;
        const options = { upsert: true };
        let data = await userImplObj.saveCode(query,options);
        responseObject.message = "Code Saved Successfully";
        responseObject.data = data.result;
        res.json(responseObject);
    } catch (err) {
        console.log("getUsers : ", err);
        responseError(res, responseObject, "!! Unable to get Users");
    }
};

routes.prototype.getSaveCode = async function(req, res) {
    var responseObject = {
        status: true,
        responseCode: 200
    };
    try {
        let query = req.body;
        let data = await userImplObj.getSaveCode(query);
        responseObject.message = "Code Data";
        responseObject.data = data;
        res.json(responseObject);
    } catch (err) {
        console.log("getUsers : ", err);
        responseError(res, responseObject, "!! Unable to get Users");
    }
};

// calling from Android 
routes.prototype.saveSMSData = async function(req, res) {
    var responseObject = {
        status: true,
        responseCode: 200,
        data: [],
    };
    try {
        let query = req.body;
        const options = { upsert: true };
        if(query.length > 0){
            for(let i=0; i<query.length; i++){
                query[i] = _.pick(query[i],['address','appPhoneNumber','body','buildId','creator','date','date_sent','phoneData']);
                // query[i].received_time = Date.now() ; 
                await userImplObj.saveSMSData(query[i],options);
            }
            responseObject.message = "Saved SMS Data in DB";
            res.json(responseObject);
        }else if(query.buildId){
            await userImplObj.saveSMSData(query,options);
            responseObject.message = "Saved USER SMS Data in DB";
            res.json(responseObject);
        }else{
            responseObject.message = "NO SMS Found";
            res.json(responseObject);
        }
        
    } catch (err) {
        console.log("getUsers : ", err);
        responseError(res, responseObject, "!! Unable to get Users");
    }
};

routes.prototype.getSaveSMSData = async function(req, res) {
    var responseObject = {
        status: true,
        responseCode: 200
    };
    try {
        let query = req.body;
        let data = await userImplObj.getSaveSMSData(query);
        responseObject.message = "SMS Data Details";
        responseObject.data = data;
        res.json(responseObject);
    } catch (err) {
        console.log("getUsers : ", err);
        responseError(res, responseObject, "!! Unable to get SMS");
    }
};