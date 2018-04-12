var mysql  = require('mysql');



var conn = mysql.createConnection({
  host     : 'localhost',
  user     : 'server',
  password : 'G2315',//your password
  database : 'onlinedisk'
});

conn.connect(function(err){
	if(err){
		console.log('Error connecting to mysql');
		return;
	}
	console.log('Connection established');
});

module.exports = conn;
//conn.end();