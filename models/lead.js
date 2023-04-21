const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const LeadRemarkSchema = new Schema({
    customer_remark: {
        type: String,
        default: ""
    },
    assignee_remark: {
        type: String,
        default: ""
    },
    resource: {
        type: String,
        default: ""
    },
    status: {
        type: String,
        default: "New"
    },
    reason: {
        type: String,
        default: ""
    },
     //S.M
     pickup_date:{
        type: String,
        default: ""
    },
    pickup_address:{
        
            /* type: [Number],
            index: '2d', */
    
            type: String,
            default: ""
    },
    color_code: {
        type: String,
        default: "#FFFF00"
    },
    created_at: {
        type: Date,
    },
    updated_at: {
        type: Date,
    }
});

//Abhinav LeadAdditional Info
const AdditionalInfoSchema = new Schema({
    address: {
        type: String,
        default: ""
    },
    model: {
        type: String,
        default: ""
    },
    location: {
        type: String,
        default: ""
    },
    registration_no: {
        type: String,
        default: ""
    },
    brand: {
        type: String,
        default: ""
    },
    category: {
        type: String,
        default: ""
    },
    alternate_no: {
        type: String,
        default: ""
    },
    variant: {
        type: Schema.ObjectId,
        ref: 'Variant',

    }


});
const JustDialDataSchema = new Schema({
    leadId: {
        type: String,
        default: ""
    },
    leadtype: {
        type: String,
        default: ""
    },
    dncmobile: {
        type: String,
        default: ""
    },
    brancharea: {
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
    dncphone: {
        type: String,
        default: ""
    },
    pincode: {
        type: String,
        default: ""
    },
    company: {
        type: String,
        default: ""
    },
    time: {
        type: String,
        default: ""
    },
    branchpin: {
        type: String,
        default: ""
    },
    parentid: {
        type: String,
        default: ""
    },
    date: {
        type: Date,
        default: ""
    }


});

const LeadFollowUpSchema = new Schema({
    date: {
        type: Date,
        default: null
    },
    time: {
        type: String,
        default: ""
    },
    created_at: {
        type: Date,
    },
    updated_at: {
        type: Date,
    }
});

const LeadSchema = new Schema({
    lead_id: {
        type: String,
    },
    // vinay changes
    booking: {
        type: Schema.ObjectId,
        ref: "Booking",
        default: null
    },
    car: {
        type: Schema.ObjectId,
        ref: 'Car',
        default: null
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User',
        default: null,
    },
    model: {
        type: Schema.ObjectId,
        default: null,
    },
    business: {
        type: Schema.ObjectId,
        ref: 'User',
    },
    assignee: {
        type: Schema.ObjectId,
        ref: 'User',
        default: null,
    },
    //Abhinav: New Role CR
    cr_assignee: {
        type: Schema.ObjectId,
        ref: 'User',
        default: null,
    },
    advisor: {
        type: Schema.ObjectId,
        ref: 'User',
        default: null,
    },
    name: {
        type: String,
    },
    contact_no: {
        type: String,
    },
    email: {
        type: String,
    },
    geometry: {
        type: [Number],
        index: '2d',
    },
    type: {
        type: String,
        default: ""
    },
    source: {
        type: String,
        default: ""
    },
    lead: {
        type: String,
    },
    owner: {
        type: String,
    },
    category: {
        type: String,
        default: ""
    },
    important: {
        type: Boolean,
        default: false
    },
    priority: {
        type: Number,
        default: 2
    },
    converted: {
        type: Boolean,
        default: false
    },
    remark: LeadRemarkSchema,
    follow_up: LeadFollowUpSchema,
    satisfied: {
        type: Boolean,
        default: true
    },
    psf: {
        type: Boolean,
        default: false
    },
    //Lead Generation Abhinav
    generated: {
        type: Boolean,
        default: false
    },

    contacted: {
        type: Boolean,
        default: true
    },
    isStared: {
        type: Boolean,
        default: false
    },
    remarks: [
        {
            ref: 'LeadRemark',
            type: Schema.ObjectId,
        }
    ],

    additional_info: AdditionalInfoSchema,
    justDial_data: JustDialDataSchema,


    created_at: {
        type: Date,
    },
    updated_at: {
        type: Date,
    },
});

LeadSchema.set('toObject', { virtuals: true });
LeadSchema.set('toJSON', { virtuals: true });

const Lead = mongoose.model('Lead', LeadSchema, 'Lead');
module.exports = Lead;