export const paths = {
  // Catch-all route for Better Auth's own endpoints (sign-in, sign-up, session, etc.) — Express 5 syntax
  auth: {
    all: "/api/auth/*splat",
  },
  chats: {
    list: "/chats",
    messagesByChatId: "/chats/:chatId/messages",
  },
  metrics: {
    logs: "/metrics/logs",
  },
  users: {
    list: "/users",
  },
};
