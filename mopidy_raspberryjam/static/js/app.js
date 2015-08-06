function timeToStr(seconds) {
  var str = "";
  var hrs = Math.floor(seconds / 3600);
  var mins = Math.floor((seconds - hrs * 3600) / 60);
  var secs = Math.floor((seconds - hrs * 3600 - mins * 60));

  return str + (hrs > 0 ? bufferZeros(hrs) + ":" : "") + (mins > 0 ? bufferZeros(mins) + ":" : "") + bufferZeros(secs) + (seconds < 60 ? "s" : "");
}

function bufferZeros(amount) {
  return (amount < 10 ? "0" + amount : amount);
}

var raspberryjamApp = angular.module("raspberryjamApp", [
  'ngRoute',
  'raspberryjamControllers'
]);

var trackID;

function togglePositionTrack(state, length) {
  var progress = $("[name='player-remaining']");
  clearInterval(trackID);
  console.log("toggling track to " + state);
  if (state) {
    progress.parent().show();

    trackID = setInterval(function () {
      mopidy.playback.getTimePosition().done(function (pos) {
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
        }
      }).name);
      $("[name='player-title']").html(track.name);
      $("[name='player-length']").html(timeToStr(track.length / 1000));
      $("[name='player-genre']").html("");

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

  $(window).unload(function () {
    mopidy.close();
    mopidy.off();
    mopidy = null;
  });
});
