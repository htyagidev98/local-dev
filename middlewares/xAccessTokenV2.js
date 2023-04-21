/*var config = require('./../config');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const AppVersion = require('../models/appVersion');
const async = require("async");
var secret = config.secret;
global.loggedInUser = null;
module.exports = {
	token: async function(req,res,next) {
	    var token = req.headers['x-access-token'];	
	    var device = req.headers['devicetype'];	
	    var version = req.headers['appversion'];
	    var currentVersion = await AppVersion.findOne({device:device, type:"force"}).sort({created_at:-1}).exec();
	    //return res.status(403).json({responseCode: 403, responseMessage: req.headers,responseData: req.headers});
	    if(device=="Android"){
	    	return res.status(406).json({responseCode: 406, responseMessage: "This App is outdated. Please update from Play Store now!",responseData: {}});
	    }else{
		    if(token) 
			{
			    if(currentVersion)
			    {

			    	if(currentVersion.version!=version)
			    	{
						return res.status(406).json({responseCode: 406, responseMessage: "This App is outdated. Please update from Play Store now!",responseData: {}});
					}
					else
					{
						
						jwt.verify(token, secret,async function(err, decoded) {
						  	if(err) {
						    	res.status(401).json({responseCode: 401, responseMessage: "Failed to authenticate token.",responseData: {}});
							}
							else{
							
								loggedInUser = decoded.user;
							}	
						});
					}
				}
			}
			else 
			{
				res.status(403).json({responseCode: 403, responseMessage: "Token Not Provided",responseData: {}});
			}
		}
	    next();
	}
};*/


var config = require('./../config');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const AppVersion = require('../models/appVersion');
const async = require("async");
var secret = config.secret;
global.loggedInUser = null;
module.exports = {
	token: async function(req,res,next) {
	    var token = req.headers['x-access-token'];		   
	    if(token) 
		{
			jwt.verify(token, secret,async function(err, decoded) {
			  	if(err) {
			    	res.status(401).json({responseCode: 401, responseMessage: "Failed to authenticate token.",responseData: {}});
				}
				else{
					loggedInUser = decoded.user;
				}	
			});
		}
		else 
		{
			res.status(403).json({responseCode: 403, responseMessage: "Session Expired! Login Again...",responseData: {}});
		}
	    next();
	}
};