var config = require('./../config');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const AppVersion = require('../models/appVersion');
const async = require("async");
var secret = config.secret;
global.loggedInUser = null;
module.exports = {
	token: async function(req,res,next) {
		let token = req.headers['x-access-token'] // Express headers are auto converted to lowercase
		let deviceId = req.headers['deviceid'];	
		if (token) 
		{
		    jwt.verify(token, config.secret, (err, decoded) => {
		      	if(err){
		        	return res.status(403).json({responseCode: 403, responseMessage: "Failed to authenticate token.",responseData: {}});
		      	} 
		      	else {
					new Promise((resolve, reject) => {
				       	User.findOne({_id: decoded.user, 'device.deviceId': deviceId,'device.token': token }).then(function (authenticate) {
				       		if(authenticate)
				       		{
				       			User.findOneAndUpdate({_id: decoded.user}, {$set:{updated_at: new Date()}},{new: true}, async function(err, doc){});
								loggedInUser = decoded.user;
				        		next();
							}
				        	else
				        	{
						    	return res.status(401).json({responseCode: 401, responseMessage: "Session Expired! Login Again...",responseData: {}});
							}
				    	})
				    })
		      	}
		    });
		} 
	 	else {
	    	return res.status(403).json({responseCode: 403, responseMessage: "Failed to authenticate token.",responseData: {}});
		}
	}

};