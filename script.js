
// Initialization
//------------------------------------------------------------------------------

var app = angular.module('app', ['ui.bootstrap']);

// Timeline Controller
//------------------------------------------------------------------------------

app.controller('TimelineController', ['$scope', '$modal', '$filter', function ($scope, $modal, $filter) {

  $scope.data = {
    timeline: {
      type: 'default',
      date: []
    }
  };

  $scope.state = {
    isPreviewing: false,
    isValid: false,
    isEditing: false
  };

  // Methods
  $scope.addDateAction = function () {
    var date = {
      startDate: new Date(),
      endDate: new Date(),
      text: '',
      headline: '',
      asset: {}
    };

    $scope.data.timeline.date.push(date);
  };

  $scope.editDateAction = function (date) {
    if ($scope.state.isEditing) {
      return;
    }

    var modal = $modal.open({
      templateUrl: 'date-modal.tpl.html',
      controller: 'TimelineDateController',
      resolve: {
        'date': function () {
          return date;
        },
        'dates': function () {
          return $scope.data.timeline.date;
        }
      }
    });

    $scope.state.isEditing = true;

    modal.result.finally(function () {
      $scope.state.isEditing = false;
    });
  };

  $scope.importDataAction = function (data) {
    $scope.data = reverseTransform(angular.fromJson(data));
  };

  $scope.getExportData = function () {
    return transformData($scope.data);
  };

  // Private Methods
  function transformData (data) {
    var newData = angular.copy(data);

    angular.forEach(newData.timeline.date, function (value, key) {
      var date = newData.timeline.date[key];

      date.startDate = $filter('date')(date.startDate, 'yyyy,MM,dd');
      date.endDate = $filter('date')(date.endDate, 'yyyy,MM,dd');
    });

    return newData;
  }

  function reverseTransform (data) {
    var newData = angular.copy(data);

    angular.forEach(newData.timeline.date, function (value, key) {
      var date = newData.timeline.date[key];

      date.startDate = new Date(date.startDate);
      date.endDate = new Date(date.endDate);
    });

    return newData;
  }

  function isDataValid (data) {
    var isValid = false;

    if (data.timeline && data.timeline.date.length) {
      var date = data.timeline.date[0];

      if (date.startDate && date.endDate && date.headline) {
        isValid = true;
      }
    }

    return isValid;
  }

  // Watches
  $scope.$watch('data', function () {
    $scope.state.isValid = isDataValid($scope.data);
  }, true);

}]);

// Date Entry Controller
//------------------------------------------------------------------------------

app.controller('TimelineDateController', ['$scope', 'date', 'dates', function ($scope, date, dates) {
  $scope.date = date;
  $scope.temp = angular.copy($scope.date);
  $scope.confirmDelete = false;

  // Methods
  $scope.saveChangesAction = function () {
    angular.forEach($scope.date, function (value, key) {
      $scope.date[key] = $scope.temp[key];
    });
  };

  $scope.deleteAction = function () {
    angular.forEach(dates, function (value, key) {
      if (value == date) {
        dates.splice(key, 1);
      }
    });
  };
}]);

// Timeline Preview Directive
//------------------------------------------------------------------------------

app.directive('timelinePreview', [function () {
  return {
    restrict: 'E',
    link: function ($scope, $element, attrs) {
      var data = angular.fromJson(attrs.timelineData);

      createStoryJS({
        width: '100%',
        height: '100%',
        source: data,
        embed_id: 'timeline-container'
      });
    }
  };
}]);
