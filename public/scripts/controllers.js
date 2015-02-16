var indexControllers = angular.module('indexControllers', ["services"]);

indexControllers.controller('tableCtrl', ['$scope', '$modal', 'centerUrls', 'getSource',
	function($scope,$modal,centerUrls,getSource){

		getSource.then(function(source){
			$scope.docs = source.transformed;
			$scope.summary = source.summary;
			console.log($scope.docs);
		});

		$scope.centerUrls = centerUrls;

		$scope.getters = {
			release: function(value){
				if(value["release-date"]=="TBD") return new Date("6/29/2100")
				else return new Date(value["release-date"]);
			}
		}

}]);