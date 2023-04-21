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

    bookingMail: async function (u, b, b) {
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
            .populate({ path: 'car', select: '_id id title registration_no' })
            .exec();

        var services = [];
        booking.services.forEach(function (service) {
            services.push(service.service)
        });

        let mailToBusiness = {
            from: 'CarEager Xpress <tech@careager.com>',
            to: booking.business.email,
            subject: '[' + booking.status.toUpperCase() + '] New Service Booking No-' + booking.booking_no, // Subject line
            html: '<table><tr><td><h1 style="margin:0px">' + booking.user.name.toUpperCase() + '</h1></td></tr><tr><tr><td><p>' + services + '</p></td></tr><tr><th style="text-align: left">Name </td><td>' + booking.user.name + '</th></tr><tr><th style="text-align: left">Contact </th><td>' + booking.user.contact_no + '</td></tr><tr><th style="text-align: left">Car</th><td>' + booking.car.title + '</td></tr><tr><th style="text-align: left">Registration No </th><td>' + booking.car.registration_no + '</td></tr><tr><th style="text-align: left">Booking No </th><td>' + booking.booking_no + '</td></tr><tr><th style="text-align: left">Booking Date </th><td>' + booking.date + " " + booking.time_slot + '</td></tr><tr><th style="text-align: left">Total</th><td>' + booking.payment.paid_total + '</td></tr><tr><th style="text-align: left">Payment Status</th><td>' + booking.payment.transaction_response + '</td></tr></table>'
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
            subject: '[' + booking.status.toUpperCase() + '] New Service Booking No-' + booking.booking_no, // Subject line
            html: '<table><tr><td><h1>' + booking.business.name.toUpperCase() + '</h1></td></tr><tr><tr><td><p>' + services + '</p></td></tr><tr><th style="text-align: left">Contact </th><td>' + booking.business.contact_no + '</td></tr><tr><th style="text-align: left">Car</th><td>' + booking.car.title + '</td></tr><tr><th style="text-align: left">Registration No </th><td>' + booking.car.registration_no + '</td></tr><tr><th style="text-align: left">Booking No </th><td>' + booking.booking_no + '</td></tr><tr><th style="text-align: left">Booking Date </th><td>' + booking.date + ' ' + booking.time_slot + '</td></tr><tr><th style="text-align: left">Total</th><td>' + booking.payment.paid_total + '</td></tr><tr><th style="text-align: left">Payment Status</th><td>' + booking.payment.transaction_response + '</td></tr></table>'
        };


        transporter.sendMail(mailToUser, (error, info) => {
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
                user: 'tech@careager.com',
                pass: 'developers.tech@2018'
            }
        });

        var user = await User.findOne({ _id: u }).select('name email contact_no').exec();
        var booking = await Booking.findOne({ _id: b }).exec();

        let mail = {
            from: 'CarEager Xpress <tech@careager.com>',
            to: user.email,
            subject: '[' + booking.status.toUpperCase() + '] New Update For Booking No:' + booking.booking_no,
            html: 'Your Booking No:' + booking.booking_no + ' has been ' + booking.status
        };

        transporter.sendMail(mail, (error, info) => {
            if (error) {
                // console.log(error);
            }
            // console.log('Message sent: %s', info.messageId);
        });
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
            //<img src="https://maps.googleapis.com/maps/api/staticmap?zoom=13&size=300x300&maptype=roadmap&center='+d.geometry[1]+','+d.geometry[0]+'&key=AIzaSyDDMOrPW7GJbGqE9GqSra7p7zq6um0wf-M">
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
    }
};