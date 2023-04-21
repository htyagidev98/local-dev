const nodemailer = require('nodemailer');
const ejsLint = require('ejs-lint');

const pug = require('pug');
const User = require('../models/user');
const Booking = require('../models/booking');
const Order = require('../models/order');
const BusinessOrder = require('../models/businessOrder');
const OrderLine = require('../models/orderLine');
const Lead = require('../models/lead');
const LeadStatus = require('../models/leadStatus');
const LeadRemark = require('../models/leadRemark');
const Review = require('../models/review');
const Management = require('../models/management');
const Country = require('../models/country');
const Variant = require('../models/variant');
const moment = require('moment-timezone');
const DriverVerification = require('../models/driverVerification');
const fun = require('../api/function');
const CarSell = require('../models/carSell');
const CarSellLead = require('../models/carSellLead');
//Abhinav
const Statements = require('../models/statements');
const Service = require('../models/service');
const Customization = require('../models/customization');
const Collision = require('../models/collision');
const Detailing = require('../models/detailing');
const UserPackage = require('../models/userPackage');
const businessFunctions = require('../api/erpWeb/businessFunctions');
var ejs = require("ejs");
var pdf = require("html-pdf");
var path = require("path");
//const s3 = new aws.S3();
aws = require('aws-sdk');
var mongoose = require('mongoose');
const { key } = require('../config');
const Invoice = require('../models/invoice');
const VendorOrders = require('../models/vendorOrders');
const OrderInvoice = require('../models/orderInvoice');
const Parchi = require('../models/parchi');
const TransactionLog = require('../models/transactionLog');
const Purchase = require('../models/purchase');
const whatsAppEvent = require('../api/whatsapp/whatsappEvent');
let nodemailerConfig = {
    careager_email: `${process.env.careager_email}`,
    careager_pass: `${process.env.careager_pass}`,
    autroid_email: `${process.env.autroid_email}`,
    autroid_pass: `${process.env.autroid_pass}`,
}
let textLocal = {
    email: `${process.env.textlocal_mail}`,
    hash: `${process.env.textlocal_hash}`,
}

//console.log("TextLocal = " + JSON.stringify(textLocal))

require('dotenv').config();
uuidv1 = require('uuid/v1');

