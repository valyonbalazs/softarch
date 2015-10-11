var projectApp = angular.module('ProjectApp', []);
var controllers = {};

var modalTaskData = {
  taskName: '',
  taskResp: ''
};
projectApp.factory('taskDataSharerService', function ($rootScope) {
  var service = {};
  service.task = modalTaskData;
  service.sendData = function(data) {
    this.data = data;
    $rootScope.$broadcast('taskDataSharerService');
  };
  service.getData = function() {
    return this.data;
  };
  return service;
});

var modalRiskData = {
  riskName: ''
};
projectApp.factory('riskDataSharerService', function ($rootScope) {
  var service = {};
  service.risk = modalRiskData;
  service.sendData = function(data) {
    this.data = data;
    $rootScope.$broadcast('riskDataSharerService');
  };
  service.getData = function() {
    return this.data;
  };
  return service;
});

projectApp.controller('ProjectController', ['$scope', function ($scope, taskDataSharerService) {
    $scope.project = [
        {
          projectId: 1,
          projectName: 'Test project',
          projectLeader: 'Bruce Wayne',
          projectWasCreated: '2015. October 05.',
          projectWasLastSaved: '2015. October 10.'
        }
    ];
  }
]);

projectApp.controller('TaskController', ['$scope', 'taskDataSharerService', function ($scope, taskDataSharerService) {
    $scope.init = function () {
      $scope.tasks = [
        {
          taskId: 1,
          taskName: 'First task',
          taskStatus: 'In progress',
          taskStart: '2015. October 03.',
          taskEnd: '2015. October 12',
          taskDependencies: 1,
          taskResponsibles: 'Alfred Pennyworth',
          taskComments: 'comment1'
        },
        {
          taskId: 2,
          taskName: 'Second task',
          taskStatus: 'In progress',
          taskStart: '2015. October 05.',
          taskEnd: '2015. October 17',
          taskDependencies: 1,
          taskResponsibles: 'Clark Kent',
          taskComments: 'comment2'
        },
        {
          taskId: 3,
          taskName: 'Third task',
          taskStatus: 'Not started',
          taskStart: '2015. October 22.',
          taskEnd: '2015. November 07.',
          taskDependencies: '1, 2',
          taskResponsibles: 'Barry Allen',
          taskComments: 'comment3'
        }
      ];
    };

    $scope.setTaskNameForModal = function (id) {
      console.log(id);
      var task = $scope.tasks[id-1];
      var taskPassableData = {
        taskName: task.taskName,
        taskResp: task.taskResponsibles
      };
      taskDataSharerService.sendData(taskPassableData);
    };
  }
]);

projectApp.controller('ModalTaskController', ['$scope', 'taskDataSharerService', function ($scope, taskDataSharerService) {
    $scope.taskName = '';
    $scope.$on('taskDataSharerService', function () {
      var taskData = taskDataSharerService.getData();
      $scope.taskName = taskData.taskName;
      $scope.taskResp = taskData.taskResp;
    });
  }
]);

projectApp.controller('ModalRiskController', ['$scope', 'riskDataSharerService', function ($scope, riskDataSharerService) {
    $scope.riskName = '';
    $scope.$on('riskDataSharerService', function () {
      var riskData = riskDataSharerService.getData();
      $scope.riskName = riskData.riskName;
    });
  }
]);

projectApp.controller('RiskController', ['$scope', 'riskDataSharerService', function ($scope, riskDataSharerService) {
    $scope.risks = [
      {
        riskId: 1,
        riskName: 'Name and description of the first risk',
        riskImportance: 'Low risk'
      },
      {
        riskId: 2,
        riskName: 'Name and description of the second risk',
        riskImportance: 'High risk'
      }
    ];

    $scope.setRiskNameForModal = function (id) {
      console.log(id);
      var risk = $scope.risks[id-1];
      var riskPassableData = {
        riskName: risk.riskName
      };
      riskDataSharerService.sendData(riskPassableData);
    };
  }
]);
