/**
 * Types related to user presence and events
 */

export interface UserLeavingEvent {
  userId: string;
  timestamp: string;
}

export interface UserJoiningEvent {
  userId: string;
  timestamp: string;
}

export interface UserConnectionEvent {
  userId: string;
  isConnected: boolean;
  timestamp: string;
}
