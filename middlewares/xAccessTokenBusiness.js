var config = require('./../config');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const AppVersion = require('../models/appVersion');
const Management = require('../models/management');

const async = require("async");
const secret = config.secret;
global.loggedInUser = null;
module.exports = {
	token: async function (req, res, next) {
		let token = req.headers['x-access-token'];
		let deviceId = req.headers['deviceid'];

		if (token && deviceId) {
			jwt.verify(token, config.secret, (err, decoded) => {
				if (err) {

					return res.status(403).json({ responseCode: 403, responseMessage: "Failed to authenticate token.", responseData: {} });
					// console.log("Abhinav Tyagi ")
				}
				else {
					new Promise(async (resolve, reject) => {
						var authenticate = await User.findOne({ _id: decoded.user, device: { $elemMatch: { token: token, deviceId: deviceId } } })
						if (authenticate) {
							User.findOneAndUpdate({ _id: decoded.user }, { $set: { updated_at: new Date() } }, { new: true }, async function (err, doc) { });

							Management.find({ user: decoded.user, business: req.headers['business'] }).then(function (management) {
								if (management) {
									loggedInUser = decoded.user;
									req.user = decoded.user;
									next();
								}
								else {
									return res.status(403).json({ responseCode: 403, responseMessage: "Unauthorized", responseData: {} });
								}
							});
						}
						else {
							return res.status(403).json({ responseCode: 403, responseMessage: "Session Expired! Login Again...", responseData: {} });
						}
					})
				}
			});
		}
		else {
			return res.status(403).json({ responseCode: 403, responseMessage: "Failed to authenticate token.", responseData: {} });
		}
	}
};