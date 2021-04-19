let mysql = require('mysql');
let connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    socketPath: "/Applications/MAMP/tmp/mysql/mysql.sock",
    database: "nodejs_crud_db"
})

connection.connect(function(error){
    if(!!error){
        console.log(error);
    }else{
        console.log('Connected!');
    }
});

module.exports = connection;