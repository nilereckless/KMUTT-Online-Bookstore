let dbConn = require('../lib/db');

exports.getNewestBook = (date_time, at_least, limit = 100) => {
    return new Promise((resolve, reject) => {
        var query = `SELECT * FROM books WHERE created_at >= DATE_SUB('${date_time}',INTERVAL ${at_least} DAY) ORDER BY created_at DESC LIMIT ${limit}`;
        dbConn.query(query, (err, rows) => {
            if (err) {
                reject(err);
            }
            resolve(rows);
        })
    })
}

exports.getDateNewestBook = () =>{
    return new Promise((resolve, reject) => {
        var query = `SELECT * FROM books ORDER BY created_at DESC LIMIT 1`;
        dbConn.query(query, (err, rows) => {
            if (err) {
                reject(err);
            }
            resolve(rows[0]['created_at']);
        })
    }) 
}
