
var services = angular.module('services', []);

var transforms;
services.factory('getDocs',['$http', '$q','$location',
	function($http,$q,$location){
		
		function getDocs(){
			var deferred = $q.defer();
			$http.get($location.absUrl()+'docs')
					.success(function(data){
				deferred.resolve(transform(data));
			})
			return deferred.promise;
		}

		function transform(docs){
			return _.map(docs,function(doc){
				var transformed = {};
				transformed["center"] = doc["center"];
				transformed["assay"] = doc["assay"];

				transformed["cell-lines"] = transformByKey("cell-lines",doc);
				transformed["cell-lines-count"] = transformByKey("cell-lines-count",doc);
				
				transformed["perturbagens"] = transformByKey("perturbagens",doc);
				transformed["perturbagens-count"] = transformByKey("perturbagens-count",doc);

				transformed["readouts"] = transformByKey("readouts",doc);
				transformed["release-date"] = transformByKey("release-date",doc);

				return transformed
			});
		}

		return getDocs;
}]);




function transformByKey(key,doc){
	// key is the key in transformed.
	var transforms = {
		"cell-lines":function(){
			if("cell-lines" in doc){
				return _.map(doc["cell-lines"],function(cellLine){
					return cellLine.name
				});
			}else return ["TBD"]
		},

		"cell-lines-count":function(){
			// consider changing the structure of cell-lines-meta 
			// to the same as perturbagens-meta.
			if("cell-lines-meta" in doc){
				return doc["cell-lines-meta"];
			}else return [{count:"TBD",type:"TBD"}]
		},


		"perturbagens":function(){
			if("perturbagens" in doc){
				return _.map(doc["perturbagens"],function(perturbagen){
					return perturbagen.name
				});
			}else return ["TBD"]
		},

		"perturbagens-count":function(){
			if("perturbagens-meta" in doc && "count-type" in doc["perturbagens-meta"]){
				var countType = doc["perturbagens-meta"]["count-type"]
				return _.map(countType,function(countObj){
					if(!("count" in countObj)) countObj["count"] = "TBD";
					if(!("type" in countObj)) countObj["type"] = "TBD";
					return countObj;
				});
			}else return [{count:"TBD",type:"TBD"}]
		},

		"readouts":function(){
			// all tasks have readouts
			return _.map(doc["readouts"],function(readout){
				return readout.name;
			});
		},

		"release-date":function(){
			// most recent release date
			if("release-dates" in doc){
				return _.min(_.map(doc["release-dates"],function(release){
					return new Date(release.date);
				})).toLocaleDateString();
			}else return "TBD";
		}

		// "perturbagens-count":function(){
		// 	if("perturbagens-meta" in doc && "count-type" in doc["perturbagens-meta"]){
		// 		return _.reduce(doc["perturbagens-meta"]["count-type"],
		// 			function(memo,count){return memo+count.count},0);
		// 	}else return "TBD"
		// },

		// "perturbagens-type":function(){
		// 	if("perturbagens-meta" in doc && "count-type" in doc["perturbagens-meta"]){
		// 		return _.map(doc["perturbagens-meta"]["count-type"],function(count){
		// 			return count.type
		// 		});
		// 	}else return ["TBD"]
		// },


	}
	
	return transforms[key]();
}