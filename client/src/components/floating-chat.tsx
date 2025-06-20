import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Send, X, User } from "lucide-react";
import { ChatMessage } from "@shared/schema";

interface Message extends ChatMessage {
  timestamp: Date;
}

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [username, setUsername] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [showNamePrompt, setShowNamePrompt] = useState(true);
  const socketRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateSessionId = () => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const connectWebSocket = (currentSessionId?: string) => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    socketRef.current = new WebSocket(wsUrl);

    socketRef.current.onopen = () => {
      console.log('User WebSocket connected');
      setIsConnected(true);
      
      // Join the session - use the passed sessionId or current sessionId
      const sessionToJoin = currentSessionId || sessionId;
      if (sessionToJoin) {
        console.log('Joining session:', sessionToJoin);
        socketRef.current?.send(JSON.stringify({
          type: 'join_session',
          sessionId: sessionToJoin
        }));
      }
    };

    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('User chat received WebSocket message:', data);
      
      if (data.type === 'new_message') {
        const message = data.payload;
        // Only add message if it belongs to this session
        if (message.sessionId === sessionId) {
          setMessages(prev => {
            // Check if message already exists to avoid duplicates
            const messageExists = prev.some(msg => 
              msg.id === message.id || 
              (msg.message === message.message && 
               msg.username === message.username && 
               Math.abs(new Date(msg.createdAt).getTime() - new Date(message.createdAt).getTime()) < 1000)
            );
            
            if (!messageExists) {
              return [...prev, {
                ...message,
                timestamp: new Date(message.createdAt)
              }];
            }
            return prev;
          });
        }
      }
      
      if (data.type === 'session_joined') {
        console.log('Joined session:', data.sessionId);
      }
    };

    socketRef.current.onclose = () => {
      console.log('User WebSocket disconnected');
      setIsConnected(false);
      // Attempt to reconnect after 3 seconds
      setTimeout(() => {
        if (sessionId) {
          connectWebSocket(sessionId);
        }
      }, 3000);
    };

    socketRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  };

  const handleStartChat = async () => {
    if (!username.trim()) return;

    const newSessionId = generateSessionId();
    setSessionId(newSessionId);

    try {
      // Create chat session
      const response = await fetch('/api/chat/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: newSessionId,
          username: username.trim(),
          isActive: true
        }),
      });

      if (response.ok) {
        setShowNamePrompt(false);
        
        // Load existing messages if any
        const messagesResponse = await fetch(`/api/chat/sessions/${newSessionId}/messages`);
        if (messagesResponse.ok) {
          const existingMessages = await messagesResponse.json();
          setMessages(existingMessages.map((msg: ChatMessage) => ({
            ...msg,
            timestamp: new Date(msg.createdAt)
          })));
        }
        
        // Connect WebSocket after session is created and messages loaded
        connectWebSocket(newSessionId);
      }
    } catch (error) {
      console.error('Error starting chat session:', error);
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !socketRef.current || !sessionId) return;

    const messageData = {
      sessionId,
      username,
      message: newMessage.trim(),
      isAdmin: false,
      userId: null
    };

    console.log('Sending user message:', messageData);

    socketRef.current.send(JSON.stringify({
      type: 'chat_message',
      payload: messageData
    }));

    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (showNamePrompt) {
        handleStartChat();
      } else {
        sendMessage();
      }
    }
  };

  const resetChat = () => {
    setMessages([]);
    setUsername("");
    setSessionId("");
    setShowNamePrompt(true);
    setIsConnected(false);
    if (socketRef.current) {
      socketRef.current.close();
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full btn-glow shadow-2xl z-40"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-80 h-96 bg-black/95 border-red-500/30 backdrop-blur-lg z-40">
          <CardHeader className="flex flex-row items-center justify-between p-4 border-b border-red-500/30">
            <CardTitle className="text-red-500 text-lg">
              {showNamePrompt ? "Live Support" : `Chat - ${username}`}
            </CardTitle>
            <div className="flex items-center gap-2">
              {!showNamePrompt && (
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 text-gray-400 hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0 h-80 flex flex-col">
            {showNamePrompt ? (
              // Name Input Screen
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <User className="w-12 h-12 text-red-500 mb-4" />
                <h3 className="text-white text-lg font-semibold mb-2">Welcome to Support</h3>
                <p className="text-gray-400 text-sm mb-6">Please enter your name to start chatting with our support team</p>
                
                <div className="w-full space-y-4">
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter your name..."
                    className="bg-gray-900/50 border-red-500/30 text-white placeholder-gray-500"
                    autoFocus
                  />
                  <Button 
                    onClick={handleStartChat}
                    disabled={!username.trim()}
                    className="w-full btn-glow"
                  >
                    Start Chat
                  </Button>
                </div>
              </div>
            ) : (
              // Chat Interface
              <>
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-400 text-sm mt-8">
                      <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>Start a conversation...</p>
                    </div>
                  ) : (
                    messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${message.isAdmin ? 'justify-start' : 'justify-end'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                            message.isAdmin
                              ? 'bg-red-500/20 text-white border border-red-500/30'
                              : 'bg-gray-700 text-white'
                          }`}
                        >
                          {message.isAdmin && (
                            <div className="text-red-400 text-xs font-medium mb-1">Support</div>
                          )}
                          <div>{message.message}</div>
                          <div className={`text-xs mt-1 opacity-60 ${message.isAdmin ? 'text-red-300' : 'text-gray-300'}`}>
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-red-500/30">
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className="flex-1 bg-gray-900/50 border-red-500/30 text-white placeholder-gray-500"
                      disabled={!isConnected}
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || !isConnected}
                      className="btn-glow px-3"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {!isConnected && (
                    <div className="text-xs text-red-400 mt-2 text-center">
                      Reconnecting...
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-500 mt-2 text-center">
                    <button onClick={resetChat} className="hover:text-red-400 transition-colors">
                      Start New Chat
                    </button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
}