var express = require('express');
var router = express.Router();
const Cart = require('../model/cartModel');
var bookController = require('../controller/bookController');
var cartStorage = [];
const middleWare = require('../middleware/authentication');
var shipController = require('../controller/shipAddressController');
var locationController = require('../controller/locationController');


//middleware.isAuthenticated(), วางไว้หน้า async
router.get('/', middleWare.isAuthenticatedCart, async (req, res, next) => {
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
    res.render('cart', { cart: cartInfo, totalCart: cart.getTotalCart(), sumPrice: total });
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

router.get('/checkout', middleWare.isAuthenticatedCart, async (req, res, next) => {
    var shipAddress = await shipController.getAllShippingAddressByUserID(req.user.id);
    // console.log(shipAddress) ;
    var province = await locationController.getAllProvince();
    var district = await locationController.getAllDistrict();
    res.render('address', { address: shipAddress, province: province, district: district });
})

router.post('/checkout', middleWare.isAuthenticatedCart, async (req, res, next) => {
    var address = await shipController.getShippingAddressByShipID(req.body.address);
    if(req.user.id == address.userID) {
        res.json(address);
    } else {
        res.json("error");
    }
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