const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductModelSchema = new Schema({
	brand:{
        type:Schema.ObjectId,
        ref: 'ProductBrand',
    },
    value: {
        type:String,
    },
 	model: {
        type:String,
    }
});

ProductModelSchema.set('toObject', { virtuals: true });
ProductModelSchema.set('toJSON', { virtuals: true });


const ProductModel = mongoose.model('ProductModel', ProductModelSchema, 'ProductModel');

module.exports = ProductModel;