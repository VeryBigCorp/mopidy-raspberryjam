function timeToStr(seconds) {
  var str = "";
  var hrs = Math.floor(seconds / 3600);
  var mins = Math.floor((seconds - hrs*3600)/ 60);
  var secs = Math.floor((seconds-hrs*3600-mins*60));

  return str + (hrs > 0 ? bufferZeros(hrs) + ":"  : "") + (mins > 0 ? bufferZeros(mins) + ":" : "") + bufferZeros(secs);
}

function bufferZeros(amount) {
  return ( amount < 10 ? "0" + amount : amount );
}

var raspberryjamApp = angular.module("raspberryjamApp", [
  'ngRoute',
  'raspberryjamControllers'
]);

function populatePlayer() {
  mopidy.playback.getCurrentTrack().done(function(track){
    if(track){
      $("#player-artist").html(track.artists.name.join(", "));
      $("#player-title").html(track.name);
      $("#player-length").html(timeToStr(track.length));
    }
  });
}

var mopidy;
$(document).ready(function(){
  $("#player-controls").height($("#player").height());
  
  //start mopidy
  mopidy = new Mopidy();
  
  mopidy.on(console.log.bind(console));
  
  mopidy.on("event:playbackStateChanged", function() {
    populatePlayer();
  });
});