//initialize the express object
var express = require('express');
var app = express(); 

//hashcode design for userid
String.prototype.hashCode = function(){
	var hash = 0, len = this.length;
	if ( len === 0 ) return hash;
	for( var i = 0; i < len; ++i ) {
		char = this.charCodeAt(i);
		hash = ((hash<<5)-hash)+char;
		hash = hash & hash; // Convert to 32bit integer
	}
	return hash;
}

//use body parser
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('web'));

//delete from database
app.delete('/region/*', function (req, res) {
	var postBody = req.body;
	var email = req.params[0];
	var userid = email.hashCode();
	//database part
	var fs = require('fs');
	var sql = require('sql.js');

	var filebuffer = fs.readFileSync('foodminer.db');
	var db = new sql.Database(filebuffer);

	//select user previous info
	var stmt = db.prepare("SELECT * FROM Preference WHERE ID=:userid");
	var result = stmt.getAsObject({':userid' : userid});

	var arrayR = result['Region'].split(",");
	var foodregion = "";
	for(var i = 0; i < arrayR.length; i++){
		if(postBody.foodregion !== arrayR[i])
			foodregion = foodregion + arrayR[i] + ',';
	}

	db.run('UPDATE Preference SET Region=' 
		+ '\'' + String(foodregion) +',\'' 
		+ 'WHERE ID = ' + '\'' + String(userid) +'\'');
	var data = db.export();
	var buffer = new Buffer(data);
	fs.writeFileSync('foodminer.db', buffer);
	db.close();
	res.send(foodregion);
});

//update pereference
app.post('/region/*', function (req, res) {
	var postBody = req.body;
	var email = req.params[0];	
	var userid = email.hashCode();

	//database part
	var fs = require('fs');
	var sql = require('sql.js');

	var filebuffer = fs.readFileSync('foodminer.db');
	var db = new sql.Database(filebuffer);

	//select user previous info
	var stmt = db.prepare("SELECT * FROM Preference WHERE ID=:userid");
	var result = stmt.getAsObject({':userid' : userid});

	if(result['Region'] == "None")
		var foodregion = postBody.foodregion;
	else 
		var foodregion = result['Region'] + postBody.foodregion;
	//update
	db.run('UPDATE Preference SET Region=' 
		+ '\'' + String(foodregion) +',\'' 
		+ 'WHERE ID = ' + '\'' + String(userid) +'\'');
	var data = db.export();
	var buffer = new Buffer(data);
	fs.writeFileSync('foodminer.db', buffer);
	db.close();
	res.send(foodregion);
});

app.post('/users/', function (req, res) {
    var postBody = req.body;
    console.log(postBody);
	var nickname = postBody.nickname;
	var password = postBody.password;
	var age = postBody.age;
	var gender = postBody.gender;
	var email = postBody.email;
	var userid = email.hashCode();

	//database part
	var fs = require('fs');
	var sql = require('sql.js');

	var filebuffer = fs.readFileSync('foodminer.db');
	var db = new sql.Database(filebuffer);

	db.run('INSERT INTO Users VALUES (\'' + 
		String(userid)   + '\',\'' + String(email) + '\',\'' + 
  		String(nickname) + '\',\'' + String(password) + '\',\'' + 
  		String(age)      + '\',\'' + String(gender) + '\')');

	db.run('INSERT INTO Preference VALUES (\'' + 
		String(userid) + '\',\'' + "None" + '\',\'' + "None" +'\')');

	//var stmt = db.prepare("SELECT * FROM Users WHERE Email=:email-adress");
	//var result = stmt.getAsObject({':email-adress' : email});
	//console.log(result);
	
	var data = db.export();
	var buffer = new Buffer(data);
	fs.writeFileSync('foodminer.db', buffer);
	db.close();
	res.send('OK');
});

app.get('/login/*',function (req,res){
	var email = req.params[0];
	//database part
	var fs = require('fs');
	var sql = require('sql.js');

	var filebuffer = fs.readFileSync('foodminer.db');
	var db = new sql.Database(filebuffer);

	var stmt = db.prepare("SELECT * FROM Users WHERE email=:user");
	var result = stmt.getAsObject({':user' : email});

	console.log(result); //Will print the user colomn

	db.close();
	res.send(result);
	return;
});


//send home page
app.get('/', function (req, res) {
	res.sendFile(__dirname + '/web/home.html');
});

//send services page
app.get('/services' , function (req,res) {
	res.sendFile(__dirname + '/web/services.html');
});

//send about page
app.get('/about' , function (req,res) {
	res.sendFile(__dirname + '/web/about.html');
});

//send discovery page
app.get('/discover', function (req, res) {
	res.sendFile(__dirname + '/web/discover.html');
});

//send contact page
app.get('/contact', function (req, res) {
	res.sendFile(__dirname + '/web/contact.html');
});


// start the server on http://localhost:3000/
var server = app.listen(3000, function () {
	var port = server.address().port;
	console.log('Server started at http://localhost:%s/', port);
});
