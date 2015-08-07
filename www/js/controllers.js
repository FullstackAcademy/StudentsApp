angular.module('starter.controllers', [])

.controller('LoginCtrl', function($scope, $rootScope, $http, BaseURL, $localstorage, $state) {

  // if($localstorage.get('token').length > 20) {
  //   $state.go('tab.cohorts');
  // }

  $scope.creds = {
    email: "",
    password: ""
  };

  $scope.login = function() {
    if($scope.creds.email.indexOf("@") == -1) {
      $scope.creds.email += "@fullstackacademy.com";
    }

    $http.post(BaseURL + '/auth/local', {
      email: $scope.creds.email,
      password: $scope.creds.password
    }).then(function(response) {
      window.localStorage['token'] = response.data.token;
      console.log("Token", response.data.token);
      $rootScope.token = response.data.token;
      $state.go('tab.cohorts')
    }, function(err) {
      console.dir(err);
    });
  }
})

.controller('CohortsCtrl', function($scope, $http, Cohort, BaseURL) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //


  $scope.refreshCohorts = function() {
    // $scope.dataLoaded = false;
    // debugger;
    // $http.get(BaseURL + "/api/cohorts")
    //   .then(function(data) {
    //     $scope.cohorts = data.data;
    //     $scope.dataLoaded = true;
    //   })
    Cohort.loadCohorts().then(function(cohorts) {
      $scope.cohorts = cohorts;
      // $scope.dataLoaded = true;
      $scope.$broadcast('scroll.refreshComplete')

    })
  }

  $scope.$on('$ionicView.enter', function(e) {
    $scope.refreshCohorts();
  });


})

.controller('CohortMemberListCtrl', function($scope, Cohort, $stateParams, $http, BaseURL) {
  $scope.currentPhoto = Cohort.getPhoto;

  $scope.refreshMembers = function() {

    Cohort.loadMembers($stateParams.cohortId)
      .then(function(members) {
        $scope.members = members;
        $scope.$broadcast('scroll.refreshComplete')
      })  
  };

  $scope.$on('$ionicView.enter', function(e) {
    $scope.refreshMembers();
  });



})
.controller('StudentCtrl' , function($scope, $http, $stateParams, Cohort, BaseURL) {
  $scope.student = Cohort.loadStudent($stateParams.studentId);
  $scope.$on('$ionicView.enter', function(e) {
    $scope.student = Cohort.loadStudent($stateParams.studentId);

  })

  $scope.currentPhoto = Cohort.getPhoto;


  $scope.newPhoto = function() { 
    navigator.camera.getPicture(onSuccess, onFail, { 
      allowEdit: true, 
      quality: 70,
      destinationType: Camera.DestinationType.DATA_URL 
    });

    function onSuccess(imageURI) {
      $scope.imageURI = imageURI;
      // console.log("image", imageURI);
      // alert(imageURI.length);
      $scope.$apply();
    }

    function onFail(message) {
      alert('Failed because: ' + message);
    }
  }

  $scope.editPhoto = function() {
    alert("Editing not currently supported");
  }

  $scope.uploadPhoto = function() {
    if(!$scope.imageURI) {
      alert("Haven't taken a new picture yet!");
    } else {
      $http.post(BaseURL + '/api/users/' + $scope.student._id + '/photo', {
        image: $scope.imageURI
      }).then(function(data) {
        var student = data.data;
        $scope.student = student;
        Cohort.updateStudent(student);
        alert('Photo Uploaded');
      }, function(err) {
        alert("Error uploading: " + err);
      })
    }
  }


})
.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});
