var mongoose = require('mongoose');

mongoose.connect('mongodb+srv://adminlove:t%40ye1234@skrypt-sbitd.mongodb.net/test?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, (error) => {
    if (error) {
        console.log(error);
    } else {
        console.log('created successfully');
    }
});