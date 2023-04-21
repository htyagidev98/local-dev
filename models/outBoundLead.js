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
    },
    alternate_no: {
        type: String,
        default: ""
    },
    variant: {
        type: Schema.ObjectId,
        ref: 'Variant',
    },
    lost_reason: {
        type: String,
        default: ''
    },
    remark: {
        type: String,
        default: ''
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
// const OutbountBookingSchema = new Schema({
//     booking: {
//         type: Date,
//         default: null
//     },
//     time: {
//         type: String,
//         default: ""
//     },
//     created_at: {
//         type: Date,
//     },
//     updated_at: {
//         type: Date,
//     }
// });
const InsuranceSchema = new Schema({
    policy_holder: {
        type: String,
        default: ""
    },
    insurance_company: {
        type: String,
        default: ""
    },
    policy_no: {
        type: String,
        default: ""
    },
    policy_type: {
        type: String,
        default: ""
    },
    premium: {
        type: Number,
        default: 0,
    },
    expire: {
        type: Date,
        default: null
    }
});
const OutBoundLeadSchema = new Schema({
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
    booking: {
        type: Schema.ObjectId,
        ref: 'Booking',
        default: null,
    },
    outbound_booking: {
        type: Schema.ObjectId,
        ref: 'Booking',
        default: null,
    },
    status: {
        type: String,
        default: 'Open'
    },
    advisor: {
        type: Schema.ObjectId,
        ref: 'User',
        default: null,
    },
    lead: {
        type: Schema.ObjectId,
        ref: 'Lead',
        default: null,
    },
    car: {
        type: Schema.ObjectId,
        ref: 'Car',
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

    category: {
        type: String,
        default: ""
    },

    priority: {
        type: Number,
        default: 2
    },
    follow_up: LeadFollowUpSchema,
    remarks: [
        {
            ref: 'LeadGenRemark',
            type: Schema.ObjectId,
        }
    ],

    additional_info: AdditionalInfoSchema,


    created_at: {
        type: Date,
    },
    reminderDate: {
        type: Date,
    },
    insurance_rem: {
        type: Date,
    },
    insurance_info: InsuranceSchema,

    converted: {
        type: Boolean,
        default: false
    },
    // outbound_booking: OutbountBookingSchema,
    date_added: { type: Date },
    updated_at: {
        type: Date,
    },
    isJob: {
        type: Boolean,
        default: false
    },
    job_card: {
        type: Schema.ObjectId,
        ref: 'Booking',
        default: null,
    },
    isStared: {
        type: Boolean,
        default: false
    },

});

OutBoundLeadSchema.set('toObject', { virtuals: true });
OutBoundLeadSchema.set('toJSON', { virtuals: true });

const OutBoundLead = mongoose.model('OutBoundLead', OutBoundLeadSchema, 'OutBoundLead');
module.exports = OutBoundLead;