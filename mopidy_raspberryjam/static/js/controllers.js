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
        Page.setTitle(artist + " | Artists");
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
			mop.searchLibrary({"album":album}, function(data){
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
                $scope.searchResults.total = 0;
                for(var i = 0; i < $scope.searchResults.length; i++){
                    if($scope.searchResults[i].albums){
                        $scope.searchResults[i].albums = $scope.searchResults[i].albums.uniq("uri").sort_key("name");
                        $scope.searchResults.total += $scope.searchResults[i].albums.length;
                        $scope.searchResults[i].albums = $scope.searchResults[i].albums.slices($scope.columns);
                    }
                }
				$scope.$apply();

				$("#search-icon").toggleClass("fa-pulse fa-spinner", false);
				$("#search-icon").toggleClass("fa-search", true);
			});
		},0);
	};
}]);

raspberryControllers.controller('AlbumsDetailController',['$scope','$routeParams','Page','mop','$sce', function($scope,$routeParams,Page,mop,$sce){
    Page.setTitle("Album");
    $scope.id = $routeParams.id;
    $scope.album = {};
    mop.callbackReady(function(){
        console.log($scope.id);
        mop.lookup($scope.id, function(tracks){
            if(tracks.length > 0)
                $scope.album = tracks[0].album;
            $scope.album.tracks = tracks;
            $scope.$apply();
            console.log($scope.album);
        });
    });

    $scope.getArtistNames = function(album){
        if(album.artists == null) return;
        return $sce.trustAsHtml(album.artists.map(function(artist){
                return "<a class='uriLink' href='#/artists/"+artist.uri+"'>"+artist.name+"</a>";
        }).join(','));
    };

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
}]);

raspberryControllers.controller('SongsController',['$scope','Page','mop','$sce', function($scope, Page, mop,$sce){
    Page.setTitle("Songs");
    $scope.searchSongs = function(){
        var track = this.track_name;
        Page.setTitle(track);
        mop.callbackReady(function(){
            setTimeout(function(){
                $("#search-icon").toggleClass("fa-pulse fa-spinner", true);
                $("#search-icon").toggleClass("fa-search", false);
                mop.searchLibrary({track_name:track},function(data){
                    console.log(data);

                    $scope.searchResults = [];

                    for(var i = 0; i < data.length; i++){
                        if(data[i].tracks != null){
                            $scope.searchResults = $scope.searchResults.concat(data[i].tracks);
                        }
                    }

                    console.log($scope.searchResults);
                    $scope.$apply();
                    $("#search-icon").toggleClass("fa-pulse fa-spinner", false);
                    $("#search-icon").toggleClass("fa-search", true);
                });
            }, 0);
        });
    }

    $scope.getArtistNames = function(track){
        return $sce.trustAsHtml(track.artists.map(function(artist){
                return "<a class='uriLink' href='#/artists/"+artist.uri+"'>"+artist.name+"</a>";
        }).join(','));
    };

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

    $scope.addToQueue = mop.addToQueue;
}]);

raspberryControllers.controller('PlaylistsController',['$scope','Page','mop','$sce', function($scope, Page, mop, $sce){
    Page.setTitle("Playlists");

    $scope.search = function(){
        var query = this.query;
        Page.setTitle(query + " - Playlists");

        setTimeout(function(){
            $("#search-icon").toggleClass("fa-pulse fa-spinner", true);
            $("#search-icon").toggleClass("fa-search", false);
            mop.callbackReady(function(){
                mop.service.playlists.getPlaylists().done(function(data){
                    data = data.search_all("name", query, true);
                    for(var i = 0; i < data.length; i++){
                        if(data[i].tracks != null)
                            data[i].runTime = data[i].tracks.reduce(function(a, b){ return {length: a.length + b.length} }).length;
                    }

                    $scope.searchResults = data;
                    console.log($scope.searchResults);
                    var func = function(idx){
                        var canvas = document.getElementById("playlist_"+data[idx].uri);
                        var context = canvas.getContext("2d");
                        var album_slices = data[idx].tracks.map(function(track){ return track.album; }).uniq("uri").slice(0,4).slices(2);
                        
                        // Draw album art column-wise
                        for(var j = 0; j < album_slices.length; j++){
                            var slice = album_slices[j]; // TODO: Get unique images
                            console.log(slice);
                            for(var k = 0; k < slice.length; k++){
                                var img = new Image();
                                img.onload = function(){
                                    console.log("liaded " + img.src);
                                    console.log("dimensions: ({0}, {1}, {2}, {3})".format(j*canvas.width/album_slices.length, k*canvas.height/slice.length, canvas.width/album_slices.length, canvas.height/slice.length));
                                    context.drawImage(img, 0,0);//j*canvas.width/album_slices.length, k*canvas.height/slice.length, canvas.width/album_slices.length, canvas.height/slice.length);
                                };

                                img.src = slice[k].images != null && slice[k].images.length > 0 ? slice[k].images[0] : "assets/cd.png";
                            }
                        }
                    };

                    $scope.$apply();

                    var idx = 0; 
                    for(;idx < data.length; idx++){
                        setTimeout(func(idx), 10);
                    }
                    $("#search-icon").toggleClass("fa-pulse fa-spinner", false);
                    $("#search-icon").toggleClass("fa-search", true);
                });
            });
        }, 0);
    };
    
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
	}


    $scope.getArtistNames = function(track){
        return $sce.trustAsHtml(track.artists.map(function(artist){
                return "<a class='uriLink' href='#/artists/"+artist.uri+"'>"+artist.name+"</a>";
        }).join(','));
    };

    $scope.addToQueue = mop.addToQueue;
}]);

