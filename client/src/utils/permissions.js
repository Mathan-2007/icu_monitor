export const canViewAI = (role) => ['admin', 'doctor', 'nurse'].includes(role);
export const canAckAlert = (role) => ['doctor', 'nurse'].includes(role);
export const canResolveAlert = (role) => role === 'doctor';
export const canDischarge = (role) => role === 'doctor';
export const canManageUsers = (role) => role === 'admin';
export const canAddVitals = (role) => ['doctor', 'nurse'].includes(role);