const mongoDb = new(require("config/mongodb"))();
const jwt = require("jsonwebtoken");
const auth = require('../../config/auth');
const config = require("config/config");
const userImpl = function() {};

module.exports = userImpl;

/***** User Impl *****/

userImpl.prototype.login = function(usr) {
    pswd = usr.password;
    var user = mongoDb.getCollection("registered_users");

    return new Promise((resolve, reject) => {
        user
            .find(usr)
            .toArray(async function(findUsererr, findUserResult) {
                if (!findUsererr) {
                    console.log(findUserResult);
                    console.log(findUserResult.length);
                    if (findUserResult.length == 0) {
                        console.log("user not found");
                        reject("User not found. Please ask your administrator to enable");
                    } else {
                        if (usr.nxfID == "nxpadmin@nxp.com") {
                            resolve(findUserResult[0]);
                        }
                        resolve(findUserResult[0]);
                    }
                } else {
                    reject(findUsererr);
                    console.log("error");
                }
            });
    });
};

userImpl.prototype.logout = function(user, authHeader) {
    console.log("--> logout User >> ", user);
    return new Promise((resolve, reject) => {
        console.log("--> logout Token >> ", authHeader);

        jwt.sign(authHeader, "", { expiresIn: 1 }, (logout, err) => {
            if (logout) {
                resolve('You have been Logged Out');
            } else {
                reject('Error');
            }
        });
    });
};

// Get one user details
userImpl.prototype.getUser = function(query) {
    var User = mongoDb.getCollection("user");
    //console.log("CHeck --> ", User);
    return new Promise((resolve, reject) => {
        User.findOne(query, function(findOneUserErr, findOneUserResult) {
            if (!findOneUserErr) {
                resolve(findOneUserResult);
            } else {
                reject(findOneUserErr);
            }
        });
    });
};

/*This method inserts new record in User collection with the provided details.*/
userImpl.prototype.addRegisteredUsers = function(query) {
    console.log("--> addRegisteredUsers query >> \n", query);
    var User = mongoDb.getCollection("registered_users");
    return new Promise((resolve, reject) => {
        User.insertOne(query, function(addErr, addResult) {
            if (!addErr) {
                resolve(addResult);
            } else {
                reject(addErr);
            }
        });
    });
};

userImpl.prototype.addUpdateRegisteredUsers = function(query, update, options) {
    console.log("--> addUpdateRegisteredUsers query >> \n", query, update, options);
    var User = mongoDb.getCollection("registered_users");
    return new Promise((resolve, reject) => {
        User.updateOne(query, update, options, function(addErr, addResult) {
            if (!addErr) {
                resolve(addResult);
            } else {
                reject(addErr);
            }
        });
    });
};

/* This method fetches all records from User collection.*/
userImpl.prototype.getRegisteredUsers = function(query) {
    console.log("--> registeredUsers query >> \n", query);
    var User = mongoDb.getCollection("registered_users");
    return new Promise((resolve, reject) => {
        User.find(query).toArray(function(getErr, getResult) {
            if (!getErr) {
                resolve(getResult);
            } else {
                reject(getErr);
            }
        });
    });
};

/* Delete Users from User collection.*/
userImpl.prototype.deleteUsers = function(query) {
    console.log("--> deleteUsers query >> \n", query);
    var User = mongoDb.getCollection("registered_users");
    return new Promise((resolve, reject) => {
        User.deleteMany(query,function(getErr, getResult) {
            if (!getErr) {
                resolve(getResult);
            } else {
                reject(getErr);
            }
        });
    });
};

