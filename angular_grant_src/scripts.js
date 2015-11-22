'use strict';

/**
 * @ngdoc overview
 * @name angularGanttDemoApp
 * @description
 * # angularGanttDemoApp
 *
 * Main module of the application.
 */
angular.module('angularGanttDemoApp', [
    'gantt', // angular-gantt.
    'gantt.sortable',
    'gantt.movable',
    'gantt.drawtask',
    'gantt.tooltips',
    'gantt.bounds',
    'gantt.progress',
    'gantt.table',
    'gantt.tree',
    'gantt.groups',
    'gantt.overlap',
    'gantt.resizeSensor',
    'ngAnimate',
    'mgcrea.ngStrap'
]).config(['$compileProvider', function($compileProvider) {
    $compileProvider.debugInfoEnabled(false); // Remove debug info (angularJS >= 1.3)
}]);

'use strict';

/**
 * @ngdoc function
 * @name angularGanttDemoApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the angularGanttDemoApp
 */
angular.module('angularGanttDemoApp')
    .controller('MainCtrl', ['$scope', '$timeout', '$log', '$compile', 'ganttUtils', 'GanttObjectModel', 'Sample', 'ganttMouseOffset', 'ganttDebounce', 'moment', function($scope, $timeout, $log, $compile, utils, ObjectModel, Sample, mouseOffset, debounce, moment) {
        var objectModel;
        var dataToRemove;

        $scope.options = {
            mode: 'custom',
            scale: 'day',
            sortMode: undefined,
            sideMode: 'TreeTable',
            daily: false,
            maxHeight: false,
            width: false,
            zoom: 1,
            columns: ['model.name', 'from', 'to'],
            treeTableColumns: ['from', 'to'],
            columnsHeaders: {'model.name' : 'Name', 'from': 'From', 'to': 'To'},
            columnsClasses: {'model.name' : 'gantt-column-name', 'from': 'gantt-column-from', 'to': 'gantt-column-to'},
            columnsFormatters: {
                'from': function(from) {
                    return from !== undefined ? from.format('lll') : undefined;
                },
                'to': function(to) {
                    return to !== undefined ? to.format('lll') : undefined;
                }
            },
            treeHeaderContent: '<i class="fa fa-align-justify"></i> {{getHeader()}}',
            columnsHeaderContents: {
                'model.name': '<i class="fa fa-align-justify"></i> {{getHeader()}}',
                'from': '<i class="fa fa-calendar"></i> {{getHeader()}}',
                'to': '<i class="fa fa-calendar"></i> {{getHeader()}}'
            },
            autoExpand: 'none',
            taskOutOfRange: 'truncate',
            fromDate: moment(null),
            toDate: undefined,
            rowContent: '<i class="fa fa-align-justify"></i> {{row.model.name}}',
            taskContent : '<i class="fa fa-tasks"></i> {{task.model.name}}',
            allowSideResizing: true,
            labelsEnabled: true,
            currentDate: 'line',
            currentDateValue: new Date().toJSON().slice(0,10),
            draw: false,
            readOnly: false,
            groupDisplayMode: 'group',
            filterTask: '',
            filterRow: '',
            timeFrames: {
                'day': {
                    start: moment('8:00', 'HH:mm'),
                    end: moment('20:00', 'HH:mm'),
                    color: '#ACFFA3',
                    working: true,
                    default: true
                },
                'noon': {
                    start: moment('12:00', 'HH:mm'),
                    end: moment('13:30', 'HH:mm'),
                    working: false,
                    default: true
                },
                'closed': {
                    working: false,
                    default: true
                },
                'weekend': {
                    working: false
                },
                'holiday': {
                    working: false,
                    color: 'red',
                    classes: ['gantt-timeframe-holiday']
                }
            },
            dateFrames: {
                'weekend': {
                    evaluator: function(date) {
                        return date.isoWeekday() === 6 || date.isoWeekday() === 7;
                    },
                    targets: ['weekend']
                }
            },
            timeFramesWorkingMode: 'hidden',
            timeFramesNonWorkingMode: 'visible',
            columnMagnet: '15 minutes',
            timeFramesMagnet: true,
            canDraw: function(event) {
                var isLeftMouseButton = event.button === 0 || event.button === 1;
                return $scope.options.draw && !$scope.options.readOnly && isLeftMouseButton;
            },
            drawTaskFactory: function() {
                return {
                    id: utils.randomUuid(),  // Unique id of the task.
                    name: 'Drawn task', // Name shown on top of each task.
                    color: '#AA8833' // Color of the task in HEX format (Optional).
                };
            },
            api: function(api) {
                // API Object is used to control methods and events from angular-gantt.
                $scope.api = api;

                api.core.on.ready($scope, function() {
                    // Log various events to console
                    api.scroll.on.scroll($scope, logScrollEvent);
                    api.core.on.ready($scope, logReadyEvent);

                    api.data.on.remove($scope, addEventName('data.on.remove', logDataEvent));
                    api.data.on.load($scope, addEventName('data.on.load', logDataEvent));
                    api.data.on.clear($scope, addEventName('data.on.clear', logDataEvent));
                    api.data.on.change($scope, addEventName('data.on.change', logDataEvent));

                    api.tasks.on.add($scope, addEventName('tasks.on.add', logTaskEvent));
                    api.tasks.on.change($scope, addEventName('tasks.on.change', logTaskEvent));
                    api.tasks.on.rowChange($scope, addEventName('tasks.on.rowChange', logTaskEvent));
                    api.tasks.on.remove($scope, addEventName('tasks.on.remove', logTaskEvent));

                    if (api.tasks.on.moveBegin) {
                        api.tasks.on.moveBegin($scope, addEventName('tasks.on.moveBegin', logTaskEvent));
                        //api.tasks.on.move($scope, addEventName('tasks.on.move', logTaskEvent));
                        api.tasks.on.moveEnd($scope, addEventName('tasks.on.moveEnd', logTaskEvent));

                        api.tasks.on.resizeBegin($scope, addEventName('tasks.on.resizeBegin', logTaskEvent));
                        //api.tasks.on.resize($scope, addEventName('tasks.on.resize', logTaskEvent));
                        api.tasks.on.resizeEnd($scope, addEventName('tasks.on.resizeEnd', logTaskEvent));
                    }

                    api.rows.on.add($scope, addEventName('rows.on.add', logRowEvent));
                    api.rows.on.change($scope, addEventName('rows.on.change', logRowEvent));
                    api.rows.on.move($scope, addEventName('rows.on.move', logRowEvent));
                    api.rows.on.remove($scope, addEventName('rows.on.remove', logRowEvent));

                    api.side.on.resizeBegin($scope, addEventName('labels.on.resizeBegin', logLabelsEvent));
                    //api.side.on.resize($scope, addEventName('labels.on.resize', logLabelsEvent));
                    api.side.on.resizeEnd($scope, addEventName('labels.on.resizeEnd', logLabelsEvent));

                    api.timespans.on.add($scope, addEventName('timespans.on.add', logTimespanEvent));
                    api.columns.on.generate($scope, logColumnsGenerateEvent);

                    api.rows.on.filter($scope, logRowsFilterEvent);
                    api.tasks.on.filter($scope, logTasksFilterEvent);

                    api.data.on.change($scope, function(newData) {
                        if (dataToRemove === undefined) {
                            dataToRemove = [
                                {'id': newData.data[2].id}, // Remove Kickoff row
                                {
                                    'id': newData.data[0].id, 'tasks': [
                                    {'id': newData.data[0].tasks[0].id},
                                    {'id': newData.data[0].tasks[3].id}
                                ]
                                }, // Remove some Milestones
                                {
                                    'id': newData.data[6].id, 'tasks': [
                                    {'id': newData.data[6].tasks[0].id}
                                ]
                                } // Remove order basket from Sprint 2
                            ];
                        }
                    });

                    // When gantt is ready, load data.
                    // `data` attribute could have been used too.
                    $scope.load();

                    // Add some DOM events
                    api.directives.on.new($scope, function(directiveName, directiveScope, element) {
                        if (directiveName === 'ganttTask') {
                            element.bind('click', function(event) {
                                event.stopPropagation();
                                logTaskEvent('task-click', directiveScope.task);
                            });
                            element.bind('mousedown touchstart', function(event) {
                                event.stopPropagation();
                                $scope.live.row = directiveScope.task.row.model;
                                if (directiveScope.task.originalModel !== undefined) {
                                    $scope.live.task = directiveScope.task.originalModel;
                                } else {
                                    $scope.live.task = directiveScope.task.model;
                                }
                                $scope.$digest();
                            });
                        } else if (directiveName === 'ganttRow') {
                            element.bind('click', function(event) {
                                event.stopPropagation();
                                logRowEvent('row-click', directiveScope.row);
                            });
                            element.bind('mousedown touchstart', function(event) {
                                event.stopPropagation();
                                $scope.live.row = directiveScope.row.model;
                                $scope.$digest();
                            });
                        } else if (directiveName === 'ganttRowLabel') {
                            element.bind('click', function() {
                                logRowEvent('row-label-click', directiveScope.row);
                            });
                            element.bind('mousedown touchstart', function() {
                                $scope.live.row = directiveScope.row.model;
                                $scope.$digest();
                            });
                        }
                    });

                    api.tasks.on.rowChange($scope, function(task) {
                        $scope.live.row = task.row.model;
                    });

                    objectModel = new ObjectModel(api);
                });
            }
        };

        $scope.selectedTaskToEdit = null;
        $scope.handleRowIconClick = function(rowModel) {
            //alert('Icon from ' + rowModel.name + ' row has been clicked.');

        };

        $('.close').on('click', function () {
          $scope.selectedTaskToEdit = null;
        });


        $scope.showDataConsole = function () {
          $scope.taskDurations = [];
          $scope.tasksDuration = [];
          $scope.allAvailableHours = 0;
          $scope.allSpareHours = 0;
          $scope.allRequiredHours = 0;
          $scope.allCostsWithSpareTime = 0;
          var smallestFrom = undefined;
          for(var key in $scope.data) {
            if($scope.data[key].hasOwnProperty('children')) {

            }
            else {

              for(var t in $scope.data[key].tasks) {
                if(smallestFrom === undefined) {
                  smallestFrom = $scope.data[key].tasks[t].from;
                }
                else {
                  var isItSmaller = moment($scope.data[key].tasks[t].from).isBefore(smallestFrom);
                  if(isItSmaller) {
                    smallestFrom = $scope.data[key].tasks[t].from;
                  }
                }
              }
            }
          }

          var biggestTo = undefined;
          var tasksDuration = [];
          var allTaskWorkHours = 0.0;
          var allTaskWorkDays = 0;
          for(var key in $scope.data) {
            if($scope.data[key].hasOwnProperty('children')) {

            }
            else {
              for(var t in $scope.data[key].tasks) {
                var from  = $scope.data[key].tasks[t].from;
                var then = $scope.data[key].tasks[t].to;
                var ms = moment(then).diff(moment(from));
                var d = moment.duration(ms);
                var s = Math.floor(d.asHours());
                var dayFromS = s/24;
                var dayFromSPrecised = dayFromS.toPrecision(4);
                s = dayFromSPrecised * 8;
                allTaskWorkHours += s;
                $scope.allRequiredHours += s;

                var est  = $scope.data[key].tasks[t].est;
                var lct = $scope.data[key].tasks[t].lct;
                var estms = moment(lct).diff(moment(est));
                var estd = moment.duration(estms);
                var ests = Math.floor(estd.asHours());
                var estDayFromS = ests/24;
                var estDayFromSPrecised = estDayFromS.toPrecision(4);
                ests = estDayFromSPrecised * 8;
                var spareTime = ests - s;
                $scope.allAvailableHours += ests;
                $scope.allSpareHours += spareTime;

                var taskTime = {
                  name: $scope.data[key].tasks[t].name,
                  duration: s,
                  days: dayFromSPrecised,
                  allTime: ests,
                  spare: spareTime
                };
                tasksDuration.push(taskTime);

                if(biggestTo === undefined) {
                  biggestTo = $scope.data[key].tasks[t].to;
                }
                else {
                  var isItBigger = moment($scope.data[key].tasks[t].to).isAfter(biggestTo);
                  if(isItBigger) {
                    biggestTo = $scope.data[key].tasks[t].to;
                  }
                }
              }
            }
          }
          $scope.tasksDuration = tasksDuration;
          console.log(smallestFrom);
          console.log(biggestTo);
          console.log(tasksDuration);

          var chart = AmCharts.makeChart("chartdiv", {
          	"type": "serial",
               "theme": "light",
          	"categoryField": "name",
          	"rotate": true,
          	"startDuration": 1,
          	"categoryAxis": {
          		"gridPosition": "start",
          		"position": "left"
          	},
            "colors": ['#B0DE09'],
          	"trendLines": [],
          	"graphs": [
          		{
          			"balloonText": "Duration is [[value]] WORK hours which is [[description]] days",
          			"fillAlphas": 0.8,
          			"id": "AmGraph-1",
          			"lineAlpha": 0.2,
          			"title": "Tasks",
          			"type": "column",
          			"valueField": "duration",
                "descriptionField": "days"
          		}
          	],
          	"guides": [],
          	"valueAxes": [
          		{
          			"id": "ValueAxis-1",
          			"position": "top",
          			"axisAlpha": 0
          		}
          	],
          	"allLabels": [],
          	"balloon": {},
          	"titles": [],
          	"dataProvider": tasksDuration,
            "export": {
            	"enabled": true
            }
          });

          var chart = AmCharts.makeChart( "chartdiv2", {
          "type": "pie",
          "theme": "light",
          "dataProvider": tasksDuration,
          "valueField": "days",
          "titleField": "name",
          "outlineAlpha": 0.4,
          "depth3D": 15,
          "balloonText": "[[title]]<br><span style='font-size:14px'><b>[[value]]</b> days ([[percents]]%)</span>",
          "angle": 30,
          "export": {
            "enabled": true
          }
        } );

        allTaskWorkDays = allTaskWorkHours/8;
        allTaskWorkDays = allTaskWorkDays.toPrecision(3);

        var allTaskWorkHoursObject =
        [
          {
            hours: allTaskWorkHours,
            days: allTaskWorkDays
          }
        ];


        $scope.hourlyRate = 0;
        $scope.workHours = allTaskWorkHours;
        $scope.workHoursRate = $scope.workHours * parseInt($scope.hourlyRate);

        console.log($scope.tasksDuration);

        console.log($scope.workHours);
        console.log($scope.workHoursRate);

        };


        $scope.handleTaskIconClick = function(taskModel) {
            var model = taskModel;
            console.log(taskModel.id);
            taskModel = null;
            $scope.selectedTaskToEdit = null;
            $scope.selectedTaskToEdit =  {
                           "id": "",
                           "name": "",
                           "content": "",
                           "color": "",
                           "from": "",
                           "to": "",
                           "est": "",
                           "lct": "",
                           "progress": "",
                           "person": ""
                         };
            $scope.selectedTaskToEdit.id = model.id;
            $scope.selectedTaskToEdit.name = model.name;
            $scope.selectedTaskToEdit.content = model.content;
            $scope.selectedTaskToEdit.color = model.color;
            $scope.selectedTaskToEdit.from = model.from.toDate();
            $scope.selectedTaskToEdit.to = model.to.toDate();
            $scope.selectedTaskToEdit.est = model.est.toDate();
            $scope.selectedTaskToEdit.lct = model.lct.toDate();
            $scope.selectedTaskToEdit.progress = parseInt(model.progress);
            $scope.selectedTaskToEdit.person = model.person;
            $('#modifyTaskModal').modal('show');
        };

        $scope.saveModifiedTask = function() {
          for(var key in tasksDataForChart) {
            console.log(tasksDataForChart[key].id);
            if(tasksDataForChart[key].id === $scope.selectedTaskToEdit.id) {
              var fromDateYear = moment($scope.selectedTaskToEdit.from).year();
              var fromDateMonth = moment($scope.selectedTaskToEdit.from).month();
              var fromDateDay = parseInt($scope.selectedTaskToEdit.from.toString().substring(8,10));
              var toDateYear = moment($scope.selectedTaskToEdit.to).year();
              var toDateMonth = moment($scope.selectedTaskToEdit.to).month();
              var toDateDay = parseInt($scope.selectedTaskToEdit.to.toString().substring(8,10));
              var fromEstDateYear = moment($scope.selectedTaskToEdit.est).year();
              var fromEstDateMonth = moment($scope.selectedTaskToEdit.est).month();
              var fromEstDateDay = parseInt($scope.selectedTaskToEdit.est.toString().substring(8,10));
              var toDateEstYear = moment($scope.selectedTaskToEdit.lct).year();
              var toDateEstMonth = moment($scope.selectedTaskToEdit.lct).month();
              var toDateEstDay = parseInt($scope.selectedTaskToEdit.lct.toString().substring(8,10));
              var modifiedTaskToInsert = {
                name: $scope.selectedTaskToEdit.name, tasks: [
                  {
                    name: $scope.selectedTaskToEdit.name,
                    priority: 20,
                    content: '<i class="fa fa-cog" ng-click="scope.handleTaskIconClick(task.model)"></i> {{task.model.name}} <i class="fa fa-trash-o" ng-click="scope.deleteTaskModal(task.model)"> </i> ',
                    color: '#F1C232',
                    from: new Date(fromDateYear, fromDateMonth, fromDateDay, 8, 0, 0),
                    to: new Date(toDateYear, toDateMonth, toDateDay, 8, 0, 0),
                    est: new Date(fromEstDateYear, fromEstDateMonth, fromEstDateDay, 8, 0, 0),
                    lct: new Date(toDateEstYear, toDateEstMonth, toDateEstDay, 8, 0, 0),
                    progress: parseInt($scope.selectedTaskToEdit.progress),
                    person: $scope.selectedTaskToEdit.person
                  }
                ]};

              tasksDataForChart[key] = modifiedTaskToInsert;
              $scope.selectedTaskToEdit = null;

              $('#modifyTaskModal').modal('hide');
            }
          }
        };


        $scope.expandAll = function() {
            $scope.api.tree.expandAll();
        };

        $scope.collapseAll = function() {
            $scope.api.tree.collapseAll();
        };

        $scope.$watch('options.sideMode', function(newValue, oldValue) {
            if (newValue !== oldValue) {
                $scope.api.side.setWidth(undefined);
                $timeout(function() {
                    $scope.api.columns.refresh();
                });
            }
        });

        $scope.canAutoWidth = function(scale) {
            if (scale.match(/.*?hour.*?/) || scale.match(/.*?minute.*?/)) {
                return false;
            }
            return true;
        };

        $scope.getColumnWidth = function(widthEnabled, scale, zoom) {
            if (!widthEnabled && $scope.canAutoWidth(scale)) {
                return undefined;
            }

            if (scale.match(/.*?week.*?/)) {
                return 150 * zoom;
            }

            if (scale.match(/.*?month.*?/)) {
                return 300 * zoom;
            }

            if (scale.match(/.*?quarter.*?/)) {
                return 500 * zoom;
            }

            if (scale.match(/.*?year.*?/)) {
                return 800 * zoom;
            }

            return 40 * zoom;
        };

        // Reload data action
        $scope.data = [];
        $scope.load = function() {
            $scope.data = Sample.getSampleData();
            dataToRemove = undefined;

            $scope.timespans = Sample.getSampleTimespans();
        };

        $scope.reload = function() {
            $scope.load();
        };

        // Remove data action
        $scope.remove = function() {
            $scope.api.data.remove(dataToRemove);
        };

        // Clear data action
        $scope.clear = function() {
            $scope.data = [];
        };


        // Visual two way binding.
        $scope.live = {};

        var debounceValue = 1000;

        var listenTaskJson = debounce(function(taskJson) {
            if (taskJson !== undefined) {
                var task = angular.fromJson(taskJson);
                objectModel.cleanTask(task);
                var model = $scope.live.task;
                angular.extend(model, task);
            }
        }, debounceValue);
        $scope.$watch('live.taskJson', listenTaskJson);

        var listenRowJson = debounce(function(rowJson) {
            if (rowJson !== undefined) {
                var row = angular.fromJson(rowJson);
                objectModel.cleanRow(row);
                var tasks = row.tasks;

                delete row.tasks;
                var rowModel = $scope.live.row;

                angular.extend(rowModel, row);

                var newTasks = {};
                var i, l;

                if (tasks !== undefined) {
                    for (i = 0, l = tasks.length; i < l; i++) {
                        objectModel.cleanTask(tasks[i]);
                    }

                    for (i = 0, l = tasks.length; i < l; i++) {
                        newTasks[tasks[i].id] = tasks[i];
                    }

                    if (rowModel.tasks === undefined) {
                        rowModel.tasks = [];
                    }
                    for (i = rowModel.tasks.length - 1; i >= 0; i--) {
                        var existingTask = rowModel.tasks[i];
                        var newTask = newTasks[existingTask.id];
                        if (newTask === undefined) {
                            rowModel.tasks.splice(i, 1);
                        } else {
                            objectModel.cleanTask(newTask);
                            angular.extend(existingTask, newTask);
                            delete newTasks[existingTask.id];
                        }
                    }
                } else {
                    delete rowModel.tasks;
                }

                angular.forEach(newTasks, function(newTask) {
                    rowModel.tasks.push(newTask);
                });
            }
        }, debounceValue);
        $scope.$watch('live.rowJson', listenRowJson);

        $scope.$watchCollection('live.task', function(task) {
            $scope.live.taskJson = angular.toJson(task, true);
            $scope.live.rowJson = angular.toJson($scope.live.row, true);
        });

        $scope.$watchCollection('live.row', function(row) {
            $scope.live.rowJson = angular.toJson(row, true);
            if (row !== undefined && row.tasks !== undefined && row.tasks.indexOf($scope.live.task) < 0) {
                $scope.live.task = row.tasks[0];
            }
        });

        $scope.$watchCollection('live.row.tasks', function() {
            $scope.live.rowJson = angular.toJson($scope.live.row, true);
        });

        // -----------------------
        $scope.displayNewTask = function () {
          $('#addTaskContainer').css('display', 'block');
        };

        $scope.displayAddChildTask = function () {
          $('#childrenTasksContainer').css('display', 'block');
        };

         $scope.newTask = {
          taskName: '',
          fromDate: moment(null),
          toDate: undefined,
          person: ''
        };

        $scope.newChildTask = {
         taskName: '',
         fromDate: moment(null),
         toDate: undefined,
         person: ''
       };

       $scope.childTasks = [];
       $scope.removeChildTaskFromList = function (childName) {
         console.log(childName);
         console.log($scope.childTasks);
         for(var key in $scope.childTasks) {
           if($scope.childTasks[key].name == childName) {
             $scope.childTasks.splice(key, 1);
           }
         }
         $('#childTaskListUl').empty();
         console.log($scope.childTasks);
       };
       $scope.addChildTaskToList = function () {
         var fromDateYear = moment($scope.newChildTask.fromDate).year();
         var fromDateMonth = moment($scope.newChildTask.fromDate).month();
         var fromDateDay = parseInt($scope.newChildTask.fromDate.toString().substring(8,10));
         var toDateYear = moment($scope.newChildTask.toDate).year();
         var toDateMonth = moment($scope.newChildTask.toDate).month();
         var toDateDay = parseInt($scope.newChildTask.toDate.toString().substring(8,10));

         var newChildTaskInsertable = {
           name: $scope.newChildTask.taskName, tasks: [
             {
               name: $scope.newChildTask.taskName,
               priority: 20,
               content: '<i class="fa fa-cog" ng-click="scope.handleTaskIconClick(task.model)"></i> {{task.model.name}} <i class="fa fa-trash-o" ng-click="scope.deleteTaskModal(task.model)"> </i> ',
               color: '#F1C232',
               from: new Date(fromDateYear, fromDateMonth, fromDateDay, 8, 0, 0),
               to: new Date(toDateYear, toDateMonth, toDateDay, 8, 0, 0),
               progress: 1,
               person: $scope.newTask.person
             }
           ]};

           $scope.childTasks.push(newChildTaskInsertable);

           var $injector = angular.injector(['ng', 'angularGanttDemoApp']);

           $('#childTaskListUl').append('<li class="list-group-item">' + $scope.newChildTask.taskName +
            '<button class="btn btn-warning" ng-click="removeChildTaskFromList(\'' + $scope.newChildTask.taskName + '\')">REMOVE</button></li>');
           $('#childTasksList').css('display', 'block');
           $('#childrenTasksContainer').css('display', 'none');
           $('#newChildTaskName').val('');
           $('#newChildTaskFromDate').val('');
           $('#newChildTaskTo').val('');
           $('#newChildTaskResp').val('');
           $scope.newChildTask = {
              taskName: '',
              fromDate: moment(null),
              toDate: undefined,
              person: ''
            };
            $compile($('#childTaskListUl'))($scope);
       };

        $scope.addTaskToDataCollection = function () {
          var fromDateYear = moment($scope.newTask.fromDate).year();
          var fromDateMonth = moment($scope.newTask.fromDate).month();
          var fromDateDay = parseInt($scope.newTask.fromDate.toString().substring(8,10));
          var toDateYear = moment($scope.newTask.toDate).year();
          var toDateMonth = moment($scope.newTask.toDate).month();
          var toDateDay = parseInt($scope.newTask.toDate.toString().substring(8,10));


          var fromEstDateYear = undefined
          var fromEstDateMonth = undefined
          var fromEstDateDay = undefined
          var toDateEstYear = undefined
          var toDateEstMonth = undefined
          var toDateEstDay = undefined;
          if($scope.newTask.fromDateEst === undefined || $scope.newTask.toDateEst === undefined) {

          } else {
            fromEstDateYear = moment($scope.newTask.fromDateEst).year();
            fromEstDateMonth = moment($scope.newTask.fromDateEst).month();
            fromEstDateDay = parseInt($scope.newTask.fromDateEst.toString().substring(8,10));
            toDateEstYear = moment($scope.newTask.toDateEst).year();
            toDateEstMonth = moment($scope.newTask.toDateEst).month();
            toDateEstDay = parseInt($scope.newTask.toDateEst.toString().substring(8,10));
          }

          console.log("est date:" + fromEstDateYear + ' ' + fromEstDateMonth + ' ' + fromEstDateDay);
          if($scope.childTasks.length === 0) {
            var newTaskToInsert = {
              name: $scope.newTask.taskName, tasks: [
                {
                  name: $scope.newTask.taskName,
                  priority: 20,
                  content: '<i class="fa fa-cog" ng-click="scope.handleTaskIconClick(task.model)"></i> {{task.model.name}} <i class="fa fa-trash-o" ng-click="scope.deleteTaskModal(task.model)"> </i> ',
                  color: '#F1C232',
                  from: new Date(fromDateYear, fromDateMonth, fromDateDay, 8, 0, 0),
                  to: new Date(toDateYear, toDateMonth, toDateDay, 8, 0, 0),
                  est: new Date(fromEstDateYear, fromEstDateMonth, fromEstDateDay, 8, 0, 0),
                  lct: new Date(toDateEstYear, toDateEstMonth, toDateEstDay, 8, 0, 0),
                  progress: 1,
                  person: $scope.newTask.person
                }
              ]};
              tasksDataForChart.push(newTaskToInsert);
              newTaskToInsert = null;
          } else {

            var childrenTasksName = [];
            for(var key in $scope.childTasks) {
              childrenTasksName.push($scope.childTasks[key].name);
            }
            console.log("childrentasks name:" + childrenTasksName);
            var newTaskToInsert = {
                  name: $scope.newTask.taskName,
                  content: '<i class="fa fa-file-code-o" ng-click="scope.handleRowIconClick(row.model)"></i> {{row.model.name}}',
                  children: childrenTasksName,
                };
              tasksDataForChart.push(newTaskToInsert);
              for(var key in $scope.childTasks) {
                tasksDataForChart.push($scope.childTasks[key]);
              }

          }
          $scope.childTasks = null;
          $scope.childTasks = [];
          $('#childTaskListUl').empty();
          $scope.newTask = {
             taskName: '',
             fromDate: moment(null),
             toDate: undefined,
             person: ''
           };

          $('#addTaskModal').modal('hide');
        };

        $scope.removableTask = null;
        $scope.deleteTaskModal = function (taskModel) {
          $scope.removableTask = taskModel.name;
          $('#deleteTaskModal').modal('show');

        };
        $scope.deleteTask = function () {
          for(var key in tasksDataForChart) {
            if(tasksDataForChart[key].name === $scope.removableTask) {
              var index = key;
              var deleteCount = 1;
              tasksDataForChart.splice(index, deleteCount);

              for(var key2 in tasksDataForChart) {
                if(tasksDataForChart[key2].hasOwnProperty('children')) {
                  for(var c in tasksDataForChart[key2].children) {
                    if(tasksDataForChart[key2].children[c] === $scope.removableTask) {
                      var ind = c;
                      tasksDataForChart[key2].children.splice(ind, deleteCount);
                      break;
                    }
                  }
                }
              }

              $('#deleteTaskModal').modal('hide');
              break;
            }
          }
        };

        $scope.newRisk = {
          id: 0,
          name: '',
          description: '',
          level: 'Not Important'
        };

        $scope.addNewRisk = function () {
          var riskModel = {
            id: Math.floor(Math.random() * 10000000 * (new Date().getMilliseconds())),
            name: $scope.newRisk.name,
            description: $scope.newRisk.description,
            level: $scope.newRisk.level
          };

          risksData.push(riskModel);
          $scope.newRisk = null;

          $('#addRiskModal').modal('hide');
        };


        $scope.riskModificationElement = null;
        $scope.showRiskModal = function(riskModel) {
          var riskModel = {
            id: riskModel.id,
            name: riskModel.name,
            description: riskModel.description,
            level: riskModel.level
          };
          $scope.riskModificationElement = riskModel;
          $('#modifyRiskModal').modal('show');
        };

        $scope.saveModifiedRisk = function () {
          for(var key in risksData) {
            if(risksData[key].id === $scope.riskModificationElement.id) {
              risksData[key] = $scope.riskModificationElement;
              $scope.riskModificationElement = null;
              console.log(risksData);
              $('#modifyRiskModal').modal('hide');
            }
          }
        };

        $scope.showDeleteRiskModal = function(risk) {
          $scope.removableRisk = risk.name;
          $scope.removableRiskId = risk.id;
          $('#deleteRiskModal').modal('show');
        };

        $scope.deleteRisk = function() {
          console.log(risksData);
          for(var key in risksData) {
            if(risksData[key].id == $scope.removableRiskId) {
              risksData.splice(key, 1);
              $scope.removableRiskId = null;
              $scope.removableRisk = null;
            }
          }
          console.log(risksData);
          $('#deleteRiskModal').modal('hide');
        }

        //addRisk id generator: Math.floor(Math.random() * 10000000 * (new Date().getMilliseconds()))

        $scope.riskData = risksData;

        $scope.modifiedProjectData = {
          name: '',
          leader: ''
        };
        $scope.saveModifiedProject = function () {
          console.log(projectDataFrom);

          $scope.modifiedProjectData.name = $('#modifyProjectNameInput').val();
          $scope.modifiedProjectData.leader = $('#modifyProjectLeaderInput').val();

          console.log($scope.modifiedProjectData);
          projectDataFrom[0].name = $scope.modifiedProjectData.name;
          projectDataFrom[0].leader = $scope.modifiedProjectData.leader;
          $scope.projectData = null;
          $scope.projectData = projectDataFrom;
          $('#modifyProjectModal').modal('hide');
        };


        $scope.projectData = projectDataFrom;


        $scope.showProjectSettingsBtnState = true;
        $scope.hideSettings = function () {
          if(!$scope.showProjectSettingsBtnState) {
            $("#taskAndRisk").show();
            $("#viewOptions").show();
          } else {
              $("#taskAndRisk").hide();
              $("#viewOptions").hide();
          }
        };

        $scope.saveDataToDrive = function () {
          var projDate = moment(projectDataFrom[0].created, 'YYYY. MMMM DD. HH:mm');
          var projDateYear = projDate.year();
          var projDateMonth = projDate.month();
          var projDateDay = projDate.day();
          var toSaveProjectData = {
            id: projectDataFrom[0].id,
            name: projectDataFrom[0].name,
            leader: projectDataFrom[0].leader,
            created: 'new Date(' + projDateYear + ',' + projDateMonth + ',' + projDateDay + ', 8, 0, 0)',
            lastModified: new Date()
          };


          var saveTasksToInsert = [];
          for(var key in tasksDataForChart) {
            if(tasksDataForChart[key].hasOwnProperty('children')) {
              var children = [];
              for(var c in tasksDataForChart[key].children) {
                children.push(tasksDataForChart[key].children[c]);
              }
              console.log(children);
              var saveTaskToInsert = {
                name: tasksDataForChart[key].name,
                content: "{{row.model.name}}",
                children: children
              };
              saveTasksToInsert.push(saveTaskToInsert);
            }
            else {
              for(var t in tasksDataForChart[key].tasks) {
                var fromDate = moment(tasksDataForChart[key].tasks[t].from, 'ddd MMM DD YYYY HH:mm:ss');
                var fromDateYear = fromDate.year();
                var fromDateMonth = fromDate.month();
                var fromDateDay = parseInt(fromDate.toString().substring(8,10));

                var toDate = moment(tasksDataForChart[key].tasks[t].to, 'ddd MMM DD YYYY HH:mm:ss');
                var toDateYear = toDate.year();
                var toDateMonth = toDate.month();
                var toDateDay = parseInt(toDate.toString().substring(8,10));

                var fromEstDate = moment(tasksDataForChart[key].tasks[t].est, 'ddd MMM DD YYYY HH:mm:ss');
                var fromEstDateYear = fromEstDate.year();
                var fromEstDateMonth = fromEstDate.month();
                var fromEstDateDay = parseInt(fromEstDate.toString().substring(8,10));

                var toEstDate = moment(tasksDataForChart[key].tasks[t].lct, 'ddd MMM DD YYYY HH:mm:ss');
                var toDateEstYear = toEstDate.year();
                var toDateEstMonth = toEstDate.month();
                var toDateEstDay = parseInt(toEstDate.toString().substring(8,10));

                saveTaskToInsert = {
                  name: tasksDataForChart[key].tasks[t].name, tasks: [
                    {
                      name: tasksDataForChart[key].tasks[t].name,
                      content: '<i class="fa fa-cog" ng-click="scope.handleTaskIconClick(task.model)"></i> {{task.model.name}} <i class="fa fa-trash-o" ng-click="scope.deleteTaskModal(task.model)"> </i> ',
                      color: '#F1C232',
                      from: 'new Date(' + fromDateYear + ',' + fromDateMonth +  ',' + fromDateDay +', 8, 0, 0)',
                      to: 'new Date(' + toDateYear + ',' + toDateMonth + ',' + toDateDay + ', 8, 0, 0)',
                      est: 'new Date('+ fromEstDateYear + ',' + fromEstDateMonth + ',' + fromEstDateDay + ', 8, 0, 0)',
                      lct: 'new Date(' + toDateEstYear + ',' + toDateEstMonth + ',' + toDateEstDay + ', 8, 0, 0)',
                      progress: parseInt(tasksDataForChart[key].tasks[t].progress),
                      person: tasksDataForChart[key].tasks[t].person
                    }
                ]};
                saveTasksToInsert.push(saveTaskToInsert);
              }
            }
          }

          var saveJson = {
            project: toSaveProjectData,
            risks: risksData,
            tasks: saveTasksToInsert
          };

          console.log("Saving to Google Drive started...");
          createNewFile(saveJson);
        };



        // -----------------------

        // Event handler
        var logScrollEvent = function(left, date, direction) {
            if (date !== undefined) {
                $log.info('[Event] api.on.scroll: ' + left + ', ' + (date === undefined ? 'undefined' : date.format()) + ', ' + direction);
            }
        };

        // Event handler
        var logDataEvent = function(eventName) {
            $log.info('[Event] ' + eventName);
        };

        // Event handler
        var logTaskEvent = function(eventName, task) {
            $log.info('[Event] ' + eventName + ': ' + task.model.name);
        };

        // Event handler
        var logRowEvent = function(eventName, row) {
            $log.info('[Event] ' + eventName + ': ' + row.model.name);
        };

        // Event handler
        var logTimespanEvent = function(eventName, timespan) {
            $log.info('[Event] ' + eventName + ': ' + timespan.model.name);
        };

        // Event handler
        var logLabelsEvent = function(eventName, width) {
            $log.info('[Event] ' + eventName + ': ' + width);
        };

        // Event handler
        var logColumnsGenerateEvent = function(columns, headers) {
            $log.info('[Event] ' + 'columns.on.generate' + ': ' + columns.length + ' column(s), ' + headers.length + ' header(s)');
        };

        // Event handler
        var logRowsFilterEvent = function(rows, filteredRows) {
            $log.info('[Event] rows.on.filter: ' + filteredRows.length + '/' + rows.length + ' rows displayed.');
        };

        // Event handler
        var logTasksFilterEvent = function(tasks, filteredTasks) {
            $log.info('[Event] tasks.on.filter: ' + filteredTasks.length + '/' + tasks.length + ' tasks displayed.');
        };

        // Event handler
        var logReadyEvent = function() {
            $log.info('[Event] core.on.ready');
        };

        // Event utility function
        var addEventName = function(eventName, func) {
            return function(data) {
                return func(eventName, data);
            };
        };

    }]);

