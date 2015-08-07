angular.module('starter.services', [])
  .factory('BaseURL', function() {
    if (window.location.protocol == "file:") {
      // how Ionic usually runs
      // return "http://192.168.1.12:9000";
      return "https://learn.fullstackacademy.com";
    } else {
      return ""; // running in Live Reload mode
    }
  })
  .factory('$localstorage', ['$window', function($window) {
    return {
      set: function(key, value) {
        $window.localStorage[key] = value;
      },
      get: function(key, defaultValue) {
        return $window.localStorage[key] || defaultValue;
      },
      setObject: function(key, value) {
        $window.localStorage[key] = JSON.stringify(value);
      },
      getObject: function(key) {
        return JSON.parse($window.localStorage[key] || '{}');
      }
    }
  }])
  .factory('Cohort', function($q, $http, BaseURL) {
    var cohorts;
    var members = {};

    return {
      loadCohorts: function() {
        return $http.get(BaseURL + "/api/cohorts")
          .then(function(data) {
            cohorts = data.data;
            return data.data; // cohorts
          });
      },
      getCohort: function(id) {
        var cohort = cohorts.filter(function(cohort) {
          return cohort._id == id;
        })[0];
      },
      loadMembers: function(id) {
        //https://learn.fullstackacademy.com/api/users?cohort=552ed071a5f861030015338b
        return $http.get(BaseURL + '/api/users?cohort=' + id)
          .then(function(data) {
            data.data.forEach(function(student) {
              members[student._id] = student;
            })
            return data.data
          });

      },
      loadStudent: function(sId) {
        return members[sId];
      },
      updateStudent: function(student) {
        members[student._id] = student;
        return student;
      },
      getPhoto: function(student, imageURI) {
        // this converts the base64 data into something that 
        // can be shown in a data-url
        function getPhotoUrl() {
          if (imageURI) {
            return 'data:image/jpg;base64,' + imageURI;
          } else {
            return undefined;
          }
        }
        var s3 = "https://s3.amazonaws.com/learndotresources/";
        return getPhotoUrl() || (student && student.photo_url && s3 + student.photo_url) || (student && student.github && student.github.avatar_url) || 'https://placekitten.com/g/121/121';
      }

    }
  })
