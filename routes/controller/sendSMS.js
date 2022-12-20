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
const axios = require('axios').default;

var bcryptHash = util.promisify(bcrypt.hash);

var routes = function() {};

module.exports = routes;

/******* User Controller ******/

/**
 * This Functions for send SMS
 */

/* Axios Generic Function to call GET APIs*/
// async function getMethod(url, fullUrl) {
//     try {

//         let qtestURL;
//         if (url == '') {
//             qtestURL = fullUrl;
//         } else {
//             qtestURL = config.qtest.baseURL + url
//         }
//         const axiosConfig = {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${config.qtest.access_token}`
//         }
//         const response = await axios.get(qtestURL, {
//             headers: axiosConfig
//         }, { httpsAgent })

//         return response;

//     } catch (err) {
//         console.log('\nGET Error in Catch --\n', err)
//     }

// }

/* Axios Generic Function to call POST APIs*/
async function postMethod(param) {
    try {
        const qtestURL = 'https://www.fast2sms.com/dev/bulkV2';
            //console.log('\nPOST Method URL --', qtestURL);
            //console.log('Req Param --\n', JSON.stringify(param));
        const axiosConfig = {
            "authorization":"30PwGVFxpcv7DhMOsYdmQLinUTqza4rt6yfugXkjINe1KS9WJoD5JH1gL7aQlIvm3sNjOEFMRiZnuh2V",
            "Content-Type":"application/json"
        }        
        const response = await axios.post(qtestURL, JSON.stringify(param), {
            headers: axiosConfig
        })
        return response;
    } catch (err) {
        console.log('\nPost Error in Catch --\n', err)
    }
}

//SMS
routes.prototype.saveSentDeloveredSMS = async function(req, res) {
    var responseObject = {
        status: true,
        responseCode: 200,
        data: [],
    };
    try {
        let query = {
            "route" : "v3",
            "sender_id" : "FTWSMS",
            "message" : req.body.message,
            "language" : "english",
            "flash" : 0,
            "numbers" : req.body.number,
        }
        let smsSent = await postMethod(query);
        let obj ={
            "smsSentData":query,
            "smsDeliveredData":smsSent.data,
            "userEmail":req.body.email,
            "userMobile":req.body.mobile,
            "userBuildId":req.body.buildId,
        }

        const options = { upsert: true };
        let data = await userImplObj.saveSentDeloveredSMS(obj,options);
        responseObject.message = "SMS Data Saved Successfully";
        responseObject.data = data.result;
        res.json(responseObject);
    } catch (err) {
        console.log("saveSentDeloveredSMS : ", err);
        responseError(res, responseObject, "!! Unable to get SMS Data");
    }
};

routes.prototype.getsaveSentDeloveredSMS = async function(req, res) {
    var responseObject = {
        status: true,
        responseCode: 200
    };
    try {
        let query = req.body;
        let data = await userImplObj.getsaveSentDeloveredSMS(query);
        responseObject.message = "Get ALL SMS Data";
        responseObject.data = data;
        res.json(responseObject);
    } catch (err) {
        console.log("getsaveSentDeloveredSMS : ", err);
        responseError(res, responseObject, "!! Unable to get SMS");
    }
};

