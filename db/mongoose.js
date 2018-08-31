var mongoose = require('mongoose');

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://teradixAdmin:teradixPassword159@ds022228.mlab.com:22228/teradixapp', {
    // useCreateIndex: true,
    useNewUrlParser: true
});

mongoose.connection.on('error', (err) => {
    console.log(err);
})
module.exports = {
    mongoose: mongoose
}