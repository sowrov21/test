// utils/userSession.js
import {decryptData} from './crp'
/** Get stored JWT token */
export const getToken = () => {
  const token = localStorage.getItem("token");
  return token && token !== "undefined" ? token : null;
};

/** Get stored user info object */
export const getCurrentUser = () => {
  const ec_user = localStorage.getItem("_cu");
  const user = decryptData(ec_user);
  try {
    const parsed = JSON.parse(user);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch (err) {
    console.error("Failed to parse _cu:", err);
    return null;
  }
};

/** Store token and user safely */
export const setSession = (token, user) => {
  if (token) localStorage.setItem("token", token);
  if (user) localStorage.setItem("_cu", JSON.stringify(user));
};

/** Clear all session data */
export const clearSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("_cu");
};
