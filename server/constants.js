export const UserRoles = {
  USER_ROLE: "user",
  ADMING_ROLE: "admin",
};

export const UserRoleEnums = Object.values(UserRoles);

export const EventEnums = {
  JOINED_CHAT: "JOINED",
  LEAVE_CHAT: "LEAVE",

  NEW_CHAT: "NEW_CHAT",

  CONNECTED: "CONNECTED",
  DISCONNECTED: "DISCONNECTED",

  MESSAGE_RECEIVED: "MESSAGE_RECEIVED",

  SOCKET_ERROR: "SOCKET_ERROR",

  TYPING: "TYPING",
  STOP_TYPING: "STOP_TYPING",

  UPDATE_GROUP_NAME: "UPDATE_GROUP_NAME",
};

export const AvailableEvents = Object.values(EventEnums);
