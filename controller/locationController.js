let dbConn = require('../lib/db');

exports.getAllProvince = () => {
    return new Promise((resolve, reject) => {
        var query = `SELECT * FROM provinces`;
        dbConn.query(query, (err, rows) => {
            if (err) {
                reject(err);
            }
            resolve(rows);
        })
    })
}

exports.getAllDistrict = () => {
    return new Promise((resolve, reject) => {
        var query = `SELECT * FROM districts`;
        dbConn.query(query, (err, rows) => {
            if (err) {
                reject(err);
            }
            resolve(rows);
        })
    })
}

exports.getAllSubdistrict = () => {
    return new Promise((resolve, reject) => {
        var query = `SELECT * FROM subdistricts`;
        dbConn.query(query, (err, rows) => {
            if (err) {
                reject(err);
            }
            resolve(rows);
        })
    })
}

exports.getSubdistrictByDistrictID = (district_id) => {
    return new Promise((resolve, reject) => {
        var query = `SELECT * FROM subdistricts WHERE district_id = ` + district_id;
        dbConn.query(query, (err, rows) => {
            if (err) {
                reject(err);
            }
            resolve(rows);
        })
    })
}