const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const InsuranceCompanySchema = new Schema({
    company: {
        type:String
    },   
    gstin: {
        type:String
    },  
    user: {
        type: Schema.ObjectId,
        ref: 'User',
    },
    created_at:{
        type:Date,
    },
    
    updated_at:{
        type:Date,
    },
});


InsuranceCompanySchema.set('toObject', { virtuals: true });
InsuranceCompanySchema.set('toJSON', { virtuals: true });


const InsuranceCompany = mongoose.model('InsuranceCompany', InsuranceCompanySchema, 'InsuranceCompany');

module.exports = InsuranceCompany;
