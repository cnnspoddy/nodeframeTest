var request = require('request');
var mongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var objectId = require('mongodb').ObjectID;
var dbName = "nodeframeTest";
var mongoUrl = 'mongodb://localhost:27017/' + dbName;

function fetch(i, cb) {
	console.log("fech function...");
	console.log("i ==>" + i);

	var url = "http://www.dofordad.com/get_info.php";

	request.post({
		url: url,
		form: {
		 	pixel: i
		}
	}, function(err, httpResponse, body){
		if(!err && httpResponse.statusCode == 200) {
			var obj = JSON.parse(body);

			if(obj != null && obj.length != 0) {
				console.log("name ==> " + obj.name);
				console.log("id ==> " + obj.fb_id);

				mongoClient.connect(mongoUrl, function(err, db) {
					assert.equal(null, err);
					console.log("Connected correctly to server.");

					var collection = db.collection('user');
					
					collection.updateOne({
						"socialId": obj.fb_id
					},
					{
						"socialId": obj.fb_id,
						"name": obj.name
					},
					{
						upsert: true,
						safe: false
					}, function(err, result) {
						assert.equal(null, err);
						if(err)
							console.log("err ==> " + err);
						db.close();
					});
				});
			}
		}
	});
	cb();
}

function fetchAll(i, j) {
	console.log("fetchAll function...");
	console.log("i ==> " + i + " j ==> " + j);

	fetch(i, function() {
		setTimeout(function() {
			if(i != j) {
				fetchAll(++i, j);
			} else {
				mongoClient.connect(mongoUrl, function(err, db) {
					assert.equal(null, err);

					var collection = db.collection('user');
					var countCollection = db.collection('counting');
								
					var count2 = 0;
					collection.count(function(err, count) {
						count2 = count;
					})

					countCollection.updateOne({
						"count": count2
					},
					{
						"count": count2
					}, function(err, result) {
						assert.equal(null, err);
						if(err) {
							console.log("err ==> " + err);
						}
						db.close();
					})
				})
			}
		}, 300);
	});
}

console.log("starting...");

var input = process.argv[2];

mongoClient.connect(mongoUrl, function(err, db) {
	var collection = db.collection('user');

	collection.count(function(err, count) {
		if(count < 9999) {
			console.log("count is ==> " + count);
			setTimeout(function() {
				fetchAll(count, 10000 + (10000 - count));
			}, 10000);
			
		}
	})

	console.log("input is ==> " + input);
	collection.findOne({
		name: input
	}, function(err, document) {
		if(document)
			console.log("true");
		else {
			console.log("flase");
		}
	});
});

setTimeout(function() {
	console.log("successfully!");
}, 2000);