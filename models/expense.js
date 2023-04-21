const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var _ = require('lodash');

const ExpenseSchema = new Schema({
    payee: {
        type:Schema.ObjectId,
        ref:'User',
        default: null
    },

    name: {
        type: String,
        default: ""
    },

    contact_no: {
        type: String,
        default: ""
    },
    
    business: {
        type:Schema.ObjectId,
        ref:'User',
        required:[true,'Business ObjectId field is required'],
    },
    
    items: [],
    
    expense_no:{
        type: String
    },
    
    category:{
        type: String,
        default:""
    },
      
    reference:{
        type: String
    },
    
    date: {
        type:Date,
    },

    total:{
        type: Number
    },

    status:{
        type: String
    },
    
    created_at: {
        type:Date,
    },

    updated_at: {
        type:Date,
    },
});

ExpenseSchema.set('toObject', { virtuals: true });
ExpenseSchema.set('toJSON', { virtuals: true });

const Expense = mongoose.model('Expense',ExpenseSchema,'Expense');

module.exports = Expense;


