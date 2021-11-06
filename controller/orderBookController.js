let dbConn = require('../lib/db');

exports.getorderByUserID = (userID) => {
    return new Promise((resolve, reject) => {
        var query = `SELECT * FROM order_books WHERE user_id = '${userID}'`;
        dbConn.query(query, (err, rows) => {
            if (err) {
                reject(err);
            }
            resolve(rows);
        })
    })
}
