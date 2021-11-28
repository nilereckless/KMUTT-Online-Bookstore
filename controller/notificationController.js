let dbConn = require('../lib/db');

exports.getNotificationsByUserID = (userID) => {
    return new Promise((resolve, reject) => {
        var query = `SELECT * FROM notifications WHERE userID = '${userID}'`;
        dbConn.query(query, (err, rows) => {
            if (err) {
                reject(err);
            }
            resolve(rows);
        })
    })
}

exports.addNotifications = (userID, message, status, orderNumber) => {
    return new Promise((resolve, reject) => {
        var query = `INSERT INTO notifications (userID, message, status, orderNumber) VALUES ( '${userID}', '${message}', '${status}', '${orderNumber}' )`;
        dbConn.query(query, (err, rows) => {
            if (err) {
                reject(err);
            }
            resolve(rows);
        })
    })
}
