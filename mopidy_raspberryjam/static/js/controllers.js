var raspberryControllers = angular.module('raspberryjamControllers', []);

raspberryControllers.controller('QueueCtrl', function($scope){
	$scope.queue = [
		{title: "Somewhere in the Between", artist: "Streetlight Manifesto", runtime:254, genre: "Ska", img: "http://www.lyriki.com/images/thumb/4/40/AlbumArt-Streetlight_Manifesto-Somewhere_in_the_Between_%282007%29.jpg/250px-AlbumArt-Streetlight_Manifesto-Somewhere_in_the_Between_%282007%29.jpg"},
		{title: "Damn", artist: "John Mackey", runtime: 326, genre: "Contemporary", img: "http://ostimusic.com/imagefiles/IMG_6496cropped.jpg"},
	];


	$scope.timeToStr = function(seconds){
		var str = "";
		var hrs = Math.floor(seconds / 3600);
		var mins = Math.floor((seconds - hrs*3600)/ 60);
		var secs = Math.floor((seconds-hrs*3600-mins*60));

		return str + (hrs > 0 ? hrs+ " hrs "  : "") + (mins > 0 ? mins + " min " : "") + (secs > 0 ? secs + " s" : "");
	}

	$scope.queueTimeTotal = function(){
		var sum = 0;
		$scope.queue.forEach(function(song,index,arr){sum += song.runtime});
		return sum;
	}
});

raspberryControllers.controller('PlayingCtrl', function($scope){
	$scope.controllable = false;
});
