const nodemailer = require('nodemailer');
const User = require('../../models/user');
const Booking = require('../../models/booking');
const Lead = require('../../models/lead');
const LeadStatus = require('../../models/leadStatus');
const LeadRemark = require('../../models/leadRemark');
const Review = require('../../models/review');
const Management = require('../../models/management');
const Country = require('../../models/country');
const moment = require('moment-timezone');
const DriverVerification = require('../../models/driverVerification');
const fun = require('../../api/v3.1/function');

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

        var message = encodeURIComponent("<#> Hello, Welcome to CarEager! Your OTP is " + user.otp + ". Do not share this code with anyone. - Victorious Managers' Group (Private) Limited IdmvCUdSy3l");

        var data = "username=" + username + "&hash=" + hash + "&numbers=" + number + "&sender=" + sender + "&message=" + message;
        request('http://api.textlocal.in/send/?' + data, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                // console.log(message)
            }
        })
    },

    otp: function (contact_no, otp) {
        var username = encodeURIComponent("avinay.vminc@gmail.com");
        var hash = encodeURIComponent("58fc07a01c2a0756a3abf1bb483314af8503efdf");
        var number = encodeURIComponent("91" + contact_no);
        var sender = encodeURIComponent("VMCARS");
        var message = encodeURIComponent("<#> Hello, Welcome to CarEager! Your OTP is " + otp + ". Do not share this code with anyone. - Victorious Managers' Group (Private) Limited IdmvCUdSy3l");

        var data = "username=" + username + "&hash=" + hash + "&numbers=" + number + "&sender=" + sender + "&message=" + message;
        request('http://api.textlocal.in/send/?' + data, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                // console.log(message)
            }
            // console.log(response)
        })
        // console.log(message)
    },

    bookingMail: async function (b) {
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: 'care@careager.com',
                pass: 'care@gurgaon'
            }
        });

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


        if (booking.is_services == true) {
            let mailToBusiness = {
                from: 'CarEager Xpress <care@careager.com>',
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

            if (booking.advisor) {
                let mailToAdvisor = {
                    from: 'CarEager Xpress <care@careager.com>',
                    to: booking.advisor.email,
                    subject: '[Lead Booking] ' + booking.user.name + ' - ID # ' + booking.booking_no, // Subject line
                    html: '<h3 style="margin-top:5px; margin-bottom: 2px">' + booking.user.name + '</h3><h4 style="margin:2px 0;">' + booking.user.email + '</h4><h4>' + booking.user.contact_no + '</h4>'
                };

                transporter.sendMail(mailToAdvisor, (error, info) => {
                    if (error) {
                        // console.log(error);
                    }
                    // console.log('Message sent: %s', info.messageId);
                });
            }


            let mailToUser = {
                from: 'CarEager Xpress <care@careager.com>',
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
                from: 'CarEager Xpress <care@careager.com>',
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
                from: 'CarEager Xpress <care@careager.com>',
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

    assignedBookingMail: async function (b) {
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: 'care@careager.com',
                pass: 'care@gurgaon'
            }
        });

        var booking = await Booking.findOne({ _id: b })
            .populate({ path: 'user', populate: { path: 'user', select: "_id id name contact_no email" } })
            .populate({ path: 'business', populate: { path: 'user', select: "_id id name contact_no email" } })
            .populate({ path: 'advisor', populate: { path: 'user', select: "_id id name contact_no email" } })
            .populate({ path: 'car', select: '_id id title registration_no fuel_type' })
            .exec();

        let mailToBusiness = {
            from: 'CarEager Xpress <care@careager.com>',
            to: booking.business.email,
            subject: '[Lead Booking] ' + booking.user.name + ' - ID # ' + booking.booking_no, // Subject line
            html: '<h4 style="margin-top:5px; margin-bottom: 2px">Customer Name: ' + booking.user.name + '</h4><h4 style="margin:2px 0;">Customer Email: ' + booking.user.email + '</h4><h4>Customer No.:' + booking.user.contact_no + '</h4>'
        };

        transporter.sendMail(mailToBusiness, (error, info) => {
            if (error) {
                // console.log(error);
            }
        });


        if (booking.advisor) {
            let mailToAdvisor = {
                from: 'CarEager Xpress <care@careager.com>',
                to: booking.advisor.email,
                subject: '[Lead Booking] ' + booking.user.name + ' - ID # ' + booking.booking_no, // Subject line
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

    estimateMail: async function (b) {
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: 'care@careager.com',
                pass: 'care@gurgaon'
            }
        });

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


        let mailToBusiness = {
            from: 'CarEager Xpress <care@careager.com>',
            to: booking.user.email,
            subject: '[Estimate] BOOKING- ID # ' + booking.booking_no, // Subject line
            html: '<h2 style="margin:5px 0;">' + booking.business.name.toUpperCase() + '</h2><h3 style="margin:2px 0;">' + moment(booking.date).format('ll') + ' (' + booking.time_slot + ')</h3><h3 style="margin:2px 0;">Advisor: ' + booking.advisor.name + ' (' + booking.advisor.contact_no + ')</h3><p style="margin:3px 0">18/1, NH8, Sector 35, Gurugram, Haryana 122004</p> <p style="margin:3px 0">Behind Grace Toyota (Near Mercedes-Benz), 1800 843 4300</p> <p style="margin:3px 0"><a href="https://goo.gl/maps/m5SuCHXndx62">https://goo.gl/maps/m5SuCHXndx62</a></p><table><tr><td><h4 style="margin-top:10px; margin-bottom: 2px">' + booking.car.title + '(' + booking.car.fuel_type + ')</h4></td></tr><tr><td style="text-align: left">Registration # ' + booking.car.registration_no + '</td></tr><tr><td style="margin-top:10px;">How to check the detailed estimate? </td></tr> <tr><td>1. Log into the "CarEager Xpress" App using "' + booking.user.contact_no + '"</td></tr></table><p style="margin:5px 0"><p style="margin:3px 0">- Android: <a href="https://goo.gl/fU5Upb">https://goo.gl/fU5Upb</a></td></tr> <tr><td>- iOS App: Available on the App Store</td></tr><tr><td>2. Go to the "Bookings" section</td></tr><tr><td>3. Check and "Approve" the estimate</td></tr></table>'
        };

        transporter.sendMail(mailToBusiness, (error, info) => {
            if (error) {
                // console.log(error);
            }
            // console.log('Message sent: %s', info.messageId);
        });
    },


    bookingStatusMail: async function (u, b) {
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: 'care@careager.com',
                pass: 'care@gurgaon'
            }
        });


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

        if (booking.status == "Cancelled" || booking.status == "Confirmed") {
            let mailToBusiness = {
                from: 'CarEager Xpress <care@careager.com>',
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
                    from: 'CarEager Xpress <care@careager.com>',
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
                from: 'CarEager Xpress <care@careager.com>',
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
                user: 'care@careager.com',
                pass: 'care@gurgaon'
            }
        });


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

        if (t == "user") {
            let mailToBusiness = {
                from: 'CarEager Xpress <care@careager.com>',
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
                    from: 'CarEager Xpress <care@careager.com>',
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
                from: 'CarEager Xpress <care@careager.com>',
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
                user: 'care@careager.com',
                pass: 'care@gurgaon'
            }
        });

        var user = await User.findOne({ _id: d.user }).select('name email contact_no').exec();
        var assignee = await User.findOne({ _id: d.assignee }).select('name email contact_no').exec();

        let mail = {
            from: 'CarEager Xpress <care@careager.com>',
            to: assignee.email,
            subject: '[URGENT] Roadside Assistance - Claim Intimation Request - ' + moment(d.created_at).tz(tz).format('lll'),
            html: '<table><tr><th style="text-align: left">Customer Name </td><td>' + user.name + '</th></tr><tr><th style="text-align: left">Customer Contact No. </th><td>' + user.contact_no + '</td></tr><tr><th>Request Time </th><td>' + moment(d.created_at).tz(tz).format('lll') + '</td></tr><tr><td><a target="_blank" href="http://maps.google.com/maps?z=12&t=m&q=loc:' + d.geometry[1] + '+' + d.geometry[0] + '">Click For Location</a></td></tr></table>'
        };

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
                user: 'care@careager.com',
                pass: 'care@gurgaon'
            }
        });

        var user = await User.findOne({ _id: d.user }).select('name email contact_no').exec();

        let mail = {
            from: 'CarEager Xpress <care@careager.com>',
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

    zohoEnding: async function (l) {
        var booking = await Booking.findOne({ _id: l })
            .populate({ path: 'user', populate: { path: 'user', select: "_id id name contact_no email" } })
            .populate({ path: 'business', populate: { path: 'user', select: "_id id name contact_no email" } })
            .populate({ path: 'car', select: '_id id title registration_no fuel_type' })
            .exec();

        var status = await LeadStatus.findOne({ status: booking.status }).exec()

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
                    color_code: "#4CAF50",
                    created_at: new Date(),
                    updated_at: new Date()
                },
                follow_up: follow_up
            };

            Lead.findOneAndUpdate({ _id: booking.lead }, { $set: data }, { new: true }, async function (err, doc) {
                data.remark.lead = booking.lead;
                data.created_at = new Date();
                LeadRemark.create(data.remark)

            });
        }
        else {
            var manager = null;
            var managers = [];
            await Management.find({ business: booking.business, role: "CRE" })
                .cursor().eachAsync(async (a) => {
                    var d = await Lead.find({ business: booking.business, manager: a.user }).count().exec();
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
                color_code: "#4CAF50",
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
                    color_code: "#4CAF50",
                    created_at: new Date(),
                    updated_at: new Date()
                });

                Booking.findOneAndUpdate({ _id: booking._id }, { $set: { lead: l._id, manager: manager._id } }, { new: true }, async function (err, doc) { });
            });
        }
    },


    zohoCustomStatus: async function (l, status) {
        var booking = await Booking.findOne({ _id: l })
            .populate({ path: 'user', populate: { path: 'user', select: "_id id name contact_no email" } })
            .populate({ path: 'business', populate: { path: 'user', select: "_id id name contact_no email" } })
            .populate({ path: 'car', select: '_id id title registration_no fuel_type' })
            .exec();

        var customer_remark = "";
        var status = await LeadStatus.findOne({ status: status }).exec()

        if (status.status == "Dissatisfied") {
            var review = await Review.findOne({ booking: l }).exec();
            customer_remark = review.review_points.toString() + ", " + review.review;
        }

        if (booking.lead) {
            var follow_up = {};
            var data = {
                updated_at: new Date(),
                remark: {
                    status: status.status,
                    assignee_remark: "",
                    customer_remark: customer_remark,
                    color_code: status.color_code,
                    created_at: new Date(),
                    updated_at: new Date()
                },
                follow_up: follow_up
            };

            Lead.findOneAndUpdate({ _id: booking.lead }, { $set: data }, { new: true }, async function (err, doc) {
                LeadRemark.create({
                    lead: booking.lead,
                    status: status.status,
                    assignee_remark: "",
                    customer_remark: customer_remark,
                    color_code: status.color_code,
                    created_at: new Date(),
                    updated_at: new Date()
                });


            });
        }
        else {
            var manager = null;
            var managers = [];
            await Management.find({ business: booking.business, role: "CRE" })
                .cursor().eachAsync(async (a) => {
                    var d = await Lead.find({ business: booking.business, manager: a.user }).count().exec();
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
            var follow_up = {};
            lead.user = booking.user._id;
            lead.business = booking.business._id;
            lead.name = booking.user.name
            lead.contact_no = booking.user.contact_no;
            lead.email = booking.user.email;
            lead.assignee = manager;
            lead.remark = {
                status: status.status,
                assignee_remark: "",
                customer_remark: customer_remark,
                color_code: status.color_code,
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
                    status: status.status,
                    assignee_remark: "",
                    customer_remark: customer_remark,
                    color_code: status.color_code,
                    created_at: new Date(),
                    updated_at: new Date()
                });

                Booking.findOneAndUpdate({ _id: booking._id }, { $set: { lead: l._id, manager: manager } }, { new: true }, async function (err, doc) { });
            });
        }
    },

    zohoLead: async function (l) {

        var booking = await Booking.findOne({ _id: l })
            .populate({ path: 'user', populate: { path: 'user', select: "_id id name contact_no email" } })
            .populate({ path: 'business', populate: { path: 'user', select: "_id id name contact_no email" } })
            .populate({ path: 'car', select: '_id id title registration_no fuel_type' })
            .exec();

        var status = await LeadStatus.findOne({ status: booking.status }).exec()

        if (booking.lead) {
            // console.log(booking)
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
                    status: booking.status,
                    assignee_remark: "",
                    customer_remark: "",
                    color_code: "#4CAF50",
                    created_at: new Date(),
                    updated_at: new Date()
                },
                follow_up: follow_up
            };

            // console.log(data)

            Lead.findOneAndUpdate({ _id: booking.lead }, { $set: data }, { new: true }, async function (err, doc) {
                data.remark.lead = booking.lead;
                data.created_at = new Date();
                LeadRemark.create(data.remark)

            });
        }
        else {
            var manager = null;
            var managers = [];
            await Management.find({ business: booking.business, role: "CRE" })
                .cursor().eachAsync(async (a) => {
                    var d = await Lead.find({ business: booking.business, manager: a.user }).count().exec();
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
                color_code: "#4CAF50",
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
                    color_code: "#4CAF50",
                    created_at: new Date(),
                    updated_at: new Date()
                });

                Booking.findOneAndUpdate({ _id: booking._id }, { $set: { lead: l._id, manager: manager._id } }, { new: true }, async function (err, doc) { });
            });
        }
    },
};