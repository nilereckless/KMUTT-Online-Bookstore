var mysql     = require('mysql');
var connection = mysql.createConnection({
  host     : '192.168.64.3',
  user     : 'Bookstore',
  password : 'bookstore',
  database: 'nodejs_crud_db'
});

connection.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }

  console.log('connected as id ' + connection.threadId);
});


module.exports = connection;