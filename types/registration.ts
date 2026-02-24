export type Registration = {
  id: string;
  fullName: string;
  contactNumber: string;
  email: string | null;
  church: string;
  role: string | null;
  hasVehicle: boolean;
  plateNumber: string | null;
  confirmedAttendance: boolean;
  createdAt: string;
};

export type RegistrationPayload = Omit<Registration, "id" | "createdAt" | "confirmedAttendance">;
