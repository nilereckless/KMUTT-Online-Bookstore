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