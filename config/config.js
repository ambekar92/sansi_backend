var config = {
    sms:{
        sendSMS:false
    },
    db_permission: { // All Condition maintained in config\mongodb.js
        access: 3, // 1: From IP(mongodb)  2: From mongo_culster  3: Railway DB
    },
    app: {
        port: "9001",
        saltRounds: 10,
    },
    railway:{ // db_permission -> access -> 3
        // mongosh "mongodb://mongo:rPATRzJd8pU6MyBhWnBy@containers-us-west-146.railway.app:7458"
        url : 'mongodb://mongo:rPATRzJd8pU6MyBhWnBy@containers-us-west-146.railway.app:7458',        
        schema: "smartdurga"
    },
    mongo_culster: { // db_permission -> access -> 2
        host: "smartdurga.f4fpq.mongodb.net",
        user: "smartdurga",
        pass: "smartdurga@123",
        schema: "smartdurga",
    },
    mongodb: { // db_permission -> access -> 1
        host: "localhost",
        port: "27017",
        schema: "smartdurga",
    },
    jwt: {
        sessionTimeout: 28800, // 8 hours
        tokenTimeout: 28800,  // 600 -> 10 mins 
        secretKey: "3rd24d92rd32jdjewofjewf8",
        refreshTokenSecret: '1999sansi1992'
    },
    xlsConversion: {
        runSheetName: "RUN",
    },
    mqtt: {
        host: "127.0.0.1",
        port: "1883",
        resultTopic: "nxp/testExecutionResult/",
        statusTopic: "nxp/testExecutionStatus/",
        summaryTopic: "nxp/testExecutionSummary/",
        registerTopic: "nxp/testbed/register",
        publishTopic: "nxp/testexecution/",
        errorTopic: "nxp/testbed/error",
    },
    public: {
        path: "./public/",
        templates: "Templates/",
        output: "Output/",
        configuration: "Configurations/",
        testplan: "Testplans/",
        watsversions: "WatsVersions/",
        batsversions: "BatsVersions/",
    },
    qtest: {
        permission: true,
        baseURL: "https://qtest.tulip.nxp.com",
        access_token: "17b116ba-827e-482d-8b32-09a3bff2cbec",
        tls_ca_file: "../../config/tls-ca-bundle.pem",
        project_name: "GES_AutomationIntegration_Trial",
        root_module: "Automation",
        uploadTemplate: { id: "123456789", template: "Upload PASS/FAIL" },
    },
};

module.exports = config;
