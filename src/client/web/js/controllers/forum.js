// forum.js
angular.module('IronbaneApp')
.controller('ForumCtrl', ['$scope', 'Forum','$log', function($scope, Forum,$log) {
    Forum.getAllWithBoards().then(function(forum) { 
	    $scope.cats = forum;
	}, function(error) {
		 $log.log(error);
		});
    	
    Forum.getLatestOnlineUsers().then(function(users){

    	$scope.users = users.data;
        $log.log($scope.users);
    }, function(error) { 
    	$log.log(error);
    });

    Forum.getStatistics().then(function(statistics) {
        //is there a workaround for this data[0] and do statistics or statistics.data?
        $scope.statistics = statistics.data;

    }, function(error) {
        $log.log(error);
    });
        
}]);