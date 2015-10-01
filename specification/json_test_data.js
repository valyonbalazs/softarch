var data = {
  project: {
    projectId: 1,
    projectName: "project name",
    project_leader: "project leader name",
    projectWasCreated: "2015.10.01",
    projectWasLastSaved: "2015.10.02"
  },
  tasks: [
    {
      taskId: 1,
      taskName: "first task",
      taskStatus: "completed",
      taskResponsibles: ["john smith"],
      taskDependencies: [1],
      taskPhase: 1
    },
    {
      taskId: 2,
      taskName: "second task",
      taskStatus: "in progress",
      taskResponsibles: ["john smith", "jane doe"],
      taskDependencies: [1],
      taskPhase: 1
    },
    {
      taskId: 3,
      taskName: "third task",
      taskStatus: "not started yet",
      taskResponsibles: ["john smith"],
      taskDependencies: [1, 2],
      taskPhase: 2
    }
  ],
  risks: [
    {
      riskId: 1,
      riskName: "first risk",
      riskQuality: "important"
    },
    {
      riskId: 2,
      riskName: "second risk",
      riskQuality: "not important"
    },
    {
      riskId: 3,
      riskName: "third risk",
      riskQuality: "very important"
    }
  ],
  schedule: [
    {
      phaseId: 1,
      phaseEndDate: "2015.11.21",
      phaseHumanDaysRequired: 5
    },
    {
      phaseId: 2,
      phaseEndDate: "2015.11.25",
      phaseHumanDaysRequired: 4
    },
    {
      phaseId: 3,
      phaseEndDate: "2015.12.21",
      phaseHumanDaysRequired: 20
    }
  ]
};
