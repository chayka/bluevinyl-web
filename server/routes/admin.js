var express = require('express'),
    router = express.Router();

router.get('/noop', function(req, res){
    res.send('noop');
});

module.exports = router;
