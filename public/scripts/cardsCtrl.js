var indexControllers = angular.module('indexControllers', ["services"]);
var idx = window.location.href.lastIndexOf('/');
var baseURL = window.location.href.slice(0, idx + 1);
indexControllers.controller('cardsCtrl', ['$scope', '$modal', 'centerMap', 'getSource',
    function($scope, $modal, centerMap, getSource) {

        getSource.then(function(source) {
            $scope.centerMap = centerMap;
            $scope.docs = [];
            source.transformed.forEach(function(doc) {
                //if (!doc.released) {
                //    return;
                //}
                var date, status, center;
                if (doc["release-date"] == "TBD") {
                    date = new Date("6/29/2100").getTime();
                } else {
                    date = new Date(doc["release-date"]).getTime();
                }
                center = centerMap[doc['center']].initial;
                if (doc.released) {
                    status = 1;
                } else {
                    status = 2;
                }
                // fix the bug when using function to sort.
                doc['centerSort'] = center + date;
                doc['releaseSort'] = date + center;
                doc['statusSort'] = status + center;
                doc.initial = centerMap[doc.center].initial;
                $scope.docs.push(doc);
            });

            $scope.summary = {
                center: 0,
                assays: 0,
                cellLines: 0,
                perturbagens: 0
            };

            function countUpTo(field, count, max, step, time) {
                setTimeout(function() {
                    if (count === max) {
                        return;
                    } else if (count + step > max) {
                        countUpTo(field, count, max, 1, 0);
                    } else {
                        count = count + step;
                        $scope.summary[field] = count;
                        $scope.$apply();
                        countUpTo(field, count, max, step, time);
                    }
                }, time);
            }

            source.summary.then(function(counts) {
                countUpTo('center', 0, counts.center, 1, 50);
                countUpTo('assays', 0, counts.assays, 1, 10);
                countUpTo('perturbagens', 0, counts.perturbagens, 50, 10);
                countUpTo('cellLines', 0, counts.cellLines, 5, 10);
            });
        });


        // $scope.getters = {
        // 	center:function(val){
        // 		return centerMap[val['center']]['initial']+new Date(val["release-date"]).getTime();
        // 	},
        // 	release: function(value){
        // 		if(value["release-date"]=="TBD") return new Date("6/29/2100");
        // 		else return new Date(value["release-date"]);
        // 	},
        // 	status:function(value){
        // 		if(value['release-link']) return 1;
        // 		else return 2;
        // 	},
        // 	assay:function(value){
        // 		return value['assay'];
        // 	},
        // };

        // $scope.centerGet = function(val){
        // 	return val['center'];
        // }

        $scope.extractID = function(link) {
            // Check for www.ncbi.nlm.nih.gov
            var sL = link.split('/');
            if (sL[2] === 'www.ncbi.nlm.nih.gov') {
                return sL[sL.length - 1].split('=')[1];
            } else {
                return link.split('/').splice(-2, 1)[0];
            }
        };

        /*
        var getCommonKeys = function(items) {
            // get common keys of item objects.
            var keyCount = {};
            items.forEach(function(item) {
                var keys = Object.keys(item);
                keys.forEach(function(key) {
                    if (!(key in keyCount)) {
                        keyCount[key] = 1;
                    } else {
                        keyCount[key] += 1;
                    }
                });
            });
            var itemCount = items.length;
            var commonKeys = [];
            Object.keys(keyCount).forEach(function(key) {
                if (keyCount[key] >= itemCount / 2) {
                    commonKeys.push(key);
                }
            });
            return commonKeys;
        };
        */
  

        $scope.enlarge = function(doc) {
            
            $modal.open({
                templateUrl: baseURL + 'bigCard.html',
                controller: 'cardModalCtrl',
                resolve: {
                    doc: function() {
                        return doc;
                    }
                }
            });
        };
    }])
    .controller('cardModalCtrl',
    ['$scope', '$modalInstance', 'doc',
        function($scope, $modalInstance, doc) {
            $scope.doc = doc;
            $scope.itemsPerPage = 6;
            $scope.searchThres = 16;
            if ($scope.doc.perturbagens[0] == "TBD") {
                // normalize the input format for modal
                $scope.doc.perturbagens = [{ name: "TBD" }]
            }
            $scope.doc.perturbagens.forEach(function(perturbagen) {
                delete perturbagen["$$hashKey"];
            });
            if ($scope.doc['cell-lines'][0] == "TBD") {
                // normalize the input format for modal
                $scope.doc['cell-lines'] = [{ name: "TBD" }];
            }
            $scope.doc['cell-lines'].forEach(function(cell) {
                delete cell["$$hashKey"];
            });
            $scope.cancel = function() {
                $modalInstance.dismiss('cancel');
            };
        }]);