'use strict';

/**
 * @ngdoc service
 * @name angularGanttDemoApp.Sample
 * @description
 * # Sample
 * Service in the angularGanttDemoApp.
 */

var risksData = [];
var tasksDataForChart = {};
var projectDataFrom = [];
function dataLoader() {

  var tempProjData = getProjData();

  var risksDataTmp = getRiskData();
  var taskDatatmp = getTaskData();
  var newTaskToInsert = {};
  tasksDataForChart.splice(0,1);
  console.log(taskDatatmp);
  for(var k in taskDatatmp) {
    if(taskDatatmp[k].hasOwnProperty('children')) {
      var children = [];
      for(var c in taskDatatmp[k].children) {
        children.push(taskDatatmp[k].children[c]);
      }
      console.log(children);
      newTaskToInsert = {
        name: taskDatatmp[k].name,
        children: children,
        content: '{{row.model.name}}',
      };
        tasksDataForChart.push(newTaskToInsert);
    }
    else {
      for(var j in taskDatatmp[k].tasks) {
        var fromDateYear = moment(eval(taskDatatmp[k].tasks[j].from)).year();
        var fromDateMonth = moment(eval(taskDatatmp[k].tasks[j].from)).month();
        var fromDateDay = parseInt(eval(taskDatatmp[k].tasks[j].from).toString().substring(8,10));
        var toDateYear = moment(eval(taskDatatmp[k].tasks[j].to)).year();
        var toDateMonth = moment(eval(taskDatatmp[k].tasks[j].to)).month();
        var toDateDay = parseInt(eval(taskDatatmp[k].tasks[j].to).toString().substring(8,10));
        var fromEstDateYear = moment(eval(taskDatatmp[k].tasks[j].est)).year();
        var fromEstDateMonth = moment(eval(taskDatatmp[k].tasks[j].est)).month();
        var fromEstDateDay = parseInt(eval(taskDatatmp[k].tasks[j].est).toString().substring(8,10));
        var toDateEstYear = moment(eval(taskDatatmp[k].tasks[j].lct)).year();
        var toDateEstMonth = moment(eval(taskDatatmp[k].tasks[j].lct)).month();
        var toDateEstDay = parseInt(eval(taskDatatmp[k].tasks[j].lct).toString().substring(8,10));

        newTaskToInsert = {
          name: taskDatatmp[k].tasks[j].name, tasks: [
            {
              name: taskDatatmp[k].tasks[j].name,
              content: '<i class="fa fa-cog" ng-click="scope.handleTaskIconClick(task.model)"></i> {{task.model.name}} <i class="fa fa-trash-o" ng-click="scope.deleteTaskModal(task.model)"> </i> ',
              color: '#F1C232',
              from: new Date(fromDateYear, fromDateMonth, fromDateDay, 8, 0, 0),
              to: new Date(toDateYear, toDateMonth, toDateDay, 8, 0, 0),
              est: new Date(fromEstDateYear, fromEstDateMonth, fromEstDateDay, 8, 0, 0),
              lct: new Date(toDateEstYear, toDateEstMonth, toDateEstDay, 8, 0, 0),
              progress: parseInt(taskDatatmp[k].tasks[j].progress),
              person: taskDatatmp[k].tasks[j].person
            }
          ]};
          tasksDataForChart.push(newTaskToInsert);
      }
    }
  }

  for(var r in risksDataTmp) {
    var newRisk = {
      id: parseInt(risksDataTmp[r].id),
      description: risksDataTmp[r].description,
      level: risksDataTmp[r].level,
      name: risksDataTmp[r].name
    }
    risksData.push(newRisk);
    console.log("RISKSDATA: "); console.log(risksData);
  }

  var createdDateYear = moment(eval(tempProjData.created)).year();
  var createdDateMonth = moment(eval(tempProjData.created)).month();
  var createdDateDay = parseInt(eval(tempProjData.created).toString().substring(8,10));
  var lastDate = moment(tempProjData.lastModified);
  var lastDateYear = lastDate.year();
  var lastDateMonth = lastDate.month();
  var lastDateDay = parseInt(lastDate.toString().substring(8,10));
  var lastDateHour = lastDate.hour();
  var lastDateMin = lastDate.minute();

  var newProjectData = {
    id: tempProjData.id,
    name: tempProjData.name,
    leader: tempProjData.leader,
    created: moment(new Date(createdDateYear, createdDateMonth, createdDateDay, 8, 0, 0)).format('YYYY. MMMM DD. HH:mm'),
    lastModified: moment(new Date(lastDateYear, lastDateMonth, lastDateDay, lastDateHour, lastDateMin, 0)).format('YYYY. MMMM DD. HH:mm')
  };

  projectDataFrom.push(newProjectData);

  //$("#showProjectSettingsBtn").trigger("click");
  var element1 = angular.element('button[ng-click="showDataConsole()"]');
  element1.trigger('click');
  element1.click();

}

