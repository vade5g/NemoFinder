var app = angular.module('NemoFinder', ['ngResource','ngRoute']);
var loadsoffish;

app.config(['$routeProvider', function($routeProvider){
    $routeProvider
        .when('/', {
            templateUrl: 'partials/home.html',
            controller: 'HomeCtrl'
        
        }).when('/login', {
            templateUrl: 'partials/login.html',
            controller: 'LoginCtrl'

        }).when('/sonar', {
            templateUrl: 'partials/sonar.html',
            controller: 'SonarCtrl'
        
        }).when('/online', {
            templateUrl: 'partials/online.html',
            controller: 'OnlineCtrl'
        
        }).when('/sonar/fishX/:fishX/fishY/:fishY/fishWeight/:fishWeight', {
            templateUrl: 'partials/sonar.html',
            controller: 'SonarInsert'

        }).when('/drone', {
            templateUrl: 'partials/drone.html',
            controller: 'DroneControl'

        }).when('/localmaps', {
            templateUrl: 'partials/localmaps.html',
            controller: 'LocalMapsControl'

        }).otherwise({
            redirectTo: '/'
        });
}]);

app.service("authentication", ["$window","$http", function($window,$http){
    var saveToken = function (token){
        $window.localStorage["nemo-token"] = token;
    };
    var getToken = function (){
        return $window.localStorage["nemo-token"];
    };
//    var register = function(user){
//        return $http.post("/users/register", user).success(function(data){
//            saveToken(data.token);
//        });
//    };
    var login = function(user){
        return $http.post("/users/login", user).success(function(data){
            saveToken(data.token);
        });
    };
    var logout = function(){
        $window.localStorage.removeItem("nemo-token");
        console.log("token removed");

    };

/*    var searchFish = function(search) {
        $http({
            method: 'GET',
            URL: search
            }).then(function successCallback(response) {
                console.log(response);
                let dataArray = response.data;
                return dataArray;
            // this callback will be called asynchronously
            // when the response is available
            }, function errorCallback(response) {
                console.log(response);
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });
        

        //return $http.get("/fish/list/?" + "long="search.long + "&lat="search.lat +
        //    "&maxDistance="search.maxDistance + "&amount="search.amount);
    };*/

    var isLoggedIn = function(){
        var token = getToken();

        if (token){
            var payload = JSON.parse($window.atob(token.split(".")[1]));

            return payload.exp > Date.now() / 1000;
        } else {
            return false;
        }
    };
    var currentUser = function(){
        if(isLoggedIn()){
            var token = getToken();
            var payload = JSON.parse($window.atob(token.split(".")[1]));
            return{
                email: payload.email,
                name: payload.name
            };
        }
    };


    return {
        saveToken: saveToken,
        getToken: getToken,
        //register: register,
        login: login,
        logout: logout,
        isLoggedIn: isLoggedIn,
        currentUser: currentUser,
        //searchFish: searchFish
    };
}]);


app.controller("LoginCtrl", ["$scope","$location", "authentication",function($scope,$location,authentication){
    $scope.userLogin = function(){
        console.log("login function");
        authentication.login($scope.user).then(function(){
        console.log('tuli reittiin');
        $location.path("/online");
        });
        
    };
}]);

app.controller("OnlineCtrl", ["$scope", "$resource", "$location", "authentication",function($scope,$resource,$location,authentication){
    $scope.userLogOut = function(){
        console.log("yritit logata ulos");
        authentication.logout();
        console.log("toimi logout");
        $location.path("/home");   
    };
    $scope.searchFunc = function() {
        console.log("kutsuttu searcFunc");
        let searchString = "/fish/list/?long=" + $scope.search.long + "&lat=" + $scope.search.lat + "&maxDistance=" + $scope.search.maxDistance + "&amount=" + $scope.search.amount;
        let fishData = $resource(searchString);

        $scope.data = fishData;
        console.log(fishData.coords);
        console.log("loppu searchFunc");
        
    };

}]);

app.controller('HomeCtrl', ['$scope', '$resource',  function($scope, $resource){
    $scope.$on('$viewContentLoaded', function(){
        $('body').css( {
            "background" : "url(../../images/fishing_background_1.png)"
        });
    });
}]);


app.controller('SonarCtrl', ['$scope', '$resource', function($scope, $resource){
    $scope.$on('$viewContentLoaded', function(){
    	//asetetaan backgroundi oikeaksi

        $('body').css( {
            "background-image" : "none",
            "background-color" : "black"
        });

        $(window).resize(function() {
		  	$(".measuring-line").css( {
		  		"height" : ($(window).height()-80)+"px"
		  	})
		  	adjustMeasurementLines();
		  	adjustSonarWidth();
		  	adjustSonarIndicator();
		  	$(".measuring-line-second").css( {
		  		"margin-left" : $("#surface-line").width()
		  	})
		});

		$(window).trigger('resize');

		function adjustMeasurementLines() {
			var fromtop = $('.measuring-line-first').height()/5 - 2;
			$('.measuring-line-first').children('div').each(function () {
				if (!($(this).is(':first-child'))) {
					$(this).css( {
		    			"margin-top" : fromtop+"px"
		    		})
				}
			});
		}

		function adjustSonarWidth() {
			$("#surface-line").css( {
				"width" : $(".measuring-line").height() * 2
			})
		}

		function adjustSonarIndicator() {
			$("#radar-indicator").css( {
				"margin-left" : $("#surface-line").width() / 2
			})
		}

    });
}]);

app.controller('SonarInsert', ['$scope', '$resource', function($scope, $resource){
    alert("perkele");
}]);

app.controller('DroneControl', ['$scope', '$resource', function($scope, $resource){
    $scope.$on('$viewContentLoaded', function(){
        showDrone();
    });

    $scope.$on('$destroy', function() {
        showDrone();
    });
}]);

app.controller('LocalMapsControl', ['$scope', '$resource', function($scope, $resource){
}]);

function addFish(flat,flong,depth,size){
    console.log("addFish general call");
    if (window.location.href.indexOf("localmaps") != -1){
    console.log("addFish maps update");

    $injector = angular.element(document).injector();
    $injector.get('$http').post('fish/add/'+flong+'/'+flat+'/'+depth);

    var marker = new google.maps.Marker({
        position: {lat: flat, lng: flong},
        map: window.map,
        title: "Fish : "+depth+"m deep, "+size+"kg"

      });
    }
}

function fishPing(size,depth,locallat){
    console.log("fishPing general call");
    if (window.location.href.indexOf("sonar") != -1){
    console.log("fishPing sonar call");
    }
}

function showDrone(){
    if (window.location.href.indexOf("drone") == -1){
        console.log("hide");
        document.getElementById("unityPlayer").style.visibility='hidden';
    } else {
        console.log("show");
        document.getElementById("unityPlayer").style.visibility='visible';
    }
}

function hideDrone(){
    showDrone();
}

function reroute(whereto){
    console.log("This would handle unity UI redirects, but they currently have issues.");
    $injector = angular.element(document).injector();
    $injector.get('$window').location =(whereto);
    //let scope =  $injector.get('$scope');
    //$injector.get('$location').path(whereto);
    //angular.injector(['ng', 'NemoFinder']).get('$location').path(whereto.toString());
    //angular.injector(['ng', 'NemoFinder']).get("Unity").reroute(whereto);
};

app.factory('Unity', [function(){
    return {
    reroute:function (whereto){
        console.log("This is inside the Unity angular factory, headed for "+whereto);
        //$location.path(whereto);
    }
    };
}]);