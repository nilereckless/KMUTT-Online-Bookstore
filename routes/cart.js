var express = require('express');
var router = express.Router();
const Cart = require('../model/cartModel');
var bookController = require('../controller/bookController');
const middleWare = require('../middleware/authentication');
var shipController = require('../controller/shipAddressController');
var locationController = require('../controller/locationController');
var orderHistoryController = require('../controller/orderHistoryController');
let authentication = require('../middleware/authentication');
let dbConn = require('../lib/db');
var cartStorage = require('../model/cartStorage');
var notificationController = require('../controller/notificationController');

//middleware.isAuthenticated(), วางไว้หน้า async

router.get('/', middleWare.isAuthenticatedCart, authentication.checkAdmin, async (req, res, next) => {
    var cart = null;
    //   console.log(cartStorage.cartStorage[1]) ;
    if (cartStorage.cartStorage[req.user.id] === undefined) {
        cart = new Cart(req.user.id);
    } else {
        cart = new Cart(req.user.id, cartStorage.cartStorage[req.user.id].cart);
    }
    cartStorage.cartStorage[req.user.id] = cart;
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
    console.log("User id", req.user.id);
    var cart = null;
    if (cartStorage.cartStorage[req.user.id] === undefined) {
        cart = new Cart(req.user.id);
        //  console.log("Create new cart = " ,cart.getCart()) ;
        cart.addCart({ id: bookID });
    } else {
        //   console.log("Receive " , cartStorage[1]) ;
        cart = new Cart(req.user.id, cartStorage.cartStorage[req.user.id].cart);
        cart.addCart({ id: bookID });
    }
    cartStorage.cartStorage[req.user.id] = cart;
    res.json("success");
})

router.get('/add/:id/:quantity', middleWare.isAuthenticatedCart, async (req, res, next) => {
    var bookID = req.params.id;
    var quantity = req.params.quantity;
    var cart = null;
    if (cartStorage.cartStorage[req.user.id] === undefined) {
        cart = new Cart(req.user.id);
        //  console.log("Create new cart = " ,cart.getCart()) ;
        cart.addCart({ id: bookID });
    } else {
        //   console.log("Receive " , cartStorage[1]) ;
        cart = new Cart(req.user.id, cartStorage.cartStorage[req.user.id].cart);
        cart.addCartWithQuantity(bookID, quantity);
    }
    cartStorage[req.user.id] = cart;
    res.json("success");
})

router.get('/set/:quantity/:id', middleWare.isAuthenticatedCart, async (req, res, next) => {
    var bookID = req.params.id;
    var quantity = req.params.quantity;
    var cart = null;
    if (cartStorage.cartStorage[req.user.id] === undefined) {
        cart = new Cart(req.user.id);
        //  console.log("Create new cart = " ,cart.getCart()) ;
        cart.addCart({ id: bookID });
    } else {
        //   console.log("Receive " , cartStorage[1]) ;
        cart = new Cart(req.user.id, cartStorage.cartStorage[req.user.id].cart);
        cart.addCartWithQuantity(bookID, quantity);
    }
    cartStorage.cartStorage[req.user.id] = cart;
    res.json("success");
})



router.get('/remove/:id', middleWare.isAuthenticatedCart, async (req, res, next) => {
    var bookID = req.params.id;
    var cart = null;
    if (cartStorage.cartStorage[req.user.id] === undefined) {
        cart = new Cart(req.user.id);
    } else {
        cart = new Cart(req.user.id, cartStorage.cartStorage[req.user.id].cart);
        cart.removeCartByBookID(bookID);
    }
    cartStorage.cartStorage[req.user.id] = cart;
    res.json("success");
})

router.get('/clear', middleWare.isAuthenticatedCart, async (req, res, next) => {
    var bookID = req.params.id;
    var cart = null;
    if (cartStorage.cartStorage[req.user.id] === undefined) {
        cart = new Cart(req.user.id);
    } else {
        cart = new Cart(req.user.id, cartStorage.cartStorage[req.user.id].cart);
        cart.removeAllCart();
    }
    cartStorage.cartStorage[req.user.id] = cart;
    res.json("success");
})

router.get('/clear/:id', middleWare.isAuthenticatedCart, async (req, res, next) => {
    var bookID = req.params.id;
    var cart = null;
    if (cartStorage.cartStorage[req.user.id] === undefined) {
        cart = new Cart(req.user.id);
    } else {
        cart = new Cart(req.user.id, cartStorage.cartStorage[req.user.id].cart);
        cart.removeAllCartByBookID(bookID);
    }
    cartStorage.cartStorage[req.user.id] = cart;
    res.json("success");
})

