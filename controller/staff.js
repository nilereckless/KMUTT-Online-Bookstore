let dbConn = require('../lib/db');

exports.getStaff = (email) => {
    return new Promise((resolve, reject) => {
        var query = `SELECT * FROM staff WHERE staffEmail = '${email}'`;
        dbConn.query(query, (err, rows) => {
            if (err) {
                reject(err);
            }
            resolve(rows);
        })
    })
}

exports.addStaff = (staff) => {
    return new Promise((resolve, reject) => {
        var query = `INSERT INTO staff (staffEmail) VALUES (${staff.email})`;
        dbConn.query(query, (err, rows) => {
            if (err) {
                reject(err);
            }
            resolve(rows);
        })
    })
}
