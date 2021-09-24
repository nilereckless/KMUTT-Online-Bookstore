let dbConn = require('./db');

exports.getBookByName = (name) => {
  return new Promise((resolve, reject) =>{
    var query = "SELECT * FROM books WHERE name = ?" ;
    dbConn.query(query,[name], (err, rows) => {
        if (err) {
            reject(err);
        }
        resolve(rows);
    })
  });
}

exports.getBookByAuthor = (author) => {
  return new Promise((resolve, reject) => {
    var query = "SELECT * FROM books WHERE author = ?" ;
    dbConn.query(query, [author], (err, rows) => {
      if(err){
        reject(err) ;
      }
      resolve(rows) ;
    })
  }) ;
}