import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';
import { log } from './vite';

interface Client {
  id: string;
  ws: WebSocket;
  userId: number;
  room?: string;
}

class WebSocketManager {
  private wss: WebSocketServer;
  private clients: Map<string, Client> = new Map();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server, path: '/ws' });
    this.setupWebSocketServer();
  }

  private setupWebSocketServer() {
    this.wss.on('connection', (ws: WebSocket) => {
      const clientId = Math.random().toString(36).substring(7);
      
      ws.on('message', (message: string) => {
        try {
          const data = JSON.parse(message.toString());
          this.handleMessage(clientId, data);
        } catch (error) {
          log(`WebSocket message parse error: ${error}`);
        }
      });

      ws.on('close', () => {
        const client = this.clients.get(clientId);
        if (client?.room) {
          this.broadcastToRoom(client.room, {
            type: 'user_left',
            userId: client.userId,
            room: client.room
          }, client.id);
        }
        this.clients.delete(clientId);
      });
    });
  }

  private handleMessage(clientId: string, data: any) {
    switch (data.type) {
      case 'join':
        this.handleJoin(clientId, data);
        break;
      case 'note_update':
        this.handleNoteUpdate(clientId, data);
        break;
      case 'task_update':
        this.handleTaskUpdate(clientId, data);
        break;
      default:
        log(`Unknown message type: ${data.type}`);
    }
  }

  private handleJoin(clientId: string, data: { userId: number; room: string }) {
    const client: Client = {
      id: clientId,
      ws: this.clients.get(clientId)?.ws!,
      userId: data.userId,
      room: data.room
    };
    
    this.clients.set(clientId, client);
    
    this.broadcastToRoom(data.room, {
      type: 'user_joined',
      userId: data.userId,
      room: data.room
    }, clientId);
  }

  private handleNoteUpdate(clientId: string, data: { noteId: number; content: string; room: string }) {
    this.broadcastToRoom(data.room, {
      type: 'note_updated',
      ...data
    }, clientId);
  }

  private handleTaskUpdate(clientId: string, data: { taskId: number; status: string; room: string }) {
    this.broadcastToRoom(data.room, {
      type: 'task_updated',
      ...data
    }, clientId);
  }

  private broadcastToRoom(room: string, message: any, excludeClientId?: string) {
    this.clients.forEach((client, id) => {
      if (client.room === room && id !== excludeClientId) {
        client.ws.send(JSON.stringify(message));
      }
    });
  }
}

export function setupWebSockets(server: Server) {
  return new WebSocketManager(server);
}
