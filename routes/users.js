var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.get('/address', async (req, res) => {
  var shipAddress = await shipController.getAllShippingAddressByUserID(1); // req.user.id
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
  var shipAddress = await shipController.addShippingAddress(1, req.body.district, req.body.province, req.body.postalcode, req.body.address, req.body.subdistrict).catch((e) => {
    console.log(e);
  });
  if (shipAddress.affectedRows === 1) {
    res.json('success');
  } else {
    res.json('error');
  }

})

module.exports = router;
