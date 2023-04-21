const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductFilterSchema = new Schema({
    filters: [],
    parent:{
        type:Schema.ObjectId,
        ref: 'ProductCategory',
    },
    category:{
        type:Schema.ObjectId,
        ref: 'ProductCategory',
    },
    _category:{
        type:Schema.ObjectId,
        ref: 'ProductBrand',
    },
});

ProductFilterSchema.set('toObject', { virtuals: true });
ProductFilterSchema.set('toJSON', { virtuals: true });


const ProductFilter = mongoose.model('ProductFilter',ProductFilterSchema,'ProductFilter');

module.exports = ProductFilter;

/*
    {
        "category" : ObjectId("5cf1396c0f6a8a1b596a4fa9"),
        "_category" : "Accessories",
        "filters": ["ProductBrand","Price","Type"]
    }
    {
        "category" : ObjectId("5b8a62d11520d8289005ee15"),
        "_category" : "Tyres",
        "filters": ["ProductBrand","Model","Price","Type","Size"]
    }
    {
        "category" : ObjectId("5b8a62d11520d8289005ee15"),
        "_category" : "Tyres",
        "filters": ["ProductBrand","Model","Price","Type","Size"]
    }

*/