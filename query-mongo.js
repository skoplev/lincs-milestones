 var MongoClient = require('mongodb').MongoClient;
 var q = require('q');

var coll;
var connectDeferred = q.defer();
// point to falafel server
MongoClient.connect('mongodb://146.203.54.165:27017/LINCS',
	function(err,db){
		if(err) {
            connectDeferred.reject(err);
        } else {
            connectDeferred.resolve(db.collection("milestones"));
        }
		coll = db.collection("milestones");


		exports.getAll=function(){
			var deferred = q.defer();
			coll.find().sort({center:1,"assay_info":1})
				.toArray(function(err,results){
					if(err) {
                        deferred.reject(err);
                    } else {
                        deferred.resolve(results);
                    }
			});
			return deferred.promise;
		};

});
