function timeToStr(seconds) {
  var str = "";
  var hrs = Math.floor(seconds / 3600);
  var mins = Math.floor((seconds - hrs * 3600) / 60);
  var secs = Math.floor((seconds - hrs * 3600 - mins * 60));

  return str + (hrs > 0 ? bufferZeros(hrs) + ":" : "") + (mins > 0 ? bufferZeros(mins) + ":" : "") + bufferZeros(secs) + (seconds < 60 ? "s" : "");
}

Array.prototype.slices = function(n) {
  if(n <= 0)
    n = 1;

  var newArr = [];
  for(var i = 0; i < this.length; i += n)
    newArr[i/n] = this.slice(i, i+n);
  return newArr;
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

raspberryjamApp.config(['$routeProvider',
	function($routeProvider) {
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
			});
	}
]);

raspberryjamApp.factory('Page', function(){
  var title = 'Raspberry Jam';
  return {
    title: function() { return title; },
    setTitle: function(newTitle) { title = newTitle + (newTitle == "" ? "Raspberry Jam" : " | Raspberry Jam"); }
  };
});

var trackID;

function togglePositionTrack(state, length) {
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

function populatePlayer() {
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

      $("[name='player-albumart']").attr('src',getAlbumArt(track.album.uri));
			$pageTitle = track.name;
      togglePositionTrack(true, track.length);
    } else {
      //$("#player-artist").html("");
      //$("#player-title").html("Nothing playing...");
      //$("#player-length").html("");
      $("#player").hide();
      togglePositionTrack(false, 0);
    }
  });
}

var mopidy;
$(document).ready(function () {
  $("#player-controls").height($("#player").height());

  //start mopidy
  mopidy = new Mopidy();

  mopidy.on("event:playbackStateChanged", function () {
    populatePlayer();
  });

  mopidy.on("state:online", function () {
    populatePlayer();
  });

  //mopidy.on(console.log.bind(console));

  $(window).unload(function () {
    mopidy.close();
    mopidy.off();
    mopidy = null;
  });
});
