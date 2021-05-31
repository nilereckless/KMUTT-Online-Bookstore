const { request } = require('express');
let express = require('express');
const { restart } = require('nodemon');
let router = express.Router();
let dbConn = require('../lib/db');
let searchLib = require('../lib/search');
let bookLib = require('../lib/checkBookCond');
let helpers = require('../lib/helpers');
const CryptoJS = require("crypto-js");


//admin search
async function searchAdmin(req, res, next) {
    let query = 'SELECT * FROM books';
    let searchTerm = req.query.search;
    let catagory = req.query.catagory;
    let page = req.query.page;
    var totalPagination = 0;

    if (!page) {
        page = 1
    }
    console.log(catagory);
    if (searchTerm != '' && catagory != '') {
        query = `SELECT * FROM books WHERE catagory LIKE '%` + catagory + `%' AND (name LIKE '%` + searchTerm + `%' OR author LIKE '%` + searchTerm + `%' OR author LIKE '%` + searchTerm + `%' OR isbn LIKE '%` + searchTerm + `%') LIMIT 5`;
        totalPagination = await searchLib.countAllSearch(catagory, searchTerm);
    }
    else if (searchTerm != '' && catagory == '') {
        query = `SELECT * FROM books WHERE name LIKE '%` + searchTerm + `%' OR author LIKE '%` + searchTerm + `%' OR isbn LIKE '%` + searchTerm + `%' LIMIT 5`;
        totalPagination = await searchLib.countSearchTerm(searchTerm);
    }
    else if (searchTerm == '' && catagory != '') {
        query = `SELECT * FROM books WHERE catagory = '` + catagory + `' LIMIT 5`;
        totalPagination = await searchLib.countSearchCatagory(catagory);
    }
    var data = searchLib.findOffSet(req.query.page, query);
    dbConn.query(data.query, (err, rows) => {
        if (err) {
            req.flash('error', err);
            console.log(err);
            res.render('books', { data: '' }); // render to views/books/index.ejs
        }
        console.log(totalPagination);
        var totalRows = searchLib.getPagination(totalPagination);
        var pageInfo = {
            currentPage: data.currentPage,
            totalPage: totalRows
        }
        req.books = rows;
        req.pagination = pageInfo;
        next();
    })
}

//display book page
router.get('/', searchAdmin, (req, res, next) => {
    if (req.query.search || req.query.catagory) {
        res.render('books', { data: req.books, pageInfo: req.pagination });
    } else {
        var data = searchLib.findOffSet(req.query.page, 'SELECT * FROM books ORDER BY id ASC LIMIT 5');
        dbConn.query(data.query, (err, rows) => {
            if (err) {
                req.flash('error', err);
                console.log(err);
                res.render('books', { data: '' }); // render to views/books/index.ejs
            } else {
                dbConn.query('SELECT * FROM books ORDER BY id ASC', (err, result) => {
                    var totalRows = searchLib.getPagination(result.length);
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

//display add book page
router.get('/add', (req, res, next) => {
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
router.post('/add', async (req, res, next) => {
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
    if(isbn.trim().length === 0) {
        isbn = null
    } else if(isbn.trim().length !== 13 && isbn.trim().length !== 10 && isbn.trim().length !== 0){
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
            path = `upload/image/${trimmedString}.${helpers.getExtension(bookimg.name)}`;
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
router.get('/edit/(:id)', (req, res, next) => {
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
router.post('/update/:id', (req, res, next) => {
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
            res.redirect('/books/edit/'+id);
            return;
        }
        bookimg.mv('public/' + path, function (err) {
            if (err) {
                req.flash('error', 'Book Successfully Updated!');
                res.redirect('/books/edit/'+id);
            }
        });
    } 
    let errors = false;
    
    if(isbn.trim().length === 0) {
        isbn = null
    } else if(isbn.trim().length !== 13 && isbn.trim().length !== 10 && isbn.trim().length !== 0){
        req.flash('error', 'ISBN Should 10 or 13 number');
        res.redirect('/books/edit/'+id);
        return;
    }
    if (name.length === 0 || author.length === 0 || price.length === 0 || catagory.length === 0 || stock.length === 0 ) {
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
router.get('/delete/(:id)', (req, res, next) => {
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

//Google sign-in
router.get('/signin', function (req, res, next) {
    res.render('books/signin', { title: 'Express' });
});

//ISBN
router.get('/search', function (req, res, next) {
    res.render('books/search', { title: 'Express' });
});

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

router.get('/filter', (req, res) => {
    var searchResult = req.searchResult;
    res.render('books/filter', {
        results: '',
        searchTerm: '',
        searchResult: '',
        catagory: ''
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
           // var Textisbn = result[i].isbn.toString();
            //listBooks.push(Textisbn);
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

module.exports = router;

