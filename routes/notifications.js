let express = require('express');
let router = express.Router();
let dbConn = require('../lib/db');
var NotificationController = require('../controller/notificationController');
const middleWare = require('../middleware/authentication');
let authentication = require('../middleware/authentication');
var orderBookController = require('../controller/orderHistoryController');

router.get('/', middleWare.isAuthenticatedCart, authentication.checkAdmin, async (req, res, next) => {
   var noti = await NotificationController.getNotificationsByUserID(req.user.id); // req.user.id
   var orderNum = [] ;
   var count = 0 ;
   var total = [];

   for(var i = 0 ; i < noti.length; i++){
      if(noti[i].status === "pending" || noti[i].status === "Pending"){
       //  var orderNum = await orderBookController.getBookOrderByOrderID(noti[i].orderNumber);
       orderNum.push(noti[i].orderNumber) ;
         count+=1 ;
      }
   //   var orderNum = await orderBookController.getBookOrderByOrderID(noti[i].orderNumber);
      console.log("Ordernum for noti ", orderNum) ;
   }

   console.log("count ", count) ;

   for(var z = 0 ; z < count ; z++){
      console.log("orderNum Z", orderNum[z]) ;
      var testPrice = await orderBookController.getBookOrderByOrderID(orderNum[z]);
       console.log("Test price ", testPrice) ;
       console.log("Total price",  testPrice.total_price ) ;
       console.log("Price ja", testPrice[0].total_price) ;
   }
 
   res.render('notification', { notify: noti, user: req.user, staff: req.staff, sumPrice: total });
})

module.exports = router;