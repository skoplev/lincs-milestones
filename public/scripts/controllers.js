var indexControllers = angular.module('indexControllers', ["services"]);

indexControllers.controller('tableCtrl', ['$scope', '$modal', 'getDocs',
	function($scope,$modal,getDocs){

		getDocs().then(function(docs){
			$scope.docs = docs;
			console.log(docs);
		});

		$scope.getters = {
			release: function(value){
				if(value["release-date"]=="TBD") return new Date("6/29/2100")
				else return new Date(value["release-date"]);
			}
		}

}]);