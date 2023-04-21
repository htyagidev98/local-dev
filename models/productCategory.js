const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductCategorySchema = new Schema({
    category: {
        type:String,
    },
    parent_id: {
        type:Schema.ObjectId,
        null: true
    },
    is_show: {
        type:Boolean,
        default:true
    },
    children: {
        type:Boolean,
        default:true
    },
});

ProductCategorySchema.set('toObject', { virtuals: true });
ProductCategorySchema.set('toJSON', { virtuals: true });

ProductCategorySchema.virtual('icon').get(function() {  
    var category = this.category;
    return 'https://s3.ap-south-1.amazonaws.com/'+config.BUCKET_NAME+'/icon/product/'+category.replace(/\s+/g, '-').toLowerCase()+".png";
});


const ProductCategory = mongoose.model('ProductCategory',ProductCategorySchema,'ProductCategory');

module.exports = ProductCategory;