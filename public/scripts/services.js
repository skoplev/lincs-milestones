var services = angular.module('services', []);

services.filter('released', function() {
    return function(docs) {
        var results = [];
        angular.forEach(docs, function(doc) {
            if (angular.isDefined(doc["release-link"])) {
                results.push(doc);
            }
        });
        return results;
    };
});

services.factory('centerMap', function() {
    return {
        "Broad-LINCS-Transcriptomics": {
            fullName: "LINCS Center for Transcriptomics",
            url: "http://www.lincscloud.org/",
            logo: "CSS/img/Broad_T.png",
            initial: 'T',
            color: "#0B609A"
        },
        "Broad-LINCS-PCCSE": {
            fullName: "LINCS Proteomic Characterization Center for Signaling and Epigenetics",
            url: "http://www.lincsproject.org/centers/data-and-signature-generating-centers/broad-prx/",
            logo: "CSS/img/Broad_P.png",
            initial: 'P',
            color: "#0B609A"
        },
        "HMS-LINCS": {
            fullName: "HMS LINCS",
            url: "http://lincs.hms.harvard.edu/",
            logo: "CSS/img/HMS_H.png",
            initial: 'H',
            color: "#C90016"
        },
        "DTOXS": {
            fullName: "DToxS",
            url: "http://research.mssm.edu/pst/DToxS/index.html",
            logo: "CSS/img/DTOXS_D.png",
            initial: 'D',
            // color:"#D80B8C"
            color: "#00AEEF"
        },
        "MEP-LINCS": {
            fullName: "MEP LINCS",
            url: "http://www.lincsproject.org/centers/data-and-signature-generating-centers/oregon-u/",
            logo: "CSS/img/MEP_M.png",
            initial: 'M',
            color: "#66cc33"
        },
        "NeuroLINCS": {
            fullName: "NeuroLINCS",
            url: "http://www.neurolincs.org",
            logo: "CSS/img/NeuroLINCS_N.png",
            initial: 'N',
            color: "#ffd200"
        }
        // logos:{
        // 	"LINCS Transcriptomics":"CSS/img/Broad.jpg",
        // 	"LINCS PCCSE":"CSS/img/JAFFE-LINCS-CenterIcon.png",
        // 	"HMS LINCS":"CSS/img/hms_lincs.png",
        // 	"DTOXS":"CSS/img/DTOXS_Logo.PNG",
        // 	"MEP LINCS":"CSS/img/ohsu.jpg",
        // 	"NeuroLINCS":"CSS/img/NeuroLINCS.png"
        // }
    }
});

var transforms;
services.factory('getSource', ['$http', 'dateFilter', '$q',
    function($http, dateFilter, $q) {

        var deferred = $q.defer();

        var idx = window.location.href.lastIndexOf('/');

        $http
            .get('http://amp.pharm.mssm.edu/LDR/api/releases/released')
            .success(function(data) {
                deferred.resolve({
                    transformed: transform(data),
                    summary: summary(data)
                })
            });


        function transform(docs) {
            // Only return object if released
            return _.map(docs, function(doc) {

                var transformed = {};
                transformed.center = doc.group.name;
                transformed.assay = doc.datasetName;
                transformed.released = doc.released;

                transformed["cell-lines"] = transformByKey("cellLines", doc);
                transformed["cell-lines-count"] = transformed["cell-lines"].length;

                transformed.perturbagens = transformByKey("perturbagens", doc);
                transformed["perturbagens-count"] = transformed.perturbagens.length;

                transformed.readouts = transformByKey("readouts", doc);
                transformed["release-date"] = transformByKey("releaseDate", doc);
                transformed["release-link"] = doc.urls.dataUrl;

                transformed['id'] = doc['_id'];

                return transformed;
            });
        }

        function summary(raw) {

            var def = $q.defer();

            var count = {};
            var assays = {};
            count.center = 6;

            raw.forEach(function(e) {
                var assayName = e.datasetName;
                assays[assayName] = {};
                assays[assayName].perturbagensCount = e.metadata.perturbagens.length;
                assays[assayName].cellLinesCount = e.metadata.cellLines.length;
            });

            $http
                .get('http://amp.pharm.mssm.edu/LDR/api/counts/released')
                .success(function(data) {
                    count.assays = data.dataReleases;
                    count.cellLines = data.cellLines;
                    count.perturbagens = data.perturbagens;
                    def.resolve(count);
                });

            return def.promise;
        }

        return deferred.promise;
    }]);


function transformByKey(key, doc) {
    // key is the key in transformed.
    var transforms = {
        cellLines: function() {
            return _.sortBy(doc.metadata.cellLines, function(cell) {
                if ("name" in cell) {
                    return cell.name.toLowerCase();
                } else {
                    return 'zzz';
                }
            });
        },

        perturbagens: function() {
            return _.sortBy(doc.metadata.perturbagens, function(perturbagen) {
                if ("name" in perturbagen) {
                    return S(perturbagen.name).trim().s.toLowerCase();
                } else {
                    return 'zzz';
                }
            });
        },

        readouts: function() {
            // all tasks have readouts
            return _.map(doc.metadata.readouts, function(readout) {
                return readout.name;
            });
        },

        releaseDate: function() {
            // most recent release date
            if ("releaseDates" in doc) {
                return doc.releaseDates.upcoming;
            } else {
                return "TBD";
            }
        }
    };

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
