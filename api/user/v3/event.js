const nodemailer = require('nodemailer');

const User = require('../../models/user');
const Booking = require('../../models/booking');
const moment = require('moment-timezone');


module.exports = {
    registrationSms: function (user) {
        var username = encodeURIComponent("avinay.vminc@gmail.com");
        var hash = encodeURIComponent("58fc07a01c2a0756a3abf1bb483314af8503efdf");
        var number = encodeURIComponent("91" + user.contact_no);
        var sender = encodeURIComponent("VMCARS");
        var message = encodeURIComponent("Congratulations! Your Business - " + user.name + " is now online. Show your business to the world using your web address - http://www.careager.com/" + user.username);

        var data = "username=" + username + "&hash=" + hash + "&numbers=" + number + "&sender=" + sender + "&message=" + message;
        request('http://api.textlocal.in/send/?' + data, function (error, response, body) {
            if (!error && response.statusCode == 200) {
            }
        })
        // console.log(message)
    },

    otpSms: function (user) {
        var username = encodeURIComponent("avinay.vminc@gmail.com");
        var hash = encodeURIComponent("58fc07a01c2a0756a3abf1bb483314af8503efdf");
        var number = encodeURIComponent("91" + user.contact_no);
        var sender = encodeURIComponent("VMCARS");

        var message = encodeURIComponent("Hello, Welcome to CarEager! Your verification code (OTP) is " + user.otp + ". Do not share this code with anyone. - Victorious Managers' Group (Private) Limited");

        var data = "username=" + username + "&hash=" + hash + "&numbers=" + number + "&sender=" + sender + "&message=" + message;
        request('http://api.textlocal.in/send/?' + data, function (error, response, body) {
            if (!error && response.statusCode == 200) {
            }
        })
        // console.log(message)
    },

    otp: function (contact_no, otp) {
        var username = encodeURIComponent("avinay.vminc@gmail.com");
        var hash = encodeURIComponent("58fc07a01c2a0756a3abf1bb483314af8503efdf");
        var number = encodeURIComponent("91" + contact_no);
        var sender = encodeURIComponent("VMCARS");
        var message = encodeURIComponent("Hello, Welcome to CarEager! Your verification code (OTP) is " + otp + ". Do not share this code with anyone. - Victorious Managers' Group (Private) Limited");

        var data = "username=" + username + "&hash=" + hash + "&numbers=" + number + "&sender=" + sender + "&message=" + message;
        request('http://api.textlocal.in/send/?' + data, function (error, response, body) {
            if (!error && response.statusCode == 200) {
            }
        })
        // console.log(message)
    },

    bookingMail: async function (u, b, b, is_services) {
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: 'tech@careager.com',
                pass: 'developers.tech@2018'
            }
        });

        var booking = await Booking.findOne({ _id: b })
            .populate({ path: 'user', populate: { path: 'user', select: "_id id name contact_no email" } })
            .populate({ path: 'business', populate: { path: 'user', select: "_id id name contact_no email" } })
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


        if (is_services == true) {
            let mailToBusiness = {
                from: 'CarEager Xpress <tech@careager.com>',
                to: booking.business.email,
                subject: '[New Service] ' + booking.user.name + ' - ID # ' + booking.booking_no, // Subject line
                html: '<h3 style="margin-top:5px; margin-bottom: 2px">' + booking.car.title + '(' + booking.car.fuel_type + ')</h3><h4 style="margin:2px 0;">' + moment(booking.date).format('ll') + ' (' + booking.time_slot + ')</h4> <h4>' + services + '</h4><table><tr><th style="text-align: left">Contact:</th><td>' + booking.user.contact_no + '</td></tr><tr><th style="text-align: left">Registration #</th><td>' + booking.car.registration_no + '</td><tr><th style="text-align: left">Booking No </th><td>' + booking.booking_no + '</td></tr><tr><th style="text-align: left">Service Value</th><td>' + booking.payment.total + '</td></tr><tr><th style="text-align: left">Amount Paid</th><td>' + booking.payment.paid_total + '</td></tr><tr><th style="text-align: left">Discount</th><td>' + booking.payment.discount_type + '</td></tr><tr><th style="text-align: left">Coupon Discount</th><td>' + booking.payment.discount_total + '</td></tr></table>'
            };

            transporter.sendMail(mailToBusiness, (error, info) => {
                if (error) {
                    // console.log(error);
                }
                // console.log('Message sent: %s', info.messageId);
            });


            let mailToUser = {
                from: 'CarEager Xpress <tech@careager.com>',
                to: booking.user.email,
                subject: '[New Service] Booking No-# ' + booking.booking_no, // Subject line
                html: '<h2 style="margin:5px 0;">' + booking.business.name.toUpperCase() + '</h2><h3 style="margin:2px 0;">' + moment(booking.date).format('ll') + ' (' + booking.time_slot + ')</h3> <h4>' + services + '</h4><p style="margin:3px 0">18/1, NH8, Sector 35, Gurugram, Haryana 122004</p> <p style="margin:3px 0">Behind Grace Toyota (Near Mercedes-Benz), 1800 843 4300</p> <p style="margin:3px 0"><a href="https://goo.gl/maps/m5SuCHXndx62">https://goo.gl/maps/m5SuCHXndx62</a></p><table><tr><td><h4 style="margin-top:5px; margin-bottom: 2px">' + booking.car.title + '(' + booking.car.fuel_type + ')</h4></td></tr><tr><th style="text-align: left">Registration #</th><td>' + booking.car.registration_no + '</td></tr><tr><th style="text-align: left">Booking No </th><td>' + booking.booking_no + '</td></tr><tr><th style="text-align: left">Service Value</th><td>' + booking.payment.total + '</td></tr><tr><th style="text-align: left">Amount Paid</th><td>' + booking.payment.paid_total + '</td></tr><tr><th style="text-align: left">Discount</th><td>' + booking.payment.discount_type + '</td></tr><tr><th style="text-align: left">Coupon Discount</th><td>' + booking.payment.discount_total + '</td></tr></table> <p style="margin:15px 0"><p style="margin:3px 0">- Android: <a href="https://goo.gl/fU5Upb">https://goo.gl/fU5Upb</a></p> <p style="margin:3px 0">- iOS App: Available on the App Store</p></p>'
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
                from: 'CarEager Xpress <tech@careager.com>',
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
                from: 'CarEager Xpress <tech@careager.com>',
                to: booking.user.email,
                subject: '[New Package] Purchase ID #' + booking.booking_no, // Subject line // Subject line
                html: '<h2 style="margin:5px 0;">' + booking.business.name.toUpperCase() + '</h2><p style="margin:3px 0">Location: 18/1, NH8, Sector 35, Gurugram, Haryana 122004</p> <p style="margin:3px 0">Behind Grace Toyota (Near Mercedes-Benz), 1800 843 4300</p> <p style="margin:3px 0"><a href="https://goo.gl/maps/m5SuCHXndx62">https://goo.gl/maps/m5SuCHXndx62</a></p><p style="margin:15px 0"> <p style="margin:3px 0">How to use this package?</p> <p style="margin:2px 0">Please choose a suitable date/time & book service using CarEager Xpress App<p style="margin:3px 0">- Android: <a href="https://goo.gl/fU5Upb">https://goo.gl/fU5Upb</a></p> <p style="margin:3px 0">- iOS App: Available on the App Store</p> </p><table><tr><td><h4 style="margin-top:5px; margin-bottom: 2px">' + booking.car.title + '(' + booking.car.fuel_type + ')</h4></td></tr><tr><th style="text-align: left">Registration #</th><td>' + booking.car.registration_no + '</td></tr><tr><th style="text-align: left">Booking No </th><td>' + booking.booking_no + '</td></tr><tr><th style="text-align: left">Package Value</th><td>' + booking.payment.total + '</td></tr><tr><th style="text-align: left">Amount Paid</th><td>' + booking.payment.paid_total + '</td></tr><tr><th style="text-align: left">Discount</th><td>' + booking.payment.discount_type + '</td></tr><tr><th style="text-align: left">Coupon Discount</th><td>' + booking.payment.discount_total + '</td></tr></table>'


            };


            transporter.sendMail(mailToUser, (error, info) => {
                if (error) {
                    // console.log(error);
                }
                // console.log('Message sent: %s', info.messageId);
            });
        }
    },

    bookingStatusMail: async function (u, b) {
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: 'tech@careager.com',
                pass: 'developers.tech@2018'
            }
        });


        var booking = await Booking.findOne({ _id: b })
            .populate({ path: 'user', populate: { path: 'user', select: "_id id name contact_no email" } })
            .populate({ path: 'business', populate: { path: 'user', select: "_id id name contact_no email" } })
            .populate({ path: 'car', select: '_id id title registration_no fuel_type' })
            .exec();

        var services = [];
        booking.services.forEach(function (service) {
            services.push(service.service)
        });

        if (req.body.status == "Cancelled") {
            let mailToBusiness = {
                from: 'CarEager Xpress <tech@careager.com>',
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
        }
        else if (req.body.status == "Confirmed" || req.body.status == "Completed" || req.body.status == "Rejected") {
            let mailToUser = {
                from: 'CarEager Xpress <tech@careager.com>',
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
    },

    rescheduleMail: async function (b, t) {
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: 'tech@careager.com',
                pass: 'developers.tech@2018'
            }
        });


        var booking = await Booking.findOne({ _id: b })
            .populate({ path: 'user', populate: { path: 'user', select: "_id id name contact_no email" } })
            .populate({ path: 'business', populate: { path: 'user', select: "_id id name contact_no email" } })
            .populate({ path: 'car', select: '_id id title registration_no fuel_type' })
            .exec();

        var services = [];
        booking.services.forEach(function (service) {
            services.push(service.service)
        });

        if (t == "user") {
            let mailToBusiness = {
                from: 'CarEager Xpress <tech@careager.com>',
                to: booking.business.email,
                subject: '[RESCHEDULE] Booking No- #' + booking.booking_no, // Subject line
                html: '<h3 style="margin-top:5px; margin-bottom: 2px">' + booking.car.title + '(' + booking.car.fuel_type + ')</h3><h4 style="margin:2px 0;">' + moment(booking.date).format('ll') + ' (' + booking.time_slot + ')</h4> <h4>' + services + '</h4><table><tr><th style="text-align: left">Contact:</th><td>' + booking.user.contact_no + '</td></tr><tr><th style="text-align: left">Registration #</th><td>' + booking.car.registration_no + '</td><tr><th style="text-align: left">Booking No </th><td>' + booking.booking_no + '</td></tr><tr><th style="text-align: left">Service Value</th><td>' + booking.payment.total + '</td></tr><tr><th style="text-align: left">Amount Paid</th><td>' + booking.payment.paid_total + '</td></tr><tr><th style="text-align: left">Discount</th><td>' + booking.payment.discount_type + '</td></tr><tr><th style="text-align: left">Coupon Discount</th><td>' + booking.payment.discount_total + '</td></tr></table>'
            };

            transporter.sendMail(mailToBusiness, (error, info) => {
                if (error) {
                    // console.log(error);
                }
                // console.log('Message sent: %s', info.messageId);
            });
        }
        else {
            let mailToUser = {
                from: 'CarEager Xpress <tech@careager.com>',
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
    },

    assistance: async function (d, tz) {
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: 'tech@careager.com',
                pass: 'developers.tech@2018'
            }
        });

        var user = await User.findOne({ _id: d.user }).select('name email contact_no').exec();

        let mail = {
            from: 'CarEager Xpress <tech@careager.com>',
            to: 'care@careager.com',
            subject: '[URGENT] Roadside Assistance - Claim Intimation Request - ' + moment(d.created_at).tz(tz).format('lll'),
            html: '<table><tr><th style="text-align: left">Customer Name </td><td>' + user.name + '</th></tr><tr><th style="text-align: left">Customer Contact No. </th><td>' + user.contact_no + '</td></tr><tr><th>Request Time </th><td>' + moment(d.created_at).tz(tz).format('lll') + '</td></tr><tr><td><a target="_blank" href="http://maps.google.com/maps?z=12&t=m&q=loc:' + d.geometry[1] + '+' + d.geometry[0] + '">Click For Location</a></td></tr></table>'
        };

        // console.log(d)

        transporter.sendMail(mail, (error, info) => {
            if (error) {
                // console.log(error);
            }
            // console.log('Message sent: %s', info.messageId);
        });
    },

    callbackRequest: async function (d, tz) {
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: 'tech@careager.com',
                pass: 'developers.tech@2018'
            }
        });

        var user = await User.findOne({ _id: d.user }).select('name email contact_no').exec();

        let mail = {
            from: 'CarEager Xpress <tech@careager.com>',
            to: 'care@careager.com',
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


    zohoLead: async function (l) {
        var headers = {
            'Origin': 'https://accounts.zoho.com',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36',
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
            'Accept': '*/*',
            'Referer': 'https://accounts.zoho.com/developerconsole',
            'Connection': 'keep-alive',
            'Cookie': 'zohocares-_zldt=9205e910-b828-4ce4-80e2-ff3b1f76b2e6; 90643b459b1adf9d5c8ba650d8418fb905f989e389e690323db70e8258ee79a1b38c0fc203bea6c01c22393458f46948__zldt=9205e910-b828-4ce4-80e2-ff3b1f76b2e6; zohocares-_zldp=YfEOFpfOAG%2FoDGvUkc64X%2B9TIz5cNhrb7T36hXTTlqoNbcu8Qsj16SJiQ9EXPYhx; 90643b459b1adf9d5c8ba650d8418fb905f989e389e690323db70e8258ee79a1b38c0fc203bea6c01c22393458f46948__zldp=YfEOFpfOAG%2FoDGvUkc64X%2B9TIz5cNhrb7T36hXTTlqoNbcu8Qsj16SJiQ9EXPYhx; _iamadt=135fd4495b6dcc7ee77cf2b7db452d490a2d5ba84b5be8f6d0807f5ee9e3079cbede50629d8ae1a18da6589cd816e699a06d78e840f8e488dfb90a2da06e12b3; _iambdt=a103f7d045f0d8bb33db35699d2846b202894e81c864d3ca4a08f68fbd269b4d754f16249139ea9b6ec9e2143c7007fb0193ab1d0bd43277ef0e29bd95967062; _imtrem=2592000; _z_identity=true; zabUserId=1547293700738zabu0.9465932242746484; zabBucket=%7B%227541b0cbf8564af3adb98b32e4bd61cb%22%3A%226123187f015449c28c22168942a3ef40%22%7D; a8c61fa0dc=412d04ceb86ecaf57aa7a1d4903c681d; iamcsr=4440791d0f25fcf5d5cd839ac05dc323cdeb69d1d49d9d7ead6318f4a0edad1c979b7beb0a0d074a9e4e77d716e054b292bf015b531342d6566d893964f3aed6; JSESSIONID=60FD0237EA74EACED2A4C90BF587465F; ZohoMarkRef=https://www.zoho.com/crm/help/api/v2/; ZohoMarkSrc=direct:crm|direct:crm|direct:crm; com_chat_owner=1547381034766'
        };

        var dataString = 'approvedScope=ZohoCRM.modules.leads.ALL,ZohoCRM.modules.deals.ALL,ZohoCRM.settings.ALL&scope=ZohoCRM.modules.leads.ALL,ZohoCRM.modules.deals.ALL,ZohoCRM.settings.ALL&expiry=2&client_id=1000.IPR5ZZCJU6FO64939WJ2NBAKC2J77J&redirect_uri=https%3A%2F%2Fwww.careager.com%2Fredirect%2Fzoho%2Fcallback&state=state&response_type=code&access_type=offline&iamcsrcoo=4440791d0f25fcf5d5cd839ac05dc323cdeb69d1d49d9d7ead6318f4a0edad1c979b7beb0a0d074a9e4e77d716e054b292bf015b531342d6566d893964f3aed6';

        var options = {
            url: 'https://accounts.zoho.com/oauth/v2/self/token/generate',
            method: 'POST',
            headers: headers,
            body: dataString
        };

        function callback(error, response, body) {
            if (!error && response.statusCode == 200) {

                var res1 = JSON.parse(body)
                var options = {
                    method: 'POST',
                    url: 'https://accounts.zoho.com/oauth/v2/token',
                    headers:
                    {
                        'cache-control': 'no-cache',
                        'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW'
                    },
                    formData:
                    {
                        client_id: '1000.IPR5ZZCJU6FO64939WJ2NBAKC2J77J',
                        client_secret: 'e28a1fae2f28b5dcc0eb8618b9a0d93fd3ad220b38',
                        redirect_uri: 'https://www.careager.com/redirect/zoho/callback',
                        code: res1.code,
                        grant_type: 'authorization_code'
                    }
                };

                request(options, function (error, response, body) {
                    if (error) throw new Error(error);

                    var res2 = JSON.parse(body);

                    var firstName = l.name.split(' ').slice(0, -1).join(' ');
                    var lastName = l.name.split(' ').slice(-1).join(' ');
                    if (lastName == "") {
                        lastName = "n/a"
                    }

                    var options = {
                        method: 'POST',
                        url: 'https://www.zohoapis.com/crm/v2/Leads',
                        headers:
                        {
                            'cache-control': 'no-cache',
                            'Content-Type': 'application/json',
                            Authorization: 'Zoho-oauthtoken ' + res2.access_token
                        },
                        body: {
                            data: [
                                {
                                    Last_Name: lastName,
                                    Email: l.email,
                                    Description: l.remark.remark,
                                    First_Name: firstName,
                                    Lead_Status: 'Attempted to Contact',
                                    Salutation: 'Mr.',
                                    Phone: l.contact_no,
                                    Mobile: l.contact_no,
                                    Lead_Source: l.type,
                                }
                            ]
                        },
                        json: true
                    };

                    request(options, function (error, response, body) {
                        if (error) throw new Error(error);
                        // console.log(body.data[0].details);
                    });
                });
            }
        }

        request(options, callback);
    }
};