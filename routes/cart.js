var express = require('express');
var router = express.Router();
const Cart = require('../model/cartModel');
var bookController = require('../controller/bookController');
var cartStorage = [];
const middleWare = require('../middleware/authentication');
var shipController = require('../controller/shipAddressController');
var locationController = require('../controller/locationController');
var orderHistoryController = require('../controller/orderHistoryController');
let authentication = require('../middleware/authentication');
let dbConn = require('../lib/db');

//middleware.isAuthenticated(), วางไว้หน้า async
router.get('/', middleWare.isAuthenticatedCart, authentication.checkAdmin, async (req, res, next) => {
    console.log("sessioncome", req.user)
    var cart = null;
    //   console.log(cartStorage[1]) ;
    if (cartStorage[req.user.id] === undefined) {
        cart = new Cart(req.user.id);
    } else {
        cart = new Cart(req.user.id, cartStorage[req.user.id].cart);
    }

    cartStorage[req.user.id] = cart;
    console.log(cart);
    var cartInfo = [];
    var total = 0;
    const ids = cart.getCart().map(o => o.id)
    const filtered = cart.getCart().filter(({ id }, index) => !ids.includes(id, index + 1))
    for (var i = 0; i < filtered.length; i++) {
        var b = await bookController.getBookByID(filtered[i].id);
        var data = {
            bookName: b[0].name,
            quantity: cart.getQuantityByBookID(filtered[i].id),
            price: b[0].price,
            img: b[0].imageUrl,
            author: b[0].author,
            id: b[0].id,
            stock: b[0].stock
        }
        cartInfo.push(data);
        total = total + (b[0].price * cart.getQuantityByBookID(filtered[i].id));
    }
    res.render('cart', { cart: cartInfo, totalCart: cart.getTotalCart(), sumPrice: total, user: req.user, staff: req.staff });
})

router.get('/add/:id', middleWare.isAuthenticatedCart, async (req, res, next) => {
    var bookID = req.params.id;
    var cart = null;
    if (cartStorage[req.user.id] === undefined) {
        cart = new Cart(req.user.id);
        //  console.log("Create new cart = " ,cart.getCart()) ;
        cart.addCart({ id: bookID });
    } else {
        //   console.log("Receive " , cartStorage[1]) ;
        cart = new Cart(req.user.id, cartStorage[req.user.id].cart);
        cart.addCart({ id: bookID });
    }
    cartStorage[req.user.id] = cart;
    res.json("success");
})

router.get('/add/:id/:quantity', middleWare.isAuthenticatedCart, async (req, res, next) => {
    var bookID = req.params.id;
    var quantity = req.params.quantity;
    var cart = null;
    if (cartStorage[req.user.id] === undefined) {
        cart = new Cart(req.user.id);
        //  console.log("Create new cart = " ,cart.getCart()) ;
        cart.addCart({ id: bookID });
    } else {
        //   console.log("Receive " , cartStorage[1]) ;
        cart = new Cart(req.user.id, cartStorage[req.user.id].cart);
        cart.addCartWithQuantity(bookID, quantity);
    }
    cartStorage[req.user.id] = cart;
    res.json("success");
})

router.get('/set/:quantity/:id', middleWare.isAuthenticatedCart, async (req, res, next) => {
    var bookID = req.params.id;
    var quantity = req.params.quantity;
    var cart = null;
    if (cartStorage[req.user.id] === undefined) {
        cart = new Cart(req.user.id);
        //  console.log("Create new cart = " ,cart.getCart()) ;
        cart.addCart({ id: bookID });
    } else {
        //   console.log("Receive " , cartStorage[1]) ;
        cart = new Cart(req.user.id, cartStorage[req.user.id].cart);
        cart.addCartWithQuantity(bookID, quantity);
    }
    cartStorage[req.user.id] = cart;
    res.json("success");
})



router.get('/remove/:id', middleWare.isAuthenticatedCart, async (req, res, next) => {
    var bookID = req.params.id;
    var cart = null;
    if (cartStorage[req.user.id] === undefined) {
        cart = new Cart(req.user.id);
    } else {
        cart = new Cart(req.user.id, cartStorage[req.user.id].cart);
        cart.removeCartByBookID(bookID);
    }
    cartStorage[req.user.id] = cart;
    res.json("success");
})

router.get('/clear', middleWare.isAuthenticatedCart, async (req, res, next) => {
    var bookID = req.params.id;
    var cart = null;
    if (cartStorage[req.user.id] === undefined) {
        cart = new Cart(req.user.id);
    } else {
        cart = new Cart(req.user.id, cartStorage[req.user.id].cart);
        cart.removeAllCart();
    }
    cartStorage[req.user.id] = cart;
    res.json("success");
})

