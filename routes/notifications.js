let express = require('express');
let router = express.Router();
let dbConn = require('../lib/db');
var NotificationController = require('../controller/notificationController') ;
const middleWare = require('../middleware/authentication');

router.get('/',middleWare.isAuthenticatedCart, async (req, res, next) => {
   var noti = await NotificationController.getNotificationsByUserID(req.UserRefreshClient.id) ; // req.user.id
   res.json(noti) ;
})

module.exports = router ;