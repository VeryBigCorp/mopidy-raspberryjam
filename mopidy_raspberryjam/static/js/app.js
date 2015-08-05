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
      //do some fancy shit to get a list of the artist names
      $("#player-artist").html(track.artists.reduce(function(a, b){ return {name: a.name + ", " + b.name} }).name);
      $("#player-title").html(track.name);
      $("#player-length").html(timeToStr(track.length / 1000));
      var remainingTime = track.length - mopidy.playback.getTimePosition;
      $("#player-remaining").html(timeToStr( (remainingTime) / 1000 )).attr("aria-valuenow", 100.0 * remainingTime / track.length).css("width", 100.0 * remainingTime / track.length + "%");
    } else {
      $("#player-artist").html("");
      $("#player-title").html("Nothing playing...");
      $("#player-length").html("");
      $("#player-remaining").html("");
    }
  });
}

var mopidy;
$(document).ready(function() {
  $("#player-controls").height($("#player").height());
  
  //start mopidy
  mopidy = new Mopidy();
  
  mopidy.on(console.log.bind(console));
  
  mopidy.on("event:playbackStateChanged", function() {
    populatePlayer();
  });
  
  populatePlayer();
  
  $(window).unload( function() {
    mopidy.close();
    mopidy.off();
    mopidy = null;
  });
});