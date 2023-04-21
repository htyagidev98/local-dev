const mongoose = require('mongoose');
const Schema = mongoose.Schema;

config = require('./../config')

const customerRelationshipSchema = new Schema({
    clicktochat_WhatsApp: {
        type: Boolean,
        default: false
    },
    clicktocall: {
        type: Boolean,
        default: false
    },
    whatsApp_Official: {
        type: Boolean,
        default: false
    },
    chatwithWorkshops: {
        type: Boolean,
        default: false
    },
    chatwithCarOwners: {
        type: Boolean,
        default: false
    },
    //
    b2b_LeadGeneration: {
        type: Boolean,
        default: false
    },
    b2c_LeadGeneration: {
        type: Boolean,
        default: false
    },
    automaticInventoryUpdate: {
        type: Boolean,
        default: false
    },
    b2b_payments: {
        type: Boolean,
        default: false
    },

});

const ThirdPartyIntegrationsSchema = new Schema({
    quickbooks: {
        type: Boolean,
        default: false
    },
    justdial: {
        type: Boolean,
        default: false
    },
    knowlarity: {
        type: Boolean,
        default: false
    },
    whatsApp_Official: {
        type: Boolean,
        default: false
    },
    custom_API_integrations: {
        type: Boolean,
        default: false
    },

});
const ServiceMarketingSchema = new Schema({
    toppositionintheWorkoshop: {
        type: Number,
        // default: 5
    },
    serviceListingsonAutroidApp: {
        type: Number,
        // default: 5
    },
    exclusiveServicesonAutroidApp: {
        type: Number,
        // default: 0
    },
    toppositionintheApp: {
        type: Boolean,
        // default: false
    },
    packages: {
        type: Boolean,
        // default: false
    },
    couponsOffers :{
        type : Boolean,
       // default : false,
    },
    promotionalSMS: {
        type: Number,
        // default: 0
    },
    certificate: {
        type: Boolean,
        // default: false
    },
    branding: {
        type: Boolean,
        // default: false
    },

});
const AccountingReportingSchema = new Schema({

    upiPayment: {
type : Boolean,
//default :false
    } ,

    accounting: {
        type: Boolean,
        default: false
    },
    gstReport : {
        type : Boolean,
        //default : false
    },
    
    reports: {
        type: Boolean,
        default: false
    },
    integratedWallet: {
        type: Boolean,
        default: false
    },
    gstReturns: {
        type: Boolean,
        // default: false
    }

});
const SupportTrainingSchema = new Schema({

    technicalAssistance: {
        type: Boolean,
        default: false
    },
    Support: {
        type: String,
        default: "Online"
    },
    managementTrainings: {
        type: Boolean,
        default: false
    },
    processImplementation: {
        type: Boolean,
        default: false
    },
    carEagerPartnerEligibility: {
        type: Boolean,
        default: false
    },

});
const PROCUREMENTSchema = new Schema({

    partsProcurement: {
        type: Boolean,
        default: false
    },
    chatwithBusinesses: {
        type: String,
        default: "Online"
    },
    orderManagement: {
        type: Boolean,
        default: false
    },
    B2BPayments: {
        type: Boolean,
        default: false
    },
    autoInventoryUpdate: {
        type: Boolean,
        default: false
    },

});

const SuitePlanSchema = new Schema({
    plan: {
        type: String
    },

    short_name: {
        type: String
    },

    name: {
        type: String
    },

    price: {
        type: Number
    },

    validity: {
        type: Number
    },

    default: [],

    main: [],

    limits: {
        type: Object
    },

    category: {
        type: String
    },
    chat: {
        type: Boolean,
        default: false
    },
    thirdParty: ThirdPartyIntegrationsSchema,
    procurement: PROCUREMENTSchema,
    supportTraining: SupportTrainingSchema,
    accountings: AccountingReportingSchema,
    marketing: ServiceMarketingSchema,
    customerRelationship: customerRelationshipSchema


});
// abhinav
const GeneralSchema = new Schema({
    dashboard: {
        type: Boolean,
        default: true
    },
    businessOverview: {
        type: Boolean,
        default: true
    },
    multiUser_support: {
        type: Boolean,
        default: false
    },

});
SuitePlanSchema.set('toObject', { virtuals: true });
SuitePlanSchema.set('toJSON', { virtuals: true });

const SuitePlan = mongoose.model('SuitePlan', SuitePlanSchema, 'SuitePlan');

module.exports = SuitePlan;
