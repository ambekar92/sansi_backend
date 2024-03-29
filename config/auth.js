var jwt = require("jsonwebtoken");
const config = require("config/config");
var userImpl = require("services/db/userImpl.js");
var userImplObj = new userImpl();
const log = require("config/logger");

var responseError = require("routes/errorHandler.js");

var responseObject = {
    status: true,
    responseCode: 200,
    data: [],
};

/*
    This method accepts a payload and generates a JWT with configured timeout
*/

function generateToken(payload) {
    // var sessionTimeout = config.jwt.sessionTimeout;
    console.log("--> generateToken payload--", payload);
    console.log("--> secretKey >> ",config.jwt.secretKey);
    const token = jwt.sign(payload, config.jwt.secretKey, {
        expiresIn: config.jwt.tokenTimeout,
    });
    console.log("--> Login generateToken token",token);
    // const refreshToken = jwt.sign(payload ,config.jwt.refreshTokenSecret, { expiresIn: '1d' });
    return token;
}

/*
    This method is used for Authenticating User Active Session.
    The checks for valid JSON Web Token in Header for every HTTP request and also checks redis for active user session.
*/
function authenticate(req, res, next) {
    if (typeof req.headers["authorization"] !== "undefined") {
        let token = req.headers["authorization"].split(" ")[1];
        console.log("--> Token authenticate ",token);
        //var token = req.headers["authorization"];
        if (!token) {
            authError(res);
        } else {
            try {
                jwt.verify(token, config.jwt.secretKey, function(verifyErr, payload) {
                    console.log("--> authenticate payload-------", payload);
                    if (!verifyErr) {
                        req.user = payload;
                        next();
                    } else {
                        authError(res);
                    }
                });
            } catch (error) {
                console.log(error);
            }
        }
    } else {
        let obj = {
            "responseCode": 401,
            "info": "Token expired"
        }
        res.json(obj);
    }
}

function verifyRole(req, res, next) {
    console.log("in auth--", req.body);
    if (req.body.role == "Guest") {
        prohibitError(res);
    } else {
        next();
    }
}

function prohibitError(res) {
    responseObject.responseCode = 402;
    responseError(
        res,
        responseObject,
        "You do not have permission to perform this action"
    );
}

async function traceUserActivity(req, res, action) {
    // console.log("In trace--", req);
    let User;
    let userObj = {
        api: req.url,
        action: action,
        userId: null,
        userEmail: null,
        userRole: null,
        request: req.body,
        response: res,
    };
    try {
        // get user details in database
        if (req.url == "/login") {
            User = await userImplObj.getUserByEmail(req.body.email);
        } else {
            User = await userImplObj.getUserByEmail(req.user.email);
        }
        console.log("user--", User);
        userObj.userId = User._id;
        userObj.userEmail = User.mail;
        userObj.userRole = User.role;
        console.log(userObj);
        await userImplObj.insertActivity(userObj);
    } catch (err) {
        log("traceUserActivity : ", err);
    }
}
/*
    This method is used for handling Authentication Error
*/
function authError(res) {
    responseObject.responseCode = 401;
    responseObject.info = "Session Timeout";
    responseError(res, responseObject, "Session Timeout");
}

var auth = {
    authenticate: authenticate,
    generateToken: generateToken,
    traceUserActivity: traceUserActivity,
    verifyRole: verifyRole,
};

module.exports = auth;