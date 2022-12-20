const MongoClient = require("mongodb").MongoClient;
const config = require("config/config");
const util = require("util");
const log = require("config/logger");

var mongoConnect = util.promisify(MongoClient.connect);
let dbName;
let url;
let db_status;

// Connection URL & DB Config
if (config.db_permission.access == 1) {
    url = `mongodb://${config.mongodb.host}:${config.mongodb.port}`;
    dbName = config.mongodb.schema;
    db_status = `Local DB ${url}`;
} else if (config.db_permission.access == 2) {
    url = `mongodb+srv://${config.mongo_culster.user}:${config.mongo_culster.pass}@${config.mongo_culster.host}/${config.mongo_culster.schema}?retryWrites=true&w=majority`;
    //url = 'mongodb+srv://smartdurga:smartdurga@123@smartdurga.f4fpq.mongodb.net';
    dbName = config.mongo_culster.schema;
    db_status = `Mongo Cluster DB ${url}`;
} else if (config.db_permission.access == 3) {
    url = config.railway.url;
    dbName = config.railway.schema;
    db_status = `Railway DB ==> ${config.railway.url}`;
}else{
    console.log("<-- Please Configure to Database -->");
}


// Array of tables to be created
var tables = ["registered_users","message","config_data","sms_data","code","sms_transaction"];

var mongoClient, db;

var mongoDB = function() {};

mongoDB.prototype.connect = () => {
    // Use connect method to connect to the server
    return new Promise(async(resolve, reject) => {
        try {
            mongoClient = await mongoConnect(url, { useNewUrlParser: true, useUnifiedTopology: true });
            db = mongoClient.db(dbName);
            log("--> config.db_permission.access ==>", config.db_permission.access);
            log("--> DB Connected successfully =>",'"', db_status,'"\n\n');

            var collections = await db.collections();
            if (collections) {
                collections = collections.map((c) => {
                    return c.s.namespace.collection;
                });
                tables.forEach((table) => {
                    if (!collections.includes(table)) {
                        db.createCollection(table, function(err, res) {
                            if (err) throw err;
                            console.log(table, "--> Collection Created");
                        });
                    }
                });
            }
            resolve(mongoClient);
        } catch (err) {
            log("Mongo DB connection failed", err);
            reject(err);
        }
    });
};

mongoDB.prototype.disconnect = () => {
    mongoClient.close();
};

mongoDB.prototype.getCollection = (collectionName) => {
    return db.collection(collectionName);
};

module.exports = mongoDB;