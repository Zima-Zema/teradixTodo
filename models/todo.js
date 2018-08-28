var mongoose = require('mongoose');

var Todo = mongoose.model('Todo', {
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 5
    },
    subject:{
        type: String,
        required: true,
        trim: true,
        minlength: 5
    },
    completed: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Number,
        default: null
    },
    _creator:{
        require:true,
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
});


module.exports = { Todo };