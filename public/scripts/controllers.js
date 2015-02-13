var indexControllers = angular.module('indexControllers', ["services"]);

indexControllers.controller('tableCtrl', ['$scope', '$modal', 'getDocs',
	function($scope,$modal,getDocs){

		getDocs().then(function(docs){
			$scope.docs = docs;
			console.log(docs);
		});

}]);