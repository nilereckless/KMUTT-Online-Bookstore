var express = require('express');
var router = express.Router();
const Cart = require('../model/cartModel');
var bookController = require('../controller/bookController');
var cartStorage = [];
const middleWare = require('../middleware/authentication') ;
//middleware.isAuthenticated(), วางไว้หน้า async
router.get('/', async (req, res, next) => {
    var cart = null;
    //   console.log(cartStorage[1]) ;
    if (cartStorage[req.user.id] === undefined) {
        cart = new Cart(req.user.id);
    } else {
        cart = new Cart(req.user.id, cartStorage[req.user.id].cart);
    }
    cartStorage[req.user.id] = cart;
    var cartInfo = [];
    var total = 0 ;
    const ids = cart.getCart().map(o => o.id)
    const filtered = cart.getCart().filter(({ id }, index) => !ids.includes(id, index + 1))
    for(var i = 0 ; i < filtered.length ; i++){
        var b = await bookController.getBookByID(filtered[i].id);
        var data = {
            bookName : b[0].name,
            quantity : cart.getQuantityByBookID(filtered[i].id),
            price : b[0].price,
            img : b[0].imageUrl,
            author : b[0].author,
            id : b[0].id,
        }
        cartInfo.push(data) ;
        total = total + (b[0].price*cart.getQuantityByBookID(filtered[i].id)) ;
    }
    res.render('cart', { cart: cartInfo, totalCart: cart.getTotalCart() , sumPrice : total});
})

router.get('/add/:id',middleWare.isAuthenticatedCart, async (req, res, next) => {
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

router.get('/remove/:id',middleWare.isAuthenticatedCart, async (req, res, next) => {
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

router.get('/clear',middleWare.isAuthenticatedCart, async (req, res, next) => {
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

router.get('/clear/:id',middleWare.isAuthenticatedCart, async (req, res, next) => {
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

router.get('/count',middleWare.isAuthenticatedCart, async (req, res, next) => {
    var cart = null;
    //   console.log(cartStorage[1]) ;
    if (cartStorage[req.user.id] === undefined) {
        cart = new Cart(req.user.id);
    } else {
        cart = new Cart(req.user.id, cartStorage[req.user.id].cart);
    }
    cartStorage[req.user.id] = cart;
    res.json({ count: cart.getTotalCart() }) ;
})

module.exports = router;

// req.user.id แทนเลข 1 ทุกอัน