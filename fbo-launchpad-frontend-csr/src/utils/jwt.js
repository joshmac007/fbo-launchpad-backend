import { jwtDecode } from 'jwt-decode';

export function decodeJWT(token) {
  if (!token) return null;
  try {
    return jwtDecode(token);
  } catch (e) {
    return null;
  }
}
