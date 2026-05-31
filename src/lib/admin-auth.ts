const ADMIN_KEY = "pingwin_admin_session";
const TOKEN_KEY = "pingwin_jwt_token";

export function isAdminLoggedIn() {
  if (typeof window === "undefined") {
    return false;
  }

  const hasSession = window.localStorage.getItem(ADMIN_KEY) === "1";
  const hasToken = !!window.localStorage.getItem(TOKEN_KEY);
  
  return hasSession && hasToken;
}

export function setAdminLoggedIn(value: boolean) {
  if (typeof window === "undefined") {
    return;
  }

  if (value) {
    window.localStorage.setItem(ADMIN_KEY, "1");
    return;
  }

  window.localStorage.removeItem(ADMIN_KEY);
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem("pingwin_refresh_token");
  window.localStorage.removeItem("pingwin_user");
}
