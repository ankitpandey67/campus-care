export const VALID_STATUS_TRANSITIONS = {
  Submitted: ['Under Review', 'Rejected'],
  'Under Review': ['Assigned', 'Rejected'],
  Assigned: ['In Progress', 'Awaiting Complainant Response', 'Rejected'],
  'In Progress': ['Awaiting Complainant Response', 'Resolved', 'Rejected'],
  'Awaiting Complainant Response': ['In Progress', 'Resolved', 'Rejected'],
  Resolved: ['Closed', 'Reopened'],
  Reopened: ['In Progress', 'Assigned', 'Under Review'],
  Closed: ['Reopened'],
  Rejected: ['Submitted'],
};

export const isValidStatusTransition = (from, to) => {
  if (!from || !to) return false;
  if (from === to) return true;
  const allowed = VALID_STATUS_TRANSITIONS[from] || [];
  return allowed.includes(to);
};
