const cartModel = require('./cartModel') ;
var cart1 = new cartModel(1) ;
var cart2 = new cartModel(2)
// console.log(cart) ;
cart1.addCart({
    id:1
}) ;
cart2.addCart({
    id:2
})
cart1.addCart({
    id:1
})
// console.log(cart.getCart()) ;
// console.log(cart1.getCartByUserID(1)) ;
// console.log(cart2.getCartByUserID(2)) ;
