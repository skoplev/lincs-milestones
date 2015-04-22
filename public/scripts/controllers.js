var indexControllers = angular.module('indexControllers', ["services"]);
var idx = window.location.href.lastIndexOf('/');
var baseURL = window.location.href.slice(0,idx+1);
indexControllers.controller('tableCtrl', ['$scope', '$modal', 'centerMap', 'getSource',
	function($scope,$modal,centerMap,getSource){

		getSource.then(function(source){
			$scope.centerMap = centerMap;
			$scope.docs = _.sortBy(source.transformed, function(doc){
				return centerMap[doc['center']].initial;
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

            countUpTo('center', 0, source.summary.center, 1, 50);
            countUpTo('assays', 0, source.summary.assays, 1, 10);
            countUpTo('perturbagens', 0, source.summary.perturbagens, 50, 10);
            countUpTo('cellLines', 0, source.summary.cellLines, 5, 10);
		});

		

		$scope.getters = {
			center:function(val){
				return centerMap[val['center']]['initial'];
			},
			release: function(value){
				if(value["release-date"]=="TBD") return new Date("6/29/2100")
				else return new Date(value["release-date"]);
			},
			status:function(value){
				if(value['release-link']) return 1;
				else return 2;
			}
		}

		$scope.extractID = function(link){
			return link.split('/').splice(-2,1)[0];
		}

		var getCommonKeys = function(items){
			// get common keys of item objects.
			var keyCount = {};
			items.forEach(function(item){
				var keys = Object.keys(item);
				keys.forEach(function(key){
					if(!(key in keyCount)) keyCount[key] = 1;
					else keyCount[key] +=1;
				});
			});
			var itemCount = items.length;
			var commonKeys = [];
			Object.keys(keyCount).forEach(function(key){
				if(keyCount[key]>=itemCount/2)
					commonKeys.push(key);
			});
			return commonKeys;
		};

		$scope.showCells = function(cells){
			if(cells[0]=="TBD"){
				// normalize the input format for modal
				cells = [{name:"TBD"}];
			}
			cells.forEach(function(cell){
				delete cell["$$hashKey"];
			});
			var modalInstance = $modal.open({
      			templateUrl: baseURL+'cells.html',
      			controller: 'cellsModalCtrl',
      			resolve:{
      				cells: function(){
      					return cells;
      				},
      				commonKeys:function(){
      					return getCommonKeys(cells);
      				},
      			}
    		});
		}

		$scope.showPerturbagens = function(perturbagens){
			if(perturbagens[0]=="TBD"){
			// normalize the input format for modal
				perturbagens = [{name:"TBD"}]
			}
			perturbagens.forEach(function(perturbagen){
				delete perturbagen["$$hashKey"];
			});
			var modalInstance = $modal.open({
      			templateUrl: baseURL+'perturbagens.html',
      			controller: 'perturbagensModalCtrl',
      			resolve:{
      				perturbagens: function(){
      					return perturbagens;
      				},
      				commonKeys:function(){
      					return getCommonKeys(perturbagens);
      				},
      			}
    		});
		}


}])
.controller('cellsModalCtrl', 
	['$scope', '$modalInstance', 'cells', 'commonKeys', 
	function($scope, $modalInstance, cells, commonKeys) {
 	var order = ['name','type','tissue', 'class'];
 	var orderedKeys = [];
 	order.forEach(function(key){
 		if(_.contains(commonKeys,key))
 			orderedKeys.push(key);
 	});
 	orderedKeys = orderedKeys.concat(_.difference(commonKeys,order));
 	$scope.keys = orderedKeys;
 	$scope.cells = cells;
 	$scope.cellCount = cells.length;
 	$scope.cancel = function () {
    	$modalInstance.dismiss('cancel');
  	};
}])
.controller('perturbagensModalCtrl', 
	['$scope', '$modalInstance', 'perturbagens', 'commonKeys', 
	function($scope, $modalInstance, perturbagens, commonKeys) {
 	var order = ['name','type'];
 	var orderedKeys = [];
 	order.forEach(function(key){
 		if(_.contains(commonKeys,key))
 			orderedKeys.push(key);
 	});
 	orderedKeys = orderedKeys.concat(_.difference(commonKeys,order));
 	$scope.keys = orderedKeys;
 	$scope.perturbagens = perturbagens;
 	$scope.perturbagenCount = perturbagens.length;
 	$scope.cancel = function () {
    	$modalInstance.dismiss('cancel');
  	};
}]);

