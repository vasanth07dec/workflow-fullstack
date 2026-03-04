export interface UserResponse {
  user: User
}

export interface User {
  id: string
  name: string
  email: string
  role: string
}

export type LoginPayload = {
  email: string;
  password: string;
};