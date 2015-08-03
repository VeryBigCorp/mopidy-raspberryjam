var raspberryControllers = angular.module('raspberryjamControllers', []);

raspberryControllers.controller('QueueCtrl', function($scope){
	$scope.queue = [
		{title: "Somewhere in the Between", artist: "Streetlight Manifesto", runtime:254},
		{title: "Damn", artist: "John Mackey", runtime: 326}
	];


	$scope.timeToStr = function(seconds){
		var str = "";
		var hrs = Math.floor(seconds / 3600);
		var mins = Math.floor((seconds - hrs*3600)/ 60);
		var secs = Math.floor((seconds-hrs*3600-mins*60));

		return str + (hrs > 0 ? hrs+ " hrs "  : "") + (mins > 0 ? mins + " min " : "") + (secs > 0 ? secs + " s" : "");
	}
});

raspberryControllers.controller('PlayingCtrl', function($scope){
	$scope.controllable = false;
});