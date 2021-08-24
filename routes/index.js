var express = require('express');
var router = express.Router();
let searchLib = require('../lib/search');
let dbConn = require('../lib/db');
let viewbook = require('../lib/viewbook');
let moment = require('moment');


router.get('/', async (req, res, next) => {
  var date = await viewbook.getDateNewestBook();
  var data = await viewbook.getNewestBook(moment(date).format('YYYY-MM-DD'), 3, 3);

  res.render('index', { data: data, user: null });
})

router.get('/newbook', async (req, res, next) => {
  var date = await viewbook.getDateNewestBook();
  var data = await viewbook.getNewestBook(moment(date).format('YYYY-MM-DD'), 3);
  console.log(data);

  res.render('viewbook', { data: data });
})




module.exports = router;
