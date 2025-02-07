export interface ApiResponse<T = any> {
  status: number;
  success: boolean;
  data?: T;
  message?: string;
}