router.get('/count', middleWare.isAuthenticatedCart, async (req, res, next) => {
    var cart = null;
    //   console.log(cartStorage[1]) ;
    if (cartStorage.cartStorage[req.user.id] === undefined) {
        cart = new Cart(req.user.id);
    } else {
        cart = new Cart(req.user.id, cartStorage.cartStorage[req.user.id].cart);
    }
    cartStorage.cartStorage[req.user.id] = cart;
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
    /* var shipID = req.body.shipIDtoSend ;
     console.log("Test shipID", shipID);
     var testNan = parseInt(shipID) ;
     console.log("Nan", testNan) ; */
    var shipID = req.query.shipIDtoSend;

    //  var address = await shipController.getShippingAddressByShipID(req.body.address);
    var cart = null;
    var shipData = await shipController.getShippingAddressByShipID(shipID);
    console.log("Address what", address);
    console.log(shipData);
    console.log(data);

    if (cartStorage.cartStorage[req.user.id] === undefined) {
        cart = new Cart(req.user.id);
    } else {
        cart = new Cart(req.user.id, cartStorage.cartStorage[req.user.id].cart);
    }
    cartStorage.cartStorage[req.user.id] = cart;
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
            var txt = "Your cart is ordered" + orderID;
            notificationController.addNotifications(req.user.id, txt, "pending", orderID);
            res.json(orderID);
        } else {
            res.json("error");
        }

    } else {
        res.json("error");
    }
})

// omise
// router.post('/omise/checkout', middleWare.isAuthenticatedCart, async (req, res, next) => {

//     var orderID = Math.round(Math.floor(Date.now() / 1000))
//     //written by arit
//     var shipID = req.body.shipIDtoSend ;
//     console.log("Test shipID", shipID);
//     var testNan = parseInt(shipID) ;
//     console.log("Nan", testNan) ;

//   //  var address = await shipController.getShippingAddressByShipID(req.body.address);
//     var cart = null ;
//     var shipData = await shipController.getShippingAddressByShipID(shipID);
//     console.log("Address what", address) ;
//     console.log(shipData);
//     console.log(data);

//     if (cartStorage.cartStorage[req.user.id] === undefined) {
//         cart = new Cart(req.user.id);
//     } else {
//         cart = new Cart(req.user.id, cartStorage.cartStorage[req.user.id].cart);
//     }
//     cartStorage.cartStorage[req.user.id] = cart;
//     var cartInfo = [];
//     var total = 0; //no

//     const ids = cart.getCart().map(o => o.id)
//     const filtered = cart.getCart().filter(({ id }, index) => !ids.includes(id, index + 1))
//     for (var i = 0; i < filtered.length; i++) {
//         var b = await bookController.getBookByID(filtered[i].id);
//         var data = {
//             bookName: b[0].name,
//             quantity: cart.getQuantityByBookID(filtered[i].id),
//             price: b[0].price,
//             img: b[0].imageUrl,
//             author: b[0].author,
//             id: b[0].id,
//             stock: b[0].stock
//         }
//         cartInfo.push(data);
//         total = total + (b[0].price * cart.getQuantityByBookID(filtered[i].id));
//     }

//     for (var j = 0; j < cartInfo.length; j++) {
//         var allorder = await orderHistoryController.addAllOrderByID(req.user.id, orderID, cartInfo[j].bookName, cartInfo[j].quantity, total, cartInfo[j].id, shipData.shipID, shipData.district, shipData.province, shipData.postalCode, shipData.address, shipData.subdistrict);
//     }

//     //end here

//     var address = await shipController.getShippingAddressByShipID(req.body.address);
//     if (req.user.id == address.userID) {
//         var orderIDState = await orderHistoryController.addOrderHistoryByID(req.user.id, orderID, req.body.payment_option, req.body.address, req.user.email, req.user.name);
//         if (orderIDState.affectedRows === 1) {
//             res.json(orderID);
//         } else {
//             res.json("error");
//         }

//     } else {
//         res.json("error");
//     }
// })

router.get('/checkout/complete/:orderID', middleWare.isAuthenticatedCart, authentication.checkAdmin, async (req, res, next) => {
    var orderID = await orderHistoryController.getOrderHistoryByID(req.params.orderID);
    if (orderID.length > 0 && orderID[0].user_id == req.user.id) {
        res.render("completeOrder", { orderID: orderID[0].order_id, user: req.user, staff: req.staff });
    } else {
        res.render("completeOrder", { orderID: null, message: "Not found your orderID", user: req.user, staff: req.staff });
    }
    //clear cart
    var cart = null;
    if (cartStorage.cartStorage[req.user.id] === undefined) {
        cart = new Cart(req.user.id);
    } else {
        cart = new Cart(req.user.id, cartStorage.cartStorage[req.user.id].cart);
        cart.removeAllCart();
    }
    cartStorage.cartStorage[req.user.id] = cart;
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
