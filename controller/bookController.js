let dbConn = require('../lib/db');

exports.getBookByID = (bookID) => {
    return new Promise((resolve, reject) => {
        var query = `SELECT * FROM books WHERE id = '${bookID}'`;
        dbConn.query(query, (err, rows) => {
            if (err) {
                reject(err);
            }
            resolve(rows);
        })
    })
}

exports.updateBookStockByID = (bookID, amount) => {
    return new Promise((resolve, reject) => {
        var query = `UPDATE books SET stock=stock-${amount} FROM books WHERE id = '${bookID}'`;
        dbConn.query(query, (err, rows) => {
            if (err) {
                reject(err);
            }
            resolve(rows);
        })
    })
}
