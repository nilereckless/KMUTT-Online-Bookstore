let express = require('express');
let router = express.Router();
let dbConn = require('../lib/db');
var NotificationController = require('../controller/notificationController');
const middleWare = require('../middleware/authentication');
let authentication = require('../middleware/authentication');
var orderBookController = require('../controller/orderHistoryController');

router.get('/', middleWare.isAuthenticatedCart, authentication.checkAdmin, async (req, res, next) => {
   var noti = await NotificationController.getNotificationsByUserID(req.user.id); // req.user.id
   var total = [];

   for (var i = 0; i < noti.length; i++){
      var orderNum = await orderBookController.getBookOrderByOrderID(noti[i].orderNumber);
   }

   for(var j = 0 ; j < orderNum; j++){
     total.push(orderNum[j].total_price) ;
   }

   console.log("Total in noti ", total) ;
 
   res.render('notification', { notify: noti, user: req.user, staff: req.staff, sumPrice: total });
})

module.exports = router;