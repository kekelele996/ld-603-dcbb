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
    "FireDevice.relocate"
  ],
  "InspectionTask": [
    "InspectionTask.create",
    "InspectionTask.update",
    "InspectionTask.status",
    "InspectionTask.export",
    "InspectionTask.snapshot_migrate",
    "InspectionTask.location_conflict",
    "InspectionTask.location_resolve"
  ],
  "InspectionResult": [
    "InspectionResult.create",
    "InspectionResult.update",
    "InspectionResult.status",
    "InspectionResult.export",
    "InspectionResult.location_conflict_blocked",
    "InspectionResult.superseded",
    "InspectionResult.resubmitted_new_location"
  ],
  "HazardTicket": [
    "HazardTicket.create",
    "HazardTicket.update",
    "HazardTicket.status",
    "HazardTicket.export"
  ],
  "LocationEvent": [
    "LocationEvent.record",
    "LocationEvent.list",
    "LocationEvent.timeline",
    "LocationEvent.resolution"
  ]
}
