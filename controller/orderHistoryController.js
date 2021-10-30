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

exports.addOrderHistoryByID = (user_id, order_id, payment_option, shipaddress_id, email) => {
    return new Promise((resolve, reject) => {
        var query = `INSERT INTO order_history (user_id, order_id, created_at, updated_at, payment_option, shipaddress_id, email) VALUES ( '${user_id}', '${order_id}', current_timestamp(), current_timestamp(), '${payment_option}', '${shipaddress_id}', '${email}')` ;
        dbConn.query(query, (err, rows) => {
            if (err) {
                reject(err);
            }
            resolve(rows);
        })
    })
}

exports.getAllOrderHistory = () => {
    return new Promise((resolve, reject) => {
        var query = `SELECT * FROM order_history`;
        dbConn.query(query, (err, rows) => {
            if (err) {
                reject(err);
            }
            resolve(rows);
        })
    })
}

exports.updateOrderStatusByID = (order_id, status) => {
    return new Promise((resolve, reject) => {
        var query = `UPDATE order_history SET status = '${status}' WHERE order_id = ${order_id}`;
        dbConn.query(query, (err, rows) => {
            if (err) {
                reject(err);
            }
            resolve(rows);
        })
    })
}


