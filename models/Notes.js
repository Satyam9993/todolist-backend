const mongoose = require('mongoose');
const { Schema } = mongoose;

const NoteSchema = new Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'user'
    },
    title: {
        type : String,
        required: true
    },
    description: {
        type : String,
    },
    status : {
        type : String,
        default : "active",
        enum : ["active", "working", "done"]
    },
    date : {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('notes',NoteSchema); 