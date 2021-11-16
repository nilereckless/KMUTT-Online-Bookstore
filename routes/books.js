const { request } = require('express');
let express = require('express');
const { restart } = require('nodemon');
let router = express.Router();
let dbConn = require('../lib/db');
let searchLib = require('../lib/search');
let bookLib = require('../lib/checkBookCond');
let helpers = require('../lib/helpers');
const CryptoJS = require("crypto-js");
const { isStaffAuthenticated } = require('../middleware/authentication');
const pageAmount = 10;
var orderHistoryController = require('../controller/orderHistoryController');
var shipAddressController = require('../controller/shipAddressController');
var bookController = require('../controller/bookController');
let authentication = require('../middleware/authentication');
const nodemailer = require('nodemailer');


// Sending E-mail 
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL || 'noreplykmuttonlinebookstore@gmail.com', // TODO: your gmail account
        pass: process.env.PASSWORD || 'KongtapTheeradonNapan055457' // TODO: your gmail password
    }
});



// Check Login 
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    req.flash('error', 'Please Login !');
    res.redirect('/');
}

// report Payment
router.get('/reportPayment', async(req, res) => {
    res.render("books/reportPayment") ;
})

//display book page
router.get('/', ensureAuthenticated, searchLib.searchAdmin, (req, res, next) => {
    if (req.query.search || req.query.catagory) {
        res.render('books', { data: req.books, pageInfo: req.pagination });
    } else {
        var data = searchLib.findOffSet(req.query.page, `SELECT * FROM books ORDER BY id ASC LIMIT ${pageAmount}`);
        dbConn.query(data.query, (err, rows) => {
            if (err) {
                req.flash('error', err);
                console.log(err);
                res.render('books', { data: '' }); // render to views/books/index.ejs
            } else {
                dbConn.query('SELECT * FROM books ORDER BY id ASC', (err, result) => {
                    var totalRows = searchLib.getPagination(pageAmount, result.length);
                    console.log('totalRows', totalRows)
                    var pageInfo = {
                        currentPage: data.currentPage,
                        totalPage: totalRows
                    }
                    res.render('books', { data: rows, pageInfo: pageInfo });
                })

            }
        })
    }

})

//view detail book 
router.get('/viewDetail/(:id)', authentication.checkAdmin, function (req, res, next) {
    let id = req.params.id;

    dbConn.query('SELECT * FROM books WHERE id = ' + id, (err, rows, fields) => {
        if (rows.length <= 0) {
            req.flash('error', 'Book not found with id = ' + id)
            res.redirect('/books');
        } else {
            res.render('books/viewDetail', {
                title: 'Book detail',
                id: rows[0].id,
                name: rows[0].name,
                author: rows[0].author,
                price: rows[0].price,
                stock: rows[0].stock,
                imageUrl: rows[0].imageUrl,
                catagory: rows[0].catagory,
                isbn: rows[0].isbn,
                user: req.user,
                staff: req.staff
            })
        }
    });
})



//display add book page
router.get('/add', isStaffAuthenticated, (req, res, next) => {
    res.render('books/add', {
        name: '',
        author: '',
        price: '',
        catagory: '',
        isbn: '',
        stock: ''
    })
})

//add book 
router.post('/add', isStaffAuthenticated, async (req, res, next) => {
    let name = req.body.name;
    let author = req.body.author;
    let price = req.body.price;
    let catagory = req.body.catagory;
    let isbn = req.body.isbn;
    let imageUrl = req.body.imageUrl;
    let stock = req.body.stock;



    var checkBookName = await bookLib.getBookByName(name);
    if (checkBookName.length !== 0) {
        var data = {
            status: 'errors',
            message: 'Book name already exist'
        }
        res.status(200).json(data);
        return;
    }
    let errors = false;
    if (isbn.trim().length === 0) {
        isbn = null
    } else if (isbn.trim().length !== 13 && isbn.trim().length !== 10 && isbn.trim().length !== 0) {
        req.flash('error', 'ISBN Should 10 or 13 number');
        res.render('books/add', {
            name: name,
            author: author,
            price: price,
            catagory: catagory,
            imageUrl: imageUrl,
            isbn: isbn,
            stock: stock
        })
        return;
    }
    if (name.length === 0 || author.length === 0 || price.length === 0 || catagory.length === 0) {
        errors = true;
        //set flash message
        req.flash('error', 'Please enter all book information');
        //render to add.ejs with flash
        res.render('books/add', {
            name: name,
            author: author,
            price: price,
            catagory: catagory,
            imageUrl: imageUrl,
            isbn: isbn,
            stock: stock
        })
    }

    //if no error
    if (!errors) {

        //Insert query
        var path = null;
        var bookimg = null;
        if (!req.files) {
            path = imageUrl
        } else {
            bookimg = req.files.book_pic;
            let filename = CryptoJS.MD5(Math.floor(Date.now() / 1000) + bookimg.name).toString();
            var trimmedString = filename.substring(0, 12);
            path = `/upload/image/${trimmedString}.${helpers.getExtension(bookimg.name)}`;
            if (!helpers.imageFilter(bookimg.name)) {
                req.flash('error', 'Upload image is invalid!');
                res.redirect('/books/add');
                return;
            }
            bookimg.mv('public/' + path, function (err) {
                if (err) {
                    req.flash('error', 'Upload image is invalid!');
                    res.redirect('/books');
                }
            });
        }

        let form_data = {
            name: name,
            author: author,
            price: price,
            catagory: catagory,
            imageUrl: path,
            isbn: isbn,
            stock: stock
        }

        dbConn.query('INSERT INTO books SET ?', form_data, (err, result) => {
            if (err) {
                req.flash('error', err)
                res.render('books/add', {
                    name: form_data.name,
                    author: form_data.author,
                    price: form_data.price,
                    catagory: form_data.catagory,
                    stock: form_data.stock,
                    isbn: form_data.isbn
                })
            } else {

                req.flash('success', 'Book successfully added');
                res.redirect('/books');
            }
        })



    }
})

