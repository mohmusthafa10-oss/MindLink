export const saveToken = (t) => localStorage.setItem("token", t);
export const getToken = () => localStorage.getItem("token");
export const removeToken = () => localStorage.removeItem("token");
