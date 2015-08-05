var raspberryjamApp = angular.module("raspberryjamApp", [
  'ngRoute',
  'raspberryjamControllers'
]);

var mopidy;
$(document).ready(function(){
  $("#player-controls").height($("#player").height());
  
  //start mopidy
  mopidy = new Mopidy();
  
  mopidy.on(console.log.bind(console));
});