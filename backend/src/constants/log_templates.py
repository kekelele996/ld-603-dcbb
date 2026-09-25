LOG_TEMPLATES = {
  "Building": [
    "Building.create",
    "Building.update",
    "Building.status",
    "Building.export"
  ],
  "FireDevice": [
    "FireDevice.create",
    "FireDevice.update",
    "FireDevice.status",
    "FireDevice.export",
    "FireDevice.relocate",
    "FireDevice.relocate.taskMoved",
    "FireDevice.relocate.taskDiverged"
  ],
  "InspectionTask": [
    "InspectionTask.create",
    "InspectionTask.update",
    "InspectionTask.status",
    "InspectionTask.export",
    "InspectionTask.dispatch.snapshot",
    "InspectionTask.locationConflict",
    "InspectionTask.locationResolve.keepOld",
    "InspectionTask.locationResolve.reinspectNew"
  ],
  "InspectionResult": [
    "InspectionResult.create",
    "InspectionResult.update",
    "InspectionResult.status",
    "InspectionResult.export",
    "InspectionResult.submit.locationBlocked",
    "InspectionResult.submit.locationMatched",
    "InspectionResult.supersede"
  ],
  "HazardTicket": [
    "HazardTicket.create",
    "HazardTicket.update",
    "HazardTicket.status",
    "HazardTicket.export"
  ]
}
