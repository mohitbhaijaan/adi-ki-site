import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MessageCircle, X, Send } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChatMessage } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: messages = [] } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat/messages"],
    enabled: isOpen,
  });

  useEffect(() => {
    if (isOpen && !socket) {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("WebSocket connected");
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "new_message") {
          queryClient.setQueryData(["/api/chat/messages"], (old: ChatMessage[] = []) => [
            ...old,
            data.payload,
          ]);
        }
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected");
        setSocket(null);
      };

      setSocket(ws);
    }

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [isOpen, socket, queryClient]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !socket) return;

    const messageData = {
      type: "chat_message",
      payload: {
        userId: user?.id || null,
        username: user?.username || "Guest",
        message: message.trim(),
        isAdmin: user?.isAdmin || false,
      },
    };

    socket.send(JSON.stringify(messageData));
    setMessage("");
  };

  return (
    <>
      {/* Chat Modal */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-80 h-96 bg-black border-2 border-red-500 shadow-2xl z-50 animate-in slide-in-from-bottom-2">
          <CardHeader className="bg-gradient-to-r from-red-500 to-red-700 p-4 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-white font-semibold">Live Support</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-300 h-auto p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex flex-col h-full">
            <div className="flex-1 p-4 overflow-y-auto bg-gray-900 space-y-2">
              {messages.length === 0 ? (
                <div className="text-sm text-gray-400">
                  <div className="bg-red-500/20 p-2 rounded mb-2">
                    <strong className="text-red-400">System:</strong> Welcome! How can we help you today?
                  </div>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`text-sm ${
                      msg.isAdmin ? "bg-red-500/20" : "bg-gray-800"
                    } p-2 rounded`}
                  >
                    <strong className={msg.isAdmin ? "text-red-400" : "text-blue-400"}>
                      {msg.username}:
                    </strong>{" "}
                    <span className="text-white">{msg.message}</span>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={sendMessage} className="p-4 border-t border-red-500/30">
              <div className="flex space-x-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 bg-gray-800 border-red-500/30 text-white placeholder-gray-400 focus:border-red-500"
                />
                <Button type="submit" className="btn-glow">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full btn-glow animate-pulse-red shadow-lg"
      >
        <MessageCircle className="w-6 h-6" />
      </Button>
    </>
  );
}
