var express = require('express');
var router = express.Router();
let viewbook = require('../lib/viewbook');
let moment = require('moment');
let authentication = require('../middleware/authentication');


router.get('/', authentication.checkAdmin, async (req, res, next) => {
  console.log("test", req.session.passport.user)
  var date = await viewbook.getDateNewestBook();
  var data = await viewbook.getNewestBook(moment(date).format('YYYY-MM-DD'), 3, 3);
 // console.log(req.staff);

  res.render('index', { data: data, user: req.user, staff: req.staff});
})

router.get('/newbook', async (req, res, next) => {
  var date = await viewbook.getDateNewestBook();
  var data = await viewbook.getNewestBook(moment(date).format('YYYY-MM-DD'), 3);
 // console.log(data);

  res.render('viewbook', { data: data });
})




module.exports = router;
