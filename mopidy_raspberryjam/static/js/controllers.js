var raspberryControllers = angular.module('raspberryjamControllers', []);

raspberryControllers.controller('QueueCtrl', function($scope,Page){
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
	Page.setTitle("Queue");
});

raspberryControllers.controller('MainCtrl', function($scope,Page){
	$scope.Page = Page;
});

raspberryControllers.controller('PlayingCtrl', function($scope,Page){
	$scope.controllable = false;
});

raspberryControllers.controller('ArtistsController', ['$rootScope','$scope','Page', function($rootScope,$scope, Page) {
	Page.setTitle("Artists");
	$scope.columns = 4;
	$scope.width = 12/$scope.columns;
	$scope.searchResults = [];
	$scope.searchArtists = function(){
		var artist = this.artist_name;
		setTimeout(function(){
			$("#search-icon").toggleClass("fa-pulse fa-spinner", true);
			$("#search-icon").toggleClass("fa-search", false);
			mopidy.library.search({"artist":artist}).done(function(data){
				$scope.searchResults = $.extend(true,[],data);
				for(var i = 0; i < $scope.searchResults.length; i ++) {
					if($scope.searchResults[i].artists != null)
						$scope.searchResults[i].artists = $scope.searchResults[i].artists.slices($scope.columns);
				}

				$scope.$apply();
				for(var h = 0; h < data.length; h++){
					if(data[h].artists == null) continue;
					for(var i = 0; i < data[h].artists.length; i++){
						var img = "";
						for(var j = 0; j < data[h].albums.length; j++){
							var brk = false;
							for(var k = 0; k < data[h].albums[j].artists.length; k++){
								if(data[h].albums[j].artists[k].uri == data[h].artists[i].uri){
									if(data[h].albums[j].images != null && data[h].albums[j].images.length > 0)
										img = data[h].albums[j].images[0];
									brk = true;
									break;
								}
							}
							if(brk) break;
						}
						$("img[name='albumart_"+data[h].artists[i].uri+"']").attr("src",(img != "" ? img : "assets/cd.png"));
					}
				}

				$("#search-icon").toggleClass("fa-pulse fa-spinner", false);
				$("#search-icon").toggleClass("fa-search", true);
			});
		},0);
	};

	$scope.getAlbumArt = function(results){
		if(results.albums.length > 0 && results.albums[0].images.length > 0)
			return results.albums[0].images[0];
		else
			return "./assets/default_art.jpg";
	}
}]);

raspberryControllers.controller('ArtistsDetailController', ['$scope','$http', function($scope,$http) {
	
}]);

raspberryControllers.controller('AlbumsController', ['$scope','Page', function($scope,Page) {
	Page.setTitle("Albums");
	$scope.searchResults = [];
	$scope.searchAlbums = function(){
		var album = this.album_name;
		setTimeout(function(){
			$("#search-icon").toggleClass("fa-pulse fa-spinner", true);
			$("#search-icon").toggleClass("fa-search", false);
			mopidy.library.search({"album":album}).done(function(data){
				$scope.searchResults = data[0];
				$scope.$apply();

				$("#search-icon").toggleClass("fa-pulse fa-spinner", false);
				$("#search-icon").toggleClass("fa-search", true);
			});
		},0);
	};
}]);
