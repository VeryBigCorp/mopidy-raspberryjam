function timeToStr(seconds) {
  var str = "";
  var hrs = Math.floor(seconds / 3600);
  var mins = Math.floor((seconds - hrs * 3600) / 60);
  var secs = Math.floor((seconds - hrs * 3600 - mins * 60));

  return str + (hrs > 0 ? bufferZeros(hrs) + ":" : "") + (mins > 0 ? bufferZeros(mins) + ":" : "") + bufferZeros(secs) + (seconds < 60 ? "s" : "");
}

Array.prototype.slices = function(n) {
  if(n <= 1)
    return this;

  var newArr = [];
  for(var i = 0; i < this.length; i += n)
    newArr[i/n] = this.slice(i, i+n);
  return newArr;
}

// Goes through array and retrieves unique entries according to attr 
Array.prototype.uniq = function(attr) {
    var add = true;
    return this.reduce(function(p, c) {
        for(var i = 0; i < p.length; i++)
            if(p[i][attr] == c[attr]){
                add = false;
                break;
        }
         if (add) p.push(c);               
         add = true;
         return p;
    }, []);
}

// Return random element from array
Array.prototype.rand = function(){
    return this[Math.floor(Math.random()*this.length)];
};

// Sort an object array containing key by the value of key
Array.prototype.sort_key = function(key){
    return this.sort(function(a,b){
        return ((a[key] < b[key]) ? -1 : ((a[key] > b[key]) ? 1 : 0));
    });
}

Array.prototype.search = function(key,query){
    for(var i = 0; i < this.length; i++){
        if(this[i][key] == query)
            return this[i][key];
    }
    return -1;
}

String.prototype.pluralize = function(num,plural){
    plural = plural || this + "s";
    if(num != 1)
        return num + " " + plural;
    return num + " " + this;
}

// (in-place) Merge fields in this object with those in obj (uniquely)
function merge(objA,objB,key){
    for(var prop in objB){
        if(objA[prop] != null){
            if(Array.isArray(objA[prop]))
                objA[prop] = (objA[prop].concat(objB[prop])).uniq("uri");
            else
                objA[prop] = objB[prop];
        } else {
            objA[prop] = objB[prop];
        }
    }
    return objA;
}

function searchCache(cache, params){
    var res = -1;
    var tmp = -1;
    if(params.uri != null && params.uri != ""){
       if(params.uri.indexOf("artist") !== -1){
           if(cache.artists != null){
                tmp = cache.artists.search("uri", params.uri);
                if(tmp != -1){      // got a hit
                    tmp = [];
                    // Get tracks
                    for(var i = 0; i < cache.tracks.length; i++){
                        if(cache.tracks[i].artists != null){
                            var hit = cache.tracks[i].artists.search("uri", params.uri) !== -1 || cache.tracks[i].album.artists.search("uri", params.uri) !== -1;
                            if(hit)
                                tmp.push(cache.tracks[i]);
                        }
                    }
                    console.log(tmp);
                }
           }
       } else if(params.uri.indexOf("track") !== -1){
           if(cache.tracks != null)
                tmp = cache.tracks.search("uri", params.uri);
       } else if(params.uri.indexOf("album") !== -1){
           if(cache.albums != null)
                tmp = cache.albums.search("uri", params.uri);
       }
    } else {
    
    }
    if(tmp != -1)
        res = tmp.uniq("uri").sort_key("track_no");
    return res;
}

// Artists -> Albums -> Tracks
function structureAsCache(cache){
    if(cache.albums != null){
        // Put albums under artists
        for(var i = 0; i < cache.albums.length; i++){
            if(cache.albums[i].artists != null){
                for(var j = 0; j < cache.albums[i].artists.length; j++){
                    for(var k = 0; k < cache.artists.length; k++){
                        if(artist.uri == cache.albums[i].artists[j]){
                            if(artist.albums == null)
                                artist.albums = [];

                        }   
                    }
                }
            }
        }
    }
}

function bufferZeros(amount) {
  return (amount < 10 ? "0" + amount : amount);
}


// Gets the album art for a specified URI (spotify from the Spotify API). Move this to async loading
function getAlbumArt(uri){
  if(uri.indexOf("spotify") !== -1){
    var json = JSON.parse($.ajax({url: "https://api.spotify.com/v1/albums/"+stripIDFromURI(uri), async: false, type: "GET"}).responseText);
    console.log(json);
    return json.images[0].url;
  } else if(uri.indexOf("gmusic") !== -1){
    
  }
}

function stripIDFromURI(uri){
  var ind;
  if((ind = uri.indexOf(":")) !== -1){
    return stripIDFromURI(uri.slice(ind+1));  
  }
  return uri;
}

var raspberryjamApp = angular.module("raspberryjamApp", [
  'ngRoute',
  'raspberryjamControllers'
]);