/*var projectData =
  {
    id: 1,
    name: 'Test ',
    leader: 'Béla',
    created: new Date(2015, 9, 1, 8, 0, 0),
    lastModified: new Date(2015, 10, 1, 18, 27, 0),
  };*/


/*var risksData = [
    {
      id: 146435597,
      name: 'Senior Developer leaves',
      description: 'risk description risk description risk description risk description risk description ',
      level: 'high'
    },
    {
      id: 924857713,
      name: 'Infrastructure failure',
      description: 'risk description risk description risk description risk description risk description ',
      level: 'low'
    }
];*/

var tasksDataForChart = [
        {name: 'First',
          tasks: [
            {
             name: 'First',
             priority: 20,
             content: '<i class="fa fa-cog" ng-click="scope.handleTaskIconClick(task.model)"></i> {{task.model.name}} <i class="fa fa-trash-o" ng-click="scope.deleteTaskModal(task.model)"> </i> ',
             color: '#F1C232',
             from: new Date(2015, 10, 10, 8, 0, 0),
             to: new Date(2015, 10, 16, 18, 0, 0),
             est: new Date(2015, 10, 8, 8, 0, 0),
             lct: new Date(2015, 10, 18, 20, 0, 0),
             progress: 100,
             person: 'Clark Kent, Bruce Wayne, Berry Allen'
           }
        ]}
    ];

angular.module('angularGanttDemoApp')
    .service('Sample', function Sample() {
      console.log("gant loader");
        return {
            getSampleData: function() {
                return tasksDataForChart;
            },
            getSampleTimespans: function() {
                return [
                        {

                        }
                    ];
            }
        };
    })
;

$('#ex1').slider({
	formatter: function(value) {
		return 'Current value: ' + value;
	}
});
