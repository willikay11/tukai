export type User = {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  picture: string;
  phone?: string;
  email?: string;
  status?: string;
  acceptedTerms?: boolean;
  experienceHostedCount?: number;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
};