raspberryjamApp.config(['$routeProvider','$locationProvider',
	function($routeProvider,$locationProvider) {
		$routeProvider.
			when('/', {
				templateUrl: 'partials/queue.html',
				controller: 'QueueCtrl'			
			}).
			when('/artists', {
				templateUrl: 'partials/artists/list.html',
				controller: 'ArtistsController'			
			}).
			when('/artists/:id', {
				templateUrl: 'partials/artists/detail.html',
				controller: 'ArtistsDetailController'			
			}).
			when('/albums', {
				templateUrl: 'partials/albums/list.html',
				controller: 'AlbumsController'
            }).
            when('/albums/:id', {
                templateUrl: 'partials/albums/detail.html',
                controller: 'AlbumsDetailController'
            }).
            when('/settings', {
                templateUrl: 'partials/settings.html',
                controller: 'SettingsController'
            });

        //$locationProvider.html5Mode(true);
	}
]);

raspberryjamApp.factory('Page', function(){
  var title = 'Raspberry Jam';
  return {
    title: function() { return title; },
    setTitle: function(newTitle) { title = newTitle + (newTitle == "" ? "Raspberry Jam" : " | Raspberry Jam"); }
  };
});

raspberryjamApp.factory('mop', function(){
    var mopidy = new Mopidy();
    mopidy.on("event:playbackStateChanged", function () {
        populatePlayer(mopidy);
    });

    mopidy.on("state:online", function () {
        populatePlayer(mopidy);
    });

    //mopidy.on(console.log.bind(console));

    var cache = {};
    var lookupCache = {};

    return {
        service: mopidy,
        callbackReady: function(callback){
            var check = setInterval(function(){
                if(mopidy.library != null){
                    clearInterval(check);
                    callback();
                }
            },0,25);
        },
        searchLibrary: function(params, done){
            mopidy.library.search(params).done(function(data){
                // Merge new data into cache

                for(var i = 0; i < data.length; i++){
                    merge(cache,data[i]);
                    //structureCache(cache);
                }
                //console.log(cache);
                done(data);
            });
        },
        lookup: function(uri, done){           // Lookup uses cache (for detail pages)
            console.log(cache);
            var res = searchCache(cache, {"uri": uri});
            if(res !== -1){
                // Get just tracks
                /*res = res.tracks.map(function(track){
                    for(var i = 0; i < track.artists.length; i++){
                        if(track.artists[i].uri == uri)
                            return track;
                    }
                });*/
                console.log(res);
                done(res);
            } else {
                mopidy.library.lookup(uri).done(function(data){done(data);});
            }
        },
        addToQueue: function(uri){
                console.log("Adding "+ uri + " to queue... (not implemented yet)");
        }
    };
});

var trackID;

function togglePositionTrack(state, length, mopidy) {
  var progress = $("[name='player-remaining']");
  clearInterval(trackID);
  if (state) {
    progress.parent().show();

    trackID = setInterval(function () {
      mopidy.playback.getTimePosition().done(function (pos) {
        pos = Math.min(length, pos);
        var remaining = length - pos;
        progress.html(timeToStr((remaining) / 1000) + " remaining...");
        progress.attr("aria-valuenow", 100.0 * pos / length);
        progress.css("width", 100.0 * (pos / length) + "%");
      });
    }, 1000);
  } else {
    progress.parent().hide();
    pos = 0;
  }
}

function populatePlayer(mopidy) {
  mopidy.playback.getCurrentTrack().done(function (track) {
    if (track) {
      //do some fancy shit to get a list of the artist names
      $("#player").show();
      $("[name='player-artist']").html(track.artists.reduce(function (a, b) {
        return {
          name: a.name + ", " + b.name
        };
      }).name);
      $("[name='player-title']").html(track.name);
      $("[name='player-length']").html(timeToStr(track.length / 1000));
      $("[name='player-album']").html(track.album.name);
      $("[name='player-genre']").html("");

      $("[name='player-albumart']").attr('src',track.album.images != null ? (track.album.images.length > 0 ? track.album.images[0] : "assets/cd.png") : "assets/cd.png");

      togglePositionTrack(true, track.length, mopidy);
    } else {
      //$("#player-artist").html("");
      //$("#player-title").html("Nothing playing...");
      //$("#player-length").html("");
      $("#player").hide();
      togglePositionTrack(false, 0);
    }
  });
}

function test(a,b,k){
    if(a == null || b == null) return;
    clearInterval(k);
    console.log("a: ");
    console.log(a);
    console.log("b: ");
    console.log(b);

    console.log(a[1].merge(b[1],"uri"));    
}

//var mopidy;
$(document).ready(function () {
  $("#player-controls").height($("#player").height());

  //start mopidy
  //mopidy = new Mopidy();

   /* m = new Mopidy();
    var a, b;

    var k = setInterval(function(){
        if(m.library == null) return;
        m.library.search({artist:"b"}).done(function(data){
            a = data;
            test(a,b,k);
        });
        m.library.search({artist:"c"}).done(function(data){
            b = data;
            test(a,b,k);
        });
    },0,25);*/
});
