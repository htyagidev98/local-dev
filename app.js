const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
var multer = require('multer')
const jwt = require('jsonwebtoken');
const app = express();
const compression = require('compression');
var aes256 = require('aes256');
var cors = require('cors');
var redis = require("redis");
const axios = require('request');
/*var client = redis.createClient({host : 'localhost', port : 6379});
client.on("error", function (err) {
    console.log("Error " + err);
});
*/
var key = 'Billion$Dream';
require('dotenv').config()

var connectWithRetry = function () {
    return mongoose.connect(`${process.env.databaseURL}`, function (err) {
        if (err) {
            console.error('Failed to connect to mongo on startup - retrying in 5 sec \n', err);
            setTimeout(connectWithRetry, 5000);
        } else {
            console.log("Database Connected")
        }
    });
};
connectWithRetry();


mongoose.Promise = global.Promise;

app.use(cors());
app.use(compression());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));
let http = app.listen(`${process.env.PORT}`, function () {
    console.log(`Listening on port ${process.env.PORT}.....`)
});
const io = require('./socket').init(http)
io.on('connection', (socket) => {
    console.log('A user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});
/*app.use('/api/v2/',require('./api/common.js'))
app.use('/api/v2/user',require('./api/user/v2/user.js'))*/

/*DEC 21, 2018*/
/*app.use('/api/v3/',require('./api/common.js'))
app.use('/api/v3/user',require('./api/user/v3/user.js'))*/


/*Jan 23, 2019*/
/*app.use('/api/v3.1/',require('./api/common.js'))
app.use('/api/v3.1/user',require('./api/user/v3.1/user.js'))
*/

/*March 12, 2019*/
/*app.use('/api/v3.2/',require('./api/common.js'))
app.use('/api/v3.2/user',require('./api/user/v3.2/user.js'))*/

/*March 19, 2019*/
/*app.use('/api/v3.3/',require('./api/common.js'))
app.use('/api/v3.3/user',require('./api/user/v3.3/user.js'))
app.use('/api/v3.3/xpress',require('./api/xpress.js'))*/

/*August 05, 2019*/
app.use('/api/v3.4/', require('./api/common.js'))
app.use('/api/v3.4/user', require('./api/user/v3.4.js'))
app.use('/api/v3.4/xpress', require('./api/xpress.js'))


/*April 16, 2019*/
/*app.use('/api/v1.0/business',require('./api/business/v1.0.js'));
app.use('/api/v1.0/',require('./api/common.js'));*/

/*Feb 22, 2020*/
app.use('/api/v2.0/business', require('./api/business/v2.0.js'));
app.use('/api/v3.0/business', require('./api/business/v3.0.js'));
app.use('/api/v2.0/', require('./api/common.js'));

/*Sep 07, 2020*/
app.use('/api/v2.1/business', require('./api/business/v2.1.js'));
app.use('/api/v2.1/', require('./api/common.js'));

// Himanshu Tyagi
// app.use('/api/v2.1/business/analytics', require('./api/erpWeb/console/analytics/analytics.js'));
// app.use('/api/v2.1/business/wms', require('./api/erpWeb/console/booking/booking.js'));
// app.use('/api/v2.1/business/app', require('./api/erpWeb/application/application.js'));
// app.use('/api/v2.1/business/crm', require('./api/erpWeb/console/lead/lead.js'));
// app.use('/api/v2.1/business/auth', require('./api/erpWeb/console/auth/auth.js'));
// app.use('/api/v2.1/business/car', require('./api/erpWeb/console/car/car.js'));
// app.use('/api/v2.1/business/b2b', require('./api/erpWeb/business/business.js'));
// app.use('/api/v2.1/business/inventory', require('./api/erpWeb/console/inventory/inventory.js'));
// app.use('/api/v2.1/business/order', require('./api/erpWeb/console/order/order.js'));
// app.use('/api/v2.1/business/quotation', require('./api/erpWeb/console/quotation-service/quotation-service.js'));
// app.use('/api/v2.1/business/sale', require('./api/erpWeb/console/sales/sales.js'));
// app.use('/api/v2.1/business/supplier', require('./api/erpWeb/console/supplier/supplier.js'));
// app.use('/api/v2.1/business/vendorOrder', require('./api/erpWeb/console/vendorOrder/vendorOrder.js'));
// app.use('/api/v2.1/business/customer', require('./api/erpWeb/customer/customer.js'));
// app.use('/api/v2.1/business/user', require('./api/erpWeb/user/user.js'));
/*
/*
*/
// Abhinav Tyagi
app.use('/api/v2.1/business', require('./api/erpWeb/console/analytics/analytics.js'));
app.use('/api/v2.1/business', require('./api/erpWeb/console/booking/booking.js'));
app.use('/api/v2.1/business', require('./api/erpWeb/application/application.js'));
app.use('/api/v2.1/business', require('./api/erpWeb/console/lead/lead.js'));
app.use('/api/v2.1/business', require('./api/erpWeb/console/auth/auth.js'));
app.use('/api/v2.1/business', require('./api/erpWeb/console/car/car.js'));
app.use('/api/v2.1/business', require('./api/erpWeb/business/business.js'));
app.use('/api/v2.1/business', require('./api/erpWeb/console/inventory/inventory.js'));
app.use('/api/v2.1/business', require('./api/erpWeb/console/order/order.js'));
app.use('/api/v2.1/business', require('./api/erpWeb/console/quotation-service/quotation-service.js'));
app.use('/api/v2.1/business', require('./api/erpWeb/console/sales/sales.js'));
app.use('/api/v2.1/business', require('./api/erpWeb/console/supplier/supplier.js'));
app.use('/api/v2.1/business', require('./api/erpWeb/console/vendorOrder/vendorOrder.js'));
app.use('/api/v2.1/business', require('./api/erpWeb/customer/customer.js'));
app.use('/api/v2.1/business', require('./api/erpWeb/user/user.js'));

//End 



/* WhatsApp business */

app.use('/api/whatsapp', require('./api/whatsapp/whatsapp'))
// app.use('/api/facebook', require('./api/facebook/facebook'))

/*April 12, 2019*/
app.use('/api/job', require('./api/job.js'));

app.use('/api/master', require('./api/master/master.js'));

app.use('/api/admin', require('./api/admin/admin.js'));

app.use(function (err, req, res, next) {
    res.setHeader('Accept-Encoding', 'gzip');
    next();
});


//Abhinav Cloud Watch Logger
/*
const config = {
    accessKeyId: '<AWS accessKeyId>',
    secretAccessKey: '<AWS secret>',
    region: '<AWS region>',
    logGroupName: '<myLogGroup>',
    logStreamName: '<myLogStream>',
    // optional (for temporary credentials)
    sessionToken: '<mySessionToken>',
};

const logger = new CloudWatchLogger(config);

(async () => {
    // the connect() method returns the logger instance itself
    // and creates a new logStream
    await logger.connect();

    // / logResult is the response object returned by CloudWatchLogs API `putLogEvents` method, see:
    //   http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CloudWatchLogs.html#putLogEvents-property

    //   the messages are bundled into a single `putLogEvents` call with timestamps set to current UNIX time
    //  /
    const logResult = await logger.log('Message1', { objects: 'are serialised to JSON' }, 123);

    // we can access the underlying AWS SDK CloudWatchLogs object if we want to do fancy things
    const CloudWatchLogs = logger.getAWSObject();
    // … fancy things …
})();
*/








// var every = require('schedule').every;
// app.every('2s').do(function() {
//   console.log("Timer working");

// });
// var dateTime = require('node-datetime');
// var dt = dateTime.create();
// dt.format('m/d/Y H:M:S');
// console.log(new Date(dt.now()));