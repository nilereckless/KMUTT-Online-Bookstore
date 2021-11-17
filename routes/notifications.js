let express = require('express');
let router = express.Router();
let dbConn = require('../lib/db');
var NotificationController = require('../controller/notificationController') ;
const middleWare = require('../middleware/authentication');

router.get('/',middleWare.isAuthenticatedCart, async (req, res, next) => {
   var noti = await NotificationController.getNotificationsByUserID(req.user.id) ; // req.user.id
   //res.json(noti) ;
   res.render('notification', {notify : noti, user : req.user, staff:req.staff}) ;
})

router.get('/getNoti/(:id)',middleWare.isAuthenticatedCart, async (req, res, next) => {
   console.log("Params id" ,req.params.id) ;
   console.log("Noti id", req.user.id) ;
   console.log("What refreshclient", req.UserRefreshClient.id) ;
   var noti = await NotificationController.getNotificationsByUserID(req.user.id) ; // req.user.id
   //res.json(noti) ;
   res.render('notification', {notify : notify, user : req.user, staff: req.staff}) ;
})

module.exports = router ;