import type { Namespace, Socket } from "socket.io";
import { CONNECTION_EVENTS } from "../../common/socket";

/**
 * Events emitted from client to server in the admin namespace
 * These events are triggered by admin clients and handled on the server
 */
export type ClientToServerEventsAdmin = {
  [CONNECTION_EVENTS.ADMIN]: (msg: string) => void;
};

/**
 * Typed Socket.IO socket for admin namespace
 * Provides type-safe event handlers for admin-specific operations
 */
export type AdminSocket = Socket<ClientToServerEventsAdmin>;

/**
 * Typed Socket.IO namespace for admin functionality
 * Used to initialize and manage the admin namespace with type-safe event definitions
 */
export type AdminNamespace = Namespace<ClientToServerEventsAdmin>;
