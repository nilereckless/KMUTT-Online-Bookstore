let dbConn = require('../lib/db');

exports.getShippingAddressByUserID = (userID) => {
    return new Promise((resolve, reject) => {
        var query = `SELECT * FROM ship_address WHERE userID = ${userID}`;
        dbConn.query(query, (err, rows) => {
            if (err) {
                reject(err);
            }
            resolve(rows);
        })
    })
}


exports.getAllShippingAddressByUserID = (userID) => {
    return new Promise((resolve, reject) => {
        var query = `SELECT * FROM ship_address WHERE userID = '${userID}'`;
        dbConn.query(query, (err, rows) => {
            if (err) {
                reject(err);
            }
            resolve(rows);
        })
    })
}

exports.addShippingAddress = (userID, district, province, postalCode, address, subdistrict) => {
    return new Promise((resolve, reject) => {
        var query = `INSERT INTO ship_address (userID, district, province, postalCode, address, subdistrict, createdAt, updatedAt) VALUES ( '${userID}', '${district}', '${province}', '${postalCode}', '${address}', '${subdistrict}', current_timestamp(), current_timestamp())` ;
        dbConn.query(query, (err, rows) => {
            if (err) {
                reject(err);
            }
            resolve(rows);
        })
    })
}

exports.getShippingAddressByShipID = (shipID) => {
    return new Promise((resolve, reject) => {
        var query = `SELECT * FROM ship_address WHERE shipID = ${shipID}`;
        dbConn.query(query, (err, rows) => {
            if (err) {
                reject(err);
            }
            resolve(rows[0]);
        })
    })
}

