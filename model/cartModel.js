'use strict';

module.exports = class Cart {
    constructor(userID, cart = []) {
        this.userID = userID;
        this.cart = cart;
    }

    getCart() {
        return this.cart;
    }

    addCart(books) {
        this.cart.push(books);
    }
    
    addCartWithQuantity(books, quantity){
        for(var i = 0 ; i < quantity ; i++){
          this.cart.push(books) ;
        }
    }

    getQuantityByBookID(bookID) {
        var quantity = 0;
        this.cart.forEach(book => {
            if (book.id === bookID) {
                quantity = quantity + 1;
            }
        });
        return quantity;
    }

    getTotalCart() {
        return this.cart.length;
    }

    removeCartByBookID(bookID) {
        for (var i = 0; i < this.cart.length; i++) {
            var book = this.cart[i];
            if (book.id === bookID) {
                this.cart.splice(i, 1);
                return true;
            }
        }
        return false;
    }

    getCartByUserID(userID) {
        if (this.userID !== userID) return false;
        return true;
    }

    removeAllCartByBookID(bookID) {
         if(this.cart.find(book => book.id === bookID) !== undefined){
            for (var i = 0; i < this.cart.length; i++) {
                var book = this.cart[i];
                if (book.id === bookID) {
                    this.cart.splice(i, 1);
                    i-- ;
                }
            }
              return true ;
         }
         return false ;
    }

    removeAllCart(){
        this.cart = [] ;
    }
}