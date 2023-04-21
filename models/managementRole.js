const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var _ = require('lodash');


const ManagementRoleSchema = new Schema({
    department:{
        type:String,
        default: ""
    },

    role:{
        type:String,
        default: ""
    }
});

ManagementRoleSchema.set('toObject', { virtuals: true });
ManagementRoleSchema.set('toJSON', { virtuals: true });

const ManagementRole = mongoose.model('ManagementRole',ManagementRoleSchema,'ManagementRole');

module.exports = ManagementRole;