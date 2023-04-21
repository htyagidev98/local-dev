const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductBrandSchema = new Schema({
    value: {
        type:String,
    },
    logo: {
        type:String,
    },
    tag: {
        type:String,
    },
    category: {
        type:Schema.ObjectId,
        ref:'ProductCategory',
        required:[true,'category field is required'],
    },
});

ProductBrandSchema.set('toObject', { virtuals: true });
ProductBrandSchema.set('toJSON', { virtuals: true });


const ProductBrand = mongoose.model('ProductBrand', ProductBrandSchema, 'ProductBrand');

module.exports = ProductBrand;