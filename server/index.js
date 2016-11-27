var express = require('express');
var app = express();

app.use(express.static('client/dist'));

var admin = require('./routes/admin');
app.use('/api/blue-vinyl', admin);

app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
});