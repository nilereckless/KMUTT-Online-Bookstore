var express = require('express');
var router = express.Router();
let viewbook = require('../lib/viewbook');
let moment = require('moment');
let authentication = require('../middleware/authentication');
var notificationController = require('../controller/notificationController') ;


router.get('/', authentication.checkAdmin, async (req, res, next) => {
  console.log("test", req.user)
  var date = await viewbook.getDateNewestBook();
  var data = await viewbook.getNewestBook(moment(date).format('YYYY-MM-DD'), 3, 3);
  var notifyUser = null ;
 // console.log(req.staff);
   if(req.user){
     notifyUser = await notificationController.getNotificationsByUserID(req.user.id) ;
   }

  res.render('index', { data: data, user: req.user, staff: req.staff, notify : notifyUser});
})

router.get('/newbook', authentication.checkAdmin, async (req, res, next) => {
  var date = await viewbook.getDateNewestBook();
  var data = await viewbook.getNewestBook(moment(date).format('YYYY-MM-DD'), 3);
 // console.log(data);

  res.render('viewbook', { data: data, user: req.user, staff: req.staff });
})




module.exports = router;
