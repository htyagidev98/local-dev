var upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'careager/cover',
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    // contentDisposition: 'attachment',
    key: async function (req, file, cb) {

        // let extArray = file.mimetype.split("/");
        // let extension = extArray[extArray.length - 1];

        cb(null, file);
        
        /*if(extension == 'png' || extension == 'jpg' || extension == 'jpeg' || extension == 'gif'){
            let extArray = file.mimetype.split("/");
            let extension = extArray[extArray.length - 1];

            var token = req.headers['x-access-token'];
            var secret = config.secret;
            var decoded = jwt.verify(token, secret);

            var otp = Math.floor(Math.random() * 90000) + 10000;

            req.body.socialite = "";
            req.body.optional_info = "";
            var country = await Country.findOne({_id:req.body.country}).exec();

            req.body.account_info = {
                type : "business",
                status : "Active", 
                phone_verified : false, 
                verified_account : false, 
                approved_by_admin : false,
            };

            req.body.geometry = [req.body.longitude,req.body.latitude];

            if(country != 0){
                req.body.address = {
                    country:req.body.country,
                    timezone:country.timezone[0],
                    location:req.body.location,
                };
            }

            req.body.device = [];
            req.body.otp = otp;
            req.body.password = 'd9c74d40-277e-11e8-b678-c3524dc0bf87';
            req.body.added_by = decoded.user;

            var filename = uuidv1() + '.' +extension;

            cb(null, file);

            req.body.cover = filename;

            req.body.created_at = new Date();
            req.body.updated_at = new Date();

            req.body.business_info = {
              business_category:req.body.business_category
            };

            User.create(req.body).then(function (user) {
                const payload = {
                    user: user['_id']
                };
                var days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                
                for (var i = 0; i < 7; i++){
                    var timing = new BusinessTiming({
                        business: user._id,
                        day: days[i],
                        open: '09:30 AM',
                        close: '03:30 PM',
                        is_closed: 0,
                        created_at: new Date(),
                        updated_at: new Date(),
                    });
                    timing.save();
                }

                Type.find({}).then(function (BT){
                    BT.forEach(function (u) {
                        var businessType = new BusinessType({
                            business: user._id,
                            business_type: u._id,
                            is_added: false,
                        });
                        businessType.save();
                    });
                });

                var servicePackageData = {
                    business: user._id,
                    packages: [{
                        customization:[
                            {
                                service : "Basic", 
                                inclusions : "", 
                                service_charges :0
                            },
                            {
                                service : "Advance", 
                                inclusions : "", 
                                service_charges :0
                            },
                            {
                                service : "Prime", 
                                inclusions : "", 
                                service_charges :0
                            },
                        ],

                        diagnosis:[
                            {
                                service : "Basic", 
                                inclusions : "", 
                                service_charges :0
                            },
                            {
                                service : "Advance", 
                                inclusions : "", 
                                service_charges :0
                            },
                            {
                                service : "Prime", 
                                inclusions : "", 
                                service_charges :0
                            },
                        ],

                        collision_repair:[
                            {
                                service : "Basic", 
                                inclusions : "", 
                                service_charges :0
                            },
                            {
                                service : "Advance", 
                                inclusions : "", 
                                service_charges :0
                            },
                            {
                                service : "Prime", 
                                inclusions : "", 
                                service_charges :0
                            },
                        ],

                        washing_and_detailings:[
                            {
                                service : "Basic", 
                                inclusions : "", 
                                service_charges :0
                            },
                            {
                                service : "Advance", 
                                inclusions : "", 
                                service_charges :0
                            },
                            {
                                service : "Prime", 
                                inclusions : "", 
                                service_charges :0
                            },
                        ]
                    }],
                    status:false,
                    created_at: new Date(),
                    updated_at: new Date(),
                }

                var servicePackage = new BusinessServicePackage(servicePackageData);
                servicePackage.save();

                var token = jwt.sign(payload, secret);

                event.otpSms(user);
                // event.registrationSms(user);

                return res.status(200).json({
                  responseCode: 200,
                  responseMessage: "success",
                  responseData: {
                      token: token,
                      user: user
                  },
                });  
            }).catch(next);     
        }
        else{
            var json = ({
            responseCode: 422,
            responseMessage: "Invalid extension",
            responseData: {
                res: {
                    next: extension,
                    errors: "",
                    rld: false
                },
            }
            });
            res.status(422).json(json)
        }*/
    }
  })
}).array('media', 1);

upload(req, res, async function (error) {
    res.json(error)
});








//-----------------------------------------------------------------------------------------------------------------------------


const payload = {
            user: user['_id']
        };
        var days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        
        for (var i = 0; i < 7; i++)
        {
            var timing = new BusinessTiming({
                business: user._id,
                day: days[i],
                open: '09:30 AM',
                close: '03:30 PM',
                is_closed: 0,
                created_at: new Date(),
                updated_at: new Date(),
            });
            timing.save();
        }

        Type.find({}).then(function (BT)
        {
            BT.forEach(function (u) {
                var businessType = new BusinessType({
                    business: user._id,
                    business_type: u._id,
                    is_added: false,
                });
                businessType.save();
            });
        });

        var servicePackageData = {
            business: user._id,
            packages: [{
                customization:[
                    {
                        service : "Basic", 
                        inclusions : "", 
                        service_charges :0
                    },
                    {
                        service : "Advance", 
                        inclusions : "", 
                        service_charges :0
                    },
                    {
                        service : "Prime", 
                        inclusions : "", 
                        service_charges :0
                    },
                ],
    
                diagnosis:[
                    {
                        service : "Basic", 
                        inclusions : "", 
                        service_charges :0
                    },
                    {
                        service : "Advance", 
                        inclusions : "", 
                        service_charges :0
                    },
                    {
                        service : "Prime", 
                        inclusions : "", 
                        service_charges :0
                    },
                ],
    
                collision_repair:[
                    {
                        service : "Basic", 
                        inclusions : "", 
                        service_charges :0
                    },
                    {
                        service : "Advance", 
                        inclusions : "", 
                        service_charges :0
                    },
                    {
                        service : "Prime", 
                        inclusions : "", 
                        service_charges :0
                    },
                ],
    
                washing_and_detailings:[
                    {
                        service : "Basic", 
                        inclusions : "", 
                        service_charges :0
                    },
                    {
                        service : "Advance", 
                        inclusions : "", 
                        service_charges :0
                    },
                    {
                        service : "Prime", 
                        inclusions : "", 
                        service_charges :0
                    },
                ]
            }],
            status:false,
            created_at: new Date(),
            updated_at: new Date(),
        }
    
        var servicePackage = new BusinessServicePackage(servicePackageData);
        servicePackage.save();

        var token = jwt.sign(payload, secret);

        event.otpSms(user);
        // event.registrationSms(user);

        return res.status(200).json({
          responseCode: 200,
          responseMessage: "success",
          responseData: {
              token: token,
              user: user
          },
        });