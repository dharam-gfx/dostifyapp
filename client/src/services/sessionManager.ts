import { Socket } from 'socket.io-client';

interface SessionData {
  roomId: string;
  userId: string;
  userName: string;
  lastActive: number;
}

class SessionManager {
  private static instance: SessionManager;
  private sessionData: SessionData | null = null;
  private socket: Socket | null = null;

  private constructor() { }

  static getInstance(): SessionManager {
    if ( !SessionManager.instance ) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  initSession( roomId: string, userId: string, userName: string, socket: Socket ): void {
    this.sessionData = {
      roomId,
      userId,
      userName,
      lastActive: Date.now()
    };
    this.socket = socket;
    this.updateLastActive();
    this.startActivityTracking();
  }

  private startActivityTracking(): void {
    // Update last active time on user interaction
    ['click', 'keypress', 'mousemove', 'touchstart'].forEach( event => {
      window.addEventListener( event, () => this.updateLastActive() );
    } );
  }

  updateLastActive(): void {
    if ( this.sessionData ) {
      this.sessionData.lastActive = Date.now();
      localStorage.setItem( 'lastActive', Date.now().toString() );
    }
  }

  getSessionInfo(): SessionData | null {
    return this.sessionData;
  }

  isSessionActive(): boolean {
    if ( !this.sessionData ) return false;

    const inactiveThreshold = 30 * 60 * 1000; // 30 minutes
    const timeSinceLastActive = Date.now() - this.sessionData.lastActive;
    return timeSinceLastActive < inactiveThreshold;
  }

  clearSession(): void {
    if ( this.socket && this.sessionData ) {
      // Notify server about session end
      this.socket.emit( 'leave-room', {
        roomId: this.sessionData.roomId,
        userName: this.sessionData.userName
      } );
    }
    this.sessionData = null;
    localStorage.removeItem( 'lastActive' );
  }
}

export default SessionManager.getInstance();