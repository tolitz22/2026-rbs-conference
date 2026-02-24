export type Registration = {
  id: string;
  fullName: string;
  contactNumber: string;
  email: string | null;
  church: string;
  hasVehicle: boolean;
  plateNumber: string | null;
  createdAt: string;
};

export type RegistrationPayload = Omit<Registration, "id" | "createdAt">;