raspberryControllers.controller('GMusicController',['$scope','Page','mop','$sce', function($scope, Page, mop,$sce){
    Page.setTitle("Google Music");
    $scope.columns = 6;
    $scope.width = 12/$scope.columns;
    $scope.search = function(){
        var query = this.query;
        Page.setTitle(query + " - Google Music");
        setTimeout(function(){
            $("#search-icon").toggleClass("fa-pulse fa-spinner", true);
            $("#search-icon").toggleClass("fa-search", false);
            mop.callbackReady(function(){
                mop.searchLibrary({any: query}, function(data){
                    data = data[0];

                    if(data.albums != null){
                        for(var i = 0; i < data.albums.length; i++){
                            data.albums[i].nTracks = 0;
                            for(var j = 0; j < data.tracks.length; j++){
                                if(data.tracks[j].album.uri == data.albums[i].uri)
                                    data.albums[i].nTracks++;
                            }

                        }
                        
                    }
                    
                    if(data.artists != null){
                        for(var i = 0; i < data.artists.length; i++){
                            for(var j = 0; j < data.albums.length; j++){
                                if(data.albums[j].artists.search("uri", data.artists[i].uri) !== -1){
                                    data.artists[i].image = data.albums[j].images != null ? data.albums[j].images.rand() : "assets/cd.png";
                                    break;
                                }
                            }
                        }

                    }
                    data.results = false;
                    if(data.albums != null){
                        data.results = true;
                        data.albums = data.albums.slices($scope.columns);
                    }
                    if(data.artists != null){
                        data.results = true;
                        data.artists = data.artists.slices($scope.columns);
                    }
                    if(data.tracks != null)
                        data.results = true;
                    $scope.searchResults = data;
                    console.log($scope.searchResults);
                    $scope.$apply();
                    $("#search-icon").toggleClass("fa-pulse fa-spinner", false);
                    $("#search-icon").toggleClass("fa-search", true);
                }, uris=['gmusic:']);
            });
        }, 0);
    };

    $scope.getArtistNames = function(track){
        return $sce.trustAsHtml(track.artists.map(function(artist){
                return "<a class='uriLink' href='#/artists/"+artist.uri+"'>"+artist.name+"</a>";
        }).join(','));
    };

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
	}

    $scope.addToQueue = mop.addToQueue;
}]);

raspberryControllers.controller('HistoryController', ['$scope','Page','mop','$sce', function($scope, Page, mop, $sce){
    mop.callbackReady(function(){
        mop.service.history.getHistory().done(function(history){
            mop.service.library.lookup(null, history.map(function(ref){return ref[1].uri})).done(function(tracks){
                for(var i = 0; i < history.length; i++){
                    var date = new Date(history[i][0]);
                    history[i] = {
                        timeStamp: date.getTime(),
                        day: date.getDate(),
                        month: date.getMonth(),
                        year: date.getYear() + 1900,                // because yeah
                        track: tracks[history[i][1].uri] != null ? tracks[history[i][1].uri][0] : history[i][1]
                    };
                }

                $scope.results = history.length;
                var today = new Date();
                $scope.history = history.group_by("year").map(function(yr){
                    return {
                        year: yr[0].year == today.getYear() + 1900 ? "This Year" : yr[0].year,
                        nItems: yr.length,
                        months: yr.group_by("month").map(function(month){
                            return {
                                month: month[0].month,
                                items: month.sort_key("time")
                            }
                        })
                    }
                });
                
                $scope.$apply();
            });
            
        });
    });

    $scope.dateFormat = function(timestamp){
        var date = new Date(timestamp);
        var time = [date.getHours(), date.getMinutes()];

        for(var i = 0; i < time.length; i++){
            if(i == 0 && time[i] == 0){
                time.splice(i,1);
                continue;
            }
            if(time[i] < 10){
                time[i] = "0"+time[i];
            }
        }

        return time.join(":");
    };

    $scope.monthName = function(num){
        return ["January", "February", "March", "April", "May", "June", "July", "August", "October", "September", "November", "December"][num];
    };


    $scope.getArtistNames = function(track){
        return $sce.trustAsHtml(track.artists.map(function(artist){
                return "<a class='uriLink' href='#/artists/"+artist.uri+"'>"+artist.name+"</a>";
        }).join(','));
    };

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
	}

    $scope.addToQueue = mop.addToQueue;
}]);

raspberryControllers.controller('SettingsController', ['$scope','Page','mop', function($scope,Page,mop) {
    Page.setTitle("Settings");

    mop.callbackReady(function(){
        $scope.backends = mop.backends;
        $scope.$apply();
    });
}]);
