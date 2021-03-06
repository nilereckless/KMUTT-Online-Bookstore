var express = require('express');
var router = express.Router();
const middleWare = require('../middleware/authentication');
var bookController = require('../controller/bookController');
var shipController = require('../controller/shipAddressController');
const Cart = require('../model/cartModel');
var cartStorage = require('../model/cartStorage');
var orderBookController = require('../controller/orderBookController');
let authentication = require('../middleware/authentication');
var fetch = require('node-fetch');
var notificationController = require('../controller/notificationController') ;

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.get('/address', async (req, res) => {
  var shipAddress = await shipController.getAllShippingAddressByUserID(req.user.id); // req.user.id
  // console.log(shipAddress) ;
  res.json(shipAddress);
})

router.get('/payment', (req, res) => {
  res.render('payment');
})

router.get('/address/(:id)', async (req, res) => {
  var id = req.params.id;
  var shipAddress = await shipController.getShippingAddressByShipID(id);
  console.log(shipAddress);
  res.json(shipAddress);
})

router.post('/address/save', async (req, res) => {
  console.log("Address now", req.body);
  var shipAddress = await shipController.addShippingAddress(req.user.id, req.body.district, req.body.province, req.body.postalcode, req.body.address, req.body.subdistrict).catch((e) => {
    console.log(e);
  });
  if (shipAddress.affectedRows === 1) {
    res.json('success');
  } else {
    res.json('error');
  }

})

router.get('/orderHistory', authentication.checkAdmin, async (req, res) => {
  var orderbooks = await orderBookController.getorderByUserID(req.user.id)
  console.log(req.staff);
  res.render('orderHistory', { orderbooks: orderbooks, user: req.user, staff: req.staff })
})

router.get('/notify', async (req, res) => {
 var notify = await notificationController.getNotificationsByUserID(req.user.id) ;
// console.log(notify) ;
 res.json(notify) ;
})

module.exports = router;
