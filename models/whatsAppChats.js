const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Chats = new Schema({
    sessionId: String,
    channelId: String,
    conversationId: {
        type: String,
         default: null
        },
    direction: {
        type: String,
         default: null
        },
    origin: {
        type: String,
         default: null
        },
    platform: {
        type: String,
         default: null
        },
    status: {
        type: String,
         default: null
        },
    to: {
        type: String,
         default:null
        },
    type: {
        type: String,
         default: null
        },
    updateDatetime: {
        type: String,
         default: null
        },
    contact: {
        type: String,
         default: null
        },
    name: {
        type: String,
         default: null
        },
    address: {
        type: String,
         default: null
        },
    email: {
        type: String,
         default: null
        },
        media_url:[],
    lead: Schema.ObjectId,
    chat: [],
    start_at: Date,
    update_at: Date,
    isBot: {
        type: Boolean,
        default: true
    }
})


Chats.set('toObject', { virtuals: true });
Chats.set('toJSON', { virtuals: true });

const chats = mongoose.model('Chats', Chats, 'Chats');
module.exports = chats;