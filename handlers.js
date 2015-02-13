var mongo = require('query-mongo')

exports.docs = function(req,res){
	mongo.getAll().then(function(docs){
		res.send(docs);
	});
}