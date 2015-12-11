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
	for(var i = 0; i < arrayR.length -1 ; i++){
		console.log(arrayR[i]);
		if(postBody.foodregion != arrayR[i])
			foodregion = foodregion + arrayR[i] + ",";
	}
	if(foodregion == ",")
		foodregion = "None";
	console.log(foodregion);
	db.run('UPDATE Preference SET Region=' 
		+ '\'' + String(foodregion) +'\'' 
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

//update preference for types of food
//update pereference
app.post('/type/*', function (req, res) {
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

	if(result['Type'] == "None")
		var foodtype = postBody.foodtype;
	else 
		var foodtype = result['Type'] + postBody.foodtype;
	//update
	db.run('UPDATE Preference SET Type=' 
		+ '\'' + String(foodtype) +',\'' 
		+ 'WHERE ID = ' + '\'' + String(userid) +'\'');
	var data = db.export();
	var buffer = new Buffer(data);
	fs.writeFileSync('foodminer.db', buffer);
	db.close();
	res.send(foodtype);
});

//delete from database
app.delete('/type/*', function (req, res) {
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

	var arrayR = result['Type'].split(",");
	var foodtype = "";
	for(var i = 0; i < arrayR.length -1 ; i++){
		console.log(arrayR[i]);
		if(postBody.foodtype != arrayR[i])
			foodtype = foodtype + arrayR[i] + ",";
	}
	if(foodtype == ",")
		foodtype = "None";
	console.log(foodtype);
	db.run('UPDATE Preference SET Type=' 
		+ '\'' + String(foodtype) +'\'' 
		+ 'WHERE ID = ' + '\'' + String(userid) +'\'');
	var data = db.export();
	var buffer = new Buffer(data);
	fs.writeFileSync('foodminer.db', buffer);
	db.close();
	res.send(foodtype);
});

//get comments
app.get('/fcomment/*', function (req, res) {
	var postBody = req.body;
	var rest = req.params[0];

	var fs = require('fs');
	var sql = require('sql.js');

	var filebuffer = fs.readFileSync('foodminer.db');
	var db = new sql.Database(filebuffer);

	var result = db.exec("SELECT * FROM Comments WHERE Name=" + "\'"+rest + "\';");

	db.close();
	console.log(result);
	res.send(result);
	return;
});

//get user info
app.post('/rec/*', function (req, res){
	var email = req.params[0];
	var userid = email.hashCode();
	var postBody = req.body;
	var resultlist = [];
	console.log(postBody);
	var regions = postBody.region.split(',');
	var types = postBody.type.split(',');
	var index = 0;
	//database part
	var fs = require('fs');
	var sql = require('sql.js');
	var filebuffer = fs.readFileSync('foodminer.db');
	var db = new sql.Database(filebuffer);
	var results = db.exec("SELECT * FROM Restaurant;");
	console.log(results);
	results = results[0]['values'];
	for(var i = 0; i < results.length; i++){
		var tags = results[i][0];
		for(var j = 0; j < regions.length;j++){
			if(regions[j] != ""&&tags.indexOf(regions[j]) > -1){
				console.log(tags.indexOf(regions[j]));
				resultlist[index] = results[i];
				index++;
				results[i][0] = "-1";
			}
		}
		console.log(types);
		for(var k = 0; k < types.length; k++){
			if(types[k] != "" && tags.indexOf(types[k]) > -1){
				console.log(tags.indexOf(types[k]));
				resultlist[index] = results[i];
				index++;
				results[i][0] = "-1";
			}
		}
	}
	res.send(resultlist);

});

//write user comments
app.post('/comment/*', function (req, res) {
	var postBody = req.body;
	var rest = req.params[0];

	//database part
	var fs = require('fs');
	var sql = require('sql.js');
	var filebuffer = fs.readFileSync('foodminer.db');
	var db = new sql.Database(filebuffer);
	console.log('INSERT INTO Comments VALUES (\'' + 
			String(rest)   + '\',\'' + String(postBody.userid) + '\',\'' + 
	  		String(postBody.email) + '\',\'' + String(postBody.comment) + '\')');
	db.run('INSERT INTO Comments VALUES ("' + 
			String(rest)   + '","' + String(postBody.userid) + '","' + 
	  		String(postBody.email) + '","' + String(postBody.comment) + '")');
	var data = db.export();
	var buffer = new Buffer(data);
	fs.writeFileSync('foodminer.db', buffer);
	res.send('OK');

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

	var stmt = db.prepare("SELECT * FROM Users WHERE email=:email");
	var result = stmt.getAsObject({':email' : email});

	if (JSON.stringify(result) != '{}'){
		res.send("This email has already been registered!");
	}
	else{
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
		res.send('OK');
	}

	db.close();
	return;
});

app.get('/login/*',function (req,res){
	var email = req.params[0];
	var userid = email.hashCode();
	//database part
	var fs = require('fs');
	var sql = require('sql.js');

	var filebuffer = fs.readFileSync('foodminer.db');
	var db = new sql.Database(filebuffer);

	var stmt = db.prepare("SELECT * FROM Users WHERE email=:email");
	var result = stmt.getAsObject({':email' : email});

	var stmt2 = db.prepare("SELECT * FROM Preference WHERE ID=:userid");
	var result2 = stmt2.getAsObject({':userid' : userid});

	console.log(result);
	console.log(result2); //Will print the user colomn
	result['Region'] = result2.Region;
	result['Type'] = result2.Type;

	db.close();
	res.send(result);
	return;
});

app.put('/users/*', function (req, res){
	var postBody = req.body;
    console.log(postBody);

	var userid = postBody.userid;
	var nickname = postBody.nickname;
	var age = postBody.age;
	var gender = postBody.gender;
	
	//try to look up in database
	var fs = require('fs');
	var sql = require('sql.js');

	var filebuffer = fs.readFileSync('foodminer.db');
	var db = new sql.Database(filebuffer);

	var stmt = db.prepare("SELECT * FROM Users WHERE ID=:userid");
	var result = stmt.getAsObject({':userid' : userid});

	if (JSON.stringify(result) == '{}'){
		res.send("There is no such account!");
	} else {
		db.run("UPDATE Users SET Nickname=\'" + String(nickname) + "\', Age=\'" + String(age) + "\', Gender=\'" + String(gender) + "\' WHERE ID=\'" + String(userid) + "\'");
		res.send('OK');
	}

//	console.log(result2);

	
	var data = db.export();
	var buffer = new Buffer(data);
	fs.writeFileSync('foodminer.db', buffer);

	db.close();
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
