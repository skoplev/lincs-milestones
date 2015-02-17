var indexControllers = angular.module('indexControllers', ["services"]);

indexControllers.controller('tableCtrl', ['$scope', '$modal', 'centerUrls', 'getSource',
	function($scope,$modal,centerUrls,getSource){

		getSource.then(function(source){
			$scope.centerUrls = centerUrls;
			console.log(centerUrls);
			$scope.docs = source.transformed;
			$scope.summary = {
			    center: 0,
		        assays: 0,
		        cellLines: 0,
		        perturbagens: 0
			};
			console.log($scope.docs);

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
			release: function(value){
				if(value["release-date"]=="TBD") return new Date("6/29/2100")
				else return new Date(value["release-date"]);
			}
		}

}]);
