
var services = angular.module('services', []);

services.factory('centerMap',function(){
	return {
		urls:{
			"Broad-LINCS-Transcriptomics":"http://www.lincscloud.org/",
			"Broad-LINCS-PCCSE":"http://www.lincsproject.org/centers/data-and-signature-generating-centers/broad-prx/",
			"HMS-LINCS":"http://lincs.hms.harvard.edu/",
			"DTOXS":"http://research.mssm.edu/pst/DToxS/index.htm",
			"MEP-LINCS":"http://www.lincsproject.org/centers/data-and-signature-generating-centers/oregon-u/",
			"NeuroLINCS":"http://www.lincsproject.org/centers/data-and-signature-generating-centers/neurolincs/"
		},
		logos:{
			"Broad-LINCS-Transcriptomics":"CSS/img/Broad.jpg",
			"Broad-LINCS-PCCSE":"CSS/img/Broad.jpg",
			"HMS-LINCS":"CSS/img/harvard.png",
			"DTOXS":"CSS/img/ISMMS.png",
			"MEP-LINCS":"CSS/img/ohsu.jpg",
			"NeuroLINCS":"CSS/img/UCI.jpg"
		}
	}
});

var transforms;
services.factory('getSource',['$http', 'dateFilter','$q',
	function($http,dateFilter,$q){

		var deferred = $q.defer();

		var idx = window.location.href.lastIndexOf('/');
		var baseUrl = window.location.href.slice(0,idx+1);
		$http.get(baseUrl+'docs')
				.success(function(data){
			deferred.resolve({
				transformed:transform(data),
				summary: summary(data)
			})
		})


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
				transformed["release-link"] = doc["release-link"];

				transformed['id'] = doc['_id'];

				return transformed
			});
		}

		function summary(raw){
			var count = {};
			var assays = {};
			count.center = 6;

			raw.forEach(function(e){
				var assayName = e["assay"]
				assays[assayName] = {};
				assays[assayName].perturbagensCount = transformByKey("perturbagens-count",e);
				assays[assayName].cellLinesCount = transformByKey("cell-lines-count",e);
			});

			count.assays = Object.keys(assays).length;
			var sum = function(assays,key){
				return _.reduce(assays,function(memo,assay){
					var total = 0;
					assay[key].forEach(function(count){
						if(count.count!="TBD") total = total+count.count;
					})
					return memo+total;
				},0);
			}
			count.cellLines = sum(assays,"cellLinesCount");
			count.perturbagens = sum(assays,"perturbagensCount");
			return count;
		}

		return deferred.promise;
}]);




function transformByKey(key,doc){
	// key is the key in transformed.
	var transforms = {
		"cell-lines":function(){
			if("cell-lines" in doc){
				return _.sortBy(doc["cell-lines"],function(cell){
					if("name" in cell)
						return cell.name.toLowerCase();
					else
						return 'zzz';
				});
			}else return ["TBD"]
		},

		"cell-lines-count":function(){
			// consider changing the structure of cell-lines-meta
			// to the same as perturbagens-meta.
			if("cell-lines-meta" in doc){
				return _.map(doc["cell-lines-meta"],function(countObj){
					if(countObj.type=="ips-differentiated") countObj.type="iPSC, differentiated";
					return countObj;
				});
			}else return [{count:"TBD",type:"TBD"}]
		},


		"perturbagens":function(){
			if("perturbagens" in doc){
				return _.sortBy(doc['perturbagens'],function(perturbagen){
					if("name" in perturbagen)
						return S(perturbagen.name).trim().s.toLowerCase();
					else
						return 'zzz';
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
	}

	return transforms[key]();
}


// function extractByKey(accumulator,key,doc){
// 	var extract = {
// 		"perturbagens":function(){
// 			if("perturbagens" in doc){
// 				accumulator = accumulator.concat(_.map(doc["perturbagens"],function(perturbagen){
// 					return perturbagen.name;
// 				}));
// 			}
// 			return accumulator
// 		},

// 		"cell-lines":function(){
// 			var isValid = function(firstCellLine){
// 				if(firstCellLine==" Which four? Birtwistle unsure of structure") return false;
// 				else return true;
// 			}

// 			if("cell-lines" in doc && isValid(doc["cell-lines"][0])){
// 				accumulator = accumulator.concat(_.map(doc["cell-lines"],function(cellLine){
// 					return cellLine.name;
// 				}))
// 			}

// 			return accumulator
// 		}
// 	}

// 	return extract[key]();
// }
