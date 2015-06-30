var mongo = require('./query-mongo.js')

exports.docs = function(req,res){
	res.header('Access-Control-Allow-Origin','*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');

	mongo.getAll().then(function(docs){
		res.send(docs);
	});
};
