import { Client} from "@stomp/stompjs";
import  type { IMessage} from "@stomp/stompjs";
import SockJS from "sockjs-client";

type OnMessageFn = (msg: IMessage) => void;

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/albumartistaapi';

export function createStompClient(params: {
  baseUrl: string;          
  token?: string;          
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (err: unknown) => void;
}) {
  const { baseUrl = BASE_URL, token, onConnect, onDisconnect, onError } = params;

  const wsEndpoint = `${baseUrl}/ws`;

  const client = new Client({
    webSocketFactory: () => new SockJS(wsEndpoint),
    reconnectDelay: 3000,
    connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
    debug: () => {}, 
    onConnect: () => onConnect?.(),
    onDisconnect: () => onDisconnect?.(),
    onStompError: (frame) => {
      onError?.(frame.headers["message"] ?? frame.body);
    },
    onWebSocketError: (evt) => onError?.(evt),
  });

  function subscribe(topic: string, onMessage: OnMessageFn) {
    // Ex: topic "/topic/updates"
    return client.subscribe(topic, onMessage);
  }

  function publish(destination: string, body: unknown) {
    // Ex: destination "/app/chat"
    client.publish({
      destination,
      body: JSON.stringify(body),
    });
  }

  return { client, subscribe, publish };
}
