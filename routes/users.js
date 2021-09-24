var express = require('express');
var router = express.Router();
const middleWare = require('../middleware/authentication') ;
var bookController = require('../controller/bookController');


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});


module.exports = router;
