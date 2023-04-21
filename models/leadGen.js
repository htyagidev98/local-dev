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
    date_file: {
        type: String,
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

const LeadGenSchema = new Schema({
    lead_id: {
        type: String,
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
    business_id: {
        type: String,
        default: "5bfec47ef651033d1c99fbca"
    },

    contacted: {
        type: Boolean,
        default: true
    },

    remarks: [
        {
            ref: 'LeadGenRemark',
            type: Schema.ObjectId,
        }
    ],

    additional_info: AdditionalInfoSchema,

    date_added: {
        type: Date,
    },

    created_at: {
        type: Date,
    },
    updated_at: {
        type: Date,
    },
});

LeadGenSchema.set('toObject', { virtuals: true });
LeadGenSchema.set('toJSON', { virtuals: true });

const LeadGen = mongoose.model('LeadGen', LeadGenSchema, 'LeadGen');
module.exports = LeadGen;