router.get('/clear/:id', middleWare.isAuthenticatedCart, async (req, res, next) => {
    var bookID = req.params.id;
    var cart = null;
    if (cartStorage[req.user.id] === undefined) {
        cart = new Cart(req.user.id);
    } else {
        cart = new Cart(req.user.id, cartStorage[req.user.id].cart);
        cart.removeAllCartByBookID(bookID);
    }
    cartStorage[req.user.id] = cart;
    res.json("success");
})

router.get('/count', middleWare.isAuthenticatedCart, async (req, res, next) => {
    var cart = null;
    //   console.log(cartStorage[1]) ;
    if (cartStorage[req.user.id] === undefined) {
        cart = new Cart(req.user.id);
    } else {
        cart = new Cart(req.user.id, cartStorage[req.user.id].cart);
    }
    cartStorage[req.user.id] = cart;
    res.json({ count: cart.getTotalCart() });
})

router.get('/checkout', middleWare.isAuthenticatedCart, authentication.checkAdmin, async (req, res, next) => {
    var shipAddress = await shipController.getAllShippingAddressByUserID(req.user.id);
    // console.log(shipAddress) ;
    var province = await locationController.getAllProvince();
    var district = await locationController.getAllDistrict();
    res.render('address', { address: shipAddress, province: province, district: district, user: req.user, staff: req.staff });
})

router.post('/checkout', middleWare.isAuthenticatedCart, async (req, res, next) => {

    var orderID = Math.round(Math.floor(Date.now() / 1000))
    //written by arit
    var shipID = req.query.shipIDtoSend;
    console.log(shipID);
    var address = await shipController.getShippingAddressByShipID(req.body.address);
    var cart = null;
    var shipData = await shipController.getShippingAddressByShipID(shipID);
    console.log(shipData);
    console.log(data);

    if (cartStorage[req.user.id] === undefined) {
        cart = new Cart(req.user.id);
    } else {
        cart = new Cart(req.user.id, cartStorage[req.user.id].cart);
    }
    cartStorage[req.user.id] = cart;
    var cartInfo = [];
    var total = 0; //no

    const ids = cart.getCart().map(o => o.id)
    const filtered = cart.getCart().filter(({ id }, index) => !ids.includes(id, index + 1))
    for (var i = 0; i < filtered.length; i++) {
        var b = await bookController.getBookByID(filtered[i].id);
        var data = {
            bookName: b[0].name,
            quantity: cart.getQuantityByBookID(filtered[i].id),
            price: b[0].price,
            img: b[0].imageUrl,
            author: b[0].author,
            id: b[0].id,
            stock: b[0].stock
        }
        cartInfo.push(data);
        total = total + (b[0].price * cart.getQuantityByBookID(filtered[i].id));
    }
   
    for (var j = 0; j < cartInfo.length; j++) {
        var allorder = await orderHistoryController.addAllOrderByID(req.user.id, orderID, cartInfo[j].bookName, cartInfo[j].quantity, total, cartInfo[j].id, shipData.shipID, shipData.district, shipData.province, shipData.postalCode, shipData.address, shipData.subdistrict);
    }

    //end here

    var address = await shipController.getShippingAddressByShipID(req.body.address);
    if (req.user.id == address.userID) {
        var orderIDState = await orderHistoryController.addOrderHistoryByID(req.user.id, orderID, req.body.payment_option, req.body.address, req.user.email, req.user.name);
        if (orderIDState.affectedRows === 1) {
            res.json(orderID);
        } else {
            res.json("error");
        }

    } else {
        res.json("error");
    }
})

router.get('/checkout/complete/:orderID', middleWare.isAuthenticatedCart, authentication.checkAdmin, async (req, res, next) => {
    var orderID = await orderHistoryController.getOrderHistoryByID(req.params.orderID);
    if (orderID.length > 0 && orderID[0].user_id == req.user.id) {
        res.render("completeOrder", { orderID: orderID[0].order_id, user: req.user, staff: req.staff });
    } else {
        res.render("completeOrder", { orderID: null, message: "Not found your orderID", user: req.user, staff: req.staff });
    }
    //clear cart
    var cart = null;
    if (cartStorage[req.user.id] === undefined) {
        cart = new Cart(req.user.id);
    } else {
        cart = new Cart(req.user.id, cartStorage[req.user.id].cart);
        cart.removeAllCart();
    }
    cartStorage[req.user.id] = cart;
    res.json("success");

})

router.get('/subdistrict/:id', middleWare.isAuthenticatedCart, async (req, res, next) => {
    var subDist = await locationController.getSubdistrictByDistrictID(req.params.id);
    console.log(subDist);
    res.json(subDist);
})

router.get('/address/:id', middleWare.isAuthenticatedCart, async (req, res, next) => {
    var addr = await shipController.getShippingAddressByShipID(parseInt(req.params.id));
    res.json(addr);
})

module.exports = router;

// req.user.id แทนเลข 1 ทุกอัน