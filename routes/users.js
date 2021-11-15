var express = require('express');
var router = express.Router();
const middleWare = require('../middleware/authentication');
var bookController = require('../controller/bookController');
var shipController = require('../controller/shipAddressController');
const Cart = require('../model/cartModel');
var cartStorage = require('../model/cartStorage') ;
var orderBookController = require('../controller/orderBookController');
let authentication = require('../middleware/authentication');

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

router.get('/omise', async (req, res) => {

  var cart = null;
  //   console.log(cartStorage[req.user.id]) ;
  if (cartStorage.cartStorage[req.user.id] === undefined) {
    cart = new Cart(req.user.id);
  } else {
    cart = new Cart(req.user.id, cartStorage.cartStorage[req.user.id].cart);
  }
  cartStorage.cartStorage[req.user.id] = cart;
  var total = 0;
  const ids = cart.getCart().map(o => o.id)
  const filtered = cart.getCart().filter(({ id }, index) => !ids.includes(id, index + 1))
  for (var i = 0; i < filtered.length; i++) {
    var b = await bookController.getBookByID(filtered[i].id);
    total = total + (b[0].price * cart.getQuantityByBookID(filtered[i].id));
  }

  console.log("Total price to pay", total);

  var omise = require('omise')({
    'secretKey': 'skey_test_5p4rrbsrwo9f2d2ut18'
  });
  var token = req.query.omise_token;

  omise.charges.create({
    'amount': total * 100,
    'currency': 'thb',
    'card': token
  }, function (err, charge) {
    console.log("Call charge omise", charge);
    // console.log(charge["status"]);
    console.log("To Omise Backend");
    if (charge["status"] === "successful") {
      console.log("Omise fully successful!!");
      // return res.render('') ;
    } else {
      console.log("Omise payment failed");

    }
  });
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

module.exports = router;