module.exports = {
    registrationSms: function (user) {
        var username = encodeURIComponent(textLocal.email);
        var hash = encodeURIComponent(textLocal.hash);
        var number = encodeURIComponent("91" + user.contact_no);
        var sender = encodeURIComponent("VMCARS");
        var message = encodeURIComponent("Congratulations! Your Business is now online. Show your business to the world using your web address - http://www.careager.com/");

        var data = "username=" + username + "&hash=" + hash + "&numbers=" + number + "&sender=" + sender + "&message=" + message;
        request('http://api.textlocal.in/send/?' + data, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                // console.log(response.body)
            }
            else {
                // console.log(response.body)
            }
        })
    },

    agentSms: function (user, commission) {
        var username = encodeURIComponent(textLocal.email);
        var hash = encodeURIComponent(textLocal.hash);
        var number = encodeURIComponent("91" + user.contact_no);
        var sender = encodeURIComponent("VMCARS");

        var message = encodeURIComponent("Congrats! You are now a CarEager Agent. Earn " + commission + "% commission for 1-year on the services purchased by your Referrals. Share & make more referrals now! https://goo.gl/fU5Upb");

        var data = "username=" + username + "&hash=" + hash + "&numbers=" + number + "&sender=" + sender + "&message=" + message;
        request('http://api.textlocal.in/send/?' + data, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                // console.log(response.body)
            }
            else {
                // console.log(response.body)
            }
        })
    },
    testSms: function () {
        var username = encodeURIComponent(textLocal.email);
        var hash = encodeURIComponent(textLocal.hash);
        var number = encodeURIComponent("918650873557");
        var sender = encodeURIComponent("VMCARS");

        var message = encodeURIComponent("Congrats! You are now a CarEager Agent. Earn 10% commission for 1-year on the services purchased by your Referrals. Share & make more referrals now! https://goo.gl/fU5Upb");

        var data = "username=" + username + "&hash=" + hash + "&numbers=" + number + "&sender=" + sender + "&message=" + message;
        request('http://api.textlocal.in/send/?' + data, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                // console.log(response.body)
            }
            else {
                // console.log(response.body)
            }
        })
    },

    referralSms: function (owner, user) {
        var username = encodeURIComponent(textLocal.email);
        var hash = encodeURIComponent(textLocal.hash);
        var number = encodeURIComponent("91" + owner.contact_no);
        var sender = encodeURIComponent("VMCARS");

        var message = encodeURIComponent("Congrats! " + user.name + " is now your CarEager Referral - https://goo.gl/fU5Upb");

        var data = "username=" + username + "&hash=" + hash + "&numbers=" + number + "&sender=" + sender + "&message=" + message;
        request('http://api.textlocal.in/send/?' + data, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                // console.log(response.body)
            }
            else {
                // console.log(response.body)
            }
        })
    },


    leadSms: async function (b, u, tz) {
        var time = moment(new Date()).tz(tz).format("h:mma");
        var business = await User.findById(b).exec();
        var user = await User.findById(u).exec();

        var username = encodeURIComponent(textLocal.email);
        var hash = encodeURIComponent(textLocal.hash);
        var number = encodeURIComponent("91" + business.contact_no);
        var sender = encodeURIComponent("VMCARS");

        var message = encodeURIComponent("New lead from " + user.name + " (" + user.contact_no + ") at " + time.toUpperCase() + ". Contact now - https://goo.gl/fU5Upb");

        var data = "username=" + username + "&hash=" + hash + "&numbers=" + number + "&sender=" + sender + "&message=" + message;

        request('http://api.textlocal.in/send/?' + data, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                // console.log(message)
                // console.log(response.body)
            }
            else {
                // console.log(error)
                // console.log(response.body)
            }
        });
    },

    transactionSms: function (user, cash) {
        var username = encodeURIComponent(textLocal.email);
        var hash = encodeURIComponent(textLocal.hash);
        var number = encodeURIComponent("91" + user.contact_no);
        var sender = encodeURIComponent("VMCARS");

        var message = encodeURIComponent("Congrats! Rs " + cash + " deposited in your CarEager Account - https://goo.gl/fU5Upb");

        var data = "username=" + username + "&hash=" + hash + "&numbers=" + number + "&sender=" + sender + "&message=" + message;

        request('http://api.textlocal.in/send/?' + data, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                // console.log(response.body)
            }
            else {
                // console.log(response.body)
            }
        })
    },

    signupSMS: function (user) {
        var username = encodeURIComponent(textLocal.email);
        var hash = encodeURIComponent(textLocal.hash);
        var number = encodeURIComponent("91" + user.contact_no);
        // var sender = encodeURIComponent("VMCARS");
        var sender = encodeURIComponent("CAREGR");
        var message = encodeURIComponent("Hi " + user.name + ", welcome to CarEager! Your registered number is " + user.contact_no + ". Download the App for live updates. Android: https://goo.gl/fU5Upb iOS: https://goo.gl/n8q2er");

        var data = "username=" + username + "&hash=" + hash + "&numbers=" + number + "&sender=" + sender + "&message=" + message;

        request('http://api.textlocal.in/send/?' + data, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                // console.log(message)
            } else {
                // console.log(error)
            }
        })
    },

    //Abhi
    // otpSms: function (user) {
    //     var username = encodeURIComponent(textLocal.email);
    //     var hash = encodeURIComponent(textLocal.hash);
    //     var number = "918650873557";
    //     var sender = encodeURIComponent("autroi");
    //     // var test = true;
    //     // var apikey = encodeURIComponent("8KHFm3SrjJ4-lV0RQgLpljPqwyY6Gvfw3DA0cHv3gc");   // "&apikey=" + apikey + 
    //     //var message = encodeURIComponent("<#> Hello, Welcome to CarEager! Your verification code is "+user.otp+". Do not share with anyone - https://goo.gl/fU5Upb Message ID: oBCBAPyQ+Jj");

    //     // var message = encodeURIComponent("<#> Hello! Your OTP is " + user.otp + ". Do not share this code with anyone. oBCBAPyQ+Jj");
    //     //  is the OTP for your Autroid account. Please do not share this code with anyone.
    //     var message = encodeURIComponent(user.otp + " is the OTP for your Autroid account. Please do not share this code with anyone.");
    // console.log("--------" + message)
    //     // apikey + message + sender + numbers
    //     var data = "username=" + username + "&hash=" + hash + "&numbers=" + number + "&sender=" + sender + "&message=" + message;
    //     request('https://api.textlocal.in/send/?' + data, function (error, response, body) {
    //         if (!error && response.statusCode == 200) {
    //             // console.log(message + " " + response.body)
    //         }
    //         else {
    //             // console.log(error)
    //         }
    //     })
    // },
    //Abhi

    otpSms: function (user) {
        var username = encodeURIComponent(textLocal.email);
        var hash = encodeURIComponent(textLocal.hash);
        var number = encodeURIComponent("91" + user.contact_no);
        // var sender = encodeURIComponent("VMCARS");
        var sender = encodeURIComponent("autroi");

        //var message = encodeURIComponent("<#> Hello, Welcome to CarEager! Your verification code is "+user.otp+". Do not share with anyone - https://goo.gl/fU5Upb Message ID: oBCBAPyQ+Jj");

        // var message = encodeURIComponent("<#> Hello! Your OTP is " + user.otp + ". Do not share this code with anyone. oBCBAPyQ+Jj");
        // %%|CODE^{"inputtype" : "text", "maxlength" : "6"}%% is the OTP for your Autroid account. Please do not share this code with anyone.
        var message = encodeURIComponent(user.otp + " is the OTP for your Autroid account. Please do not share this code with anyone.");

        var data = "username=" + username + "&hash=" + hash + "&numbers=" + number + "&sender=" + sender + "&message=" + message;
        request('http://api.textlocal.in/send/?' + data, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                // console.log(message + " " + response.body)
            }
            else {
                // console.log(error)
            }
        })
    },

    otpCarEgaer: function (user) {
        var username = encodeURIComponent(textLocal.email);
        var hash = encodeURIComponent(textLocal.hash);
        var number = encodeURIComponent("91" + user.contact_no);
        // var sender = encodeURIComponent("VMCARS");
        var sender = encodeURIComponent("CAREGR");

        var message = encodeURIComponent("<#> Hello, Welcome to CarEager! Your verification code is " + user.otp + ". Do not share with anyone - https://goo.gl/fU5Upb Message ID: PpNqKia2usE");

        var data = "username=" + username + "&hash=" + hash + "&numbers=" + number + "&sender=" + sender + "&message=" + message;
        request('http://api.textlocal.in/send/?' + data, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                // console.log(message + " " + response.body)
            }
            else {
                // console.log(error)
            }
        })
    },







    /* otp: function(contact_no,otp) {
         var username = encodeURIComponent(textLocal.email);
         var hash = encodeURIComponent(textLocal.hash);
         var number = encodeURIComponent("91"+contact_no);
         var sender = encodeURIComponent("VMCARS");
         var message = encodeURIComponent("<#> Hello, Welcome to CarEager! Your verification code is "+otp+". Do not share with anyone - https://goo.gl/fU5Upb Message ID: oBCBAPyQ+Jj");
 
         var data = "username="+username+"&hash="+hash+"&numbers="+number+"&sender="+sender+"&message="+message;
         request('http://api.textlocal.in/send/?'+data, function (error, response, body) {
             if (!error && response.statusCode == 200) {
                 // console.log(message)
             }
             // console.log(response)
         })
         // console.log(message)
     },*/

    otp: function (contact_no, otp) {
        var username = encodeURIComponent(textLocal.email);
        var hash = encodeURIComponent(textLocal.hash);
        var number = encodeURIComponent("91" + contact_no);
        var sender = encodeURIComponent("autroi");
        //var message = encodeURIComponent("<#> Hello! Your verification code is "+otp+". Do not share with anyone. oBCBAPyQ+Jj");

        var message = encodeURIComponent(otp + " is the OTP for your Autroid account. Please do not share this code with anyone.");

        var data = "username=" + username + "&hash=" + hash + "&numbers=" + number + "&sender=" + sender + "&message=" + message;
        request('http://api.textlocal.in/send/?' + data, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                // console.log(message)
            }
            // console.log(response)
        })
        // console.log(message)
    },

    carSellLead: async function (user, car) {
        var startdate = new Date();
        var new_date = moment(startdate, "DD-MM-YYYY").add(1, 'hours');
        var otp = Math.floor(Math.random() * 90000) + 10000;
        var check = await CarSellLead.findOne({ user: user._id }).exec();
        if (check) {

            CarSellLead.findOneAndUpdate({ user: user }, { $set: { verified: false, car: car, otp: otp, expired_at: new Date() } }, { new: false }, async function (err, s) {
                if (err) {
                    // console.log(err)
                }
                else {
                    var username = encodeURIComponent(textLocal.email);
                    var hash = encodeURIComponent(textLocal.hash);
                    var number = encodeURIComponent("91" + user.contact_no);
                    var sender = encodeURIComponent("VMCARS");
                    var message = encodeURIComponent("<#> Hello, Welcome to CarEager! Your OTP is " + otp + ". Do not share this code with anyone. - Victorious Managers' Group (Private) Limited oBCBAPyQ+Jj");

                    var data = "username=" + username + "&hash=" + hash + "&numbers=" + number + "&sender=" + sender + "&message=" + message;
                    request('http://api.textlocal.in/send/?' + data, function (error, response, body) {
                        if (!error && response.statusCode == 200) {
                            // console.log(message)
                        }
                        // console.log(response)
                    })
                }
            });
        }
        else {
            CarSellLead.create({
                car: car,
                verified: false,
                otp: otp,
                user: user._id,
                expired_at: new Date(),
                created_at: new Date(),
                updated_at: new Date(),
            });

            var username = encodeURIComponent(textLocal.email);
            var hash = encodeURIComponent(textLocal.hash);
            var number = encodeURIComponent("91" + user.contact_no);
            var sender = encodeURIComponent("VMCARS");
            var message = encodeURIComponent("<#> Hello, Welcome to CarEager! Your OTP is " + otp + ". Do not share this code with anyone. - Victorious Managers' Group (Private) Limited oBCBAPyQ+Jj");

            var data = "username=" + username + "&hash=" + hash + "&numbers=" + number + "&sender=" + sender + "&message=" + message;
            request('http://api.textlocal.in/send/?' + data, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    // console.log(message)
                }
                // console.log(response)
            })
        }
    },


    /*shorturl:function(booking) {
        var data  = encodeURIComponent("http://suite.careager.com/user/estimate/"+booking);
        request({
            headers: {
                "content-type": "application/x-www-form-urlencoded",
                "x-rapidapi-key": "7858a06557msh1b9f015de17daeap1c9303jsn75238ce3963a",
                "x-rapidapi-host": "url-shortener-service.p.rapidapi.com",
            },
            uri: "https://url-shortener-service.p.rapidapi.com/shorten",
            body: "url="+data,
            method: 'POST'
        }, function (err, res, body) {
            var l = JSON.parse(body);
            Booking.findOneAndUpdate({_id: booking}, {$set:{user_link: l.result_url}}, {new: false}, function(err, doc){
                if(!err){
                    // console.log("User link has been created")
                    return true;
                }
            });
        });
    },*/

    jobSms: async function (data) {
        // console.log(data.tag)


        var booking = await Booking.findOne({ '_id': data.source })
            .populate({ path: 'business', populate: { path: 'user', select: "_id id name contact_no" } })
            .populate({ path: 'user', populate: { path: 'user', select: "_id id name contact_no" } })
            .populate({ path: 'surveyor', populate: { path: 'user', select: "_id id name contact_no" } })
            .populate({ path: 'car', select: '_id id title registration_no' })
            .exec();

        var model = await Variant.findOne({ variant: booking.car.title }).populate('model').exec();


        var username = encodeURIComponent(textLocal.email);
        var hash = encodeURIComponent(textLocal.hash);

        var sender = encodeURIComponent("VMCARS");

        if (data.tag == "JobInititated") {
            var number = encodeURIComponent("91" + booking.user.contact_no);
            var message = encodeURIComponent("Job initiated: Job card of your " + model.model.model + " - " + booking.car.registration_no + " is opened (ID: " + booking.booking_no + ")");
        }
        else if (data.tag == "EstimateSendUser") {
            var number = encodeURIComponent("91" + booking.user.contact_no);
            var message = encodeURIComponent("Your Approval Awaited: The estimate of the work on your " + booking.car.registration_no + " is ready. Please check & approve using the App or this link - http://13.127.255.113/e.php?q=" + booking.booking_no + "&t=u");
        }
        else if (data.tag == "ApprovalAwaited") {
            var number = encodeURIComponent("91" + booking.user.contact_no);
            var message = encodeURIComponent("Your Approval Awaited: The estimate of the work on your " + booking.car.registration_no + " is ready. Please check & approve using the App or this link - http://13.127.255.113/e.php?q=" + booking.booking_no + "&t=u");
        }
        else if (data.tag == "Approval") {
            var number = encodeURIComponent("91" + booking.user.contact_no);
            var message = encodeURIComponent("Your Approval Awaited: The estimate of the work on your " + booking.car.registration_no + " is ready. Please check & approve using the App or this link - http://13.127.255.113/e.php?q=" + booking.booking_no + "&t=u");
            // console.log("Approval")
            // console.log(message)
        }
        else if (data.tag == "In-Process") {
            var number = encodeURIComponent("91" + booking.business.contact_no);
            var message = encodeURIComponent("In-Process: Thanks for your approval. The work has been started on your " + model.model.model + " - " + booking.car.registration_no);
        }
        else if (data.tag == "StartWork") {
            var number = encodeURIComponent("91" + booking.business.contact_no);
            var message = encodeURIComponent("In-Process: Thanks for your approval. The work has been started on your " + model.model.model + " - " + booking.car.registration_no);
        }

        else if (data.tag == "Ready") {
            var number = encodeURIComponent("91" + booking.user.contact_no);
            var message = encodeURIComponent("Car Ready: QC completed, your " + model.model.model + " - " + booking.car.registration_no + " is ready for delivery.");
        }

        else if (data.tag == "Invoice") {
            var number = encodeURIComponent("91" + booking.user.contact_no);
            var message = encodeURIComponent("Invoice Generated: The Invoice amounting to ₹" + booking.due.due + " has been generated");
        }

        var data = "username=" + username + "&hash=" + hash + "&numbers=" + number + "&sender=" + sender + "&message=" + message;

        request('http://api.textlocal.in/send/?' + data, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                // console.log(message)
                // console.log(response.body)
            }
        })
    },

    bookingMail: async function (b, business) {
        // console.log("in the method")
        // let transporter = nodemailer.createTransport({
        //     host: 'smtp.gmail.com',
        //     port: 465,
        //     secure: true,
        //     auth: {
        //         user: nodemailerConfig.careager_email,
        //         pass: 'success@2020'
        //     }
        // });

        var businessId = await User.findOne({ _id: mongoose.Types.ObjectId(business) }).exec();
        // console.log("------" + businessId);
        var careager = nodemailerConfig.careager_email;
        var autroid = nodemailerConfig.autroid_email;
        var careagerPass = nodemailerConfig.careager_pass;
        var autroidPass = 'launch@2021';


        var booking = await Booking.findOne({ _id: b })
            .populate({ path: 'user', populate: { path: 'user', select: "_id id name contact_no email" } })
            .populate({ path: 'business', populate: { path: 'user', select: "_id id name contact_no email" } })
            .populate({ path: 'advisor', populate: { path: 'user', select: "_id id name contact_no email" } })
            .populate({ path: 'car', select: '_id id title registration_no fuel_type' })
            .exec();

        var services = [];
        var description = "";
        booking.services.forEach(function (service) {
            services.push(service.service)
            if (service.service == "Periodic Maintenance") {
                description = service.description;
            }
        });

        var note = "";
        if (booking.status == "Pending") {
            note = "(<i>Confirmation Awaited</i>)";
        }
        if (business == "5bfec47ef651033d1c99fbca") {



            let transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: {
                    user: nodemailerConfig.careager_email,
                    pass: nodemailerConfig.careagerPass,
                },




            });



            if (booking.is_services == true) {
                let mailToBusiness = {
                    from: nodemailerConfig.careager_email,
                    to: booking.business.email,
                    subject: '[New Service] ' + booking.user.name + ' - ID # ' + booking.booking_no, // Subject line
                    html: '<h3 style="margin-top:5px; margin-bottom: 2px">' + booking.car.title + '(' + booking.car.fuel_type + ')</h3><h4 style="margin:2px 0;">' + moment(booking.date).format('ll') + ' (' + booking.time_slot + ')</h4><h4>Status: ' + booking.status + '</h4><h4>' + services + '</h4><table><tr><th style="text-align: left">Contact:</th><td>' + booking.user.contact_no + '</td></tr><tr><th style="text-align: left">Registration #</th><td>' + booking.car.registration_no + '</td><tr><th style="text-align: left">Booking No </th><td>' + booking.booking_no + '</td></tr><tr><th style="text-align: left">Service Value</th><td>' + booking.payment.total + '</td></tr><tr><th style="text-align: left">Amount Paid</th><td>' + booking.payment.paid_total + '</td></tr><tr><th style="text-align: left">Discount</th><td>' + booking.payment.discount_type + '</td></tr><tr><th style="text-align: left">Coupon Discount</th><td>' + booking.payment.discount_total + '</td></tr></table>'
                };

                transporter.sendMail(mailToBusiness, (error, info) => {
                    if (error) {
                    }
                    // console.log('Message sent: %s', info.messageId);
                });

                if (booking.advisor) {
                    let mailToAdvisor = {
                        from: nodemailerConfig.careager_email,
                        to: booking.advisor.email,
                        subject: '[Assigned Booking] ' + booking.user.name + ' - ID # ' + booking.booking_no, // Subject line
                        html: '<h3 style="margin-top:5px; margin-bottom: 2px">' + booking.user.name + '</h3><h4 style="margin:2px 0;">' + booking.user.email + '</h4><h4>' + booking.user.contact_no + '</h4>'
                    };

                    transporter.sendMail(mailToAdvisor, (error, info) => {
                        if (error) {
                            // console.log(error);
                        }
                    });
                }


                let mailToUser = {
                    from: nodemailerConfig.careager_email,
                    to: booking.user.email,
                    subject: '[New Service] Booking No-# ' + booking.booking_no, // Subject line
                    html: "<h2 style='margin:5px 0;text-tranformation: none;'>" + booking.business.name + "</h2><h3 style='margin:2px 0;'>" + moment(booking.date).format("ll") + " (" + booking.time_slot + ")</h3><h3 style='margin:2px 0'>Status: " + booking.status + " " + note + "</h3><h4>" + services + "</h4><p style='margin:3px 0'>18/1, NH8, Sector 35, Gurugram, Haryana 122004</p> <p style='margin:3px 0'>Behind Grace Toyota (Near Mercedes-Benz), 1800 843 4300</p> <p style='margin:3px 0'><a href='https://goo.gl/maps/m5SuCHXndx62'>https://goo.gl/maps/m5SuCHXndx62</a></p><table><tr><td><h4 style='margin-top:5px; margin-bottom: 2px'>" + booking.car.title + "(" + booking.car.fuel_type + ")</h4></td></tr><tr><th style='text-align: left'>Registration #</th><td>" + booking.car.registration_no + "</td></tr><tr><th style='text-align: left'>Booking No </th><td>" + booking.booking_no + "</td></tr><tr><th style='text-align: left'>Service Value</th><td>" + booking.payment.total + "</td></tr><tr><th style='text-align: left'>Amount Paid</th><td>" + booking.payment.paid_total + "</td></tr><tr><th style='text-align: left'>Discount</th><td>" + booking.payment.discount_type + "</td></tr><tr><th style='text-align: left'>Coupon Discount</th><td>" + booking.payment.discount_total + "</td></tr></table><table><tr><td><strong>Note: </strong>Copies of RC & Insurance are mandatory for opening the Job Cards, We won't be able to undertake any work in the absence of these documents. These documents can also be uploaded through the 'Garage' section in the CarEager Xpress App.</td></tr><tr><td><strong>Lunch Timings:</strong><br>1:00 PM -1:30 PM</td></tr></table> <p style='margin:15px 0'><p style='margin:3px 0'>- Android: <a href='https://goo.gl/fU5Upb'>https://goo.gl/fU5Upb</a></p> <p style='margin:3px 0'>- iOS App: Available on the App Store</p>"
                };


                transporter.sendMail(mailToUser, (error, info) => {
                    if (error) {
                        // console.log(error);
                    }
                    // console.log('Message sent: %s', info.messageId);
                });
            }
            else {
                let mailToBusiness = {
                    from: nodemailerConfig.careager_email,
                    to: booking.business.email,
                    subject: '[New Package] ' + booking.user.name + ' - ID # ' + booking.booking_no,
                    html: '<h3 style="margin-top:5px; margin-bottom: 2px">' + booking.car.title + '(' + booking.car.fuel_type + ')</h3><h4 style="margin:2px 0;">' + moment(booking.date).format('ll') + ' </h4> <h4>' + services + '</h4><h4> Description : ' + description + '</h4><table><tr><th style="text-align: left">Contact:</th><td>' + booking.user.contact_no + '</td></tr><tr><th style="text-align: left">Registration #</th><td>' + booking.car.registration_no + '</td><tr><th style="text-align: left">Booking No </th><td>' + booking.booking_no + '</td></tr><tr><th style="text-align: left">Package Value</th><td>' + booking.payment.total + '</td></tr><tr><th style="text-align: left">Amount Paid</th><td>' + booking.payment.paid_total + '</td></tr><tr><th style="text-align: left">Discount</th><td>' + booking.payment.discount_type + '</td></tr><tr><th style="text-align: left">Coupon Discount</th><td>' + booking.payment.discount_total + '</td></tr></table>'
                };

                transporter.sendMail(mailToBusiness, (error, info) => {
                    if (error) {
                        // console.log(error);
                    }
                    // console.log('Message sent: %s', info.messageId);
                });


                let mailToUser = {
                    from: nodemailerConfig.careager_email,
                    to: booking.user.email,
                    subject: '[New Package] Purchase ID #' + booking.booking_no, // Subject line // Subject line
                    html: '<h2 style="margin:5px 0;">' + booking.business.name + '</h2><p style="margin:3px 0">Location: 18/1, NH8, Sector 35, Gurugram, Haryana 122004</p> <p style="margin:3px 0">Behind Grace Toyota (Near Mercedes-Benz), 1800 843 4300</p> <p style="margin:3px 0"><a href="https://goo.gl/maps/m5SuCHXndx62">https://goo.gl/maps/m5SuCHXndx62</a></p><p style="margin:15px 0"> <p style="margin:3px 0">How to use this package?</p> <p style="margin:2px 0">Please choose a suitable date/time & book service using CarEager Xpress App<p style="margin:3px 0">- Android: <a href="https://goo.gl/fU5Upb">https://goo.gl/fU5Upb</a></p> <p style="margin:3px 0">- iOS App: Available on the App Store</p> </p><table><tr><td><h4 style="margin-top:5px; margin-bottom: 2px">' + booking.car.title + '(' + booking.car.fuel_type + ')</h4></td></tr><tr><th style="text-align: left">Registration #</th><td>' + booking.car.registration_no + '</td></tr><tr><th style="text-align: left">Booking No </th><td>' + booking.booking_no + '</td></tr><tr><th style="text-align: left">Package Value</th><td>' + booking.payment.total + '</td></tr><tr><th style="text-align: left">Amount Paid</th><td>' + booking.payment.paid_total + '</td></tr><tr><th style="text-align: left">Discount</th><td>' + booking.payment.discount_type + '</td></tr><tr><th style="text-align: left">Coupon Discount</th><td>' + booking.payment.discount_total + '</td></tr></table>'


                };


                transporter.sendMail(mailToUser, (error, info) => {
                    if (error) {
                        // console.log(error);
                    }
                    // console.log('Message sent: %s', info.messageId);
                });
            }
        }

        else {
            // nodemailerConfig.careager_email: `${process.env.careager_email}`,
            // nodemailerConfig.careager_pass: `${process.env.careager_pass}`,
            // nodemailerConfig.autroid_email: `${process.env.autroid_email}`,
            // nodemailerConfig.autroid_pass: `${process.env.autroid_pass}`,
            let transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: {
                    user: nodemailerConfig.autroid_email,
                    pass: nodemailerConfig.autroid_pass,
                },



            });




            if (booking.is_services == true) {
                let mailToBusiness = {
                    from: nodemailerConfig.autroid_email,
                    to: booking.business.email,
                    subject: '[New Service] ' + booking.user.name + ' - ID # ' + booking.booking_no, // Subject line
                    html: '<h3 style="margin-top:5px; margin-bottom: 2px">' + booking.car.title + '(' + booking.car.fuel_type + ')</h3><h4 style="margin:2px 0;">' + moment(booking.date).format('ll') + ' (' + booking.time_slot + ')</h4><h4>Status: ' + booking.status + '</h4><h4>' + services + '</h4><table><tr><th style="text-align: left">Contact:</th><td>' + booking.user.contact_no + '</td></tr><tr><th style="text-align: left">Registration #</th><td>' + booking.car.registration_no + '</td><tr><th style="text-align: left">Booking No </th><td>' + booking.booking_no + '</td></tr><tr><th style="text-align: left">Service Value</th><td>' + booking.payment.total + '</td></tr><tr><th style="text-align: left">Amount Paid</th><td>' + booking.payment.paid_total + '</td></tr><tr><th style="text-align: left">Discount</th><td>' + booking.payment.discount_type + '</td></tr><tr><th style="text-align: left">Coupon Discount</th><td>' + booking.payment.discount_total + '</td></tr></table>'
                };

                transporter.sendMail(mailToBusiness, (error, info) => {
                    if (error) {
                    }
                    // console.log('Message sent: %s', info.messageId);
                });

                if (booking.advisor) {
                    let mailToAdvisor = {
                        from: nodemailerConfig.autroid_email,
                        to: booking.advisor.email,
                        subject: '[Assigned Booking] ' + booking.user.name + ' - ID # ' + booking.booking_no, // Subject line
                        html: '<h3 style="margin-top:5px; margin-bottom: 2px">' + booking.user.name + '</h3><h4 style="margin:2px 0;">' + booking.user.email + '</h4><h4>' + booking.user.contact_no + '</h4>'
                    };

                    transporter.sendMail(mailToAdvisor, (error, info) => {
                        if (error) {
                            // console.log(error);
                        }
                    });
                }


                let mailToUser = {
                    from: nodemailerConfig.autroid_email,
                    to: booking.user.email,
                    subject: '[New Service] Booking No-# ' + booking.booking_no, // Subject line
                    html: "<h2 style='margin:5px 0;text-tranformation: none;'>" + booking.business.name + "</h2><h3 style='margin:2px 0;'>" + moment(booking.date).format("ll") + " (" + booking.time_slot + ")</h3><h3 style='margin:2px 0'>Status: " + booking.status + " " + note + "</h3><h4>" + services + "</h4><h4 style='margin:3px 0'>" + booking.business.address.location + '</h4><table><tr><td><h4 style="margin-top:5px; margin-bottom: 2px">' + booking.car.title + '(' + booking.car.fuel_type + ')</h4></td></tr><tr><th style="text-align: left">Registration #</th><td>' + booking.car.registration_no + '</td></tr><tr><th style="text-align: left">Booking No </th><td>' + booking.booking_no + '</td></tr><tr><th style="text-align: left">Package Value</th><td>' + booking.payment.total + '</td></tr><tr><th style="text-align: left">Amount Paid</th><td>' + booking.payment.paid_total + '</td></tr><tr><th style="text-align: left">Discount</th><td>' + booking.payment.discount_type + '</td></tr><tr><th style="text-align: left">Coupon Discount</th><td>' + booking.payment.discount_total + '</td></tr></table>'
                };


                transporter.sendMail(mailToUser, (error, info) => {
                    if (error) {
                        // console.log(error);
                    }
                    // console.log('Message sent: %s', info.messageId);
                });
            }
            else {
                let mailToBusiness = {
                    from: nodemailerConfig.autroid_email,
                    to: booking.business.email,
                    subject: '[New Package] ' + booking.user.name + ' - ID # ' + booking.booking_no,
                    html: '<h3 style="margin-top:5px; margin-bottom: 2px">' + booking.car.title + '(' + booking.car.fuel_type + ')</h3><h4 style="margin:2px 0;">' + moment(booking.date).format('ll') + ' </h4> <h4>' + services + '</h4><h4> Description : ' + description + '</h4><table><tr><th style="text-align: left">Contact:</th><td>' + booking.user.contact_no + '</td></tr><tr><th style="text-align: left">Registration #</th><td>' + booking.car.registration_no + '</td><tr><th style="text-align: left">Booking No </th><td>' + booking.booking_no + '</td></tr><tr><th style="text-align: left">Package Value</th><td>' + booking.payment.total + '</td></tr><tr><th style="text-align: left">Amount Paid</th><td>' + booking.payment.paid_total + '</td></tr><tr><th style="text-align: left">Discount</th><td>' + booking.payment.discount_type + '</td></tr><tr><th style="text-align: left">Coupon Discount</th><td>' + booking.payment.discount_total + '</td></tr></table>'
                };

                transporter.sendMail(mailToBusiness, (error, info) => {
                    if (error) {
                        // console.log(error);
                    }
                    // console.log('Message sent: %s', info.messageId);
                });


                let mailToUser = {
                    from: nodemailerConfig.autroid_email,
                    to: booking.user.email,
                    subject: '[New Package] Purchase ID #' + booking.booking_no, // Subject line // Subject line
                    html: '<h2 style="margin:5px 0;">' + booking.business.name + '</h2><p style="margin:3px 0"> ' + booking.business.address + ' </p  <table><tr><td><h4 style="margin-top:5px; margin-bottom: 2px">' + booking.car.title + '(' + booking.car.fuel_type + ')</h4></td></tr><tr><th style="text-align: left">Registration #</th><td>' + booking.car.registration_no + '</td></tr><tr><th style="text-align: left">Booking No </th><td>' + booking.booking_no + '</td></tr><tr><th style="text-align: left">Package Value</th><td>' + booking.payment.total + '</td></tr><tr><th style="text-align: left">Amount Paid</th><td>' + booking.payment.paid_total + '</td></tr><tr><th style="text-align: left">Discount</th><td>' + booking.payment.discount_type + '</td></tr><tr><th style="text-align: left">Coupon Discount</th><td>' + booking.payment.discount_total + '</td></tr></table>'


                };


                transporter.sendMail(mailToUser, (error, info) => {
                    if (error) {
                        // console.log(error);
                    }
                    // console.log('Message sent: %s', info.messageId);
                });
            }




        }

    },




    assignedBookingMail: async function (b) {
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: nodemailerConfig.careager_email,
                pass: nodemailerConfig.careager_pass
            }
        });

        var booking = await Booking.findOne({ _id: b })
            .populate({ path: 'user', populate: { path: 'user', select: "_id id name contact_no email" } })
            .populate({ path: 'business', populate: { path: 'user', select: "_id id name contact_no email" } })
            .populate({ path: 'advisor', populate: { path: 'user', select: "_id id name contact_no email" } })
            .populate({ path: 'car', select: '_id id title registration_no fuel_type' })
            .exec();

        let mailToBusiness = {
            from: 'CarEager Xpress <' + nodemailerConfig.careager_email + '>',
            to: booking.business.email,
            subject: '[Lead Assigned] ' + booking.user.name + ' - ID # ' + booking.booking_no, // Subject line
            html: '<h4 style="margin-top:5px; margin-bottom: 2px">Customer Name: ' + booking.user.name + '</h4><h4 style="margin:2px 0;">Customer Email: ' + booking.user.email + '</h4><h4>Customer No.:' + booking.user.contact_no + '</h4>'
        };

        transporter.sendMail(mailToBusiness, (error, info) => {
            if (error) {
                // console.log(error);
            }
        });



        if (booking.advisor) {
            let mailToAdvisor = {
                from: 'CarEager Xpress <' + nodemailerConfig.careager_email + '>',
                to: booking.advisor.email,
                subject: '[Lead Assigned] ' + booking.user.name + ' - ID # ' + booking.booking_no, // Subject line
                html: '<h4 style="margin-top:5px; margin-bottom: 2px">Name: ' + booking.user.name + '</h4><h4 style="margin:2px 0;">Email: ' + booking.user.email + '</h4><h4>Contact No.:' + booking.user.contact_no + '</h4>'
            };

            transporter.sendMail(mailToAdvisor, (error, info) => {
                if (error) {
                    // console.log(error);
                }
                // console.log('Message sent: %s', info);
            });
        }
    },



    intimateMail: async function (b, email, tz) {
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: nodemailerConfig.careager_email,
                pass: nodemailerConfig.careager_pass
            }
        });

        var booking = await Booking.findOne({ _id: b })
            .populate({ path: 'business', populate: { path: 'user', select: "_id id name contact_no email address" } })
            .populate({ path: 'user', populate: { path: 'user', select: "_id id name contact_no email" } })
            .populate({ path: 'advisor', populate: { path: 'user', select: "_id id name contact_no email" } })
            .populate({ path: 'surveyor', populate: { path: 'user', select: "_id id name contact_no email" } })
            .populate({ path: 'car', select: '_id id title registration_no fuel_type' })
            .exec();

        var b = {
            car: booking.car.title,
            registration_no: booking.car.registration_no,
            _id: booking._id,
            policy_holder: _.startCase(booking.insurance_info.policy_holder),
            insurance_company: booking.insurance_info.insurance_company,
            branch: booking.insurance_info.branch,
            gstin: booking.insurance_info.gstin,
            policy_no: booking.insurance_info.policy_no,
            premium: booking.insurance_info.premium,
            expire: booking.insurance_info.expire,
            claim: booking.insurance_info.claim,
            cashless: booking.insurance_info.cashless,
            accident_place: booking.insurance_info.accident_place,
            accident_date: moment(booking.insurance_info.accident_date).tz(tz).format('L'),
            accident_time: booking.insurance_info.accident_time,
            accident_cause: booking.insurance_info.accident_cause,
            driver_accident: _.startCase(booking.insurance_info.driver_accident),
            spot_survey: _.startCase(booking.insurance_info.spot_survey),
            fir: _.startCase(booking.insurance_info.fir),
            policy_type: booking.insurance_info.policy_type,
            loss: booking.insurance_payment.total,
            claim_no: booking.insurance_info.claim_no,
            advisor: _.startCase(booking.advisor.name),
            advisor_contact: _.startCase(booking.advisor.contact_no),
            workshop: booking.business.name,
            workshop_address: booking.business.address.location,
            workshop_state: booking.business.address.state,
            date: moment().tz(tz).format('L'),
            time: moment().tz(tz).format('LT')
        };


        let mail = {
            from: booking.business.name + '<' + booking.business.email + '>',
            to: email,
            subject: "Claim Intimation - " + b.car + "(" + b.registration_no + ")", // Subject line
            html: pug.renderFile(path.join(__dirname, '../templates/intimate.pug'), { b: b })
        };

        transporter.sendMail(mail, (error, info) => {
            if (error) {
                // console.log(error);
            }
            // console.log('Message sent: %s', info);
        });
    },

    surveyorEstimateMail: async function (b, tz) {
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: nodemailerConfig.careager_email,
                pass: nodemailerConfig.careager_pass
            }
        });

        var booking = await Booking.findOne({ _id: b })
            .populate({ path: 'business', populate: { path: 'user', select: "_id id name contact_no email address" } })
            .populate({ path: 'user', populate: { path: 'user', select: "_id id name contact_no email" } })
            .populate({ path: 'advisor', populate: { path: 'user', select: "_id id name contact_no email" } })
            .populate({ path: 'surveyor', populate: { path: 'user', select: "_id id name contact_no email" } })
            .populate({ path: 'car', select: '_id id title registration_no fuel_type' })
            .exec();

        var b = {
            car: booking.car.title,
            registration_no: booking.car.registration_no,
            _id: booking._id,
            policy_holder: _.startCase(booking.insurance_info.policy_holder),
            insurance_company: booking.insurance_info.insurance_company,
            branch: booking.insurance_info.branch,
            gstin: booking.insurance_info.gstin,
            policy_no: booking.insurance_info.policy_no,
            premium: booking.insurance_info.premium,
            expire: booking.insurance_info.expire,
            claim: booking.insurance_info.claim,
            cashless: booking.insurance_info.cashless,
            accident_place: booking.insurance_info.accident_place,
            accident_date: moment(booking.insurance_info.accident_date).tz(tz).format('L'),
            accident_time: booking.insurance_info.accident_time,
            accident_cause: booking.insurance_info.accident_cause,
            driver_accident: _.startCase(booking.insurance_info.driver_accident),
            spot_survey: _.startCase(booking.insurance_info.spot_survey),
            fir: _.startCase(booking.insurance_info.fir),
            policy_type: booking.insurance_info.policy_type,
            claim_no: booking.insurance_info.claim_no,
            loss: booking.insurance_payment.total,
            advisor: _.startCase(booking.advisor.name),
            advisor_contact: _.startCase(booking.advisor.contact_no),
            workshop: booking.business.name,
            workshop_address: booking.business.address.location,
            workshop_state: booking.business.address.state,
            date: moment().tz(tz).format('L'),
            time: moment().tz(tz).format('LT')
        };


        let mail = {
            from: booking.business.name + '<' + booking.business.email + '>',
            to: booking.surveyor.email,
            subject: "Claim Intimation - " + b.car + "(" + b.registration_no + ")", // Subject line
            html: pug.renderFile(path.join(__dirname, '../templates/surveyor-estimation.pug'), { b: b })
        };

        transporter.sendMail(mail, (error, info) => {
            if (error) {
                // console.log(error);
            }
            // console.log('Message sent: %s', info.messageId);
        });
    },


    estimateMail: async function (b, tz) {
        // console.log(b)

        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: nodemailerConfig.careager_email,
                pass: nodemailerConfig.careager_pass
            }
        });

        var booking = await Booking.findOne({ _id: b })
            .populate({ path: 'user', populate: { path: 'user', select: "_id id name contact_no email" } })
            .populate({ path: 'advisor', populate: { path: 'user', select: "_id id name contact_no email" } })
            .populate({ path: 'business', populate: { path: 'user', select: "_id id name contact_no email address" } })
            .populate({ path: 'car', select: '_id id title registration_no fuel_type' })
            .exec();

        // console.log(booking.user.email)

        if (booking.user.email) {
            var b = {
                car: booking.car.title,
                registration_no: booking.car.registration_no,
                _id: booking._id,
                total: booking.due.due,
                advisor: _.startCase(booking.advisor.name),
                advisor_contact: _.startCase(booking.advisor.contact_no),
                workshop: booking.business.name,
                workshop_address: booking.business.address.location,
                workshop_state: booking.business.address.state,
                workshop_contact_no: booking.business.contact_no,
                date: moment().tz(tz).format('L'),
                time: moment().tz(tz).format('LT'),
            };


            let mail = {
                from: 'CarEager Xpress <' + nodemailerConfig.careager_email + '>',
                to: booking.user.email,
                subject: '[Estimate] BOOKING- ID # ' + booking.booking_no, // Subject line
                html: pug.renderFile(path.join(__dirname, '../templates/user-estimation.pug'), { b: b })
            };

            transporter.sendMail(mail, (error, info) => {
                if (error) {
                    //   // console.log(error);
                }
                // console.log('Message sent: %s', info.messageId);
            });
        }
    },


    bookingStatusMail: async function (u, b, business) {
        // let transporter = nodemailer.createTransport({
        //     host: 'smtp.gmail.com',
        //     port: 465,
        //     secure: true,
        //     auth: {
        //         user: nodemailerConfig.autroid_email,
        //         pass: 'launch@2021'
        //     }
        // });


        var booking = await Booking.findOne({ _id: b })
            .populate({ path: 'user', populate: { path: 'user', select: "_id id name contact_no email" } })
            .populate({ path: 'business', populate: { path: 'user', select: "_id id name contact_no email" } })
            .populate({ path: 'advisor', populate: { path: 'user', select: "_id id name contact_no email" } })
            .populate({ path: 'car', select: '_id id title registration_no fuel_type' })
            .exec();

        var services = [];
        booking.services.forEach(function (service) {
            services.push(service.service)
        });


        var businessId = await User.findOne({ _id: mongoose.Types.ObjectId(business) }).exec();
        // console.log("------" + businessId);
        var careager = nodemailerConfig.careager_email;
        var autroid = nodemailerConfig.autroid_email;
        var careagerPass = nodemailerConfig.careager_pass;
        var autroidPass = 'launch@2021';




        if (business == "5bfec47ef651033d1c99fbca") {
            let transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: {
                    user: nodemailerConfig.careager_email,
                    pass: nodemailerConfig.careager_pass,
                },
            });
            if (booking.status == "Cancelled" || booking.status == "Confirmed") {

                let mailToUser = {
                    from: nodemailerConfig.careager_email,
                    to: booking.user.email,
                    subject: '[' + booking.status.toUpperCase() + '] Booking No-' + booking.booking_no, // Subject line
                    html: '<h3 style="margin-top:5px; margin-bottom: 2px">' + booking.car.title + '(' + booking.car.fuel_type + ')</h3><h4 style="margin:2px 0;">' + moment(booking.date).format('ll') + ' (' + booking.time_slot + ')</h4> <h4>' + services + '</h4><table><tr><th style="text-align: left">Contact:</th><td>' + booking.user.contact_no + '</td></tr><tr><th style="text-align: left">Registration #</th><td>' + booking.car.registration_no + '</td><tr><th style="text-align: left">Booking No </th><td>' + booking.booking_no + '</td></tr><tr><th style="text-align: left">Service Value</th><td>' + booking.payment.total + '</td></tr><tr><th style="text-align: left">Amount Paid</th><td>' + booking.payment.paid_total + '</td></tr><tr><th style="text-align: left">Discount</th><td>' + booking.payment.discount_type + '</td></tr><tr><th style="text-align: left">Coupon Discount</th><td>' + booking.payment.discount_total + '</td></tr></table>'
                };

                transporter.sendMail(mailToUser, (error, info) => {
                    if (error) {
                        // console.log(error);
                    }
                    // console.log('Message sent: %s', info.messageId);
                });

                let mailToBusiness = {
                    from: nodemailerConfig.careager_email,
                    to: booking.business.email,
                    subject: '[' + booking.status.toUpperCase() + '] Booking No-' + booking.booking_no, // Subject line
                    html: '<h3 style="margin-top:5px; margin-bottom: 2px">' + booking.car.title + '(' + booking.car.fuel_type + ')</h3><h4 style="margin:2px 0;">' + moment(booking.date).format('ll') + ' (' + booking.time_slot + ')</h4> <h4>' + services + '</h4><table><tr><th style="text-align: left">Contact:</th><td>' + booking.user.contact_no + '</td></tr><tr><th style="text-align: left">Registration #</th><td>' + booking.car.registration_no + '</td><tr><th style="text-align: left">Booking No </th><td>' + booking.booking_no + '</td></tr><tr><th style="text-align: left">Service Value</th><td>' + booking.payment.total + '</td></tr><tr><th style="text-align: left">Amount Paid</th><td>' + booking.payment.paid_total + '</td></tr><tr><th style="text-align: left">Discount</th><td>' + booking.payment.discount_type + '</td></tr><tr><th style="text-align: left">Coupon Discount</th><td>' + booking.payment.discount_total + '</td></tr></table>'
                };

                transporter.sendMail(mailToBusiness, (error, info) => {
                    if (error) {
                        // console.log(error);
                    }
                    // console.log('Message sent: %s', info.messageId);
                });

                if (booking.advisor) {
                    let mailToBusiness = {
                        from: nodemailerConfig.careager_email,
                        to: booking.advisor.email,
                        subject: '[' + booking.status.toUpperCase() + '] Booking No-' + booking.booking_no, // Subject line
                        html: '<h3 style="margin-top:5px; margin-bottom: 2px">' + booking.car.title + '(' + booking.car.fuel_type + ')</h3><h4 style="margin:2px 0;">' + moment(booking.date).format('ll') + ' (' + booking.time_slot + ')</h4> <h4>' + services + '</h4><table><tr><th style="text-align: left">Contact:</th><td>' + booking.user.contact_no + '</td></tr><tr><th style="text-align: left">Registration #</th><td>' + booking.car.registration_no + '</td><tr><th style="text-align: left">Booking No </th><td>' + booking.booking_no + '</td></tr><tr><th style="text-align: left">Service Value</th><td>' + booking.payment.total + '</td></tr><tr><th style="text-align: left">Amount Paid</th><td>' + booking.payment.paid_total + '</td></tr><tr><th style="text-align: left">Discount</th><td>' + booking.payment.discount_type + '</td></tr><tr><th style="text-align: left">Coupon Discount</th><td>' + booking.payment.discount_total + '</td></tr></table>'
                    };

                    transporter.sendMail(mailToBusiness, (error, info) => {
                        if (error) {
                            // console.log(error);
                        }
                        // console.log('Message sent: %s', info.messageId);
                    });
                }
            }
            else if (booking.status == "Confirmed" || booking.status == "Completed" || booking.status == "Rejected") {
                let mailToUser = {
                    from: nodemailerConfig.careager_email,
                    to: booking.user.email,
                    subject: '[' + booking.status.toUpperCase() + '] Booking No-' + booking.booking_no, // Subject line
                    html: '<h2 style="margin:5px 0;">' + booking.business.name.toUpperCase() + '</h2><h3 style="margin:2px 0;">' + moment(booking.date).format('ll') + ' (' + booking.time_slot + ')</h3> <h4>' + services + '</h4><table><tr><td><h4 style="margin-top:5px; margin-bottom: 2px">' + booking.car.title + '(' + booking.car.fuel_type + ')</h4></td></tr><tr><th style="text-align: left">Registration #</th><td>' + booking.car.registration_no + '</td></tr><tr><th style="text-align: left">Booking No </th><td>' + booking.booking_no + '</td></tr><tr><th style="text-align: left">Service Value</th><td>' + booking.payment.total + '</td></tr><tr><th style="text-align: left">Amount Paid</th><td>' + booking.payment.paid_total + '</td></tr><tr><th style="text-align: left">Discount</th><td>' + booking.payment.discount_type + '</td></tr><tr><th style="text-align: left">Coupon Discount</th><td>' + booking.payment.discount_total + '</td></tr></table> <p style="margin:15px 0"><p style="margin:3px 0">- Android: <a href="https://goo.gl/fU5Upb">https://goo.gl/fU5Upb</a></p> <p style="margin:3px 0">- iOS App: Available on the App Store</p></p>'
                };


                transporter.sendMail(mailToUser, (error, info) => {
                    if (error) {
                        // console.log(error);
                    }
                    // console.log('Message sent: %s', info.messageId);
                });
            }
        }
        else {
            let transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: {
                    user: nodemailerConfig.autroid_email,
                    pass: nodemailerConfig.autroid_pass,
                },



            });



            if (booking.status == "Cancelled" || booking.status == "Confirmed") {

                let mailToUser = {
                    from: nodemailerConfig.autroid_email,
                    to: booking.user.email,
                    subject: '[' + booking.status.toUpperCase() + '] Booking No-' + booking.booking_no, // Subject line
                    html: '<h3 style="margin-top:5px; margin-bottom: 2px">' + booking.car.title + '(' + booking.car.fuel_type + ')</h3><h4 style="margin:2px 0;">' + moment(booking.date).format('ll') + ' (' + booking.time_slot + ')</h4> <h4>' + services + '</h4><table><tr><th style="text-align: left">Contact:</th><td>' + booking.user.contact_no + '</td></tr><tr><th style="text-align: left">Registration #</th><td>' + booking.car.registration_no + '</td><tr><th style="text-align: left">Booking No </th><td>' + booking.booking_no + '</td></tr><tr><th style="text-align: left">Service Value</th><td>' + booking.payment.total + '</td></tr><tr><th style="text-align: left">Amount Paid</th><td>' + booking.payment.paid_total + '</td></tr><tr><th style="text-align: left">Discount</th><td>' + booking.payment.discount_type + '</td></tr><tr><th style="text-align: left">Coupon Discount</th><td>' + booking.payment.discount_total + '</td></tr></table>'
                };

                transporter.sendMail(mailToUser, (error, info) => {
                    if (error) {
                        // console.log(error);
                    }
                    // console.log('Message sent: %s', info.messageId);
                });







                let mailToBusiness = {
                    from: nodemailerConfig.autroid_email,
                    to: booking.business.email,
                    subject: '[' + booking.status.toUpperCase() + '] Booking No-' + booking.booking_no, // Subject line
                    html: '<h3 style="margin-top:5px; margin-bottom: 2px">' + booking.car.title + '(' + booking.car.fuel_type + ')</h3><h4 style="margin:2px 0;">' + moment(booking.date).format('ll') + ' (' + booking.time_slot + ')</h4> <h4>' + services + '</h4><table><tr><th style="text-align: left">Contact:</th><td>' + booking.user.contact_no + '</td></tr><tr><th style="text-align: left">Registration #</th><td>' + booking.car.registration_no + '</td><tr><th style="text-align: left">Booking No </th><td>' + booking.booking_no + '</td></tr><tr><th style="text-align: left">Service Value</th><td>' + booking.payment.total + '</td></tr><tr><th style="text-align: left">Amount Paid</th><td>' + booking.payment.paid_total + '</td></tr><tr><th style="text-align: left">Discount</th><td>' + booking.payment.discount_type + '</td></tr><tr><th style="text-align: left">Coupon Discount</th><td>' + booking.payment.discount_total + '</td></tr></table>'
                };

                transporter.sendMail(mailToBusiness, (error, info) => {
                    if (error) {
                        // console.log(error);
                    }
                    // console.log('Message sent: %s', info.messageId);
                });

                if (booking.advisor) {
                    let mailToBusiness = {
                        from: nodemailerConfig.autroid_email,
                        to: booking.advisor.email,
                        subject: '[' + booking.status.toUpperCase() + '] Booking No-' + booking.booking_no, // Subject line
                        html: '<h3 style="margin-top:5px; margin-bottom: 2px">' + booking.car.title + '(' + booking.car.fuel_type + ')</h3><h4 style="margin:2px 0;">' + moment(booking.date).format('ll') + ' (' + booking.time_slot + ')</h4> <h4>' + services + '</h4><table><tr><th style="text-align: left">Contact:</th><td>' + booking.user.contact_no + '</td></tr><tr><th style="text-align: left">Registration #</th><td>' + booking.car.registration_no + '</td><tr><th style="text-align: left">Booking No </th><td>' + booking.booking_no + '</td></tr><tr><th style="text-align: left">Service Value</th><td>' + booking.payment.total + '</td></tr><tr><th style="text-align: left">Amount Paid</th><td>' + booking.payment.paid_total + '</td></tr><tr><th style="text-align: left">Discount</th><td>' + booking.payment.discount_type + '</td></tr><tr><th style="text-align: left">Coupon Discount</th><td>' + booking.payment.discount_total + '</td></tr></table>'
                    };

                    transporter.sendMail(mailToBusiness, (error, info) => {
                        if (error) {
                            // console.log(error);
                        }
                        // console.log('Message sent: %s', info.messageId);
                    });
                }
            }
            else if (booking.status == "Confirmed" || booking.status == "Completed" || booking.status == "Rejected") {
                let mailToUser = {
                    from: nodemailerConfig.autroid_email,
                    to: booking.user.email,
                    subject: '[' + booking.status.toUpperCase() + '] Booking No-' + booking.booking_no, // Subject line
                    html: '<h2 style="margin:5px 0;">' + booking.business.name.toUpperCase() + '</h2><h3 style="margin:2px 0;">' + moment(booking.date).format('ll') + ' (' + booking.time_slot + ')</h3> <h4>' + services + '</h4><table><tr><td><h4 style="margin-top:5px; margin-bottom: 2px">' + booking.car.title + '(' + booking.car.fuel_type + ')</h4></td></tr><tr><th style="text-align: left">Registration #</th><td>' + booking.car.registration_no + '</td></tr><tr><th style="text-align: left">Booking No </th><td>' + booking.booking_no + '</td></tr><tr><th style="text-align: left">Service Value</th><td>' + booking.payment.total + '</td></tr><tr><th style="text-align: left">Amount Paid</th><td>' + booking.payment.paid_total + '</td></tr><tr><th style="text-align: left">Discount</th><td>' + booking.payment.discount_type + '</td></tr><tr><th style="text-align: left">Coupon Discount</th><td>' + booking.payment.discount_total + '</td></tr></table> <p style="margin:15px 0"></p>'
                };


                transporter.sendMail(mailToUser, (error, info) => {
                    if (error) {
                        // console.log(error);
                    }
                    // console.log('Message sent: %s', info.messageId);
                });
            }


        }
    },

    rescheduleMail: async function (b, t, business) {
        // let transporter = nodemailer.createTransport({
        //     host: 'smtp.gmail.com',
        //     port: 465,
        //     secure: true,
        //     auth: {
        //         user: nodemailerConfig.autroid_email,
        //         pass: 'launch@2021'
        //     }
        // });


        var booking = await Booking.findOne({ _id: b })
            .populate({ path: 'user', populate: { path: 'user', select: "_id id name contact_no email" } })
            .populate({ path: 'business', populate: { path: 'user', select: "_id id name contact_no email" } })
            .populate({ path: 'advisor', populate: { path: 'user', select: "_id id name contact_no email" } })
            .populate({ path: 'car', select: '_id id title registration_no fuel_type' })
            .exec();

        var services = [];
        booking.services.forEach(function (service) {
            services.push(service.service)
        });


        var businessId = await User.findOne({ _id: mongoose.Types.ObjectId(business) }).exec();
        // console.log("------" + businessId);
        var careager = nodemailerConfig.careager_email;
        var autroid = nodemailerConfig.autroid_email;
        var careagerPass = nodemailerConfig.careager_pass;
        var autroidPass = 'launch@2021';
        if (business == "5bfec47ef651033d1c99fbca") {

            let transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: {
                    user: nodemailerConfig.careager_email,
                    pass: nodemailerConfig.careager_pass,


                },



            });


            if (t == "user") {
                let mailToBusiness = {
                    from: nodemailerConfig.careager_email,
                    to: booking.business.email,
                    subject: '[RESCHEDULE] Booking No- #' + booking.booking_no, // Subject line
                    html: '<h3 style="margin-top:5px; margin-bottom: 2px">' + booking.car.title + '(' + booking.car.fuel_type + ')</h3><h4 style="margin:2px 0;">' + moment(booking.date).format('ll') + ' (' + booking.time_slot + ')</h4> <h4>' + services + '</h4><table><tr><th style="text-align: left">Contact:</th><td>' + booking.user.contact_no + '</td></tr><tr><th style="text-align: left">Registration #</th><td>' + booking.car.registration_no + '</td><tr><th style="text-align: left">Booking No </th><td>' + booking.booking_no + '</td></tr><tr><th style="text-align: left">Service Value</th><td>' + booking.payment.total + '</td></tr><tr><th style="text-align: left">Amount Paid</th><td>' + booking.payment.paid_total + '</td></tr><tr><th style="text-align: left">Discount</th><td>' + booking.payment.discount_type + '</td></tr><tr><th style="text-align: left">Coupon Discount</th><td>' + booking.payment.discount_total + '</td></tr></table>'
                };

                transporter.sendMail(mailToBusiness, (error, info) => {
                    if (error) {
                        // console.log(error);
                    }
                });

                if (booking.advisor) {
                    let mailToBusiness = {
                        from: nodemailerConfig.careager_email,
                        to: booking.advisor.email,
                        subject: '[RESCHEDULE] Booking No- #' + booking.booking_no, // Subject line
                        html: '<h3 style="margin-top:5px; margin-bottom: 2px">' + booking.car.title + '(' + booking.car.fuel_type + ')</h3><h4 style="margin:2px 0;">' + moment(booking.date).format('ll') + ' (' + booking.time_slot + ')</h4> <h4>' + services + '</h4><table><tr><th style="text-align: left">Contact:</th><td>' + booking.user.contact_no + '</td></tr><tr><th style="text-align: left">Registration #</th><td>' + booking.car.registration_no + '</td><tr><th style="text-align: left">Booking No </th><td>' + booking.booking_no + '</td></tr><tr><th style="text-align: left">Service Value</th><td>' + booking.payment.total + '</td></tr><tr><th style="text-align: left">Amount Paid</th><td>' + booking.payment.paid_total + '</td></tr><tr><th style="text-align: left">Discount</th><td>' + booking.payment.discount_type + '</td></tr><tr><th style="text-align: left">Coupon Discount</th><td>' + booking.payment.discount_total + '</td></tr></table>'
                    };

                    transporter.sendMail(mailToBusiness, (error, info) => {
                        if (error) {
                            // console.log(error);
                        }
                    });
                }
            }
            else {
                let mailToUser = {
                    from: nodemailerConfig.careager_email,
                    to: booking.user.email,
                    subject: '[RESCHEDULE] Booking No- #' + booking.booking_no, // Subject line
                    html: '<h2 style="margin:5px 0;">' + booking.business.name.toUpperCase() + '</h2><h3 style="margin:2px 0;">' + moment(booking.date).format('ll') + ' (' + booking.time_slot + ')</h3> <h4>' + services + '</h4><table><tr><td><h4 style="margin-top:5px; margin-bottom: 2px">' + booking.car.title + '(' + booking.car.fuel_type + ')</h4></td></tr><tr><th style="text-align: left">Registration #</th><td>' + booking.car.registration_no + '</td></tr><tr><th style="text-align: left">Booking No </th><td>' + booking.booking_no + '</td></tr><tr><th style="text-align: left">Service Value</th><td>' + booking.payment.total + '</td></tr><tr><th style="text-align: left">Amount Paid</th><td>' + booking.payment.paid_total + '</td></tr><tr><th style="text-align: left">Discount</th><td>' + booking.payment.discount_type + '</td></tr><tr><th style="text-align: left">Coupon Discount</th><td>' + booking.payment.discount_total + '</td></tr></table> <p style="margin:15px 0"><p style="margin:3px 0">- Android: <a href="https://goo.gl/fU5Upb">https://goo.gl/fU5Upb</a></p> <p style="margin:3px 0">- iOS App: Available on the App Store</p></p>'
                };


                transporter.sendMail(mailToUser, (error, info) => {
                    if (error) {
                        // console.log(error);
                    }
                    // console.log('Message sent: %s', info.messageId);
                });
            }

        }

        else {

            let transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: {
                    user: nodemailerConfig.autroid_email,
                    pass: nodemailerConfig.autroid_pass,

                },



            });



            if (t == "user") {
                let mailToBusiness = {
                    from: nodemailerConfig.autroid_email,
                    to: booking.business.email,
                    subject: '[RESCHEDULE] Booking No- #' + booking.booking_no, // Subject line
                    html: '<h3 style="margin-top:5px; margin-bottom: 2px">' + booking.car.title + '(' + booking.car.fuel_type + ')</h3><h4 style="margin:2px 0;">' + moment(booking.date).format('ll') + ' (' + booking.time_slot + ')</h4> <h4>' + services + '</h4><table><tr><th style="text-align: left">Contact:</th><td>' + booking.user.contact_no + '</td></tr><tr><th style="text-align: left">Registration #</th><td>' + booking.car.registration_no + '</td><tr><th style="text-align: left">Booking No </th><td>' + booking.booking_no + '</td></tr><tr><th style="text-align: left">Service Value</th><td>' + booking.payment.total + '</td></tr><tr><th style="text-align: left">Amount Paid</th><td>' + booking.payment.paid_total + '</td></tr><tr><th style="text-align: left">Discount</th><td>' + booking.payment.discount_type + '</td></tr><tr><th style="text-align: left">Coupon Discount</th><td>' + booking.payment.discount_total + '</td></tr></table>'
                };

                transporter.sendMail(mailToBusiness, (error, info) => {
                    if (error) {
                        // console.log(error);
                    }
                });

                if (booking.advisor) {
                    let mailToBusiness = {
                        from: nodemailerConfig.autroid_email,
                        to: booking.advisor.email,
                        subject: '[RESCHEDULE] Booking No- #' + booking.booking_no, // Subject line
                        html: '<h3 style="margin-top:5px; margin-bottom: 2px">' + booking.car.title + '(' + booking.car.fuel_type + ')</h3><h4 style="margin:2px 0;">' + moment(booking.date).format('ll') + ' (' + booking.time_slot + ')</h4> <h4>' + services + '</h4><table><tr><th style="text-align: left">Contact:</th><td>' + booking.user.contact_no + '</td></tr><tr><th style="text-align: left">Registration #</th><td>' + booking.car.registration_no + '</td><tr><th style="text-align: left">Booking No </th><td>' + booking.booking_no + '</td></tr><tr><th style="text-align: left">Service Value</th><td>' + booking.payment.total + '</td></tr><tr><th style="text-align: left">Amount Paid</th><td>' + booking.payment.paid_total + '</td></tr><tr><th style="text-align: left">Discount</th><td>' + booking.payment.discount_type + '</td></tr><tr><th style="text-align: left">Coupon Discount</th><td>' + booking.payment.discount_total + '</td></tr></table>'
                    };

                    transporter.sendMail(mailToBusiness, (error, info) => {
                        if (error) {
                            // console.log(error);
                        }
                    });
                }
            }

            else {
                let mailToUser = {
                    from: nodemailerConfig.autroid_email,
                    to: booking.user.email,
                    subject: '[RESCHEDULE] Booking No- #' + booking.booking_no, // Subject line
                    html: '<h2 style="margin:5px 0;">' + booking.business.name.toUpperCase() + '</h2><h3 style="margin:2px 0;">' + moment(booking.date).format('ll') + ' (' + booking.time_slot + ')</h3> <h4>' + services + '</h4><table><tr><td><h4 style="margin-top:5px; margin-bottom: 2px">' + booking.car.title + '(' + booking.car.fuel_type + ')</h4></td></tr><tr><th style="text-align: left">Registration #</th><td>' + booking.car.registration_no + '</td></tr><tr><th style="text-align: left">Booking No </th><td>' + booking.booking_no + '</td></tr><tr><th style="text-align: left">Service Value</th><td>' + booking.payment.total + '</td></tr><tr><th style="text-align: left">Amount Paid</th><td>' + booking.payment.paid_total + '</td></tr><tr><th style="text-align: left">Discount</th><td>' + booking.payment.discount_type + '</td></tr><tr><th style="text-align: left">Coupon Discount</th><td>' + booking.payment.discount_total + '</td></tr></table> <p style="margin:15px 0"></p>'
                };


                transporter.sendMail(mailToUser, (error, info) => {
                    if (error) {
                        // console.log(error);
                    }
                    // console.log('Message sent: %s', info.messageId);
                });
            }



        }



    },
    assistance: async function (d, tz) {
        // console.log("Geomertry", d.geometry)
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: nodemailerConfig.careager_email,
                pass: nodemailerConfig.careager_pass
            }
        });

        var assignee = await User.findOne({ _id: d.assignee }).select('name email contact_no').exec();

        if (d.type == "Insurance Renewal") {
            let mail = {
                from: 'CarEager Xpress <' + nodemailerConfig.careager_email + '>',
                //Author Abhinav
                to: "care@careager.com",
                // to: "abhinav@autroid.com",
                //subject: '[URGENT] ' + d.type + ' - ' + moment(d.updated_at).tz(tz).format('lll'),
                subject: '[New Lead] ' + d.source + ' - ' + d.name + ' - ' + d.contact_no,
                html: '<table><tr><th style="text-align: left">Customer Name </td><td>' + d.name + '</th></tr><tr><th style="text-align: left">Customer Contact No. </th><td>' + d.contact_no + '</td></tr><tr><th>Request Time </th><td>' + moment(d.updated_at).tz(tz).format('lll') + '</td></tr></table>'
            };

            transporter.sendMail(mail, (error, info) => {
                if (error) {
                    // console.log(error);
                    // console.log(info)
                }
            });
        }
        else {
            let mail = {
                from: 'CarEager Xpress <' + nodemailerConfig.careager_email + '>',
                to: "care@careager.com",
                // to: "abhinav@autroid.com",
                //subject: '[URGENT] ' + d.type + ' - ' + d.updated_at,
                subject: '[New Lead] ' + d.source + ' - ' + d.name + ' - ' + d.contact_no,
                html: '<table><tr><th style="text-align: left">Customer Name </td><td>' + d.name + '</th></tr><tr><th style="text-align: left">Customer Contact No. </th><td>' + d.contact_no + '</td></tr><tr><th>Request Time </th><td>' + moment(d.updated_at).tz('Asia/Kolkata').format('lll') + '</td></tr><tr><td><a target="_blank" href="http://maps.google.com/maps?z=12&t=m&q=loc:' + d.geometry[1] + '+' + d.geometry[0] + '">Click For Location</a></td></tr></table>'
            };

            transporter.sendMail(mail, (error, info) => {
                if (error) {
                    // console.log(error);
                    // console.log(info)
                }
            });
        }


    },
    //Author Abhinav Tyagi
    leadgen: async function (TotalLeads, names, email, d, tz) {
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: nodemailerConfig.careager_email,
                pass: nodemailerConfig.careager_pass
                // user: 'vinya.rana@autroid.com',
                // pass: '7895933824aA@'
            }
        });
        var rowhtml = "";
        // console.log("Total Leads ", names.length)

        for (i = 0; i < TotalLeads; i++) {
            var rowhtml = rowhtml + '<tr><th style="text-align: left;">' + names[i].name + '</th><td >' + names[i].mobile + '</td></tr>'
            // console.log(" Loop ", i)
        }

        let mail = {
            from: 'Autroid WMS <' + nodemailerConfig.careager_email + '>',
            // from: 'Autroid WMS <vinya.rana@autroid.com>', 
            to: "care@careager.com",
            // to: email,
            // to: "abhinav@autroid.com",
            subject: '[URGENT] XLSXfileUpload - ' + new Date(),
            html: '<table><tr><th style="text-align: left;color:red";> Name <hr></th><th style="text-align: left;color:red"> Mobile No. <hr></th></tr>' + rowhtml + '<tr><th style="text-align: left;color:green">Total Leads </td><td>' + TotalLeads + '</th></tr><tr><th style="text-align: left;color:green">Lead Status </th><td> Success </td></tr><tr><th style="text-align: left;color:green";> Request Time </th><td>' + moment(new Date()).tz('Asia/Kolkata').format('lll') + '</td></tr><tr></table>'
        };
        transporter.sendMail(mail, (error, info) => {
            if (error) {
                // console.log(error);
                // console.log(info)
            }
        });



    },

    callbackRequest: async function (d, tz) {
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: nodemailerConfig.careager_email,
                pass: nodemailerConfig.careager_pass
            }
        });

        var user = await User.findOne({ _id: d.user }).select('name email contact_no').exec();

        let mail = {
            from: 'CarEager Xpress <' + nodemailerConfig.careager_email + '>',
            to: nodemailerConfig.careager_email,
            subject: '[URGENT] Callback Request - ' + moment(d.created_at).tz(tz).format('lll'),
            html: '<table><tr><th style="text-align: left">Customer Name </td><td>' + user.name + '</th></tr><tr><th style="text-align: left">Customer Contact No. </th><td>' + user.contact_no + '</td></tr><tr><th>Request Time </th><td>' + moment(d.created_at).tz(tz).format('lll') + '</td></tr></table>'
        };

        // console.log(d)

        transporter.sendMail(mail, (error, info) => {
            if (error) {
                // console.log(error);
            }
            // console.log('Message sent: %s', info.messageId);
        });
    },

    zohoEnding: async function (l) {
        var booking = await Booking.findOne({ _id: l })
            .populate({ path: 'user', populate: { path: 'user', select: "_id id name contact_no email" } })
            .populate({ path: 'business', populate: { path: 'user', select: "_id id name contact_no email" } })
            .populate({ path: 'car', select: '_id id title registration_no fuel_type' })
            .exec();

        var status = await LeadStatus.findOne({ status: booking.status }).exec();

        if (booking.lead) {
            var follow_up = {};
            if (booking.status == "Completed") {
                var date = booking.updated_at;
                date.setDate(date.getDate() + 4)

                var newdate = moment(date).format("YYYY-MM-DD");

                follow_up = {
                    date: new Date(newdate.toString()),
                    created_at: new Date(),
                    updated_at: new Date(),
                };
            }

            var data = {
                updated_at: new Date(),
                remark: {
                    status: "Completed",
                    assignee_remark: "",
                    customer_remark: "",
                    color_code: "#ffffff",
                    created_at: new Date(),
                    updated_at: new Date()
                },
                follow_up: follow_up
            };

            Lead.findOneAndUpdate({ _id: booking.lead }, { $set: data }, { new: false }, async function (err, doc) {
                data.remark.lead = booking.lead;
                data.created_at = new Date();
                LeadRemark.create(data.remark).then(function (newRemark) {
                    Lead.findOneAndUpdate({ _id: booking.lead }, { $push: { remarks: newRemark._id } }, { new: true }, async function (err, doc) {
                    })
                });
            });
        }
        else {
            var manager = booking.business;
            var managers = [];
            await Management.find({ business: booking.business, role: "CRE" })
                .cursor().eachAsync(async (a) => {
                    // var d = await Lead.find({ business: booking.business, manager: a.user, 'remark.status': { $in: ['Open', 'Follow-Up'] } }).count().exec();
                    var open = await Lead.find({ business: booking.business, assignee: a.user, 'remark.status': { $in: ['Open',] } }).count().exec();
                    var follow_up = await Lead.find({ business: booking.business, assignee: a.user, 'remark.status': { $in: ['Follow-Up'] }, 'follow_up.date': { $lte: new Date() } }).count().exec();
                    var d = open + follow_up;
                    managers.push({
                        user: a.user,
                        count: d
                    })
                });

            if (managers.length != 0) {
                managers.sort(function (a, b) {
                    return a.count > b.count;
                });

                manager = managers[0].user;
            }


            var name = booking.user.name;

            var lead = {};
            var follow_up = {};
            if (booking.status == "Completed") {
                var date = booking.updated_at;
                date.setDate(date.getDate() + 4)

                var newdate = moment(date).format("YYYY-MM-DD");

                follow_up = {
                    lead: l._id,
                    date: new Date(newdate.toString()),
                    created_at: new Date(),
                    updated_at: new Date(),
                };
            }
            lead.user = booking.user._id;
            lead.business = booking.business._id;
            lead.name = booking.user.name
            lead.contact_no = booking.user.contact_no;
            lead.email = booking.user.email;
            lead.assignee = manager;
            lead.remark = {
                status: booking.status,
                assignee_remark: "",
                customer_remark: "",
                color_code: "#ffffff",
                created_at: new Date(),
                updated_at: new Date()
            },
                lead.follow_up = follow_up;
            lead.type = "Booking";
            lead.created_at = new Date();
            lead.updated_at = new Date();

            Lead.create(lead).then(async function (l) {
                LeadRemark.create({
                    lead: l._id,
                    status: booking.status,
                    assignee_remark: "",
                    customer_remark: "",
                    color_code: "#ffffff",
                    created_at: new Date(),
                    updated_at: new Date()
                }).then(function (newRemark) {
                    Lead.findOneAndUpdate({ _id: l._id }, { $push: { remarks: newRemark._id } }, { new: true }, async function (err, doc) {
                    })
                });

                Booking.findOneAndUpdate({ _id: booking._id }, { $set: { lead: l._id, manager: manager._id } }, { new: false }, async function (err, doc) { });
            });
        }
    },

    zohoLead: async function (l) {
        var booking = await Booking.findOne({ _id: l })
            .populate({ path: 'user', populate: { path: 'user', select: "_id id name contact_no email" } })
            .populate({ path: 'business', populate: { path: 'user', select: "_id id name contact_no email" } })
            .populate({ path: 'car', select: '_id id title registration_no fuel_type' })
            .exec();

        var remarks = [];
        var logs = booking.logs;

        if (logs.length > 0) {
            var logged = logs[logs.length - 1].user;
        }
        else {
            var logged = booking.advisor;
        }

        var services = booking.services;

        services.forEach(async function (s) {
            remarks.push(s.service)
        });

        if (booking.lead) {
            var follow_up = {};
            if (booking.status == "Completed") {
                var date = booking.updated_at;
                date.setDate(date.getDate() + 4)
                var newdate = moment(date).format("YYYY-MM-DD");
                var status = "PSF";
                var psf = true;
                follow_up = {
                    date: new Date(newdate.toString()),
                    created_at: new Date(),
                    updated_at: new Date(),
                };
            }
            else if (booking.status == "Cancelled") {
                var psf = false;
                var status = "Lost"
            }
            else {
                var psf = false;
                var status = booking.status;
            }

            var lead = await Lead.findById(booking.lead).exec();

            var data = {
                psf: psf,
                follow_up: follow_up,
                remark: {
                    lead: lead._id,
                    type: lead.remark.type,
                    source: lead.remark.source,
                    status: status,
                    assignee: logged,
                    assignee_remark: remarks.toString(),
                    customer_remark: remarks.toString(),
                    color_code: "#ffffff",
                    created_at: new Date(),
                    updated_at: new Date()
                },
                updated_at: new Date(),
            };

            Lead.findOneAndUpdate({ _id: booking.lead }, { $set: data }, { new: false }, async function (err, doc) {
                LeadRemark.create(data.remark).then(function (newRemark) {
                    Lead.findOneAndUpdate({ _id: booking.lead }, { $push: { remarks: newRemark._id } }, { new: true }, async function (err, doc) {
                    })
                });
            });
        }
        else {
            var checkLead = await Lead.findOne({ contact_no: booking.user.contact_no, "remark.status": { $in: ["Open", "Follow-Up"] } }).sort({ updated_at: -1 }).exec();
            if (checkLead) {
                var follow_up = {};
                if (booking.status == "Completed") {
                    var date = booking.updated_at;
                    date.setDate(date.getDate() + 4)
                    var newdate = moment(date).format("YYYY-MM-DD");
                    var status = "PSF";
                    var psf = true;
                    follow_up = {
                        date: new Date(newdate.toString()),
                        created_at: new Date(),
                        updated_at: new Date(),
                    };
                }

                else if (booking.status == "Cancelled") {
                    var psf = false;
                    var status = "Closed"
                }

                else {
                    var psf = false;
                    var status = booking.status;
                }

                var data = {
                    user: booking.user._id,
                    name: booking.user.name,
                    contact_no: booking.user.contact_no,
                    email: booking.user.email,
                    psf: psf,
                    converted: true,
                    follow_up: follow_up,
                    remark: {
                        lead: checkLead._id,
                        type: checkLead.remark.type,
                        source: checkLead.remark.source,
                        status: status,
                        assignee: logged,
                        assignee_remark: "",
                        customer_remark: "",
                        color_code: "#ffffff",
                        created_at: new Date(),
                        updated_at: new Date()
                    },
                    updated_at: new Date(),
                };

                /*if(booking.job_no=="")
                {
                    var notify = {
                        receiver: [checkLead.assignee],
                        activity: "booking",
                        tag: "FollowUpBooking",
                        source: booking._id,
                        sender: booking.advisor,
                        points: 0
                    }
                }

                if(booking.job_no!="")
                {
                     var notify = {
                        receiver: [checkLead.assignee],
                        activity: "booking",
                        tag: "FollowUpJob",
                        source: booking._id,
                        sender: booking.advisor,
                        points: 0
                    }
                }*/



                Lead.findOneAndUpdate({ _id: checkLead._id }, { $set: data }, { new: false }, async function (err, doc) {
                    LeadRemark.create(data.remark).then(function (newRemark) {
                        Lead.findOneAndUpdate({ _id: checkLead._id }, { $push: { remarks: newRemark._id } }, { new: true }, async function (err, doc) {
                        })
                    });
                });

                Booking.findOneAndUpdate({ _id: booking._id }, { $set: { lead: checkLead._id, manager: checkLead.assignee, converted: true } }, { new: false }, async function (err, doc) {
                    if (err) {
                        // console.log(err)
                    }
                    else {
                        //fun.newNotification(notify);
                    }
                });
            }
            else {
                var follow_up = {};
                if (booking.status == "Completed") {
                    var date = booking.updated_at;
                    date.setDate(date.getDate() + 4)
                    var newdate = moment(date).format("YYYY-MM-DD");
                    var status = "PSF";
                    var psf = true;
                    follow_up = {
                        date: new Date(newdate.toString()),
                        created_at: new Date(),
                        updated_at: new Date(),
                    };
                }
                else if (booking.status == "Cancelled") {
                    var psf = false;
                    var status = "Closed"
                }
                else {
                    var psf = false;
                    var status = booking.status;
                }

                var manager = booking.business;
                var managers = [];
                await Management.find({ business: booking.business, role: "CRE" })
                    .cursor().eachAsync(async (a) => {

                        // var d = await Lead.find({ business: booking.business, manager: a.user, 'remark.status': { $in: ['Open', 'Follow-Up'] } }).count().exec();
                        var open = await Lead.find({ business: booking.business, assignee: a.user, 'remark.status': { $in: ['Open',] } }).count().exec();
                        var follow_up = await Lead.find({ business: booking.business, assignee: a.user, 'remark.status': { $in: ['Follow-Up'] }, 'follow_up.date': { $lte: new Date() } }).count().exec();
                        var d = open + follow_up;
                        managers.push({
                            user: a.user,
                            count: d
                        })
                    });

                if (managers.length != 0) {
                    managers.sort(function (a, b) {
                        return a.count > b.count;
                    });
                    manager = managers[0].user;
                }

                var name = booking.user.name;

                var lead = {}
                var source = "Booking";



                lead.user = booking.user._id;
                lead.business = booking.business._id;
                lead.name = booking.user.name
                lead.contact_no = booking.user.contact_no;
                lead.email = booking.user.email;
                lead.assignee = manager;
                lead.remark = {
                    status: status,
                    assignee_remark: remarks.toString(),
                    customer_remark: remarks.toString(),
                    color_code: "#ffffff",
                    created_at: new Date(),
                    updated_at: new Date()
                },
                    lead.follow_up = follow_up;
                lead.psf = psf;
                lead.source = "Booking";
                lead.category = "Booking";
                lead.created_at = new Date();
                lead.updated_at = new Date();

                Lead.create(lead).then(async function (ld) {
                    LeadRemark.create({
                        type: ld.type,
                        source: "Booking",
                        lead: ld._id,
                        assignee: logged,
                        status: booking.status,
                        assignee_remark: "",
                        customer_remark: "",
                        color_code: "#ffffff",
                        created_at: new Date(),
                        updated_at: new Date()
                    }).then(function (newRemark) {
                        Lead.findOneAndUpdate({ _id: ld._id }, { $push: { remarks: newRemark._id } }, { new: true }, async function (err, doc) {
                        })
                    });

                    Booking.findOneAndUpdate({ _id: booking._id }, { $set: { lead: ld._id, manager: manager } }, { new: false }, async function (err, doc) {
                        if (err) {
                            // console.log(err)
                        }
                    });
                });
            }
        }
    },

    zohoCustomStatus: async function (l, status) {
        var booking = await Booking.findOne({ _id: l })
            .populate({ path: 'user', populate: { path: 'user', select: "_id id name contact_no email" } })
            .populate({ path: 'business', populate: { path: 'user', select: "_id id name contact_no email" } })
            .populate({ path: 'car', select: '_id id title registration_no fuel_type' })
            .exec();

        var logs = booking.logs;

        var review = await Review.findOne({ booking: l }).exec();
        var customer_remark = review.review;

        if (booking.lead) {
            var psf = true;
            if (status == "Rework") {
                var status = "Rework";
                var data = {
                    psf: psf,
                    updated_at: new Date(),
                    remark: {
                        lead: booking.lead,
                        assignee: booking.manager,
                        status: status,
                        reason: status,
                        assignee_remark: customer_remark,
                        customer_remark: customer_remark,
                        color_code: status.color_code,
                        created_at: new Date(),
                        updated_at: new Date()
                    },
                    follow_up: {}
                };

                Lead.findOneAndUpdate({ _id: booking.lead }, { $set: data }, { new: false }, async function (err, doc) {
                    Booking.findOneAndUpdate({ _id: booking._id }, { $set: { status: "Closed", updated_at: new Date() } }, { new: false }, async function (err, doc) { })
                    LeadRemark.create(data.remark).then(function (newRemark) {
                        Lead.findOneAndUpdate({ _id: booking.lead }, { $push: { remarks: newRemark._id } }, { new: true }, async function (err, doc) {
                        })
                    });

                    var customer_requirements = [];

                    customer_requirements.push({
                        requirement: customer_remark,
                    });

                    var payment = {
                        payment_mode: "Undefined",
                        payment_status: "Pending",
                        discount_type: "",
                        coupon: "",
                        coupon_type: "",
                        discount: 0,
                        discount_total: 0,
                        part_cost: 0,
                        labour_cost: 0,
                        of_cost: 0,
                        paid_total: 0,
                        total: 0,
                        discount_applied: false,
                        transaction_id: "",
                        transaction_date: "",
                        transaction_status: "",
                        transaction_response: ""
                    }

                    var bookingData = {
                        booking: booking._id,
                        package: booking.package,
                        car: booking.car._id,
                        advisor: booking.advisor,
                        manager: booking.manager,
                        business: booking.business._id,
                        user: booking.user._id,
                        services: [],
                        customer_requirements: customer_requirements,
                        re_booking_no: booking.booking_no,
                        booking_no: Math.round(+new Date() / 1000),
                        date: null,
                        time_slot: "",
                        is_rework: true,
                        convenience: "",
                        status: "Rework",
                        payment: payment,
                        insurance_info: booking.insurance_info,
                        address: booking.address,
                        lead: booking.lead,
                        is_services: true,
                        converted: booking.converted,
                        created_at: new Date(),
                        updated_at: new Date()
                    };

                    Booking.create(bookingData).then(async function (b) {
                        var notify = {
                            receiver: [booking.advisor],
                            activity: "booking",
                            tag: "Rework",
                            source: b._id,
                            sender: b.manager,
                            points: 0
                        };
                        fun.newNotification(notify);
                    });
                });
            }
            else {
                var data = {
                    psf: psf,
                    updated_at: new Date(),
                    remark: {
                        lead: booking.lead,
                        assignee: booking.manager,
                        status: "Closed",
                        reason: status,
                        assignee_remark: customer_remark,
                        customer_remark: customer_remark,
                        color_code: status.color_code,
                        created_at: new Date(),
                        updated_at: new Date()
                    },
                    follow_up: {}
                };

                Lead.findOneAndUpdate({ _id: booking.lead }, { $set: data }, { new: false }, async function (err, doc) {
                    Booking.findOneAndUpdate({ _id: booking._id }, { $set: { status: "Closed", updated_at: new Date() } }, { new: false }, async function (err, doc) {
                        if (!err) {
                            // console.log(doc)
                        }
                    })
                    LeadRemark.create(data.remark).then(function (newRemark) {
                        Lead.findOneAndUpdate({ _id: booking.lead }, { $push: { remarks: newRemark._id } }, { new: true }, async function (err, doc) {
                        })
                    });;
                });
            }
        }
    },

    orderMail: async function (b, t) {
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: nodemailerConfig.careager_email,
                pass: nodemailerConfig.careager_pass
            }
        });

        var order = [];
        var items = [];

        var o = await Order.findOne({ _id: b })
            .populate({ path: 'user', select: 'id name contact_no email' })
            .populate({ path: 'address' })
            .exec();

        if (o) {
            await BusinessOrder.find({ order: o._id })
                .populate({ path: 'business', select: 'id name contact_no email' })
                .cursor()
                .eachAsync(async function (p) {
                    var orderLine = await OrderLine.find({ order: o._id, business: p.business }).select('cost total title description quantity thumbnail services').exec();

                    items.push({
                        business: p.business,
                        date: moment(p.date).tz(t).format('ll'),
                        time_slot: p.time_slot,
                        convenience: p.convenience,
                        items: orderLine
                    })
                });

            if (o.address) {
                var address = o.address.address + " " + o.address.area + " " + o.address.landmark + " " + o.address.zip + " " + o.address.city + " " + o.address.state;
            }
            else {
                var address = ""
            }

            order.push({
                _id: o._id,
                items: items,
                user: o.user,
                address: address,
                order_no: o.order_no,
                payment: o.payment,
                due: o.due,
                created_at: o.created_at,
                updated_at: o.updated_at,
            })



            let mailToUser = {
                from: 'CarEager Xpress <' + nodemailerConfig.careager_email + '>',
                to: o.user.email,
                subject: '[New Order] CarEager Xpress #' + o.order_no,
                html: pug.renderFile(path.join(__dirname, '../templates/user-order.pug'), { order: order })
            };

            transporter.sendMail(mailToUser, (error, info) => {
                if (error) {
                }

                res.status(200).json({
                    responseCode: 200,
                    responseMessage: 'Mail sent',
                });
            });

            let mailToBusiness = {
                from: 'CarEager Xpress <' + nodemailerConfig.careager_email + '>',
                to: "order@careager.com",
                subject: '[New Order] ' + o.user.name + ' #' + o.order_no,
                html: pug.renderFile(path.join(__dirname, '../templates/business-order.pug'), { order: order })
            };

            transporter.sendMail(mailToBusiness, (error, info) => {
                if (error) {
                }

                res.status(200).json({
                    responseCode: 200,
                    responseMessage: 'Mail sent',
                });
            });
        }
    },

    orderStatusMail: async function (b, t) {
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: nodemailerConfig.careager_email,
                pass: nodemailerConfig.careager_pass
            }
        });


        var order = [];
        var items = [];

        var status = "";

        var o = await Order.findOne({ _id: b })
            .populate({ path: 'user', select: 'id name contact_no email' })
            .populate({ path: 'address' })
            .exec();

        if (o) {
            await BusinessOrder.find({ order: o._id })
                .populate({ path: 'business', select: 'id name contact_no email' })
                .cursor()
                .eachAsync(async function (p) {
                    var orderLine = await OrderLine.find({ order: o._id, business: p.business }).select('cost total title description quantity thumbnail services').exec();
                    status = p.status;
                    items.push({
                        business: p.business,
                        date: moment(p.date).tz(t).format('ll'),
                        time_slot: p.time_slot,
                        convenience: p.convenience,
                        items: orderLine,
                        status: p.status
                    })
                });

            if (o.address) {
                var address = o.address.address + " " + o.address.area + " " + o.address.landmark + " " + o.address.zip + " " + o.address.city + " " + o.address.state;
            }
            else {
                var address = ""
            }

            order.push({
                _id: o._id,
                items: items,
                user: o.user,
                address: address,
                order_no: o.order_no,
                payment: o.payment,
                due: o.due,
                created_at: o.created_at,
                updated_at: o.updated_at,
            })



            let mailToUser = {
                from: 'CarEager Xpress <' + nodemailerConfig.careager_email + '>',
                to: o.user.email,
                subject: '[Order ' + status + '] CarEager Xpress #' + o.order_no,
                html: pug.renderFile(path.join(__dirname, '../templates/order-status-business.pug'), { order: order })
            };

            transporter.sendMail(mailToUser, (error, info) => {
                if (error) {
                }

                res.status(200).json({
                    responseCode: 200,
                    responseMessage: 'Mail sent',
                });
            });

            let mailToBusiness = {
                from: 'CarEager Xpress <' + nodemailerConfig.careager_email + '>',
                to: "care@careager.com",
                subject: '[Order ' + status + '] CarEager Xpress #' + o.order_no,
                html: pug.renderFile(path.join(__dirname, '../templates/order-status-business.pug'), { order: order })
            };

            transporter.sendMail(mailToBusiness, (error, info) => {
                if (error) {
                }

                res.status(200).json({
                    responseCode: 200,
                    responseMessage: 'Mail sent',
                });
            });
        }
    },


    sellerApproval: async function (b, tz) {
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: nodemailerConfig.careager_email,
                pass: nodemailerConfig.careager_pass
            }
        });

        var sell = await CarSell.findOne({ _id: b })
            .populate({ path: 'seller', populate: { path: 'user', select: "_id id name contact_no email" } })
            .populate({ path: 'car', select: '_id id title registration_no fuel_type location' })
            .exec();

        var data = {
            car: sell.car.title,
            location: sell.car.location,
            registration_no: sell.car.registration_no,
            name: _.startCase(sell.seller.name),
            email: _.startCase(sell.seller.email),
            contact_no: _.startCase(sell.seller.contact_no),
            date: moment().tz(tz).format('L'),
            time: moment().tz(tz).format('LT')
        };


        let mail = {
            from: sell.seller.name + '<' + sell.seller.email + '>',
            to: 'tech@careager.com',
            subject: "Car Sell Approval - " + data.car + "(" + data.registration_no + ")", // Subject line
            html: pug.renderFile(path.join(__dirname, '../templates/seller-car-request.pug'), { b: data })
        };

        transporter.sendMail(mail, (error, info) => {
            if (error) {
                // console.log(error);
            }
            // console.log('Message sent: %s', info);
        });
    },

    adminCarApproval: async function (b, remark, tz) {
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: nodemailerConfig.careager_email,
                pass: nodemailerConfig.careager_pass
            }
        });

        var sell = await CarSell.findOne({ _id: b })
            .populate({ path: 'seller', populate: { path: 'user', select: "_id id name contact_no email" } })
            .populate({ path: 'car', select: '_id id title registration_no fuel_type location' })
            .exec();

        var data = {
            car: sell.car.title,
            registration_no: sell.car.registration_no,
            location: sell.car.location,
            name: _.startCase(sell.seller.name),
            email: _.startCase(sell.seller.email),
            remark: remark,
            status: "Approved",
            contact_no: _.startCase(sell.seller.contact_no),
            date: moment().tz(tz).format('L'),
            time: moment().tz(tz).format('LT'),
        };


        let mail = {
            from: 'Admin <admin@careager.com>',
            to: sell.seller.email,
            // to:"abhinav@autroid.com",
            subject: "Car Listing Approved - " + data.car + "(" + data.registration_no + ")", // Subject line
            html: pug.renderFile(path.join(__dirname, '../templates/admin-car-approval.pug'), { b: data })
        };

        transporter.sendMail(mail, (error, info) => {
            if (error) {
                // console.log(error);
            }
            // console.log('Message sent: %s', info);
        });
    },

    adminCarReject: async function (b, remark, tz) {
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: nodemailerConfig.careager_email,
                pass: nodemailerConfig.careager_pass
            }
        });

        var sell = await CarSell.findOne({ _id: b })
            .populate({ path: 'seller', populate: { path: 'user', select: "_id id name contact_no email" } })
            .populate({ path: 'car', select: '_id id title registration_no fuel_type location' })
            .exec();

        var data = {
            car: sell.car.title,
            registration_no: sell.car.registration_no,
            location: sell.car.location,
            name: _.startCase(sell.seller.name),
            email: _.startCase(sell.seller.email),
            contact_no: _.startCase(sell.seller.contact_no),
            remark: remark,
            status: "Rejected",
            date: moment().tz(tz).format('L'),
            time: moment().tz(tz).format('LT')
        };


        let mail = {
            from: 'Admin <admin@careager.com>',
            to: sell.seller.email,
            subject: "Car Listing Rejected - " + data.car + "(" + data.registration_no + ")", // Subject line
            html: pug.renderFile(path.join(__dirname, '../templates/admin-car-approval.pug'), { b: data })
        };

        transporter.sendMail(mail, (error, info) => {
            if (error) {
                // console.log(error);
            }
            // console.log('Message sent: %s', info);
        });
    },
    //Abhinav Tygai
    ServiceApproval: async function (ser, business, seg, pack, service, part_cost, labour_cost, type, tz) {
        // let transporter = nodemailer.createTransport({
        //     host: 'smtp.gmail.com',
        //     // service:'gmail',
        //     port: 465,
        //     secure: true,
        //     auth: {
        //         user: nodemailerConfig.careager_email,
        //         pass: nodemailerConfig.careager_pass
        //         // user: 'tyagiadesh1970@gmail.com',
        //         // pass: 'Abhi2234@'
        //     }
        // });
        // if (type == "Service")
        // console.log(business + " Id Of Busienss")
        var buss = await User.findOne({ _id: business }).exec();
        // .populate({ path: 'seller', populate: { path: 'user', select: "_id id name contact_no email" } })
        // .populate({ path: 'car', select: '_id id title registration_no fuel_type location' })


        var data = {
            type: ser,
            segment: seg,
            package: pack,
            service: service,
            business_name: buss.name,
            // email: _.startCase(buss.email),
            contact_no: buss.contact_no,
            // date: moment().tz(tz).format('L'),
            // time: moment().tz(tz).format('LT')
        };
        var businessId = await User.findOne({ _id: mongoose.Types.ObjectId(business) }).exec();
        // console.log("------" + businessId);
        var careager = nodemailerConfig.careager_email;
        var autroid = nodemailerConfig.autroid_email;
        var careagerPass = nodemailerConfig.careager_pass;
        var autroidPass = 'launch@2021';

        if (business == "5bfec47ef651033d1c99fbca") {

            let transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: {
                    user: nodemailerConfig.careager_email,
                    pass: nodemailerConfig.careager_pass,


                },



            });
            let mail = {
                from: buss.name + '<' + buss.email + '>',
                // from: "My Bsuness" + '<'+nodemailerConfig.careager_email+'>',
                //to: "abhinav@autroid.com",
                //to: "admin@autroid.com",
                to: careager,
                subject: "Custom Service Approval - " + data.service + "(" + data.package + ")", // Subject line
                html: '<table><tr><th style="text-align: left;color:red";> Business Name: <hr></th><th style="text-align: left;color:red">' + data.business_name + '<hr></th></tr><tr><th style="text-align: left;color:red";> Contact no: <hr></th><th style="text-align: left;color:red">' + data.contact_no + '<hr></th></tr><tr><th style="text-align: left;color:green"> Category </td><td>' + data.type + '</th></tr><tr><th style="text-align: left;color:green"> Sub Category </td><td>' + data.package + '</th></tr><tr><th style="text-align: left;color:green"> Segment </td><td>' + data.segment + '</th></tr><tr><th style="text-align: left;color:green"> Service Name </td><td>' + data.service + '</th></tr><tr><th style="text-align: left;color:green"> Part Cost </td><td>' + "₹ " + part_cost + '</th></tr><tr><th style="text-align: left;color:green"> Labour Cost </td><td>' + "₹ " + labour_cost + '</th></tr><tr><th style="text-align: left;color:green">Service Status </th><td> Not Approved </td></tr></table><br><a style="background-color: #4CAF50;border: none;color: white;padding: 15px 32px; align: center; text-align: center;text-decoration: none;display: inline-block;font-size: 16px;margin: 4px 2px;cursor: pointer;" href="http://13.127.255.113/new-services" class="button">Approve Now</a>'
                // html: pug.renderFile(path.join(__dirname, '../templates/seller-car-request.pug'), { b: data })
            };

            transporter.sendMail(mail, (error, info) => {
                if (error) {
                    // console.log(error);
                    // console.log(info)
                }
                // console.log('Message sent: %s', info);

            });
        }
        else {
            let transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: {

                    user: nodemailerConfig.autroid_email,
                    pass: nodemailerConfig.autroid_pass,

                },



            });

            let mail = {
                from: buss.name + '<' + buss.email + '>',
                // from: "My Bsuness" + '<'+nodemailerConfig.careager_email+'>',
                //to: "abhinav@autroid.com",
                //to: "admin@autroid.com",
                to: autroid,
                subject: "Custom Service Approval - " + data.service + "(" + data.package + ")", // Subject line
                html: '<table><tr><th style="text-align: left;color:red";> Business Name: <hr></th><th style="text-align: left;color:red">' + data.business_name + '<hr></th></tr><tr><th style="text-align: left;color:red";> Contact no: <hr></th><th style="text-align: left;color:red">' + data.contact_no + '<hr></th></tr><tr><th style="text-align: left;color:green"> Category </td><td>' + data.type + '</th></tr><tr><th style="text-align: left;color:green"> Sub Category </td><td>' + data.package + '</th></tr><tr><th style="text-align: left;color:green"> Segment </td><td>' + data.segment + '</th></tr><tr><th style="text-align: left;color:green"> Service Name </td><td>' + data.service + '</th></tr><tr><th style="text-align: left;color:green"> Part Cost </td><td>' + "₹ " + part_cost + '</th></tr><tr><th style="text-align: left;color:green"> Labour Cost </td><td>' + "₹ " + labour_cost + '</th></tr><tr><th style="text-align: left;color:green">Service Status </th><td> Not Approved </td></tr></table><br><a style="background-color: #4CAF50;border: none;color: white;padding: 15px 32px; align: center; text-align: center;text-decoration: none;display: inline-block;font-size: 16px;margin: 4px 2px;cursor: pointer;" href="http://13.127.255.113/new-services" class="button">Approve Now</a>'
                // html: pug.renderFile(path.join(__dirname, '../templates/seller-car-request.pug'), { b: data })
            };

            transporter.sendMail(mail, (error, info) => {
                if (error) {
                    // console.log(error);
                    // console.log(info)
                }
                // console.log('Message sent: %s', info);

            });

        }
    },

    //For My Use Dublicate
    adminServiceApproval: async function (type, b, remark, tz) {
        var data = {}
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: nodemailerConfig.careager_email,
                pass: nodemailerConfig.careager_pass
            }
        });
        if (type == "services") {
            var ser = await Service.findOne({ _id: b })
                .populate('business').exec();
            // console.log("Populated User " + buss);

            // return res.send(buss)
            // console.log("Populated " + ser.business.name)

            data = {
                type: ser.type,
                service: ser.service,
                segment: ser.segment,
                package: ser.package,
                business_name: ser.business.name,
                mobile: ser.business.contact_no,
                email: ser.business.email,
                remark: remark,
                cost: ser.cost,
                status: ser.admin_status,
                contact_no: _.startCase(ser.business.contact_no),
                date: moment().tz(tz).format('L'),
                time: moment().tz(tz).format('LT'),
            };
            // console.log(data)
            // console.log(data.email)
        } else if (type == "collision") {
            var ser = await Collision.findOne({ _id: b })
                .populate('business').exec();
            // console.log("Populated User " + buss);

            // return res.send(buss)
            // console.log("Populated " + ser.business.name)

            data = {
                type: ser.type,
                service: ser.service,
                segment: ser.segment,
                package: ser.package,
                business_name: ser.business.name,
                mobile: ser.business.contact_no,
                email: ser.business.email,
                remark: remark,
                cost: ser.cost,
                status: ser.admin_status,
                contact_no: _.startCase(ser.business.contact_no),
                date: moment().tz(tz).format('L'),
                time: moment().tz(tz).format('LT'),
            };

            // console.log(data)
            // console.log(data.email)
        } else if (type == "detailing") {
            var ser = await Detailing.findOne({ _id: b })
                .populate('business').exec();
            // console.log("Populated User " + buss);

            // return res.send(buss)
            // console.log("Populated " + ser.business.name)

            data = {
                type: ser.type,
                service: ser.service,
                segment: ser.segment,
                package: ser.package,
                business_name: ser.business.name,
                mobile: ser.business.contact_no,
                email: ser.business.email,
                remark: remark,
                cost: ser.cost,
                status: ser.admin_status,
                contact_no: _.startCase(ser.business.contact_no),
                date: moment().tz(tz).format('L'),
                time: moment().tz(tz).format('LT'),
            };
            // console.log(data)
            // console.log(data.email)
        } else if (type == "customization") {
            var ser = await Customization.findOne({ _id: b })
                .populate('business').exec();
            // console.log("Populated User " + buss);

            // return res.send(buss)
            // console.log("Populated " + ser.business.name)

            data = {
                type: ser.type,
                service: ser.service,
                segment: ser.segment,
                package: ser.package,
                business_name: ser.business.name,
                mobile: ser.business.contact_no,
                email: ser.business.email,
                remark: remark,
                cost: ser.cost,
                status: ser.admin_status,
                contact_no: _.startCase(ser.business.contact_no),
                date: moment().tz(tz).format('L'),
                time: moment().tz(tz).format('LT'),

            };
            // console.log(data)
            // console.log(data.email)
        } else {
            // data = {
            //     type: "custom",
            //     service: "custom",
            //     segment: ser.segment,
            //     package: ser.package,
            //     business_name: ser.business.name,
            //     mobile: ser.business.contact_no,
            //     email: _.startCase(ser.business.email),
            //     remark: remark,
            //     cost: ser.cost,
            //     status: "Approved",
            //     contact_no: _.startCase(ser.business.contact_no),
            //     date: moment().tz(tz).format('L'),
            //     time: moment().tz(tz).format('LT'),
            // };
            // console.log(data)

        }

        // });

        let mail = {
            from: 'Admin <admin@autroid.com>',
            to: data.email,
            // to: "abhinav@autroid.com",
            subject: "Service Listing Approved - " + data.service + "(" + data.type + ")", // Subject line
            html: '<table border="20px cyan solid"><tr><th style="text-align: left;color:green"> Category </td><td>' + data.type + '</th></tr><tr><th style="text-align: left;color:green"> Sub Category </td><td>' + data.package + '</th></tr><tr><th style="text-align: left;color:green"> Segment </td><td>' + data.segment + '</th></tr><tr><th style="text-align: left;color:green"> Service Name </td><td>' + data.service + '</th></tr><tr><th style="text-align: left;color:green"> Email </td><td>' + data.email + '</th></tr><tr><th style="text-align: left;color:green"> Labour Cost </td><td>' + "₹ " + data.cost + '</th></tr><tr><th style="text-align: left;color:green"> Publsih </th><td> ' + ser.publish + ' </td></tr><tr><th style="text-align: left;color:red";> Admin_Status: <hr></th><th style="text-align: left;color:red">' + data.status + '<hr></th></tr></table>'

            //For Admin Remark 
            //<tr><th style="text-align: left;color:red";> Admin Remark: </th><th style="text-align: left;color:red">' + data.remark + '</th></tr> 
        };

        transporter.sendMail(mail, (error, info) => {
            if (error) {
                // console.log(error);
            }
            // console.log('Message sent: %s', info);
        });
    },
    //Abhinav Tyagi Called From Common.js
    // packageRenew: async function () {
    //     var dates = []
    //     var date = new Date()
    //     dates.push({
    //         today: date.getDate(),
    //         month: date.getMonth(),
    //         day: date.getFullYear()
    //     })

    // console.log("Today Date Array" + dates)

    //     var bar = new Date();
    //     if (bar.getDay >= 25) {

    //         bar.setDate(bar.getDate() + 7);
    //         bar.setMonth(bar.getMonth() + 1);
    //         // console.log("Date of expire by today Month Changed " + new Date(bar))

    //     } else {

    //         bar = bar.setDate(bar.getDate() + 7);
    //         // console.log("Date of expire by today " + bar.getFullYear)
    //         // console.log("Date Function:" + new Date(bar))

    //     }

    //     // return res.json(dates)

    //     var filters = [];

    //     var business = "5bfec47ef651033d1c99fbca";
    //     var specification = {};
    //     specification['$lookup'] = {
    //         from: "User",
    //         localField: "user",
    //         foreignField: "_id",
    //         as: "user",
    //     };
    //     filters.push(specification);

    //     var specification = {};
    //     specification['$unwind'] = {
    //         path: "$user",
    //         preserveNullAndEmptyArrays: false
    //     };
    //     filters.push(specification);

    //     var specification = {};
    //     specification['$lookup'] = {
    //         from: "Car",
    //         localField: "car",
    //         foreignField: "_id",
    //         as: "car",
    //     };
    //     filters.push(specification);

    //     var specification = {};
    //     specification['$unwind'] = {
    //         path: "$car",
    //         preserveNullAndEmptyArrays: true
    //     };


    //     // var bar = new Date();

    //     // bar.setDate(bar.getDate() + 7);

    // console.log("Date of " + bar)

    //     var specification = {};
    //     specification['$match'] = {
    //         business: mongoose.Types.ObjectId(business),
    //         "expired_at": { $gte: new Date(), $lt: new Date(bar) },
    //     }
    //     filters.push(specification);

    // console.log("New Date", new Date())
    // console.log("Exp date", new Date(bar))

    //     // var bar1 = new Date(bar)
    // console.log("Month of Exp date" + bar.getMonth())
    //     var user_pack1 = [];
    //     await UserPackage.aggregate(filters)
    //         .allowDiskUse(true)
    //         .cursor({ batchSize: 10 })
    //         .exec()
    //         .eachAsync(async function (user_pack) {

    //             user_pack1.push({
    //                 exdate: user_pack.expired_at
    //             }
    //             )
    //             // console.log(user_pack.length)
    //             // if(user_pack.expired_at.getDate==new Date().getDate)
    //             var dd = user_pack.expired_at.getDate();
    //             var mm = user_pack.expired_at.getMonth();
    //             var yyyy = user_pack.expired_at.getFullYear();

    //             var exp_date = dd + "/" + mm;
    //             var dd1 = new Date(bar).getDate();
    //             var mm1 = new Date(bar).getMonth();
    //             // var yyyy1 =  bar.getFullYear();
    //             var date1 = dd1 + "/" + mm1;

    //             // console.log(exp_date + "=" + date1)

    //             if (date1 === exp_date) {

    //                 // console.log("Date Matched")


    //                 var contact_no = user_pack.user.contact_no;
    //                 // console.log(contact_no)
    //                 // contact_no = contact_no.substring(3)
    //                 var getUser = await User.findOne({ contact_no: contact_no }).exec();



    //                 var user = null;
    //                 var name = user_pack.user.name;
    //                 var email = user_pack.user.email;
    //                 var businessId = user_pack.business._id;
    //                 // var source=req.query.leadtype;
    //                 // console.log("Business" + businessId)
    //                 var source = "Package Renewal";

    //                 if (getUser) {
    //                     user = getUser._id;
    //                     name = getUser.name;
    //                     email = getUser.email;
    //                     contact = getUser.contact_no;
    //                 }

    //                 var checkLead = await Lead.findOne({ contact_no: contact_no, business: businessId, "remark.status": { $in: ["Open", "Follow-Up",] } }).sort({ updated_at: -1 }).exec();
    //                 var date = null;
    //                 var status = await LeadStatus.findOne({ status: "Open" }).exec();
    //                 // console.log("Status...." + checkLead.remark.status)
    //                 if (checkLead) {
    //                     if (checkLead.follow_up) {
    //                         var date = checkLead.follow_up.date
    //                         var time = checkLead.follow_up.time
    //                         // console.log("Follow up Date  " + date)
    //                     }
    //                     else {
    //                         date = null
    //                     }
    //                     Lead.findOneAndUpdate({ _id: checkLead._id }, {
    //                         $set: {
    //                             type: "Package",
    //                             follow_up: {
    //                                 date: date,
    //                                 time: time,
    //                                 created_at: new Date(),
    //                                 updated_at: new Date(),
    //                             },
    //                             remark: {
    //                                 status: checkLead.remark.status,
    //                                 resource: "",
    //                                 customer_remark: "",
    //                                 assignee_remark: "",
    //                                 color_code: status.color_code,
    //                                 created_at: new Date(),
    //                                 updated_at: new Date()
    //                             },
    //                             source: "Package Renewal",
    //                             status: checkLead.status,
    //                             updated_at: new Date(),
    //                             // business:businessId
    //                         }
    //                     }, { new: false }, async function (err, doc) {

    //                         LeadRemark.create({
    //                             lead: checkLead._id,
    //                             type: "User Package",
    //                             source: "Package Renewal",
    //                             resource: "",
    //                             status: checkLead.remark.status,
    //                             customer_remark: "",
    //                             assignee_remark: "",
    //                             assignee: checkLead.assignee,
    //                             color_code: status.color_code,
    //                             created_at: new Date(),
    //                             updated_at: new Date()
    //                         }).then(function (newRemark) {
    //                             Lead.findOneAndUpdate({ _id: checkLead._id }, { $push: { remarks: newRemark._id } }, { new: false }, async function (err, doc) {
    //                             })
    //                         });


    //                         // event.assistance(checkLead, req.headers['tz'])

    //                         // var json = ({
    //                         //     responseCode: 200,
    //                         //     responseMessage: "Pre: "+checkLead._id,
    //                         //     responseData: {}
    //                         // });

    //                         // res.status(200).json("RECEIVED")

    //                     });

    //                 }

    //                 else {
    //                     // console.log("Create new lead", contact_no)

    //                     var data = {}
    //                     var manager = businessId;

    //                     var status = await LeadStatus.findOne({ status: "Open" }).exec();
    //                     var managers = [];
    //                     await Management.find({ business: businessId, role: "CRE" })
    //                         .cursor().eachAsync(async (a) => {
    //                             var d = await Lead.find({ business: businessId, assignee: a.user }).count().exec();
    //                             managers.push({
    //                                 user: a.user,
    //                                 count: d
    //                             })
    //                         });

    //                     if (managers.length != 0) {
    //                         managers.sort(function (a, b) {
    //                             return a.count > b.count;
    //                         });

    //                         manager = managers[0].user;
    //                     }
    //                     var data = {
    //                         user: user,
    //                         business: businessId,
    //                         name: name,
    //                         contact_no: contact_no,
    //                         email: email,
    //                         assignee: manager,
    //                         contacted: false,
    //                         priority: 3,
    //                         follow_up: {

    //                         },
    //                         // type: req.query.leadtype,
    //                         geometry: [0, 0],
    //                         source: source,
    //                         remark: {
    //                             status: status.status,
    //                             customer_remark: "",
    //                             assignee_remark: "",
    //                             assignee: manager,
    //                             resource: "",
    //                             color_code: status.color_code,
    //                             created_at: new Date(),
    //                             updated_at: new Date(),
    //                         },

    //                         created_at: new Date(),
    //                         updated_at: new Date(),
    //                     }

    //                     Lead.create(data).then(async function (lead) {
    //                         var count = await Lead.find({ _id: { $lt: lead._id }, business: businessId }).count();
    //                         var lead_id = count + 10000;

    //                         Lead.findOneAndUpdate({ _id: lead._id }, { $set: { lead_id: lead_id } }, { new: true }, async function (err, doc) {
    //                         })
    //                         var status = await LeadStatus.findOne({ status: "Open" }).exec();

    //                     });
    //                 }
    //             }
    //             else {
    //                 // console.log("Date Note Matched")
    //             }
    //         });

    //     // event.packageRenewSMS(contact_no)


    //     // res.status(200).json({
    //     //     responseCode: 200,
    //     //     responseMessage: "",
    //     //     responseInfo: {
    //     //         // totalResult: totalResult.length
    //     //     },
    //     //     responseData: user_pack1,

    //     // });
    // },

    packageRenewSMS: async function (data, business) {
        // var username = encodeURIComponent(textLocal.email);
        // var hash = encodeURIComponent(textLocal.hash);
        // var number = encodeURIComponent("918650873557");
        // var sender = encodeURIComponent("VMCARS");

        // //var message = encodeURIComponent("<#> Hello, Welcome to CarEager! Your verification code is "+user.otp+". Do not share with anyone - https://goo.gl/fU5Upb Message ID: oBCBAPyQ+Jj");

        // var message = encodeURIComponent("<#> Hello! Your OTP is " + user + ". Do not share this code with anyone. oBCBAPyQ+Jj");


        // var data = "username=" + username + "&hash=" + hash + "&numbers=" + number + "&sender=" + sender + "&message=" + message;
        // request('http://api.textlocal.in/send/?' + data, function (error, response, body) {
        //     if (!error && response.statusCode == 200) {
        //         // console.log(message)
        //     }
        //     else {
        //         // console.log(error)
        //     }
        // });
        var businessId = await User.findOne({ _id: mongoose.Types.ObjectId(business) }).exec();
        // console.log("------" + businessId);
        var careager = nodemailerConfig.careager_email;
        var autroid = nodemailerConfig.autroid_email;
        var careagerPass = nodemailerConfig.careager_pass;
        var autroidPass = 'launch@2021';


        // let transporter = nodemailer.createTransport({
        //     host: 'smtp.gmail.com',
        //     port: 465,
        //     secure: true,
        //     auth: {
        //         user: nodemailerConfig.autroid_email,
        //         pass: 'launch@2021'
        //     }
        // });
        // console.log("Email = " + user.email)

        if (business == "5bfec47ef651033d1c99fbca") {

            let transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: {
                    user: nodemailerConfig.careager_email,
                    pass: nodemailerConfig.careager_pass,


                },



            });
            let mail = {
                from: nodemailerConfig.careager_email,
                // to: "abhinav@autroid.com",
                to: data.email,
                subject: "Reminder of subscription expiration", // Subject line
                html: '<p>Hi ' + data.customer_name + '</p><br> <p> Thanks for using our ' + data.package_name + ' for the past 1 Year – we love having you as our customer. Your subscription  will expire in 7 days (' + data.expired_at + ') , so we thought we’d check in.If you want to continue taking advantage of services, you can easily renew .We can also have a call sometime next week, so I can show you our new services and answer any questions you have.Feel free to call at 1800.</p><br><p>Thank you.</p><hr>'

            };

            transporter.sendMail(mail, (error, info) => {
                if (error) {
                    // console.log(error);
                }
                // console.log('Message sent: %s', info);
            });
        }
        else {
            let transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: {

                    user: nodemailerConfig.autroid_email,
                    pass: nodemailerConfig.autroid_pass,

                },


            });
            let mail = {
                from: nodemailerConfig.autroid_email,
                // to: "abhinav@autroid.com",
                to: data.email,
                subject: "Reminder of subscription expiration", // Subject line
                html: '<p>Hi ' + data.customer_name + '</p><br> <p> Thanks for using our ' + data.package_name + ' for the past 1 Year – we love having you as our customer. Your subscription  will expire in 7 days (' + data.expired_at + ') , so we thought we’d check in.If you want to continue taking advantage of services, you can easily renew .We can also have a call sometime next week, so I can show you our new services and answer any questions you have.Feel free to call at 1800.</p><br><p>Thank you.</p><hr>'

            };

            transporter.sendMail(mail, (error, info) => {
                if (error) {
                    // console.log(error);
                }
                // console.log('Message sent: %s', info);
            });



        }
    },
    //Abhinav Cashback
    carEagerCash: async function (data) {
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: nodemailerConfig.careager_email,
                pass: nodemailerConfig.careager_pass
            }
        });

        let mail = {
            from: 'Admin <admin@careager.com>',
            to: "abhinav@autroid.com",
            subject: "Cashback Added", // Subject line
            html: '<p>Congrats! Rs ' + data + ' deposited in your CarEager Account - https://goo.gl/fU5Upb </p><hr>'

        };

        transporter.sendMail(mail, (error, info) => {
            if (error) {
                // console.log(error);
            }
            // console.log('Message sent: %s', info);
        });
    },

    //Abhinav App link
    appLink: function (lead) {
        var username = encodeURIComponent(textLocal.email);
        var hash = encodeURIComponent(textLocal.hash);
        var number = encodeURIComponent("91" + lead.contact_no);
        // var sender = encodeURIComponent("VMCARS");
        var sender = encodeURIComponent("CAREGR");
        // console.log("Evenet Con" + number)

        //var message = encodeURIComponent("<#> Hello, Welcome to CarEager! Your verification code is "+user.otp+". Do not share with anyone - https://goo.gl/fU5Upb Message ID: oBCBAPyQ+Jj");

        var message = encodeURIComponent("World-Class Services & Certified Cars at the lowest prices. Download the CarEager App Now! - https://goo.gl/fU5Upb");


        var data = "username=" + username + "&hash=" + hash + "&numbers=" + number + "&sender=" + sender + "&message=" + message;
        request('http://api.textlocal.in/send/?' + data, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                // console.log(message + " == " + response.body)
            }
            else {
                // console.log(error)
            }
        })
    },

    otpSmsMail: async function (user) {
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: nodemailerConfig.careager_email,
                pass: nodemailerConfig.careager_pass
            }
        });
        var email = "";
        if (user.email == "") {
            email = "abhinav@autroid.com"
        }
        else {
            email = user.email
        }
        // email = "abhinav@autroid.com"
        // console.log(user.email, " OTP mail id ", email)
        let mail = {
            from: 'Admin <admin@careager.com>',
            // to: "abhinav@autroid.com",
            to: email,
            subject: "OTP Verification Code", // Subject line
            html: '<p><#> Hello! Your OTP is <h2>' + user.otp + '</h2>. Do not share this code with anyone. oBCBAPyQ+Jj</p><hr>'

        };

        transporter.sendMail(mail, (error, info) => {
            if (error) {
                // console.log(error);
            }
            // console.log('Message sent: %s', info);
        });
    },
    otpSmsMailXpress: async function (user, otp) {
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: nodemailerConfig.careager_email,
                pass: nodemailerConfig.careager_pass
            }
        });
        var email = "abhinav@autroid.com";
        if (user.email == "") {
            email = "abhinav@autroid.com"
        }
        else {
            email = user.email
        }
        // console.log(" OTP mail id ", user, "---", otp.otp)
        let mail = {
            from: 'Admin <admin@careager.com>',
            // to: "abhinav@autroid.com",
            to: email,
            subject: "OTP Verification Code", // Subject line
            html: '<p><#> Hello! Your OTP is <h2>' + otp.otp + '</h2>. Do not share this code with anyone. oBCBAPyQ+Jj</p><hr>'

        };

        transporter.sendMail(mail, (error, info) => {
            if (error) {
                // console.log(error);
            }
            // console.log('Message sent: %s', info);
        });
    },
    notifyAbhinav: async function (user) {
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: nodemailerConfig.careager_email,
                pass: nodemailerConfig.careager_pass
            }
        });
        let mail = {
            from: 'Admin <admin@careager.com>',
            to: "abhinav@autroid.com",
            subject: "Knowlarity Called Lead API", // Subject line
            html: '<p>Hello! Lead API Called by Knowlarity, Customer Contact No:' + user + ' </p><hr>'
        };

        transporter.sendMail(mail, (error, info) => {
            if (error) {
                // console.log(error);
            }
            // console.log('Message sent: %s', info);
        });
    },

    justdialData: async function (mailId, data) {
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: nodemailerConfig.careager_email,
                pass: nodemailerConfig.careager_pass
            }
        });
        let mail = {
            from: 'Admin(Justdial API) <admin@careager.com>',
            to: "abhinav@autroid.com",
            subject: "LEAD From Justdail", // Subject line
            html: '<p>Hello! Lead API Called by Justdial with following Customer details-> Contact Number: ' + data.contact_no + 'E-mail: ' + mailId + 'Lead Id: ' + data.leadId + ', leadtype: |' + data.leadtype + ', |date :' + data.date + ', category: ' + data.category + ', city: ' + data.city + ', Area: ' + data.area + ', brancharea: ' + data.brancharea + ', dncmobile: ' + data.dncmobile + ', dncphone: ' + data.dncphone + ', company: ' + data.company + ', pincode: ' + data.pincode + ', time ' + data.time + ', branchpin: ' + data.branchpin + ', parentid: ' + data.parentid + ' </p><hr>'
        };

        transporter.sendMail(mail, (error, info) => {
            if (error) {
                // console.log(error);
            }
            // console.log('Message sent: %s', info);
        });
    },
    autroidSignUpMail: async function (user) {
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: nodemailerConfig.autroid_email,
                pass: nodemailerConfig.autroid_pass,
            }
        });
        // console.log("Email = " + user.email)
        let mail = {
            from: 'Admin(AUTROID) <' + nodemailerConfig.autroid_email + '>',
            to: user.email,
            subject: "Autroid Business Registration", // Subject line
            html: 'Welcome to Autroid Business! Your business is successfully registered. <br><br> Business Name: ' + user.name + '<br> User ID - ' + user.contact_no + '<br> Login Page - business.autroid.com.<br>  App Link - play.google.com/store/apps/details?id=com.vmt.autroid <br><br> Thanks, <br> Autroid Support <br> 871-000-6161 '

        };

        transporter.sendMail(mail, (error, info) => {
            if (error) {
                // console.log(error);
            }
            // console.log('Message sent: %s', info);
        });
    },
    autroidSignUpSMS: function (user) {
        var username = encodeURIComponent(textLocal.email);
        var hash = encodeURIComponent(textLocal.hash);
        var number = encodeURIComponent("91" + user.contact_no);
        // var sender = encodeURIComponent("VMCARS");
        var sender = encodeURIComponent("autroi");
        // console.log("Evenet Con" + number)
        var message = encodeURIComponent("Welcome to Autroid Business! Your business - " + user.name + " is successfully registered. User ID - " + user.contact_no + " / business.autroid.com.");
        var data = "username=" + username + "&hash=" + hash + "&numbers=" + number + "&sender=" + sender + "&message=" + message;
        request('http://api.textlocal.in/send/?' + data, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                // console.log(message + " == " + response.body)
            }
            else {
                // console.log(error)
            }
        })
    },
    loginLinkMail: async function (user) {
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: nodemailerConfig.autroid_email,
                pass: nodemailerConfig.autroid_pass,
            }
        });
        // console.log("Email = " + user.email)
        let mail = {
            from: 'Admin(AUTROID) <' + nodemailerConfig.autroid_email + '>',
            to: user.email,
            subject: "Greetings from Autroid!",     // Subject line
            html: "Welcome to Autroid Business! Your business - " + user.name + " is successfully registered. User ID - " + user.contact_no + " / business.autroid.com."
        };
        transporter.sendMail(mail, (error, info) => {
            if (error) {
                // console.log(error);
            }
            // console.log('Message sent: %s', info);
        });
    },
    // autroidOnboardings: async function (user) {
    //     let transporter = nodemailer.createTransport({
    //         host: 'smtp.gmail.com',
    //         port: 465,
    //         secure: true,
    //         auth: {
    //             user: nodemailerConfig.careager_email,
    //             pass: nodemailerConfig.careager_pass
    //         }
    //     });
    // console.log("Email = " + user.email)
    //     let mail = {
    //         from: 'Admin(AUTROID) <admin@careager.com>',
    //         to: user.email,
    //         subject: "Greetings from Autroid!", // Subject line
    //         html: "Greetings from Autroid! <br> Hello Team, <br><br>  Welcome to Autroid Business! I am so excited to have you join us. <br> I will reach you on 8851323932 today. <br> <br>As part of your purchase, we love to provide you onboarding assistance and help you have a better experience with the product. Feel free to write to onboarding@autroid.com for your queries and concerns. <br>Also, for any account related information or assistance you can always write to me. I will be happy to assist you. <br>Looking forward to hearing from you.<br><br>Sincerely, <br>Abhinav Tyagi <br>86508-73557 <br><br>Customer Success<br>Autroid Business Team"

    //     };

    //     transporter.sendMail(mail, (error, info) => {
    //         if (error) {
    //             // console.log(error);
    //         }
    //         // console.log('Message sent: %s', info);
    //     });
    // },


    autroidOnboardings: async function (user) {
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: nodemailerConfig.autroid_email,
                pass: nodemailerConfig.autroid_pass,
            }
        });
        // console.log("Email = " + user.email)
        let mail = {
            from: 'Admin(AUTROID) <' + nodemailerConfig.autroid_email + '>',
            to: user.email,
            subject: "Greetings from Autroid!",     // Subject line
            html: "Greetings from Autroid! <br> Hello Team, <br><br>  Welcome to Autroid Business! I am so excited to have you join us. <br> I will reach you on " + user.contact_no + "  today. <br> <br>As part of your purchase, we love to provide you onboarding assistance and help you have a better experience with the product. Feel free to write to onboarding@autroid.com for your queries and concerns. <br>Also, for any account related information or assistance you can always write to me. I will be happy to assist you. <br>Looking forward to hearing from you.<br><br>Sincerely, <br>Abhinav Tyagi <br>86508-73557 <br><br>Customer Success<br>Autroid Business Team"
        };
        transporter.sendMail(mail, (error, info) => {
            if (error) {
                // console.log(error);
            }
            // console.log('Message sent: %s', info);
        });
    },
    //made by Sumit working fine :)
    employeeWelcome: async function (user, role, business) {

        let businessName = await User.findOne({ _id: mongoose.Types.ObjectId(business) }).exec()
        var careager = nodemailerConfig.careager_email;
        var autroid = nodemailerConfig.autroid_email;
        var careagerPass = nodemailerConfig.careager_pass;
        var autroidPass = 'launch@2021';


        // let transporter = nodemailer.createTransport({
        //     host: 'smtp.gmail.com',
        //     port: 465,
        //     secure: true,
        //     auth: {
        //         user: nodemailerConfig.autroid_email,
        //         pass: 'launch@2021'

        //     }
        // });
        if (business == "5bfec47ef651033d1c99fbca") {

            let transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: {
                    user: nodemailerConfig.careager_email,
                    pass: nodemailerConfig.careager_pass,


                },



            });
            let mail = {
                from: nodemailerConfig.careager_email,
                to: user.email,
                subject: "[New Employee]!",     // Subject line
                html: "<h3>New employee - " + user.name + " " + "(" + role + ")" + " is added to " + businessName.name + " .</h3>"
            };
            transporter.sendMail(mail, (error, info) => {
                if (error) {
                    // console.log(error);
                }
                // console.log('Message sent: %s', info);
            });
        }
        else {

            let transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: {
                    user: nodemailerConfig.autroid_email,
                    pass: nodemailerConfig.autroid_pass,
                },
            });
            let mail = {
                from: nodemailerConfig.autroid_email,
                to: user.email,
                subject: "[New Employee]!",     // Subject line
                html: " <h3> New employee - " + user.name + " " + "(" + role + ")" + " is added to " + businessName.name + " .</h3>"
            };
            transporter.sendMail(mail, (error, info) => {
                if (error) {
                    // console.log(error);
                }
                // console.log('Message sent: %s', info);
            });

        }



    },

    //made by sumit...working fine

    newPackage: async function (b, packageCost, business) {
        var businessId = await User.findOne({ _id: mongoose.Types.ObjectId(business) }).exec();
        // console.log("------" + businessId);
        var careager = nodemailerConfig.careager_email;
        var autroid = nodemailerConfig.autroid_email;
        var careagerPass = nodemailerConfig.careager_pass;
        var autroidPass = 'launch@2021';

        // let transporter = nodemailer.createTransport({
        //     host: 'smtp.gmail.com',
        //     port: 465,
        //     secure: true,
        //     auth: {
        //         user: careager,
        //         user: autroid,  
        //         pass: autroidPass,
        //         pass: careagerPass,

        //     },



        // });



        var booking = await Booking.findOne({ _id: b })
            .populate({ path: 'user', populate: { path: 'user', select: "_id id name contact_no email" } })
            .populate({ path: 'business', populate: { path: 'user', select: "_id id name contact_no email" } })
            .populate({ path: 'admin', populate: { path: 'user', select: "_id id name contact_no email" } })
            .populate({ path: 'car', select: '_id id title registration_no fuel_type' })
            .exec();
        if (business == "5bfec47ef651033d1c99fbca") {

            let transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: {
                    user: nodemailerConfig.careager_email,
                    pass: nodemailerConfig.careager_pass,


                },



            });

            // console.log("careager....")
            // console.log("###", careager + careagerPass);

            let mailToUser = {
                from: nodemailerConfig.careager_email,
                to: booking.user.email,
                subject: '[New Package] Purchase ID #' + booking.booking_no, // Subject line // Subject line
                html: '<h2 style="margin:5px 0;">' + booking.business.name + '</h2><p style="margin:3px 0">Location: 18/1, NH8, Sector 35, Gurugram, Haryana 122004</p> <p style="margin:3px 0">Behind Grace Toyota (Near Mercedes-Benz), 1800 843 4300</p> <p style="margin:3px 0"><a href="https://goo.gl/maps/m5SuCHXndx62">https://goo.gl/maps/m5SuCHXndx62</a></p><p style="margin:15px 0"> <p style="margin:3px 0">How to use this package?</p> <p style="margin:2px 0">Please choose a suitable date/time & book service using CarEager Xpress App<p style="margin:3px 0">- Android: <a href="https://goo.gl/fU5Upb">https://goo.gl/fU5Upb</a></p> <p style="margin:3px 0">- iOS App: Available on the App Store</p> </p><table><tr><td><h4 style="margin-top:5px; margin-bottom: 2px">' + booking.car.title + '(' + booking.car.fuel_type + ')</h4></td></tr><tr><th style="text-align: left">Registration #</th><td>' + booking.car.registration_no + '</td></tr><tr><th style="text-align: left">Booking No </th><td>' + booking.booking_no + '</td></tr><tr><th style="text-align: left">Package Value</th><td>' + packageCost + '</td></tr><tr><th style="text-align: left">'

            };


            transporter.sendMail(mailToUser, (error, info) => {
                if (error) {
                    // console.log(error);
                }
                // console.log('Message sent: %s', info.messageId);
            });
        }
        else {
            // console.log("Autroid...")


            let transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: {

                    user: nodemailerConfig.autroid_email,
                    pass: nodemailerConfig.autroid_pass,

                },



            });

            let mailToUser = {


                from: nodemailerConfig.autroid_email,
                to: booking.user.email,
                subject: '[New Package] Purchase ID #' + booking.booking_no, // Subject line // Subject line
                html: '<h2 style="margin:5px 0;">' + booking.business.name + '</h2><p style="margin:3px 0">Location: 18/1, NH8, Sector 35, Gurugram, Haryana 122004</p> <p style="margin:3px 0">Behind Grace Toyota (Near Mercedes-Benz), 1800 843 4300</p> <p style="margin:3px 0"><a href="https://goo.gl/maps/m5SuCHXndx62">https://goo.gl/maps/m5SuCHXndx62</a></p><p style="margin:15px 0"> <p style="margin:3px 0">How to use this package?</p> <p style="margin:2px 0">Please choose a suitable date/time & book service using CarEager Xpress App<p style="margin:3px 0">- Android: <a href="https://goo.gl/fU5Upb">https://goo.gl/fU5Upb</a></p> <p style="margin:3px 0">- iOS App: Available on the App Store</p> </p><table><tr><td><h4 style="margin-top:5px; margin-bottom: 2px">' + booking.car.title + '(' + booking.car.fuel_type + ')</h4></td></tr><tr><th style="text-align: left">Registration #</th><td>' + booking.car.registration_no + '</td></tr><tr><th style="text-align: left">Booking No </th><td>' + booking.booking_no + '</td></tr><tr><th style="text-align: left">Package Value</th><td>' + packageCost + '</td></tr><tr><th style="text-align: left">'

            };


            transporter.sendMail(mailToUser, (error, info) => {
                if (error) {
                    // console.log(error);
                }
                // console.log('Message sent: %s', info.messageId);
            });

        }


    },


    //sumit Made by working fine :)


    invoiceMail: async function (b, totalAmount, business) {
        var businessId = await User.findOne({ _id: mongoose.Types.ObjectId(business) }).exec();
        // console.log("------" + businessId);
        var careager = nodemailerConfig.careager_email;
        var autroid = nodemailerConfig.autroid_email;
        var careagerPass = nodemailerConfig.careager_pass;
        var autroidPass = 'launch@2021';

        // let transporter = nodemailer.createTransport({
        //     host: 'smtp.gmail.com',
        //     port: 465,
        //     secure: true,
        //     auth: {
        //         user: nodemailerConfig.autroid_email,
        //         pass: 'launch@2021'
        //     }
        // });
        var booking = await Booking.findOne({ _id: b })
            .populate({ path: 'user', populate: { path: 'user', select: "_id id name contact_no email" } })
            .populate({ path: 'business', populate: { path: 'user', select: "_id id name contact_no email" } })
            // .populate({ path: 'admin', populate: { path: 'user', select: "_id id name contact_no email" } })
            // .populate({ path: 'car', select: '_id id title registration_no fuel_type' })
            .exec();



        if (business == "5bfec47ef651033d1c99fbca") {

            let transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: {
                    user: nodemailerConfig.careager_email,
                    pass: nodemailerConfig.careager_pass,


                },

            });

            let mailToUser = {
                from: nodemailerConfig.careager_email,
                to: booking.user.email,
                subject: '[New Invoice]  ID #' + booking.booking_no, // Subject line // Subject line
                html: '<h4 style="margin:5px 0;">Congrats! Your car has passed the quality check (QC) and is now ready for delivery.</h4><h4 style="margin:5px 0;"> Please find the invoice amounting to ₹ ' + totalAmount + ' (attached). </h4>'


            };


            transporter.sendMail(mailToUser, (error, info) => {
                if (error) {
                    // console.log(error);
                }
                // console.log('Message sent: %s', info.messageId);
            });

        }

        else {

            let transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: {

                    user: nodemailerConfig.autroid_email,
                    pass: nodemailerConfig.autroid_pass,

                },



            });

            let mailToUser = {
                from: nodemailerConfig.autroid_email,
                to: booking.user.email,
                subject: '[New Invoice]  ID #' + booking.booking_no, // Subject line // Subject line
                html: '<h2 style="margin:5px 0;">Congrats! Your car has passed the quality check (QC) and is now ready for delivery.</h2><h2 style="margin:5px 0;"> Please find the invoice amounting to ' + totalAmount + ' (attached). '

            };


            transporter.sendMail(mailToUser, (error, info) => {
                if (error) {
                    // console.log(error);
                }
                // console.log('Message sent: %s', info.messageId);
            });


        }

    },

    changePlan: async function (plan, planName, bussinessEmail) {


        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: nodemailerConfig.autroid_email,
                pass: nodemailerConfig.autroid_pass,
            }
        });
        let mailToUser = {
            from: nodemailerConfig.autroid_email,
            to: bussinessEmail,
            subject: 'RE: Your Autroid subscription is changed',// Subject line // Subject line
            html: '<h2 style="margin:5px 0;">Hello,</h2><h3 style="margin:5px 0;"> Thank you for the subscription upgrade you have made in Autroid.<br> Please find your subscription details below.<br> The invoice is attached which you can also download from your account details page. </h3><h3 style="margin:5px 0;">New Plan : ' + plan + '- ' + planName + '</h3><h3 style="margin:5px 0;"> Thanks</h3><h3 style="margin:5px 0;">Customer Success <br> Autroid Business Team <br> 871-000-6161<h3>'



        };


        transporter.sendMail(mailToUser, (error, info) => {
            if (error) {
                // console.log(error);
            }
            // console.log('Message sent: %s', info.messageId);
        });




    },


    leadCre: async function (leadId, business) {
        var businessData = await User.findOne({ _id: mongoose.Types.ObjectId(business) }).exec();
        let lead = await Lead.findOne({ _id: mongoose.Types.ObjectId(leadId) })
            .populate({ path: 'business', select: 'name avatar avatar_address contact_no isCarEager uuid business_info whatsAppChannelId' })
            .populate({ path: 'assignee', select: 'name contact_no email' }).exec();



        // console.log(businessData.email);
        var careager = nodemailerConfig.careager_email;
        var autroid = nodemailerConfig.autroid_email;
        var careagerPass = nodemailerConfig.careager_pass;
        var autroidPass = 'launch@2021';
        // let transporter = nodemailer.createTransport({
        //     host: 'smtp.gmail.com',
        //     port: 465,
        //     secure: true,
        //     auth: {
        //         user: nodemailerConfig.autroid_email,
        //         pass: 'launch@2021'
        //     }
        // });
        if (business == "5bfec47ef651033d1c99fbca") {
            let transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: {
                    user: nodemailerConfig.careager_email,
                    pass: nodemailerConfig.careager_pass,

                },

            });


            let mailtoCre = {

                from: nodemailerConfig.careager_email,
                to: lead.assignee.email,
                subject: '[New Lead]',// Subject line // Subject line
                html: '<h3 style="margin:5px 0;"> [Source] - ' + lead.source + '<br> [Name] - ' + lead.name + '<br> [Phone] - ' + lead.contact_no + '</h3>'

            };

            transporter.sendMail(mailtoCre, (error, info) => {
                if (error) {
                }

            });


            let mailtoAdmin = {

                from: nodemailerConfig.careager_email,
                to: businessData.email,
                subject: '[New Lead]',// Subject line // Subject line
                html: '<h3 style="margin:5px 0;"> [Source] - ' + lead.source + '<br> [Name] - ' + lead.name + '<br> [Phone] - ' + lead.contact_no + '</h3>'

            };

            transporter.sendMail(mailtoAdmin, (error, info) => {
                if (error) {
                    // console.log(error);
                }
                // console.log('Message sent: %s', info.messageId);

            });


        }

        else {

            let transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: {
                    user: nodemailerConfig.autroid_email,
                    pass: nodemailerConfig.autroid_pass,

                },



            });


            let mailtoCre = {

                from: nodemailerConfig.autroid_email,
                to: lead.assignee.email,
                subject: '[New Lead]',// Subject line // Subject line
                html: '<h3 style="margin:5px 0;"> [Source] - ' + lead.source + '<br> [Name] - ' + lead.name + '<br> [Phone] - ' + lead.contact_no + '</h3>'

            };

            transporter.sendMail(mailtoCre, (error, info) => {
                if (error) {
                    // console.log(error);
                }
                // console.log('Message sent: %s', info.messageId);

            });

        }
    },



    //Super Admin..Sumit
    autroidReg: async function (city, category, user) {

        let businessDetail = await User.findOne({ _id: mongoose.Types.ObjectId(user._id) }).exec()
        var statusMark = businessDetail.account_info.status;
        if (statusMark == "Complete") {
            statusMark = "InActive";
            // console.log(statusMark);
        }


        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: nodemailerConfig.autroid_email,
                pass: nodemailerConfig.autroid_pass,
            }
        });
        let mailToUser = {
            from: nodemailerConfig.autroid_email,
            to: ' admin@autroid.com',
            subject: 'Subject: [New Business - ' + city + '] ' + '(' + statusMark + ')',// Subject line // Subject line
            html: '<h3 style="margin:5px 0;">Business : ' + businessDetail.name + '</h3><h3 style="margin:5px 0;">Registered by : ' + businessDetail.optional_info.reg_by + '</h3><h3 style="margin:5px 0;">Registered Contact : ' + businessDetail.contact_no + '</h3><h3 style="margin:5px 0;">Status :' + statusMark + '</h3><h3 style="margin:5px 0;"> City :' + city + '</h3><h3 style="margin:5px 0;">Category : ' + category + '</h3>'



        };


        transporter.sendMail(mailToUser, (error, info) => {
            if (error) {
                // console.log(error);
            }
            // console.log('Message sent: %s', info.messageId);
        });




    },

    //sumit..
    changePlanAdmin: async function (plan, planName, price, pricePaid, bussinessEmail, address, phone, name, category, mode, prePlan, regBy, prePlanPrice) {
        /*  let businessDetail = await User.findOne({_id:mongoose.Types.ObjectId(business)}).exec() */
        var prePlanCategory = plan;
        if (prePlanPrice <= price) {
            if (prePlan == "No Previouse Plan") {
                prePlanCategory = "";
            }


            // console.log("in if....");
            var transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: {
                    user: nodemailerConfig.autroid_email,
                    pass: nodemailerConfig.autroid_pass,
                }
            });
            let mailToUser = {
                from: nodemailerConfig.autroid_email,
                to: 'admin@autroid.com',
                subject: 'Subject: [New Sale - ' + address + '] ' + plan + ' - ' + planName,
                html: '<h3 style="margin:5px 0;">Business : ' + name + '</h3><h3 style="margin:5px 0;"> Registered Contact : ' + phone + '</h3><h3 style="margin:5px 0;"> City : ' + address + '</h3><h3 style="margin:5px 0;">Category : ' + category + '</h3><h3 style="margin:5px 0;">Registered by : ' + regBy + '</h3><h3 style="margin:5px 0;">New Plan : ' + plan + " - " + planName + '</h3><h3 style="margin:5px 0;">Previous Plan : ' + prePlanCategory + ' - ' + prePlan + ' </h3><h3 style="margin:5px 0;">Price : ₹ ' + price + '</h3><h3 style="margin:5px 0;">Amount Paid : ₹ ' + pricePaid + '</h3><h3 style="margin:5px 0;">Mode : ' + mode + '</h3>'
            };


            transporter.sendMail(mailToUser, (error, info) => {
                if (error) {
                    // console.log(error);
                }
                // console.log('Message sent: %s', info.messageId);
            });

        }
        else {
            // console.log("in else...");
            var transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: {
                    user: nodemailerConfig.autroid_email,
                    pass: nodemailerConfig.autroid_pass,
                }
            });


            console.log("Email - = " + nodemailerConfig.autroid_email, " Paa = " + nodemailerConfig.autroid_pass)
            let mailToUser = {
                from: nodemailerConfig.autroid_email,
                to: 'admin@autroid.com',
                subject: 'Subject: [New Lose - ' + address + '] ' + plan + ' - ' + planName,
                html: '<h3 style="margin:5px 0;">Business : ' + name + '</h3><h3 style="margin:5px 0;"> Registered Contact : ' + phone + '</h3><h3 style="margin:5px 0;"> City : ' + address + '</h3><h3 style="margin:5px 0;">Category : ' + category + '</h3><h3 style="margin:5px 0;">Registered by : ' + regBy + '</h3><h3 style="margin:5px 0;">New Plan : ' + plan + " - " + planName + '</h3><h3 style="margin:5px 0;">Previous Plan : ' + plan + ' - ' + prePlan + ' </h3><h3 style="margin:5px 0;">Price : ₹ ' + price + '</h3><h3 style="margin:5px 0;">Amount Paid : ₹ ' + pricePaid + '</h3><h3 style="margin:5px 0;">Mode : ' + mode + '</h3>'





            };


            transporter.sendMail(mailToUser, (error, info) => {
                if (error) {
                    // console.log(error);
                }
                // console.log('Message sent: %s', info.messageId);
            });

        }
        let mailToUser = {
            from: nodemailerConfig.autroid_email,
            to: bussinessEmail,
            subject: 'Subject: [New Loss - ' + address + ']' + planName,
            html: '<h3 style="margin:5px 0;">Business: ' + name + '</h3><h3 style="margin:5px 0;"> Registered Contact : ' + phone + '</h3><h3 style="margin:5px 0;"> City :' + address + '</h3><h3 style="margin:5px 0;">Category :' + category + '</h3><h3 style="margin:5px 0;">New Plan: ' + plan + "- " + planName + '</h3><h3 style="margin:5px 0;">Previous Plan : ' + prePlan + ' </h3><h3 style="margin:5px 0;">Price: ₹ ' + price + '</h3><h3 style="margin:5px 0;">Amount Paid: ₹ ' + pricePaid + '</h3><h3 style="margin:5px 0;">Mode:' + mode + '</h3>'
        };


        transporter.sendMail(mailToUser, (error, info) => {
            if (error) {
                // console.log(error);
            }
            // console.log('Message sent: %s', info.messageId);
        });


    },

    //sumit...

    paymentLink: async function (userBooking, amount, business) {
        /*  let businessDetail = await User.findOne({_id:mongoose.Types.ObjectId(business)}).exec() */
        var business = await User.findOne({ _id: mongoose.Types.ObjectId(business) }).exec();
        //var code = `<img  alt="" src="https://s3.ap-south-1.amazonaws.com/careager/avatar/76c9c5c0-74f0-11eb-8228-c577636c7b80.jpeg" width="140px" height="180px" border="1">`
        var qr_code = ` <img alt ="" src= "https://www.upiqrcode.com/upi-qr-code-api/v01/?apikey=mfeokl&seckey=autroid&payee=Victorious%20Managers%27%20Group%20Pvt%20Ltd&vpa=8851323932@okbizaxis"  width="180px" height="180px"  border="1">`

        var transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: nodemailerConfig.careager_email,
                pass: nodemailerConfig.careager_pass
            }
        });

        let mailToUser = {
            from: nodemailerConfig.careager_email,
            to: userBooking.email,
            // to: 'abhinav@autroid.com',
            subject: '[Payment Link] You have received Payment details of ' + business.name,
            html: '<h3 style="margin:5px 0;">Bank Details  <br>' + business.bank_details[0].bank + '</h3><h3 style="margin:5px 0;">Amount : ' + amount + '</h3><h3 style="margin:5px 0;">A/c # : ' + business.bank_details[0].account_no + '</h3><h3 style="margin:5px 0;">IFSC : ' + business.bank_details[0].ifsc + '</h3><h3 style="margin:5px 0;">UPI : ' + business.bank_details[0].upi + ' <br>QR code is attached<br><br>' + qr_code + '</h3>'





        };


        transporter.sendMail(mailToUser, (error, info) => {
            if (error) {
                // console.log(error);
            }
            // console.log('Message sent: %s', info.messageId);
        });







    },

    uploadToS3: async (body, filename, user) => {

        var s3 = new aws.S3({
            accessKeyId: config.IAM_USER_KEY,
            secretAccessKey: config.IAM_USER_SECRET,
            Bucket: config.BUCKET_NAME
        });


        var params = {
            Body: body,
            ACL: 'public-read',
            Bucket: config.BUCKET_NAME + '/partyStatemnts',
            Key: filename + '.pdf',
            ContentType: "application/pdf"

        };
        s3.upload(params, async function (err, response) {
            // console.log(err, response);
            //party...
            var data = {
                "business_info.party_statements": "https://s3.ap-south-1.amazonaws.com/" + config.BUCKET_NAME + "/partyStatemnts/" + filename + ".pdf",
                created_at: new Date(),
                updated_at: new Date()
            }
            User.findOneAndUpdate({ _id: user }, { $set: data }, function (err, data) {
                if (err) {
                    //  return // console.log(err);
                }
                else {
                    // console.log(data);
                    console.log("Abhinav");
                }
            })
            return { url: "https://s3.ap-south-1.amazonaws.com/" + config.BUCKET_NAME + "/partyStatemnts/" + filename + ".pdf" }
        });

    },


    sendStatement: async (user) => {
        var userDetail = await User.findOne({ _id: mongoose.Types.ObjectId(user) }).exec();
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: nodemailerConfig.careager_email,
                pass: nodemailerConfig.careager_pass
            }
        });

        var url = userDetail.business_info.party_statements;
        //  // console.log("ss"+url);

        // console.log("Email" + party.email);


        let mailToBusiness = {
            from: 'CarEager Xpress <' + nodemailerConfig.careager_email + '>',
            to: userDetail.email,
            subject: "Party Statament",
            html: "<h2>  " + userDetail.name + " document is attached </h2>",
            attachments: [
                {
                    filename: `${userDetail.name}.pdf`,
                    path: `${url}`

                    // path :`https://careager.s3.ap-south-1.amazonaws.com/partyStatemnts/${userDetail.name}.pdf`


                }
            ]

        };

        transporter.sendMail(mailToBusiness, (error, info) => {
            if (error) {
                //  // console.log(error);
            }
            // console.log('Message sent: %s', info);
        });
    },

    //for invoice
    uploadToS3Invoice: async (body, filename, invoice) => {

        var s3 = new aws.S3({
            accessKeyId: config.IAM_USER_KEY,
            secretAccessKey: config.IAM_USER_SECRET,
            Bucket: config.BUCKET_NAME
        });


        var params = {
            Body: body,
            ACL: 'public-read',
            Bucket: config.BUCKET_NAME + '/InvoicePDfs',
            Key: filename + '.pdf',
            ContentType: "application/pdf"

        };
        s3.upload(params, function (err, response) {
            // console.log(err, response);

            var data = {
                'invoice_url': "https://s3.ap-south-1.amazonaws.com/" + config.BUCKET_NAME + "/InvoicePDfs/" + filename + ".pdf",
                created_at: new Date(),
                updated_at: new Date()
            }
            // console.log("bef" + invoice.user);
            Invoice.findOneAndUpdate({ _id: mongoose.Types.ObjectId(invoice._id) }, { $set: data }, function (err, doc) {

                if (err) {
                    //  return // console.log(err);
                }
                else {
                    // console.log("sss" + doc._id);
                    // console.log(doc);
                }
            })

        });
    },


    //for performa....

    uploadToS3Performa: async (body, filename, b) => {

        var s3 = new aws.S3({
            accessKeyId: config.IAM_USER_KEY,
            secretAccessKey: config.IAM_USER_SECRET,
            Bucket: config.BUCKET_NAME
        });


        var params = {
            Body: body,
            ACL: 'public-read',
            Bucket: config.BUCKET_NAME + '/peroformaPdfs',
            Key: filename + '.pdf',
            ContentType: "application/pdf"

        };

        s3.upload(params, function (err, response) {
            // console.log(err, response);

            var data = {
                'performa_url': "https://s3.ap-south-1.amazonaws.com/" + config.BUCKET_NAME + "/peroformaPdfs/" + filename + ".pdf",
                created_at: new Date(),
                updated_at: new Date()
            }

            Booking.findOneAndUpdate({ _id: mongoose.Types.ObjectId(b) }, { $set: data }, function (err, doc) {

                if (err) {
                    // return // console.log(err);
                }
                else {
                    // console.log("sss" + doc._id);
                    // console.log(doc);
                }
            })

        });
    },



    invoiceMail: async function (user, invoice, business) {
        var businessId = await User.findOne({ _id: mongoose.Types.ObjectId(business) }).exec();
        // console.log("------" + businessId);
        var careager = nodemailerConfig.careager_email;
        var autroid = nodemailerConfig.autroid_email;
        var careagerPass = nodemailerConfig.careager_pass;
        var autroidPass = 'launch@2021';


        var userDeatails = await User.findOne({ _id: mongoose.Types.ObjectId(user) })
            .populate({ path: 'user', select: 'name contact_no address _id' })
            .exec();

        var carDetail = await Invoice.findOne({ car: mongoose.Types.ObjectId(invoice.car) })
            .populate({ path: 'car', select: 'title registration_no' })
            .exec();

        var url = invoice.invoice_url;
        var file = carDetail.car.registration_no;



        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: nodemailerConfig.careager_email,
                pass: nodemailerConfig.careager_pass,


            },

        });

        let mailToUser = {
            from: nodemailerConfig.careager_email,
            to: userDeatails.email,
            subject: '[New Invoice]  ID #' + invoice.invoice_no, // Subject line // Subject line
            html: '<h4 style="margin:5px 0;">Congrats! Your car has passed the quality check (QC) and is now ready for delivery.</h4><h4 style="margin:5px 0;"> Please find the invoice amounting to ₹ ' + invoice.due.due + ' (attached). </h4>',
            attachments: [
                {
                    filename: `${file}.pdf`,
                    path: `${url}`

                    // path :`https://careager.s3.ap-south-1.amazonaws.com/partyStatemnts/${userDetail.name}.pdf`


                }

            ]

        };


        transporter.sendMail(mailToUser, (error, info) => {
            if (error) {
                // console.log(error);
            }
            // console.log('Message sent: %s', info.messageId);
        });





    },



    sendPerformaMail: async (b) => {
        var booking = await Booking.findOne({ _id: mongoose.Types.ObjectId(b) })

            .populate({ path: 'user', populate: { path: 'user', select: "_id id name contact_no email" } })
            .populate({ path: 'car', select: '_id id title registration_no fuel_type vin engine_no' })
            .exec();

        let title = booking.car.title;
        let due = booking.due.due;

        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: nodemailerConfig.careager_email,
                pass: nodemailerConfig.careager_pass
            }
        });

        var url = booking.performa_url;
        // console.log("ss" + url);

        // console.log("Email" + party.email);


        let mailToBusiness = {
            from: 'CarEager Xpress <' + nodemailerConfig.careager_email + '>',
            to: booking.user.email,
            subject: "[Peroforma Invoice]",
            html: "<h3>The total amount for the service/repair of your " + title + 'is ₹ ' + due + '. Please pay the due amount to generate the gate pass. </h3>',
            attachments: [
                {
                    filename: `${title}.pdf`,
                    path: `${url}`

                    // path :`https://careager.s3.ap-south-1.amazonaws.com/partyStatemnts/${userDetail.name}.pdf`


                }
            ]

        };

        transporter.sendMail(mailToBusiness, (error, info) => {
            if (error) {
                //   // console.log(error);
            }
            //  // console.log('Message sent: %s', info);
        });
    },




    requestParts: async function (vendorId) {
        let seller = await VendorOrders.findOne({ _id: mongoose.Types.ObjectId(vendorId) })
            .populate({ path: 'vendor', select: 'name email contact_no  business_info optional_info' })
            .populate({ path: 'business', select: 'name email contact_no  business_info optional_info' })
            .exec()

        // console.log('ee' + seller.vendor.email);
        var transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: nodemailerConfig.autroid_email,
                pass: nodemailerConfig.autroid_pass,
            }
        });


        let mailToUser = {
            from: nodemailerConfig.autroid_email,
            to: /* 'sumit@autroid.com', */seller.vendor.email,
            subject: '[Quotation Request] ',
            html: '<h3 style="margin:5px 0;">Dear Supplier,   <br>   The workshop - ' + seller.business.name + ' has requested a quotation. Please follow the link -  https://business.autroid.com/<br> <h3 style="margin:5px 0;">Thanks, <br> Autroid Support <br> 871-000-6161  </h3>'





        };



        transporter.sendMail(mailToUser, (error, info) => {
            if (error) {
                //  // console.log(error);
            }
            // console.log('Message sent: %s', info.messageId);
        });







    },

    uploadToS3InvoiceOrder: async (body, filename, id) => {

        var s3 = new aws.S3({
            accessKeyId: config.IAM_USER_KEY,
            secretAccessKey: config.IAM_USER_SECRET,
            Bucket: config.BUCKET_NAME

        });


        var params = {
            Body: body,
            ACL: 'public-read',
            Bucket: config.BUCKET_NAME + '/SalesInvoicePdfs',
            Key: filename + '.pdf',
            ContentType: "application/pdf"

        };
        s3.upload(params, function (err, response) {
            // console.log(err, response);

            var data = {
                'invoice_url': "https://s3.ap-south-1.amazonaws.com/" + config.BUCKET_NAME + "/SalesInvoicePdfs/" + filename + ".pdf",
                created_at: new Date(),
                updated_at: new Date()
            }

            OrderInvoice.findOneAndUpdate({ _id: mongoose.Types.ObjectId(id) }, { $set: data }, function (err, doc) {

                if (err) {
                    return // console.log(err);
                }
                else {

                }
            })

        });
    },




    sendSalesInvoice: async (salesinvoice) => {
        var user = await User.findOne({ _id: mongoose.Types.ObjectId(salesinvoice.user) }).exec();
        var business = await User.findOne({ _id: mongoose.Types.ObjectId(salesinvoice.business) }).exec();

        var due = salesinvoice.due.due.toLocaleString();
        var url = salesinvoice.invoice_url;
        var businessName = business.name;
        var caption = user.name;
        // console.log("sfdsfd" + user.email)


        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: nodemailerConfig.autroid_email,
                pass: nodemailerConfig.autroid_pass,
            }
        });


        // console.log("ss" + url);

        // console.log("Email" + party.email);


        let mailToBusiness = {
            from: nodemailerConfig.autroid_email,
            to: user.email,
            subject: "[Order Invoice]",
            html: `<h4>The invoice amounting to ₹${due} has been generated by ${businessName}.<br> The PDF is attached. </h4>`,
            attachments: [
                {
                    filename: `${caption}.pdf`,
                    path: `${url}`

                    // path :`https://careager.s3.ap-south-1.amazonaws.com/partyStatemnts/${userDetail.name}.pdf`


                }
            ]

        };

        transporter.sendMail(mailToBusiness, (error, info) => {
            if (error) {
                console.log(error);
            }
            console.log('Message sent: %s', info);
        });
    },

    uploadToS3Estimate: async (body, booking, activity, preEstiamtePDF) => {
        var s3 = new aws.S3({
            accessKeyId: config.IAM_USER_KEY,
            secretAccessKey: config.IAM_USER_SECRET,
            Bucket: config.BUCKET_NAME
        });
        if (preEstiamtePDF != '') {
            var estimatParams = { Bucket: config.BUCKET_NAME + '/estimationPdfs', Key: preEstiamtePDF };
            s3.deleteObject(estimatParams, function (err, data) {
                if (err) console.log(err, err.stack);  // error
                else console.log("Deleted");                 // deleted
            });
        }
        filename = uuidv1()
        var params = {
            Body: body,
            ACL: 'public-read',
            Bucket: config.BUCKET_NAME + '/estimationPdfs',
            Key: filename + '.pdf',
            ContentType: "application/pdf"

        };


        await s3.upload(params, async function (err, response) {
            console.log(err, response);
            const updated_at = new Date();

            var data = {
                // 'estimate_url': "https://s3.ap-south-1.amazonaws.com/" + config.BUCKET_NAME + "/estimationPdfs/" + filename + ".pdf",
                'estimate_url': `${response.Location}`,
                created_at: new Date(),
                estimate_pdf: {
                    filename: filename + ".pdf",
                    url: "https://s3.ap-south-1.amazonaws.com/" + config.BUCKET_NAME + "/estimationPdfs/" + filename + ".pdf",
                    updated_at: updated_at,
                },
                updated_at: updated_at
            }

            await Booking.findOneAndUpdate({ _id: mongoose.Types.ObjectId(booking._id) }, { $set: data }, { new: true }, async function (err, doc) {

                if (err) {
                    // return console.log(err);
                }
                else {

                    // whatsAppEvent.estiamteSendWhatsapp(b, doc.business, doc.estimate_url);

                    if (activity == 'email') {
                        // sendEstimateMail(b, doc.business);
                        // return 'Abhi'
                        let title = booking.car.title
                        let due = doc.due.due;

                        let transporter = nodemailer.createTransport({
                            host: 'smtp.gmail.com',
                            port: 465,
                            secure: true,
                            auth: {
                                user: nodemailerConfig.careager_email,
                                pass: nodemailerConfig.careager_pass,
                            }
                        });
                        var url = doc.estimate_url;
                        let mailToBusiness = {
                            from: 'CarEager Xpress <' + nodemailerConfig.user + '>',
                            // to: doc.user.email,
                            to: 'abhinav@autroid.com',
                            subject: "[Estiamte]",
                            html: "<h3>The estimated amount for the service/repair of your  " + title + ' is ₹ ' + doc.payment.estimate_cost + '. Please approve to get the work started. </h3>',
                            attachments: [
                                {
                                    filename: `${title}.pdf`,
                                    path: `${url}`

                                    // path :`https://careager.s3.ap-south-1.amazonaws.com/partyStatemnts/${userDetail.name}.pdf`
                                }
                            ]

                        };

                        transporter.sendMail(mailToBusiness, (error, info) => {
                            if (error) {
                                //   console.log(error);
                            }
                            console.log('Message sent: %s', info);
                        });
                    }
                    if (activity == 'whatsapp') {
                        console.log("doneeee");
                        whatsAppEvent.estiamteSendWhatsapp(booking._id, doc.business);
                    }
                    // console.log(doc);
                }
            })

        });
    },

    /*
        uploadToS3Estimate: async (body, filename, b) => {
    
            var s3 = new aws.S3({
                accessKeyId: config.IAM_USER_KEY,
                secretAccessKey: config.IAM_USER_SECRET,
                Bucket: config.BUCKET_NAME
            });
    
            // filename = uuidv1()
            var params = {
                Body: body,
                ACL: 'public-read',
                Bucket: config.BUCKET_NAME + '/estimationPdfs',
                Key: filename + '.pdf',
                ContentType: "application/pdf"
    
            };
    
            await s3.upload(params, async function (err, response) {
                if (err) {
                    console.log(err);
                }
                else {
                    console.log(response.Location);;
                    var data = {
                        //'estimate_url': "https://s3.ap-south-1.amazonaws.com/" + config.BUCKET_NAME + "/estimationPdfs/" + filename + ".pdf",
                        'estimate_url': `${response.Location}`,
                        created_at: new Date(),
                        updated_at: new Date()
                    }
                    //console.log(data);
                    await Booking.findOneAndUpdate({ _id: mongoose.Types.ObjectId(b) }, { $set: data }, { new: true }, async function (err, doc) {
                        if (err) {
                            // return console.log(err);
                        }
                        else {
                            console.log("sss" + doc.estimate_url);
                            // console.log(doc);
                        }
                    })
    
                }
            });
    
        },
    */
    sendEstimateMail: async (b) => {
        var booking = await Booking.findOne({ _id: mongoose.Types.ObjectId(b) })
            .populate({ path: 'user', populate: { path: 'user', select: "_id id name contact_no email" } })
            .populate({ path: 'car', select: '_id id title registration_no fuel_type vin engine_no' })
            .exec();
        let title = booking.car.title;
        let due = booking.due.due;

        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: nodemailerConfig.careager_email,
                pass: nodemailerConfig.careager_pass
            }
        });

        var url = booking.estimate_url;
        // console.log("ss"+url);

        // console.log("Email"+party.email);


        let mailToBusiness = {
            from: 'CarEager Xpress <' + nodemailerConfig.careager_email + '>',
            to: booking.user.email,
            subject: "[Estiamte]",
            html: "<h3>The estimated amount for the service/repair of your  " + title + 'is ₹ ' + due + '. Please approve to get the work started. </h3>',
            attachments: [
                {
                    filename: `${title}.pdf`,
                    path: `${url}`

                    // path :`https://careager.s3.ap-south-1.amazonaws.com/partyStatemnts/${userDetail.name}.pdf`


                }
            ]

        };

        transporter.sendMail(mailToBusiness, (error, info) => {
            if (error) {
                //   console.log(error);
            }
            console.log('Message sent: %s', info);
        });
    },





    uploadToS3Parchi: async (body, filename, p) => {

        var s3 = new aws.S3({
            accessKeyId: config.IAM_USER_KEY,
            secretAccessKey: config.IAM_USER_SECRET,
            Bucket: config.BUCKET_NAME
        });


        var params = {
            Body: body,
            ACL: 'public-read',
            Bucket: config.BUCKET_NAME + '/eParchi',
            Key: filename + '.pdf',
            ContentType: "application/pdf"

        };

        s3.upload(params, function (err, response) {
            console.log(err, response);

            var data = {
                'parchi_url': "https://s3.ap-south-1.amazonaws.com/" + config.BUCKET_NAME + "/eParchi/" + filename + ".pdf",
                created_at: new Date(),
                updated_at: new Date()
            }

            Parchi.findOneAndUpdate({ _id: mongoose.Types.ObjectId(p) }, { $set: data }, function (err, doc) {

                if (err) {
                    return console.log(err);
                }
                else {
                    //console.log("sss"+doc._id);
                    // console.log(doc);
                }
            })

        });
    },
    sendParchiMail: async (id, businessId) => {
        var business = await User.findOne({ _id: mongoose.Types.ObjectId(businessId) }).exec();
        var parchi = await Parchi.findOne({ _id: mongoose.Types.ObjectId(id) })
            .populate({ path: 'user', select: 'name contact_no username email account_info business_info' })
            .exec();

        var due = parchi.payment.total.toLocaleString();
        var url = parchi.parchi_url;
        var caption = parchi.user.name;

        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: nodemailerConfig.autroid_email,
                pass: nodemailerConfig.autroid_pass,
            }
        });


        // console.log("ss"+url);

        // console.log("Email"+party.email);


        let mailToBusiness = {
            from: 'Autroid <' + nodemailerConfig.autroid_email + '>',
            to: parchi.user.email,
            subject: "[eParchi]",
            html: `<p style="font-size:1.5em">eParchi amounting to ₹${due} generated by ${business.name}.`,
            attachments: [
                {
                    filename: `${caption}.pdf`,
                    path: `${url}`

                    // path :`https://careager.s3.ap-south-1.amazonaws.com/partyStatemnts/${userDetail.name}.pdf`


                }
            ]

        };

        transporter.sendMail(mailToBusiness, (error, info) => {
            if (error) {
                console.log(error);
            }
            console.log('Message sent: %s', info);
        });
    },


    uploadToS3Payment: async (body, filename, p) => {

        console.log("sumit...");

        var s3 = new aws.S3({
            accessKeyId: config.IAM_USER_KEY,
            secretAccessKey: config.IAM_USER_SECRET,
            Bucket: config.BUCKET_NAME
        });


        var params = {
            Body: body,
            ACL: 'public-read',
            Bucket: config.BUCKET_NAME + '/PaymentReceipt',
            Key: filename + '_Payment_Receipt.pdf',
            ContentType: "application/pdf"

        };
        // console.log('ss');
        s3.upload(params, function (err, response) {
            console.log(err, response);

            var data = {
                'transaction_url': "https://s3.ap-south-1.amazonaws.com/" + config.BUCKET_NAME + "/PaymentReceipt/" + filename + "_Payment_Receipt.pdf",
                created_at: new Date(),
                updated_at: new Date()
            }

            TransactionLog.findOneAndUpdate({ _id: mongoose.Types.ObjectId(p) }, { $set: data }, function (err, doc) {

                if (err) {
                    return console.log(err);
                }
                else {
                    //console.log("sss"+doc._id);
                    // console.log(doc);
                }
            })

        });
    },
    uploadToS3PurchaseBill: async (body, filename, p) => {

        console.log("sumit...");

        var s3 = new aws.S3({
            accessKeyId: config.IAM_USER_KEY,
            secretAccessKey: config.IAM_USER_SECRET,
            Bucket: config.BUCKET_NAME
        });


        var params = {
            Body: body,
            ACL: 'public-read',
            Bucket: config.BUCKET_NAME + '/purchaseBills',
            Key: filename + '_Purchase_bill.pdf',
            ContentType: "application/pdf"

        };
        // console.log('ss');
        s3.upload(params, function (err, response) {
            console.log(err, response);

            var data = {
                'bill_url': "https://s3.ap-south-1.amazonaws.com/" + config.BUCKET_NAME + "/purchaseBills/" + filename + "_Purchase_bill.pdf",
                created_at: new Date(),
                updated_at: new Date()
            }

            Purchase.findOneAndUpdate({ _id: mongoose.Types.ObjectId(p) }, { $set: data }, function (err, doc) {

                if (err) {
                    return console.log(err);
                }
                else {
                    //console.log("sss"+doc._id);
                    // console.log(doc);
                }
            })

        });
    },

}















