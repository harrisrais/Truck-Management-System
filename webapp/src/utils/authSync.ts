// utils/authSync.ts
export function setupLogoutSync(logoutFn: () => void) {
  window.addEventListener("storage", (event) => {
    if (event.key === "logout") {
      logoutFn();
    }
  });
}

export function broadcastLogout() {
  localStorage.setItem("logout", Date.now().toString());
}
