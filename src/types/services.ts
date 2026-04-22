export interface LoginResponse {
  status: boolean;
  data?: {
    fullName: any;
    roles: string[];
    token: string;
    tenantId: string;
    [key: string]: any;
  };
  message?: string;
}

export interface UserSession {
  userId: number;
  clubId?: number;
  email: string;
  fullName: string;
  roles: string[];
  tenantId: string;
  token: string;
  permissions: string[];
  isSuperAdmin: boolean;
  [key: string]: any;
}

export interface LoginValues {
  email: string;
  password: string;
}

export interface LoginResult {
  success: boolean;
  data?: any;
  error?: string;
}

export interface ApiParams {
  [key: string]: any;
}
