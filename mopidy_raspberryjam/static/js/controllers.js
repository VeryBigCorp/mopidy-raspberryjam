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

raspberryControllers.controller('MainCtrl', function($scope,Page,mop){
	$scope.Page = Page;
    $scope.mop = mop;
});

raspberryControllers.controller('PlayingCtrl', function($scope,Page){
	$scope.controllable = false;
});

raspberryControllers.controller('ArtistsController', ['$rootScope','$scope','Page','mop', function($rootScope,$scope, Page,mop) {
    Page.setTitle("Artists");
    $scope.columns = 4;
	$scope.width = 12/$scope.columns;
	$scope.searchResults = [];
	$scope.searchArtists = function(){
		var artist = this.artist_name;
        Page.setTitle(artist);
		mop.callbackReady(function(){
			$("#search-icon").toggleClass("fa-pulse fa-spinner", true);
			$("#search-icon").toggleClass("fa-search", false);
			mop.searchLibrary({"artist":artist},function(data){
				$scope.searchResults = $.extend(true,[],data);
                $scope.searchResults.total = 0;
				for(var i = 0; i < $scope.searchResults.length; i++) {
					if($scope.searchResults[i].artists != null){ 
                        /*mopidy.library.getImages($scope.searchResults[i].artists.map(function(artist){return artist.uri;})).done(function(data){
                            console.log(data);
                            for(uri in data){
                                $("img[name='albumart_"+uri+"']").attr('src', data[uri] != null && data[uri].length > 0 ? data[uri][0].uri : "assets/cd.png");
                            }
                        });*/

                        $scope.searchResults.total += $scope.searchResults[i].artists.length;
						$scope.searchResults[i].artists = $scope.searchResults[i].artists.slices($scope.columns);
                    }
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
		});
	};

	$scope.getAlbumArt = function(results){
		if(results.albums.length > 0 && results.albums[0].images.length > 0)
			return results.albums[0].images[0];
		else
			return "./assets/default_art.jpg";
	}
}]);

raspberryControllers.controller('ArtistsDetailController', ['$scope','$routeParams','Page', 'mop', function($scope,$routeParams,Page,mop) {
	Page.setTitle("Artist Details");
    $scope.id = $routeParams.id;
    $scope.artist = {name: "Loading..."};
    // Get artist image

    mop.callbackReady(function(){
        // Get artist image
        mop.service.library.getImages([$scope.id]).done(function(data){
            if(data[$scope.id].length > 0)
                $scope.img = data[$scope.id].rand().uri;
            $scope.$apply();
        });

        // Get tracks
        mop.lookup($scope.id,function(_tracks) { 
            var tracks = $.extend(true,[],_tracks);
            $scope.albums = tracks.map(function(track){
                return track.album;    
            });
            $scope.albums = $scope.albums.uniq("uri").sort_key("name");
            // Get artist name lol
            for(var i = 0; i < $scope.albums.length; i++){
                // Get artist name
                for(var j = 0; j < $scope.albums[i].artists.length;j++){
                    if($scope.albums[i].artists[j].uri == $scope.id){
                        $scope.artist = $scope.albums[i].artists[j];
                        Page.setTitle($scope.artist.name);
                        break;
                    }
                }
                // Add tracks to each album
                $scope.albums[i].runTime = 0;
                for(var j = 0; j < tracks.length; j++){
                    if(tracks[j].album.uri == $scope.albums[i].uri){
                        if($scope.albums[i].tracks == null)
                            $scope.albums[i].tracks = [];
                        $scope.albums[i].tracks.push(tracks[j]);
                        $scope.albums[i].runTime += tracks[i].length;
                    }
                }
            }
            $scope.nTracks = tracks.length;
            $scope.$apply();
        });
    });


	$scope.timeToStr = function(seconds){
		var str = "";
		var hrs = Math.floor(seconds / 3600);
		var mins = Math.floor((seconds - hrs*3600)/ 60);
		var secs = Math.floor((seconds-hrs*3600-mins*60));
        var time = [hrs,mins,secs];

        for(var i = 0; i < 3; i++){
            if(i == 0 && time[i] == 0){
                time.splice(i,1);
                continue;
            }
            if(time[i] < 10){
                time[i] = "0"+time[i];
            }
        }

        return time.join(":");
        return str + (hrs > 0 ? hrs+ "jquery "  : "") + (mins > 0 ? mins + " min " : "") + (secs > 0 ? secs + " s" : "");
	}

    $scope.addToQueue = function(uri){
        mop.addToQueue(uri);
    }
}]);

raspberryControllers.controller('AlbumsController', ['$scope','Page','mop', function($scope,Page,mop) {
	Page.setTitle("Albums");
    $scope.columns = 4;
	$scope.width = 12/$scope.columns;
    $scope.searchResults = [];
	$scope.searchAlbums = function(){
		var album = this.album_name;
        Page.setTitle(album);
		setTimeout(function(){
			$("#search-icon").toggleClass("fa-pulse fa-spinner", true);
			$("#search-icon").toggleClass("fa-search", false);
			mop.service.library.search({"album":album}).done(function(data){
				$scope.searchResults = $.extend(true,[],data);
                console.log(data);
                // Get tracks
                for(var h = 0; h < data.length; h++){
                    if(data[h].albums != null){
                        for(var i = 0; i < data[h].albums.length; i++){
                            $scope.searchResults[h].albums[i].nTracks = 0;
                            if(data[h].tracks != null){
                                for(var j = 0; j < data[h].tracks.length; j++){
                                   if(data[h].tracks[j].album.uri == data[h].albums[i].uri)
                                        $scope.searchResults[h].albums[i].nTracks++;
                                }
                            }
                        }
                    }
                }

                for(var i = 0; i < $scope.searchResults.length; i++){
                    if($scope.searchResults[i].albums)
                        $scope.searchResults[i].albums = $scope.searchResults[i].albums.uniq("uri").sort_key("name").slices($scope.columns);
                }
				$scope.$apply();

				$("#search-icon").toggleClass("fa-pulse fa-spinner", false);
				$("#search-icon").toggleClass("fa-search", true);
			});
		},0);
	};
}]);

raspberryControllers.controller('AlbumsDetailController',['$scope','$routeParams','Page','mop', function($scope,$routeParams,Page,mop){
    Page.setTitle("Album");
    $scope.id = $routeParams.id;
    $scope.album = [];
    mop.callbackReady(function(){
        console.log($scope.id);
        mop.service.library.lookup($scope.id).done(function(data){
            console.log(data);
        });
    });
}]);

raspberryControllers.controller('SettingsController', ['$scope','Page', function($scope,Page) {
    Page.setTitle("Settings");
}]);
