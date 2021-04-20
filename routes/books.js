let express = require('express');
let router = express.Router();
let dbConn = require('../lib/db');

//display book page
router.get('/', (req, res, next) => {
    dbConn.query('SELECT * FROM books ORDER BY id ASC', (err,rows) => {
        if(err){
            req.flash('error', err);
            console.log(err);
            res.render('books', {data: ''}); // render to views/books/index.ejs
        } else {
            res.render('books', {data:rows});
        }
    })
})

//display add book page
router.get('/add', (req,res,next) =>{
    res.render('books/add', {
        name: '',
        author: '',
        price: '',
        catagory: ''
    })
})

//add book 
router.post('/add', (req,res,next) => {
    let name = req.body.name;
    let author = req.body.author;
    let price = req.body.price;
    let catagory = req.body.catagory;

    let errors = false;
    if(name.length === 0 || author.length === 0 || price.length === 0 || catagory.length === 0){
        errors = true;
        //set flash message
        req.flash('error', 'Please enter all book information');
        //render to add.ejs with flash
        res.render('books/add', {
            name: name,
            author: author,
            price: price,
            catagory: catagory
        })

    }

    //if no error
    if(!errors){
        let form_data = {
            name: name,
            author: author,
            price: price,
            catagory: catagory
        }
        //Insert query
        dbConn.query('INSERT INTO books SET ?', form_data, (err,result) => {
            if(err){
                req.flash('error', err)
                res.render('books/add', {
                    name: form_data.name,
                    author: form_data.author,
                    price: form_data.price,
                    catagory: form_data.catagory
                })
            } else {
                req.flash('success', 'Book successfully added');
                res.redirect('/books');
            }
        })
    }
})

//Display edit book page
router.get('/edit/(:id)', (req,res,next) => {
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
                catagory: rows[0].catagory
            })
        }
    });
})

//Update book page
router.post('/update/:id', (req,res,next) => {
    let id = req.params.id;
    let name = req.body.name;
    let author = req.body.author;
    let price = req.body.price;
    let catagory = req.body.catagory;

    let errors = false;
    
    if(name.length === 0 || author.length === 0 || price.length === 0 || catagory.length === 0){
        errors = true;
        req.flash('errors', 'Please enter all book information');
        res.render('books/edit', {
            id: req.params.id,
            name: name,
            author: author,
            price: price,
            catagory: catagory
        })
    }

    //If no error
    if(!errors){
        let form_data = {
            name: name,
            author: author,
            price: price,
            catagory: catagory
        }
        //Update Query
        dbConn.query('UPDATE books SET ? WHERE id = ' + id, form_data, (err,result) =>{
            if(err){
                req.flash('error',err);
                res.render('books/edit', {
                    id: req.params.id,
                    name: form_data.name,
                    author: form_data.author,
                    price: form_data.price,
                    catagory: form_data.catagory
                })
            } else {
                req.flash('success', 'Book successfully Updated!');
                res.redirect('/books')
            }
        } )
    }
})

//Delete book
router.get('/delete/(:id)', (req,res,next) =>{
    let id = req.params.id;
    
    dbConn.query('DELETE FROM books WHERE id = ' + id, (err, result) =>{
        if (err) {
            req.flash('error', err),
            res.redirect('/books');
        } else {
            req.flash('success', 'Book successfully Deleted!');
            res.redirect('/books');
        }
    })
})
module.exports = router;