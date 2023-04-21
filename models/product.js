const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SpecificationSchema = new Schema({
    dimension: {
        type:String,
    },
    size: {
        type:String,
        default:""
    },
    specification: {
        type:String,
        default:""
    },
    alignment: {
        type:String,
        default:"",
    },
    orientation: {
        type:String,
        default:"",
    },
    weight: {
        type:String,
        default:""
    },
    type: []
});

const WarrantySchema = new Schema({
    warranty:{
        type:String,
    },
    domestic:{
        type:String,
    },
    international:{
        type:String,
    },
    summary:{
        type:String,
    },
    service_type: {
        type:String,
    },
    covered: {
        type:String,
    },
    not_covered: {
        type:String,
    },
});

const ProductSchema = new Schema({
    business: {
        type:Schema.ObjectId,
        ref:'business',
        null: true
    },
    product_brand: {
        type:Schema.ObjectId,
        ref:'ProductBrand',
        null: true
    },
    _product_brand:{
        type: String
    }, 
    product_model: {
        type:Schema.ObjectId,
        ref:'ProductModel',
        null: true
    },
    _product_model:{
        type: String
    }, 
    models: [],
    category:{
    	type:Schema.ObjectId,
        ref:'ProductCategory',
        null: true
    },
    _category:{
        type: String
    }, 
    subcategory:{
        type:Schema.ObjectId,
        ref:'ProductCategory',
        null: true
    },
    _subcategory:{
        type: String
    }, 
    product:{
        type: String
    }, 

    part_no: {
        type:String
    },
    
    short_description:{
        type: String
    },    
    long_description:{
    	type: String
    },
    thumbnail:{
        type: String
    },
    unit: {
        type:String,
        enum: ['KG','MG','Gram','Piece','Litre','L','ML','Pack','Unit','Set','Tyre','Battery'],
        default : 'unit'
    },
    type:{
        type: String
    },
    
    hsn_sac:{
        type: String
    },
    
    mrp:{
        type: Number
    },
    
    price:{
        type: Number
    },
    
    quantity:{
        type: Number
    },

    common: {
        type:Boolean,
        default: false
    },

    tax_info: {},
    warranty: WarrantySchema,
    specification: SpecificationSchema
});

ProductSchema.virtual('preview').get(function() {  
    return 'https://s3.ap-south-1.amazonaws.com/'+config.BUCKET_NAME+'/master/product/300/'+this.thumbnail;
});


ProductSchema.set('toObject', { virtuals: true });
ProductSchema.set('toJSON', { virtuals: true });

const Product = mongoose.model('Product',ProductSchema,'Product');

module.exports = Product;