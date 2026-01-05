export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface UpdateProfileDto {
  firstName: string;
  lastName: string;
  phone: string;
}
