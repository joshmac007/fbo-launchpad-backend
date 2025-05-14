import { jwtDecode, JwtPayload } from 'jwt-decode';

// More specific types for JWT payload
interface UserIdentity {
  id: number;
  username: string;
  name?: string; 
  // email might also be here or directly on CustomJwtPayload if not in identity
}

interface UserRoleClaim {
  id: number;
  name: string;
}

interface UserClaims {
  permissions?: string[];
  role?: UserRoleClaim; 
  // Other custom claims can be added here
}

export interface CustomJwtPayload extends JwtPayload {
  id: number; // Typically refers to user ID, often same as identity.id
  identity?: UserIdentity; 
  user_claims?: UserClaims; 
  email?: string; // If email is a top-level claim
  // Add other custom claims as needed at the top level
}

export function decodeJWT(token: string | null): CustomJwtPayload | null {
  if (!token) return null;
  try {
    return jwtDecode<CustomJwtPayload>(token);
  } catch (e) {
    console.error("Failed to decode JWT:", e);
    return null;
  }
}
