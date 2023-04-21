const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OwnerSchema = new Schema({
    owner: {
        type:String,
    },
    
    selected: {
        type:Boolean,
        default:false,
    },
});

OwnerSchema.virtual('value').get(function() {  
    return this.owner;
});

OwnerSchema.set('toObject', { virtuals: true });
OwnerSchema.set('toJSON', { virtuals: true });


const Owner = mongoose.model('Owner',OwnerSchema,'Owner');

module.exports = Owner;