//Display edit book page
router.get('/edit/(:id)', isStaffAuthenticated, (req, res, next) => {
    let id = req.params.id;

    dbConn.query('SELECT * FROM books WHERE id = ' + id, (err, rows, fields) => {
        if (rows.length <= 0) {
            req.flash('error', 'Book not found with id = ' + id)
            res.redirect('/books');
        } else {
            res.render('books/edit', {
                title: 'Edit book',
                id: rows[0].id,
                name: rows[0].name,
                author: rows[0].author,
                price: rows[0].price,
                stock: rows[0].stock,
                imageUrl: rows[0].imageUrl,
                catagory: rows[0].catagory,
                isbn: rows[0].isbn
            })
        }
    });
})

//Update book page
router.post('/update/:id', isStaffAuthenticated, (req, res, next) => {
    let id = req.params.id;
    let name = req.body.name;
    let author = req.body.author;
    let price = req.body.price;
    let stock = req.body.stock;
    let catagory = req.body.catagory;
    let isbn = req.body.isbn;

    var path = null;
    if (req.files) {
        console.log(req.files);
        var bookimg = req.files.book_pic;
        let filename = CryptoJS.MD5(Math.floor(Date.now() / 1000) + bookimg.name).toString();
        var trimmedString = filename.substring(0, 12);
        path = `upload/image/${trimmedString}.${helpers.getExtension(bookimg.name)}`;
        if (!helpers.imageFilter(bookimg.name)) {
            req.flash('error', 'Upload image is invalid!');
            res.redirect('/books/edit/' + id);
            return;
        }
        bookimg.mv('public/' + path, function (err) {
            if (err) {
                req.flash('error', 'Book Successfully Updated!');
                res.redirect('/books/edit/' + id);
            }
        });
    }
    let errors = false;

    if (isbn.trim().length === 0) {
        isbn = null
    } else if (isbn.trim().length !== 13 && isbn.trim().length !== 10 && isbn.trim().length !== 0) {
        req.flash('error', 'ISBN Should 10 or 13 number');
        res.redirect('/books/edit/' + id);
        return;
    }
    if (name.length === 0 || author.length === 0 || price.length === 0 || catagory.length === 0 || stock.length === 0) {
        errors = true;
        req.flash('errors', 'Please enter all book information');
        res.render('books/edit', {
            id: req.params.id,
            name: name,
            author: author,
            price: price,
            stock: stock,
            catagory: catagory,
            isbn: isbn
        })
    }

    //If no error
    if (!errors) {
        let form_data = {
            name: name,
            author: author,
            price: price,
            stock: stock,
            catagory: catagory,
            imageUrl: path,
            isbn: isbn
        }
        //Update Query
        dbConn.query('UPDATE books SET ? WHERE id = ' + id, form_data, (err, result) => {
            if (err) {
                req.flash('error', err);
                res.render('books/edit', {
                    id: req.params.id,
                    name: form_data.name,
                    author: form_data.author,
                    price: form_data.price,
                    stock: form_data.stock,
                    catagory: form_data.catagory,
                    isbn: form_data.isbn
                })
            } else {
                req.flash('success', 'Book successfully Updated!');
                res.redirect('/books')
            }
        })
    }
})

//Delete book
router.get('/delete/(:id)', isStaffAuthenticated, (req, res, next) => {
    let id = req.params.id;

    dbConn.query('DELETE FROM books WHERE id = ' + id, (err, result) => {
        if (err) {
            req.flash('error', err),
                res.redirect('/books');
        } else {
            req.flash('success', 'Book successfully Deleted!');
            res.redirect('/books');
        }
    })
})


