let dbConn = require('../lib/db');

exports.addReportPayment = (userID, fullName, eMail, phone, orderNumber, date, slip, amount, note) => {
    return new Promise((resolve, reject) => {
        var query = `INSERT INTO reportorder (userID, fullName, eMail, phone, orderNumber, date, slip, amount, note) VALUES ( '${userID}', '${fullName}', '${eMail}', '${phone}', '${orderNumber}', '${date}', '${slip}', '${amount}', '${note}' )`;
        dbConn.query(query, (err, rows) => {
            if (err) {
                reject(err);
            }
            resolve(rows);
        })
    })
}