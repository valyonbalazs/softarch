var projectApp = angular.module('ProjectApp', []);
var controllers = {};

controllers.ProjectController = function ($scope) {
  $scope.project = [
      {
        projectId: 1,
        projectName: 'Test project',
        projectLeader: 'Bruce Wayne',
        projectWasCreated: '2015. October 05.',
        projectWasLastSaved: '2015. October 10.'
      }
  ];
};

controllers.TaskController = function ($scope) {

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

controllers.RiskController = function ($scope) {
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
}

projectApp.controller(controllers);
