var mysql     = require('mysql');
var connection = mysql.createConnection({
  host     : '13.67.42.249',
  user     : 'BOOKSTORE',
  password : '@kongtapTheeradonNapan055457',
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