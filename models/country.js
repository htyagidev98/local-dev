const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CountrySchema = new Schema({
    isoAlpha2: {
        type:String,
    },
    isoAlpha3: {
        type:String,
    },
    telephoneCode: {
        type:String,
    },
    currency: {
        type:String,
    },
    currency_symbol: {
        type:String,
    },
    countryName: {
        type:String,
    },

    timezone:[],

});

const Country = mongoose.model('Country',CountrySchema,'Country');

module.exports = Country;
