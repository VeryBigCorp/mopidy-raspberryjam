var raspberryjamApp = angular.module("raspberryjamApp", [
    'ngRoute',
    'raspberryjamControllers'
]);

$(document).ready(function(){
    $("#player-controls").height($("#player").height());
});