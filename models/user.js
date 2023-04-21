const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bcrypt = require('bcrypt-nodejs');

config = require('./../config');
const uuidv1 = require('uuid/v1');

var uniqueValidator = require('mongoose-unique-validator');

var salt = bcrypt.genSaltSync(10);

const AddressSchema = new Schema({
    country: {
        type: String,
        default: ""
    },
    state: {
        type: String,
        default: ""
    },
    country_code: {
        type: String,
        default: ""
    },
    zip: {
        type: String,
        default: ""
    },
    area: {
        type: String,
        default: ""
    },
    city: {
        type: String,
        default: ""
    },
    address: {
        type: String,
        default: "",
    },
    location: {
        type: String,
        default: ""
    },
    timezone: {
        type: String,
    }
});

const PartnerSchema = new Schema({
    partner: {
        type: Boolean,
        default: false,
    },

    commission: {
        type: Number,
        default: 0,
    },

    package_discount: {
        type: Number,
        default: 0
    },

    started_at: {
        type: Date,
        default: new Date(),
    },

    expired_at: {
        type: Date,
        default: new Date(),
    },
});

const AgentSchema = new Schema({
    agent: {
        type: Boolean,
        default: false
    },

    commission: {
        type: Number,
        default: 0
    },

    started_at: {
        type: Date,
        default: new Date()
    },

    expired_at: {
        type: Date,
        default: new Date(),
    },
});

const SocialiteSchema = new Schema({
    facebook: {
        type: String,
        default: ''
    },
    twitter: {
        type: String,
        default: ''
    },
    linkedin: {
        type: String,
        default: ''
    },
    instagram: {
        type: String,
        default: ''
    },
    googleplus: {
        type: String,
        default: ''
    },
    youtube: {
        type: String,
        default: ''
    },
    website: {
        type: String,
        default: ''
    },
    androidAppLink: {
        type: String,
        default: ''
    },
    iosAppLink: {
        type: String,
        default: ''
    },

});

const PackageSchema = new Schema({
});

const BankAccountSchema = new Schema({
    bank: {
        type: String,
        default: ''
    },
    branch: {
        type: String,
        default: ''
    },
    ifsc: {
        type: String,
        default: ''
    },
    account_no: {
        type: String,
        default: ''
    },
    account_holder: {
        type: String,
        default: ''
    },
    upi_id: {
        type: String,
        default: ''
    }
});

const OptionalInfoSchema = new Schema({
    email: {
        type: String,
        default: ''
    },
    contact_no: {
        type: String,
        default: ''
    },
    overview: {
        type: String,
        default: ''
    },
    uid: {
        type: String,
        default: null
    },
    reg_by: {
        type: String,
        default: 'Super'
    },
    alternate_no: {
        type: String,
        default: ""
    }
});

const AccountInfoSchema = new Schema({
    approved_by_admin: {
        type: Boolean,
        default: false
    },
    verified_account: {
        type: Boolean,
        default: false
    },
    phone_verified: {
        type: Boolean,
        default: false
    },
    added_by: {
        type: Schema.ObjectId,
        ref: 'User',
        null: true,
        default: null
    },
    status: {
        type: String,
        enum: ['Active', 'Terminate', 'Complete', 'Deactivate', 'Incomplete', 'Deleted'],
        default: 'Incomplete'
    },
    type: {
        type: String,
        enum: ['user', 'business', 'deleted'],
        default: 'user'
    },
    role: {
        type: String,
        enum: ['admin', 'sales'],
        // default: 'user'
    },
    is_page: {
        type: Boolean,
        default: false
    },
    is_password: {
        type: Boolean,
        default: true
    },
    //Abhinav MultiOutlet
    isFranchisor: {
        type: Boolean,
        default: false
    },
    isFranchise: {
        type: Boolean,
        default: false
    },
    isInsCompany: {
        type: Boolean,
        default: false
    }
});

const BusinessInfoSchema = new Schema({
    business_id: {
        type: String,
    },
    company_name: {
        type: String,
        default: '',
    },
    company_logo: {
        type: String,
        default: '',
    },
    qr_code: {
        type: String,
        default: '',
    },
    business_category: {
        type: String,
        default: '',
    },

    party_statements: {
        type: String,
        default: ''
    },

    category: [],
    brand: [],
    account_no: {
        type: String,
    },
    gst_registration_type: {
        type: String,
        default: '',
    },
    gstin: {
        type: String,
        default: '',
    },
    tax_registration_no: {
        type: String,
        default: '',
    },
    pan_no: {
        type: String,
        default: '',
    },
    policy: {
        type: String,
        default: ""
    },
    terms: {
        type: String,
        default: ""
    },
    order_terms: {
        type: String,
        default: ""
    },
    pick_up_limit: {
        type: Number,
    },
    pick_up_charges: {
        type: Number,
    },
    is_claimed: {
        type: Boolean,
        default: false
    },
    assistance: {
        type: Boolean,
        default: false
    }
});

