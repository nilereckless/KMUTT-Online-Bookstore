let express = require('express');
let router = express.Router();
let dbConn = require('../lib/db');
var NotificationController = require('../controller/notificationController') ;
const middleWare = require('../middleware/authentication');
let authentication = require('../middleware/authentication');
var orderBookController = require('../controller/orderHistoryController') ;

router.get('/',middleWare.isAuthenticatedCart, authentication.checkAdmin,  async (req, res, next) => {
   var noti = await NotificationController.getNotificationsByUserID(req.user.id) ; // req.user.id
   var total = 0 ;
 //  console.log("User id for noti", req.user.id) ;
   console.log("Noti orderNum ", noti[0].orderNumber) ;
   var orderNum = orderBookController.getBookOrderByOrderID(noti[0].orderNumber) ;
   console.log("Order in noti ", orderNum) ;
   console.log("Total price in noti ", orderNum.total_price) ;
   //res.json(noti) ;
   res.render('notification', {notify : noti, user : req.user, staff: req.staff}) ;
})

module.exports = router ;