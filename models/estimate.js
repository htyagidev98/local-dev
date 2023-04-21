const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const PaymentSchema = new Schema({
    payment_mode: {
        type:String,
        default : ''
    },
    payment_status: {
        type:String,
        default : 'Pending'
    },
    total: {
        type:Number,
        default: 0
    },
    pick_up_limit: {
        type:Number,
        default: 0
    },
    pick_up_charges: {
        type:Number,
        default: 0
    },
    policy_clause: {
        type:Number,
        default: 0
    },
    salvage_value: {
        type:Number,
        default: 0
    },
    terms:{
        type:String,
        default: ""
    },
    discount_by: {
        type:String,
        default:""
    },
    discount_type: {
        type:String,
        default:""
    },
    discount: {
        type:Number,
        default: 0
    },
    discount_total: {
        type:Number,
        default: 0
    },
    coupon_type: {
        type:String,
        default:""
    },
    coupon: {
        type:String,
        default:""
    },
   
    labour_cost: {
        type:Number,
        default: 0
    },
    part_cost: {
        type:Number,
        default: 0
    },
    of_cost: {
        type:Number,
        default: 0
    },
    exceeded_cost: {
        type:Number,
        default: 0
    },
    paid_total:{
        type:Number,
        default: 0
    },
    due:{
        type:Number,
        default: 0
    },
    discount_applied: {
        type: Boolean,
        default: false
    },
    transaction_id:{
        type:String,
        default:""        
    },
    transaction_date:{
        type:String,
        default:""        
    },
    transaction_status:{
        type:String,
        default:""        
    },
    transaction_response:{
        type:String,
        default:""        
    }
});


const DueSchema = new Schema({
    due:{
        type:Number,
        default: 0
    },
    pay:{
        type:Number,
        default: 0
    },
});

const InsuanceSchema = new Schema({
    policy_holder: {
        type:String,
        default: "",
    },
    insurance_company: {
        type:String,
        default: "",
    },
    branch: {
        type: String,
        default: "",
    },
    gstin: {
        type:String,
        default: "",
    },
    policy_no:{
        type: String,
        default: "",
    },
    premium:{
        type: Number,
        default: 0,
    },
    expire:{
        type:Date,
        default: "",
    },
    claim:{
        type: Boolean,
        default: false
    }, 
    cashless:{
        type: Boolean,
        default: false
    },

    policy_type: {
        type: String,
        default: "",
    },

    claim_no: {
        type: String,
        default: "",
    },

    driver_accident: {
        type: String,
        default: "",
    },
    
    accident_place: {
        type: String,
        default: "",
    },

    accident_date: {
        type:Date,
        default: null
    },

    accident_time: {
        type: String,
        default: "",
    },

    accident_cause: {
        type: String,
        default: "",
    },

    spot_survey: {
        type: String,
        default: "",
    },
    
    fir: {
        type: String,
        default: "",
    }, 

    manufacture_year: {
        type: String,
        default: "",
    }
});

const PartSchema = new Schema({
    item:{
        type:String,
        default: ""
    },
    source: {
        type:Schema.ObjectId,
        default: null
    },
    hsn_sac:{
        type:String,
        default: ""
    },
    part_no:{
        type:String,
        default: ""
    },
    quantity:{
        type:Number,
        default: 1
    },
    rate:{
        type:Number,
        default: 0
    },
    base:{
        type:Number,
        default: 0
    },
    amount:{
        type:Number,
        default: 0
    },
    tax_amount:{
        type:Number,
        default: 0
    },
    amount_is_tax: {
        type:String,
        default: ""
    },
    discount: {
        type:Number,
        default: 0
    },
    tax_rate: {
        type:Number,
        default: 0
    },
    tax:{
        type:String,
        default: ""
    },
    tax_info:{}
});

const RemarkSchema = new Schema({
    remark:{
        type:String,
    },
    added_by: {
        type:Schema.ObjectId,
        ref:'User',
        default: null
    },
    created_at:{
        type:Date,
    },
    updated_at:{
        type:Date,
    }
});

const ServiceSchema = new Schema({
    type: {
        type:String,
        default: ""
    },
    source: {
        type: Schema.ObjectId,
        default: null
    },
    paid_cost: {
        type:Number,
        default: 0
    }, 
    total: {
        type:Number,
        default: 0
    },
    discount: {
        type:Number,
        default: 0
    },
    parts: [PartSchema],
    labour: [],
    opening_fitting: [],
    service: {
        type:String,
        default:""
    },
    mileage:{
        type: Number,
        default: 0 
    },
    description: {
        type:String,
        default:""
    },
    labour_cost: {
        type:Number,
        default: 0
    },
    part_cost: {
        type:Number,
        default: 0
    },
    of_cost: {
        type:Number,
        default: 0
    },
    hours: {
        type:Number,
        default: 0
    },
    pay_by: {
        type:String,
        default: "user"
    },
    cost: {
        type:Number,
        default: 0
    },
    quantity: {
        type:Number,
        default: 1
    },
    customer_approval: {
        type:Boolean,
        default: false
    },
    surveyor_approval: {
        type:Boolean,
        default: false
    },
    claim: {
        type:Boolean,
        default: false
    },
    exceeded_cost: {
        type:Number,
        default: 0
    },
    part_cost_editable:{
        type: Boolean,
        default: false
    },
    labour_cost_editable:{
        type: Boolean,
        default: false
    },
    of_cost_editable:{
        type: Boolean,
        default: false
    },
    custom:{
        type: Boolean,
        default: false
    }
});

const CustomerRequirementSchema = new Schema({
    requirement: {
        type:String
    },
    created_at:{
        type:Date,
        default: new Date(),
    },
    updated_at:{
        type:Date,
        default: new Date(),
    }
});

const AssetSchema = new Schema({
    value: {
        type:String
    },
    checked:{
        type: Boolean,
        default: false
    },
});

const EstimateSchema = new Schema({
    services: [ServiceSchema],

    insurance_info: InsuanceSchema,

    payment: PaymentSchema,
    rance_payment: PaymentSchema,
    due: DueSchema,
    insurance_due: DueSchema,

    created_at:{
        type:Date,
    },
    
    updated_at:{
        type:Date,
    },
});

EstimateSchema.virtual('recording_address').get(function() {  
    return 'https://s3.ap-south-1.amazonaws.com/'+config.BUCKET_NAME+'/inspection/'+this.recording;
});

EstimateSchema.set('toObject', { virtuals: true });
EstimateSchema.set('toJSON', { virtuals: true });

const Estimate = mongoose.model('Estimate', EstimateSchema, 'Estimate');

module.exports = Estimate;