const DeviceInfoSchema = new Schema({
    deviceId: {
        type: String,
    },
    fcmId: {
        type: String,
    },
    deviceType: {
        type: String,
    },
    deviceModel: {
        type: String,
    },
    token: {
        type: String,
    },
    app: {
        type: String,
    },
    created_at: {
        type: Date
    }
});

const UserSchema = new Schema({
    name: {
        type: String,
        default: '',
    },
    // user_pass: {
    //     type: String,
    //     default: ''
    // },

    username: {
        type: String,
        required: [true, 'Username field is required'],
        unique: true
    },

    email: {
        type: String,
        default: ""
    },
    whatsAppChannelId: {
        type: String,
        default: ""
    },

    contact_no: {
        type: String,
        required: [true, 'Contact field is required'],
        trim: true,
        min: 10,
        maxlength: 14
    },

    password: {
        type: String,
        default: ''
    },
    //abhinav
    business: {
        type: Schema.ObjectId,
        ref: 'User',
    },
    //
    gender: {
        type: String,
        default: ''
    },

    avatar: {
        type: String,
        default: 'profile.png',
    },

    address: AddressSchema,
    transactions: [],
    geometry: {
        type: [Number],
        index: '2d'
    },

    socialite: SocialiteSchema,

    account_info: AccountInfoSchema,

    careager_cash: {
        type: Number,
        default: 0
    },

    careager_rating: {
        type: Number,
        default: 0
    },

    optional_info: OptionalInfoSchema,

    device: [DeviceInfoSchema],

    otp: {
        type: Number,
        expires: 30,
        default: null,
    },

    business_info: BusinessInfoSchema,
    bank_details: [BankAccountSchema],

    referral_code: {
        type: String,
        default: ''
    },

    social_login: {
        type: String,
        default: ''
    },

    social_id: {
        type: String,
        default: null,
    },

    isCarEager: {
        type: Boolean,
        default: false
    },

    partner: PartnerSchema,

    agent: AgentSchema,

    visibility: {
        type: Boolean,
        default: true
    },

    posts: [
        {
            type: Schema.ObjectId,
            ref: 'Post',
        }
    ],

    cars: [
        {
            type: Schema.ObjectId,
            ref: 'Car',
        }
    ],

    orders: [
        {
            type: Schema.ObjectId,
            ref: 'Order',
        }
    ],

    bookings: [
        {
            ref: 'Booking',
            type: Schema.ObjectId,
        }
    ],

    uuid: {
        type: String,
        default: ""
    },
    logs: [],

    outlets: [
        {
            ref: 'User',
            type: Schema.ObjectId,
        }
    ],
    created_at: {
        type: Date,
    },
    updated_at: {
        type: Date,
    },
});

/*UserSchema.virtual('cover_address').get(function() {  
    return 'https://s3.ap-south-1.amazonaws.com/'+config.BUCKET_NAME+'/cover/'+this.cover;
});
*/

UserSchema.virtual('avatar_address').get(function () {
    return 'https://s3.ap-south-1.amazonaws.com/' + config.BUCKET_NAME + '/avatar/' + this.avatar;
});



UserSchema.virtual('points', {
    ref: 'Point',
    localField: '_id',
    foreignField: 'user'
});

UserSchema.virtual('car', {
    ref: 'Car',
    localField: '_id',
    foreignField: 'car'
}).get(function () {
});

UserSchema.virtual('is_following').get(function () {
    if (loggedInUser != null) {
        var follow = this.follow;
        var status = _.filter(follow, { user: mongoose.mongo.ObjectId(loggedInUser) }).length > 0 ? true : false;
        return status;
    }
    else {
        return false;
    }
});

UserSchema.virtual('bookmark', {
    ref: 'BookmarkBusiness',
    localField: '_id',
    foreignField: 'business'
});

UserSchema.virtual('is_bookmarked').get(function () {
    if (loggedInUser != null) {
        var bookmark = this.bookmark;
        var status = _.filter(bookmark, { user: mongoose.mongo.ObjectId(loggedInUser) }).length > 0 ? true : false;
        return status;
    }
    else {
        return false;
    }
});

UserSchema.index({ username: -1 }, { collation: { locale: 'en', strength: 2 } });

UserSchema.set('toObject', { virtuals: true });

UserSchema.set('toJSON', { virtuals: true });

UserSchema.plugin(uniqueValidator);

UserSchema.pre('save', function (next) {
    var user = this;

    var currentDate = new Date();
    console.log("User = " + user.optional_info.reg_by)
    user.created_at = currentDate;
    user.updated_at = currentDate;
    bcrypt.hash(user.password, salt, null, function (err, hash) {
        if (err) return next(err);
        user.password = hash;
        // console.log("Hash = " + hash)
        next();
    });
    // if (user.optional_info.reg_by == "Upload") {
    //     user.password = '';
    // } else {
    //     // bcrypt.hash(user.password, salt, null, function (err, hash) {
    //     //     if (err) return next(err);
    //     //     user.password = hash;
    //     //     // console.log("Hash = " + hash)
    //     //     next();
    //     // });
    //     user.password = '';
    //     console.log("else")
    // }
    // console.log("Password" + user.password)

});

const User = mongoose.model('User', UserSchema, 'User');

module.exports = User;