export const InitiativeStatus = Object.freeze({
  PROPOSED: "Proposed",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
  INPROGRESS: "In Progress",
  NOTSTARTED: "Not Started",
  PLANNING: "Planning",
  ONHOLD: "On Hold",
  COMPLETE: "Complete"
});

export const InitiativeStatusByName = Object.freeze({
  proposed: InitiativeStatus.PROPOSED,
  approved: InitiativeStatus.APPROVED,
  rejected: InitiativeStatus.REJECTED
});

export const HealthStatus = Object.freeze({
  RED: "Red",
  AMBER: "Amber",
  GREEN: "Green"
});