let mysql = require('mysql');
let connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "nodejs_crud_db"
})

connection.connect(function(error){
   /* if(!!error){
        console.log(error);
    }else{
        console.log('Connected!');
    } */
    if(error) throw error ;
    console.log("connected") ;
});

module.exports = connection;