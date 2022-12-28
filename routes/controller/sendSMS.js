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
const moment = require("moment");

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

/* Axios Generic Function to Send a SMS via POST APIs*/
async function postMethod(param) {
    try {
        const qtestURL = 'https://www.fast2sms.com/dev/bulkV2';
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
routes.prototype.saveSentDeliveredSMS = async function(req, res) {
    var responseObject = {
        status: true,
        responseCode: 200,
        data: [],
    };
    let smsSent ="";
    let query ="";
    let obj ="";
    let SmsStatus=0; // 0-SMS NOT Sent, 1-SMS Sent

    try {
        query = {
            "route" : "v3",
            "sender_id" : "FTWSMS",            
            "message" : req.body.message,
            "language" : "english",
            "flash" : 0,
            "numbers" : req.body.number,
        }     
        // SEND SMS ON and OFF
        if(config.sms.sendSMS){
            smsSent = await postMethod(query);
            SmsStatus=1
        } 
               
        if(req.body._id){
            obj ={
                "_id":req.body._id,
                // "userBuildId":req.body.buildId,                
                "status":req.body.status,
                "stop_time":parseInt(Date.now())
            }
        }else{
            
            obj ={
                "smsSentData":query,
                "smsDeliveredData":smsSent.data,
                "userEmail":req.body.email,
                "userMobile":req.body.mobile,
                "userBuildId":req.body.buildId,
                "code":req.body.code,
                "status":req.body.status,
                "SmsStatus":SmsStatus,
                "sent_time":parseInt(Date.now())
            }
        }
        

        const options = { upsert: true };
        let data = await userImplObj.saveSentDeliveredSMS(obj,options);
        responseObject.message = "SMS Data Saved Successfully";
        responseObject.data = data.result;
        res.json(responseObject);
    } catch (err) {
        console.log("saveSentDeliveredSMS : ", err);
        responseError(res, responseObject, "!! Unable to get SMS Data");
    }
};

routes.prototype.getsaveSentDeliveredSMS = async function(req, res) {
    var responseObject = {
        status: true,
        responseCode: 200
    };
    try {
        let query = req.body;
        let query2 = {userBuildId: req.body.userBuildId,status:0};
        let query3 = {buildId: req.body.userBuildId};
        let data = await userImplObj.getsaveSentDeliveredSMS(query,false); // Get current execution data
        let last3info = await userImplObj.getsaveSentDeliveredSMS(query2,true); // Get 3 ON OFF 
        let last3infoSms = await userImplObj.getSaveSMSData(query3,true); // Get 3 SMS

         console.log(">> last3infoSms",last3infoSms);
        // console.log(">> data[0].sent_time",data[0].sent_time);
        if(data.length > 0){
            let st = moment(data[0].sent_time).format("YYYY-MM-DD HH:mm:ss");
            let ft = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
            let diff = moment(ft).diff(st);

            let duration = moment.duration(diff);
            let years = duration.years(),
                days = duration.days(),
                months = duration.months(),
                hrs = duration.hours(),
                mins = duration.minutes(),
                secs = duration.seconds();

            let timeDuration = days + ' days ' + hrs + ' hrs ' + mins + ' mins ' + secs + ' sec';
            data[0].timeDuration = timeDuration;
        }
        

        for(let i=0; i < last3info.length; i++){
            last3info[i].smsBody = last3infoSms[i] ? last3infoSms[i].body : '';
        }

        responseObject.message = "Get ALL SMS Data";
        responseObject.data = data;
        responseObject.last3info = last3info;
        res.json(responseObject);
    } catch (err) {
        console.log("getsaveSentDeliveredSMS : ", err);
        responseError(res, responseObject, "!! Unable to get SMS");
    }
};

