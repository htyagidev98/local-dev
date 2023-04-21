const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const PaymentSchema = new Schema({
    payment_mode: {
        type: String,
        default: ''
    },
    payment_status: {
        type: String,
        default: 'Pending'
    },
    total: {
        type: Number,
        default: 0
    },
    pick_up_limit: {
        type: Number,
        default: 0
    },
    pick_up_charges: {
        type: Number,
        default: 0
    },
    policy_clause: {
        type: Number,
        default: 0
    },
    salvage: {
        type: Number,
        default: 0
    },
    terms: {
        type: String,
        default: ""
    },
    discount_by: {
        type: String,
        default: ""
    },
    discount_type: {
        type: String,
        default: ""
    },
    servicesCost: {
        type: Number,
        default: 0
    },
    discount: {
        type: Number,
        default: 0
    },
    discount_total: {
        type: Number,
        default: 0
    },
    additionalDiscount: {
        type: Number,
        default: 0
    },
    coupon_type: {
        type: String,
        default: ""
    },
    coupon: {
        type: String,
        default: ""
    },
    careager_cash: {
        type: Number,
        default: 0
    },
    labour_cost: {
        type: Number,
        default: 0
    },
    part_cost: {
        type: Number,
        default: 0
    },
    of_cost: {
        type: Number,
        default: 0
    },
    estimate_cost: {
        type: Number,
        default: 0
    },
    exceeded_cost: {
        type: Number,
        default: 0
    },
    paid_total: {
        type: Number,
        default: 0
    },
    due: {
        type: Number,
        default: 0
    },
    discount_applied: {
        type: Boolean,
        default: false
    },
    transaction_id: {
        type: String,
        default: ""
    },
    transaction_date: {
        type: String,
        default: ""
    },
    transaction_status: {
        type: String,
        default: ""
    },
    transaction_response: {
        type: String,
        default: ""
    }
});
//TODO Made by sumit (start.)
const LeadFollowUpSchema = new Schema({
    date: {
        type: Date,

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
const LeadRemarkSchema = new Schema({
    lead: {
        type: Schema.ObjectId,
        ref: 'Lead',

    },
    assignee: {
        type: Schema.ObjectId,
        ref: 'User',

    },
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
    type: {
        type: String,
        default: ""
    },
    source: {
        type: String,
        default: ""
    },
    status: {
        type: String
    },
    reason: {
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
const leadManagement = new Schema({
    lead_id: {
        type: String,
    },
    // vinay changes
    booking: {
        type: Schema.ObjectId,
        ref: "Booking",

    },
    user: {
        type: Schema.ObjectId,
        ref: 'User',

    },

    business: {
        type: Schema.ObjectId,
        ref: 'User',
    },
    assignee: {
        type: Schema.ObjectId,
        ref: 'User',

    },


    advisor: {
        type: Schema.ObjectId,
        ref: 'User',

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

    type: {
        type: String,
        default: ""
    },

    status: {
        type: String,
        default: "Open"

    },
    source: {
        type: String,
        default: ""
    },

    priority: {
        type: String,
        default: ""
    },
    psf: {
        type: Boolean,

    },
    isStared: {
        type: Boolean,

    },
    remarks: [LeadRemarkSchema],
    follow_up: LeadFollowUpSchema,

    created_at: {
        type: Date,
    },
    updated_at: {
        type: Date,
    },
});




//TODO  (END..)

const DueSchema = new Schema({
    due: {
        type: Number,
        default: 0
    },
    pay: {
        type: Number,
        default: 0
    },
});

const InsuanceSchema = new Schema({
    policy_holder: {
        type: String,
        default: "",
    },
    insurance_company: {
        type: String,
        default: "",
    },
    ins_company_id: {
         type: Schema.ObjectId,
        ref: 'User',
        default: null
    },
    state: {
        type: String,
        default: "",
    },
    branch: {
        type: String,
        default: "",
    },
    contact_no: {
        type: String,
        default: "",
    },
    gstin: {
        type: String,
        default: "",
    },
    policy_no: {
        type: String,
        default: "",
    },
    premium: {
        type: Number,
        default: 0,
    },
    expire: {
        type: Date,
        default: null,
    },
    claim: {
        type: Boolean,
        default: false
    },
    cashless: {
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
        type: Date,
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
    item: {
        type: String,
        default: ""
    },
    source: {
        type: Schema.ObjectId,
        default: null
    },
    hsn_sac: {
        type: String,
        default: ""
    },
    part_no: {
        type: String,
        default: ""
    },
    quantity: {
        type: Number,
        default: 1
    },
    rate: {
        type: Number,
        default: 0
    },
    base: {
        type: Number,
        default: 0
    },
    amount: {
        type: Number,
        default: 0
    },
    tax_amount: {
        type: Number,
        default: 0
    },
    amount_is_tax: {
        type: String,
        default: ""
    },
    discount: {
        type: Number,
        default: 0
    },
    customer_dep: {
        type: Number,
        default: 0
    },
    insurance_dep: {
        type: Number,
        default: 0
    },
    tax_rate: {
        type: Number,
        default: 0
    },
    tax: {
        type: String,
        default: ""
    },
    tax_info: {},

    issued: {
        type: Boolean,
        default: false
    },
});
const LabourSchema = new Schema({
    item: {
        type: String,
        default: ""
    },
    quantity: {
        type: Number,
        default: 1
    },
    rate: {
        type: Number,
        default: 0
    },
    base: {
        type: Number,
        default: 0
    },
    amount: {
        type: Number,
        default: 0
    },
    tax_amount: {
        type: Number,
        default: 0
    },
    amount_is_tax: {
        type: String,
        default: ""
    },
    discount: {
        type: Number,
        default: 0
    },
    customer_dep: {
        type: Number,
        default: 0
    },
    insurance_dep: {
        type: Number,
        default: 0
    },
    tax_rate: {
        type: Number,
        default: 0
    },
    tax: {
        type: String,
        default: ""
    },
    tax_info: {},
});
const OFSchema = new Schema({
    item: {
        type: String,
        default: ""
    },
    quantity: {
        type: Number,
        default: 1
    },
    rate: {
        type: Number,
        default: 0
    },
    base: {
        type: Number,
        default: 0
    },
    amount: {
        type: Number,
        default: 0
    },
    tax_amount: {
        type: Number,
        default: 0
    },
    amount_is_tax: {
        type: String,
        default: ""
    },
    discount: {
        type: Number,
        default: 0
    },
    customer_dep: {
        type: Number,
        default: 0
    },
    insurance_dep: {
        type: Number,
        default: 0
    },
    tax_rate: {
        type: Number,
        default: 0
    },
    tax: {
        type: String,
        default: ""
    },
    tax_info: {},


});
const estimatePDFSchema = new Schema({
    url: {
        type: String,
        default: ''
    },
    filename: {
        type: String,
        default: ''
    },
    created_at: {
        type: Date,
        default: new Date()
    },
    updated_at: {
        type: Date,
        default: new Date()
    }
});
const RemarkSchema = new Schema({
    remark: {
        type: String,
    },
    added_by: {
        type: Schema.ObjectId,
        ref: 'User',
        default: null
    },
    created_at: {
        type: Date,
    },
    updated_at: {
        type: Date,
    }
});

const ServiceSchema = new Schema({
    type: {
        type: String,
        default: ""
    },
    sub_category: {
        type: String,
        default: ""
    },
    source: {
        type: Schema.ObjectId,
        default: null
    },
    paid_cost: {
        type: Number,
        default: 0
    },
    total: {
        type: Number,
        default: 0
    },
    discount: {
        type: Number,
        default: 0
    },
    parts: [PartSchema],
    labour: [LabourSchema],
    opening_fitting: [OFSchema],
    service: {
        type: String,
        default: ""
    },
    mileage: {
        type: Number,
        default: 0
    },
    description: {
        type: String,
        default: ""
    },
    labour_cost: {
        type: Number,
        default: 0
    },
    part_cost: {
        type: Number,
        default: 0
    },
    of_cost: {
        type: Number,
        default: 0
    },
    hours: {
        type: Number,
        default: 0
    },
    pay_by: {
        type: String,
        default: "user"
    },
    cost: {
        type: Number,
        default: 0
    },
    quantity: {
        type: Number,
        default: 1
    },
    customer_approval: {
        type: Boolean,
        default: false
    },
    surveyor_approval: {
        type: Boolean,
        default: false
    },
    claim: {
        type: Boolean,
        default: false
    },
    exceeded_cost: {
        type: Number,
        default: 0
    },
    part_cost_editable: {
        type: Boolean,
        default: false
    },
    labour_cost_editable: {
        type: Boolean,
        default: false
    },
    of_cost_editable: {
        type: Boolean,
        default: false
    },
    custom: {
        type: Boolean,
        default: false
    }
});

const CustomerRequirementSchema = new Schema({
    requirement: {
        type: String
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User',
        default: null
    },
    added_by: {
        type: String
    },
    created_at: {
        type: Date,
        default: new Date(),
    },
    updated_at: {
        type: Date,
        default: new Date(),
    }
});

const AssetSchema = new Schema({
    value: {
        type: String
    },
    checked: {
        type: Boolean,
        default: false
    },
});

const BookingSchema = new Schema({
    package: {
        type: Schema.ObjectId,
        ref: 'UserPackage',
        default: null
    },

    booking: {
        type: Schema.ObjectId,
        default: null
    },

    car: {
        type: Schema.ObjectId,
        ref: 'Car',
        default: null
    },

    driver: {
        type: Schema.ObjectId,
        ref: 'User',
        default: null
    },

    business: {
        type: Schema.ObjectId,
        ref: 'User',
        default: null
    },

    manager: {
        type: Schema.ObjectId,
        ref: 'User',
        default: null
    },

    advisor: {
        type: Schema.ObjectId,
        ref: 'User',
        default: null
    },

    user: {
        type: Schema.ObjectId,
        ref: 'User',
        required: [true, 'User field is required'],
    },

    technician: {
        type: Schema.ObjectId,
        ref: 'User',
        default: null
    },

    technicians: [],

    surveyor: {
        type: Schema.ObjectId,
        ref: 'User',
        default: null
    },

    lead: {
        type: Schema.ObjectId,
        ref: 'Lead',
        default: null
    },
    outbound_lead: {
        type: Schema.ObjectId,
        ref: 'OutBoundLead',
        default: null
    },
    isOutbound: {
        type: Boolean,
        default: false
    },
    services: [ServiceSchema],
    claimed: [ServiceSchema],
    remarks: [RemarkSchema],
    assets: [AssetSchema],
    qc: [],

    other_assets: {
        type: String,
        default: ""
    },

    customer_requirements: [CustomerRequirementSchema],

    re_booking_no: {
        type: Number,
        default: ""
    },

    booking_no: {
        type: Number,
        default: ""
    },

    job_no: {
        type: String,
        default: ""
    },

    recording: {
        type: String,
        default: ""
    },

    odometer: {
        type: Number,
        default: ""
    },
    //Todo made Sumit..

    performa_url: {
        type: String,
        default: ''
    },
    estimate_url: {
        type: String,
        default: ''
    },

    fuel_level: {
        type: Number,
        default: 0
    },

    convenience: {
        type: String,
        default: '',
    },

    date: {
        type: Date,
        default: null,
    },

    delivery_date: {
        type: Date,
        default: new Date(),
    },

    delivery_time: {
        type: String,
        default: ""
    },

    time_slot: {
        type: String,
        default: '',
    },

    order_id: {
        type: String,
        default: ""
    },

    status: {
        type: String,
        enum: ['Cancelled', 'Confirmed', 'Inactive', 'Pending', 'Rejected', 'Closed', 'Completed', 'Failure', 'In-Process', 'Dissatisfied', 'EstimateRequested', 'Approval', 'Approved', 'Failed', 'JobInitiated', 'JobOpen', 'EstimatePrepared', 'ApprovalAwaited', 'IntimationSent', 'SurveyorApproved', 'SurveyorAssigned', 'StartWork', 'CloseWork', 'QC', 'Rework', 'Ready', 'StoreApproval',],
        default: 'Inactive',
        required: [true, 'Status is required']
    },

    sub_status: {
        type: String,
        default: ""
    },
    estimate_pdf: estimatePDFSchema,
    insurance_info: InsuanceSchema,

    payment: PaymentSchema,
    insurance_payment: PaymentSchema,
    due: DueSchema,
    insurance_due: DueSchema,
    leadManagement: leadManagement,

    address: {
        type: Schema.ObjectId,
        ref: 'Address',
    },

    is_services: {
        type: Boolean,
        default: true,
    },

    is_rework: {
        type: Boolean,
        default: false
    },

    with_tax: {
        type: Boolean,
        default: true
    },

    is_reviewed: {
        type: Boolean,
        default: false
    },

    estimation_requested: {
        type: Boolean,
        default: false
    },

    important: {
        type: Boolean,
        default: false
    },

    settlement: {
        type: Boolean,
        default: false
    },

    advance: {
        type: Boolean,
        default: false
    },

    converted: {
        type: Boolean,
        default: false
    },

    tax_type: {
        type: String,
        default: "GST"
    },

    user_link: {
        type: String,
        default: ""
    },

    surveyor_link: {
        type: String,
        default: ""
    },

    note: {
        type: String,
        default: ""
    },

    logs: [],

    service_reminder: {
        type: Date,
        default: null
    },

    started_at: {
        type: Date,
        default: null
    },

    created_at: {
        type: Date,
    },

    updated_at: {
        type: Date,
    },
});



BookingSchema.set('toObject', { virtuals: true });
BookingSchema.set('toJSON', { virtuals: true });

const Booking = mongoose.model('Booking', BookingSchema, 'Booking');

module.exports = Booking;
