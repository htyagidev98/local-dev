const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var _ = require('lodash');

const GeoSchema = new Schema({
    type: {
        type:String,
        default : "Point"
    },
    coordinates:{
        type:[Number],
        index : "2dsphere"
    }
});

const InsuranceSchema = new Schema({
    policy_holder: {
        type:String,
        default: ""
    },
    insurance_company: {
        type:String,
        default: ""
    },
    ins_company_id: {
         type: Schema.ObjectId,
        ref: 'User',
        default: null
    },
    policy_no:{
        type: String,
        default: ""
    },
    policy_type:{
        type: String,
        default: ""
    },
    premium:{
        type: Number,
        default: 0,
    },
    expire:{
        type:Date,
        default: null
    }
});

const CarSchema = new Schema({
    package: {
        type:Schema.ObjectId,
        ref:'Package',
        default: null
    },
    user: {
        type:Schema.ObjectId,
        ref:'User',
        required:[true,'Business ObjectId field is required'],
    },
    automaker: {
        type:Schema.ObjectId,
        ref:'Automaker',
        required:[true,'Maker ObjectId field is required'],
    },
    _automaker: {
        type: String,
        default: ""
    },
    model: {
        type:Schema.ObjectId,
        ref:'Model',
        required:[true,'Model ObjectId field is required'],
    },
    _model: {
        type: String,
        default: ""
    },
    segment: {
        type: String,
        default: ""
    },
    variant: {
        type:Schema.ObjectId,
        ref:'Variant',
        required:[true,'Variant ObjectId field is required'],
    },
    _variant: {
        type: String,
        default: ""
    },
    vin: {
        type:String,
        default: "",
    },
    engine_no: {
        type:String,
        default: "",
    },
    title: {
        type:String,
        default: "",
    },
    fuel_type: {
        type:String,
        required:[true,'Fuel Type field is required'],
        default: ""
    },
    manufacture_year: {
        type:String,
        default: "",
    },
    
    purchased_year: {
        type:String,
        default: "",
    },
  
    vehicle_color: {
        type:String,
        default:''
    },
    vehicle_status: {
        type:String,
        default:''
    },
    video_url: {
        type:String,
        default:''
    },
    odometer: {
        type:Number,
    },
    fuel_level: {
        type:Number,
    },

    body_style: {
        type:String,
        default:''
    },
    accidental: {
        type:String,
        default:'No',
    },

    insurance: {
        type:String,
        default:'',
    },
    insurance_info: InsuranceSchema,
    owner: {
        type:String,
        default:'',
    },
    price: {
        type:Number,
        default:0
    },
    purchase_price: {
        type:Number,
        default:0
    },
    refurbishment_cost: {
        type:Number,
        default:0
    },
    posted_by: {
        type:String,
        default:''
    },
    description: {
        type:String,
        default:''
    },
    careager_rating: {
        type:Number,
        default:0
    },
    registration_no: {
        type:String,
        required: [true,'Business ObjectId field is required'],
    },
    reg_no_copy: {
        type:String,
    },
    transmission: {
        type:String,
    },
    rc: {
        type:String,
        default:''
    },
    ic: {
        type:String,
        default:''
    },
    location: {
        type:String,
        default:''
    },
    geometry: {
        type: [Number],
        index: '2d'
    },
    carId: {
        type: Number,
    },
    status: {
        type:Boolean,
        default:true
    },
    publish: {
        type:Boolean,
        default:false,
    },
    admin_approved: {
        type:Boolean,
        default:false,
    },
    created_at: {
        type:Date,
    },
    updated_at: {
        type:Date,
    },
});


CarSchema.virtual('thumbnails', {
    ref: 'CarImage',
    localField: '_id',
    foreignField: 'car',
});

CarSchema.virtual('bookmark', {
    ref: 'BookmarkCar',
    localField: '_id',
    foreignField: 'car'
});


CarSchema.virtual('ic_address').get(function() {  
    return 'https://s3.ap-south-1.amazonaws.com/'+config.BUCKET_NAME+'/car/'+this.ic;
});

CarSchema.virtual('rc_address').get(function() {  
    return 'https://s3.ap-south-1.amazonaws.com/'+config.BUCKET_NAME+'/car/'+this.rc;
});

CarSchema.virtual('is_bookmarked').get(function() {
    var bookmark = this.bookmark;
    var status = _.filter(bookmark, {user:mongoose.mongo.ObjectId(loggedInUser)}).length > 0 ? true:false;
    return status;
});


CarSchema.set('toObject', { virtuals: true });
CarSchema.set('toJSON', { virtuals: true });


const Car = mongoose.model('Car',CarSchema,'Car');

module.exports = Car;