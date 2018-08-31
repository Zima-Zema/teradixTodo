var mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require("bcryptjs");

var UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'User Emile number required'],
        trim: true,
        minlength: 5,
        unique: true,
        validate: {
            validator: (val) => validator.isEmail(val),
            message: '{VALUE} is not a valid Email Address!'
        },

    },
    password: {
        type: String,
        required: [true, 'User Password number required'],
        trim: true,
        minlength: 6,
    },
    name:{
        type: String,
        required: [true, 'User Name number required'],
        trim: true,
    },
    tokens: [{
        access: {
            type: String,
            required: true,
        },
        token: {
            type: String,
            required: true,
        }
    }]
}, {
        usePushEach: true
    });

UserSchema.methods.toJSON = function () {
    var userObj = this.toObject();
    return _.pick(userObj, ['_id', 'email','name']);
}
UserSchema.methods.generateAuthToken = function () {
    var user = this;
    var access = 'auth';
    var token = jwt.sign({
        _id: user._id.toHexString(),
        access: access
    }, 'abc123').toString();

    user.tokens.push({
        access: access,
        token: token
    });
    return user.save().then(() => {
        return token;
    })
};
UserSchema.methods.removeToken = function (token) {
    return this.update({
        $pull: {
            tokens: {
                token: token
            }
        }
    });
}
UserSchema.statics.findByToken = function (token) {
    var decoded;
    try {
        decoded = jwt.verify(token, "abc123");
    } catch (error) {
        return Promise.reject();
    }
    return this.findOne({
        '_id': decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    })
}
UserSchema.statics.findByCredentials = function (email, password) {
    return this.findOne({ email }).then((user) => {
        if (!user) {
            return Promise.reject();
        }
        return bcrypt.compare(password, user.password).then((res) => {
            if (!res) {
                return Promise.reject();
            }
            return user;
        })
    })
}
UserSchema.pre("save", function (next) {
    if (this.isModified('password')) {
        bcrypt.genSalt(10).then(salt => {
            bcrypt.hash(this.password, salt).then(hash => {
                this.password = hash;
                next();
            });
        });
    } else {
        next();
    }
})

var User = mongoose.model('User', UserSchema);

module.exports = { User };