let dbConn = require('../lib/db');

exports.countAllSearch = (catagory, searchTerm) => {
    return new Promise((resolve, reject) => {
        var query = `SELECT count(*) AS TOTAL FROM books WHERE catagory LIKE '%` + catagory + `%' AND (name LIKE '%` + searchTerm + `%' OR author LIKE '%` + searchTerm + `%')`;
        dbConn.query(query, (err, rows) => {
            if (err) {
                reject(err);
            }
            resolve(rows[0]['TOTAL']);
        })
    })
}

exports.countSearchTerm = (searchTerm) => {
    return new Promise((resolve, reject) => {
        var query = `SELECT count(*) AS TOTAL FROM books WHERE name LIKE '%` + searchTerm + `%' OR author LIKE '%` + searchTerm + `%'`;
        dbConn.query(query, (err, rows) => {
            if (err) {
                reject(err);
            }
            resolve(rows[0]['TOTAL']);
        })
    })
}

exports.countSearchCatagory = (catagory) => {
    return new Promise((resolve, reject) => {
        var query = `SELECT count(*) AS TOTAL FROM books WHERE catagory = '` + catagory + `'`;
        dbConn.query(query, (err, rows) => {
            if (err) {
                reject(err);
            }
            resolve(rows[0]['TOTAL']);
        })
    })
}

exports.getPagination = (length) => {
    var rawRows = length / 5
    var totalRows = Math.floor(length / 5)
    if (rawRows > totalRows) {
        totalRows += 1
    }
    return totalRows;
}

exports.findOffSet = (page, query) => {
    var currentPage = 1
    var sqlStatement = query
    if (page) {
        currentPage = page
        console.log('parseInt(currentPage)', parseInt(currentPage))
        var offSet = 5
        if (parseInt(currentPage) === 1) {
            offSet = 0
        }
        if (parseInt(currentPage) !== 1) {
            offSet = offSet * (currentPage - 1)
            console.log('offSet', offSet)
        }
        sqlStatement = query + ` OFFSET ${offSet} `
    }
    var data = {
        currentPage: currentPage,
        query: sqlStatement
    }
    return data;
}

//pagination
 exports.searchAdmin = async (req, res, next) => {
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
        totalPagination = await this.countAllSearch(catagory, searchTerm);
    }
    else if (searchTerm != '' && catagory == '') {
        query = `SELECT * FROM books WHERE name LIKE '%` + searchTerm + `%' OR author LIKE '%` + searchTerm + `%' OR isbn LIKE '%` + searchTerm + `%' LIMIT 5`;
        totalPagination = await this.countSearchTerm(searchTerm);
    }
    else if (searchTerm == '' && catagory != '') {
        query = `SELECT * FROM books WHERE catagory = '` + catagory + `' LIMIT 5`;
        totalPagination = await this.countSearchCatagory(catagory);
    }
    var data = this.findOffSet(req.query.page, query);
    dbConn.query(data.query, (err, rows) => {
        if (err) {
            req.flash('error', err);
            console.log(err);
            res.render('books', { data: '' }); // render to views/books/index.ejs
        }
        console.log(totalPagination);
        var totalRows = this.getPagination(totalPagination);
        var pageInfo = {
            currentPage: data.currentPage,
            totalPage: totalRows
        }
        req.books = rows;
        req.pagination = pageInfo;
        next();
    })
}
