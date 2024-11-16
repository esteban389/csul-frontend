export enum Role {
  NATIONAL_COORDINATOR = 'national_coordinator',
  CAMPUS_COORDINATOR = 'campus_coordinator',
  PROCESS_LEADER = 'process_leader',
}

export type User = {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  role: Role;
  campus_id: number | null;
  employee_id: number | null;
  avatar: string | null;
};

export type CreateUserRequest = {
  name: string;
  email: string;
  avatar: File | null;
  campus_id: number | undefined;
};