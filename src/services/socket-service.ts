import { io, Socket } from 'socket.io-client';

type EventHandler = (data: any) => void;

class SocketService {
  public socket: Socket | null;

  constructor() {
    this.socket = null;
    this.connect('https://api.webrtc.chambe.dev/');
  }

  connect(url: string): void {
    this.socket = io(url, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
    })

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
  }

  getSocketId(): string | undefined {
    return this.socket?.id;
  }

  emit(event: string, data: any): void {
    this.socket?.emit(event, data);
  }

  on(event: string, handler: EventHandler): void {
    this.socket?.on(event, handler);
  }

  disconnect(): void {
    this.socket?.disconnect();
  }
}

export const socketService = new SocketService();