//Filter aka search
function search(req, res, next) {
    var searchTerm = req.body.search;
    var catagory = req.body.catagory;
    console.log(catagory);

    let query = 'SELECT * FROM books';
    if (searchTerm != '' && catagory != '') {
        query = `SELECT * FROM books WHERE catagory LIKE '%` + catagory + `%' AND (name LIKE '%` + searchTerm + `%' OR author LIKE '%` + searchTerm + `%')`;
    }
    else if (searchTerm != '' && catagory == '') {
        query = `SELECT * FROM books WHERE name LIKE '%` + searchTerm + `%' OR author LIKE '%` + searchTerm + `%'`;
    }
    else if (searchTerm == '' && catagory != '') {
        query = `SELECT * FROM books WHERE catagory = '` + catagory + `'`;
    }
    dbConn.query(query, (err, result) => {
        if (err) {
            req.searchResult = '',
                req.searchTerm = '',
                req.catagory = '';
            next();
        }
        console.log(result);
        req.searchResult = result;
        req.searchTerm = searchTerm;
        req.catagory = '';

        next();
    });
}

//ISBN
router.post('/search', search, authentication.checkAdmin, function (req, res, next) {
    var searchResult = req.searchResult;
    console.log(searchResult);
    res.render('productfilter', { title: 'Express', data: searchResult, user: req.user, staff: req.staff });
});

router.get('/filter', authentication.checkAdmin, (req, res) => {
    var searchResult = req.searchResult;
    res.render('books/filter', {
        results: '',
        searchTerm: '',
        searchResult: '',
        catagory: '',
        user: req.user,
        staff: req.staff
    });
})

router.post('/filter', search, (req, res) => {
    var searchResult = req.searchResult;
    res.json({
        results: searchResult.length,
        searchTerm: req.searchTerm,
        searchResult: searchResult,
        catagory: req.catagory
    });
})



//Autocomplete in search
router.post('/autocom', (req, res) => {
    var listBooks = [];
    dbConn.query('SELECT DISTINCT name, author, isbn FROM books', (err, result) => {
        for (var i = 0; i < result.length; i++) {
            if (result[i].isbn !== null) {
                var Textisbn = result[i].isbn.toString();
                listBooks.push(Textisbn);
            }
            listBooks.push(result[i].name);
            listBooks.push(result[i].author);
            console.log(result[i].name);
        }
        res.json(listBooks);
    });
})

//Validate addbook Author name by Suggest
router.post('/author/suggest', (req, res) => {
    var authorList = [];
    dbConn.query('SELECT DISTINCT author FROM books', (err, result) => {
        for (var i = 0; i < result.length; i++) {
            authorList.push(result[i].author);
        }
        res.json(authorList);
    });
})

//upload img
router.post('/image/upload', (req, res) => {
})

// ชื่อ, เลขสั่งซื้อสินค้า, ที่อยู่
router.get('/payment', async (req, res) => {
    var payments = await orderHistoryController.getAllOrderHistory()
    res.render("books/paymentHistory", { payments: payments });
})

// Orders payment
// Sending G-mail when fill tracking number & Approved by Staff
router.post('/payment', async (req, res) => {
    var status = req.body.status
    var paymentID = req.body.paymentID
    console.log("Showing",status);

    var orders = await orderHistoryController.updateOrderStatusByID(paymentID, status)
    var orderInformation = await orderHistoryController.getOrderHistoryByID(paymentID)
    var address = await shipAddressController.getShippingAddressByShipID(orderInformation[0].shipaddress_id)
    console.log(address);
  if(status === "Approved"){
    if (orders.affectedRows === 1) {
        let mailOptions = {
            from: 'noreplykmuttonlinebookstore@gmail.com', // TODO: email sender
            to: orderInformation[0].email, // TODO: email receiver
            subject: 'KMUTTBookstore - Payment Confirm notification #OrderID ' + paymentID  ,
            text: 'เรียนคุณ '+ orderInformation[0].name + ' หมายเลขคำสั่งซื้อของคุณ คือ ' + paymentID + ' tracking number : ' + req.body.track_number
        };

        transporter.sendMail(mailOptions, (err, data) => {
            if (err) {
                return console.log('Error occurs');
            }
        });

        var bookorder = await orderHistoryController.getBookOrderByOrderID(paymentID)
        console.log(bookorder);

        var bookstock = await bookController.updateBookStockByID(parseInt(bookorder[0].book_id), parseInt(bookorder[0].quantity))
        return res.json("success");
    } 
  }
    else {
       return res.json("Payment declined");
    }

})

// Summarize orderID in Payment History by Arit
router.get('/orderDetail/(:id)', isStaffAuthenticated, function (req, res, next) {
    let id = req.params.id;

    dbConn.query(`SELECT * FROM order_books WHERE order_id =  ${id} ORDER BY book_id ASC`, (err, rows, fields) => {
        if (rows.length <= 0) {
            req.flash('error', 'order not found')
            res.redirect('/books');
        } else {
            res.render('books/orderDetail', {
                data: rows
            })
        }
    });
})






module.exports = router;

