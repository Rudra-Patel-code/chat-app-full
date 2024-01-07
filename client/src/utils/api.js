import axios from "axios";
import LocalStorage from "./LocalStorage";

axios.defaults.baseURL = import.meta.env.VITE_SERVER_URI;
axios.defaults.withCredentials = true;
axios.defaults.timeout = 12000;

axios.interceptors.request.use(
  (config) => {
    const token = LocalStorage.get("accessToken");
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => {
    Promise.reject(error);
  }
);

export const loginUser = ({ username, password }) => {
  return axios.post(
    "/users/login",
    { username, password },
    { headers: { "Content-Type": "application/json" } }
  );
};

export const registerUser = (formData) => {
  return axios.post("/users/register", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const logoutUser = () => {
  return axios.get("/users/logout");
};

export const forgetPasswordRequest = (email) => {
  const frontEndUrl = import.meta.env.VITE_FRONTEND_URL;

  return axios.post(
    "users/forget-password/request",
    { email, frontEndUrl },
    { headers: { "Content-Type": "application/json" } }
  );
};

export const resetPassword = (resetToken, newPassword) => {
  return axios.post(
    `users/reset-password/${resetToken}`,
    { newPassword },
    { headers: { "Content-Type": "application/json" } }
  );
};

export const getUserChats = () => {
  return axios.get("/chats/chats");
};

export const getChatMessages = (chatId) => {
  return axios.get(`/messages/${chatId}`);
};

export const getGroupDetails = (chatId) => {
  return axios.get(`/chats/group/${chatId}`);
};

export const getAvailableUsers = () => {
  return axios.get(`chats/users`);
};

export const renameGroup = (chatId, name) => {
  console.log(chatId);

  return axios.patch(
    `/chats/group/${chatId}`,
    { name },
    { headers: { "Content-Type": "application/json" } }
  );
};

export const addParticipantInGroup = (chatId, participantId) => {
  return axios.post(`/chats/group/${chatId}/${participantId}`);
};
export const removeParticipantFromGroup = (chatId, participantId) => {
  return axios.delete(`/chats/group/${chatId}/${participantId}`);
};

export const groupChatDelete = (chatId) => {
  return axios.delete(`chats/group/${chatId}`);
};

export const deleteOneOnOneChat = (chatId) => {
  return axios.delete(`/chats/remove/${chatId}`);
};

export const leaveFromGroup = (chatId) => {
  return axios.delete(`chats/leave/group/${chatId}`);
};

export const createOneOnOneChat = (participantId) => {
  return axios.post(`chats/create/one/${participantId}`);
};

export const createGroupChat = (data) => {
  return axios.post(`chats/create/group/`, data);
};

export const sendMessage = (chatId, formData) => {
  return axios.post(`/messages/${chatId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
