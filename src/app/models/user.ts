export interface UserResponse {
  userId: number;
  name: string;
  email: string;
}

export interface UpdateUserRequest {
  name: string;
}
