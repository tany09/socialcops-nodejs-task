const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/nodejs-task', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true
});
