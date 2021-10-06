let dbConn = require('../lib/db');

exports.getOrderHistoryByID = (order_id) => {
    return new Promise((resolve, reject) => {
        var query = `SELECT * FROM order_history WHERE order_id = ${order_id}`;
        dbConn.query(query, (err, rows) => {
            if (err) {
                reject(err);
            }
            resolve(rows);
        })
    })
}

exports.addOrderHistoryByID = (user_id, order_id) => {
    return new Promise((resolve, reject) => {
        var query = `INSERT INTO order_history (user_id, order_id, created_at, updated_at) VALUES ( '${user_id}', '${order_id}', current_timestamp(), current_timestamp())` ;
        dbConn.query(query, (err, rows) => {
            if (err) {
                reject(err);
            }
            resolve(rows);
        })
    })
}



