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
					loggedInUser = decoded.user;
	        		next();
		      	}
		    });
		} 
	 	else {
	    	return res.status(403).json({responseCode: 403, responseMessage: "Failed to authenticate token.",responseData: {}});
		}
	}

};