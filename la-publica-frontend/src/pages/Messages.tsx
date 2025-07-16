
import { Send, Search, Phone, Video, MoreVertical, Paperclip, Smile } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

const Messages = () => {
  const [selectedChat, setSelectedChat] = useState(1);
  const [newMessage, setNewMessage] = useState("");

  const conversations = [
    {
      id: 1,
      user: {
        name: "María González",
        avatar: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=100&h=100&fit=crop&crop=face",
        status: "online"
      },
      lastMessage: "¡Genial! Me parece perfecto para el proyecto",
      timestamp: "hace 5 min",
      unread: 2,
      isActive: true
    },
    {
      id: 2,
      user: {
        name: "Carlos Ruiz",
        avatar: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=100&h=100&fit=crop&crop=face",
        status: "away"
      },
      lastMessage: "¿Podemos revisar el código mañana?",
      timestamp: "hace 1 hora",
      unread: 0,
      isActive: false
    },
    {
      id: 3,
      user: {
        name: "Ana Martínez",
        avatar: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=100&h=100&fit=crop&crop=face",
        status: "offline"
      },
      lastMessage: "Perfecto, nos vemos en la reunión",
      timestamp: "hace 2 horas",
      unread: 1,
      isActive: false
    },
    {
      id: 4,
      user: {
        name: "Luis Herrera",
        avatar: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=100&h=100&fit=crop&crop=face",
        status: "online"
      },
      lastMessage: "Excelente trabajo en la presentación",
      timestamp: "ayer",
      unread: 0,
      isActive: false
    }
  ];

  const messages = [
    {
      id: 1,
      sender: "María González",
      content: "Hola! ¿Cómo vas con el nuevo proyecto?",
      timestamp: "14:30",
      isOwn: false
    },
    {
      id: 2,
      sender: "Tú",
      content: "¡Hola María! Todo va muy bien, ya tengo el diseño casi listo",
      timestamp: "14:32",
      isOwn: true
    },
    {
      id: 3,
      sender: "María González",
      content: "Eso suena genial. ¿Podrías enviarme una vista previa?",
      timestamp: "14:33",
      isOwn: false
    },
    {
      id: 4,
      sender: "Tú",
      content: "¡Por supuesto! Te lo envío en unos minutos",
      timestamp: "14:35",
      isOwn: true
    },
    {
      id: 5,
      sender: "María González",
      content: "¡Genial! Me parece perfecto para el proyecto",
      timestamp: "14:40",
      isOwn: false
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "away":
        return "bg-yellow-500";
      default:
        return "bg-gray-400";
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      console.log("Sending message:", newMessage);
      setNewMessage("");
    }
  };

  const selectedConversation = conversations.find(conv => conv.id === selectedChat);

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-200px)]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
        { /* Lista de Conversaciones */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="shadow-sm border-0 bg-white dark:bg-gray-800/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Mensajes</h2>
                <Button size="sm" variant="outline">
                  Nuevo Chat
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1 /2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar conversaciones..."
                  className="pl-10 bg-gray-50 dark:bg-gray-700 /50 border-0 focus:bg-white dark:bg-gray-800/50 focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-0 bg-white dark:bg-gray-800/50 flex-1">
            <CardContent className="p-0">
              <div className="space-y-1 max-h-[500px] overflow-y-auto">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => setSelectedChat(conversation.id)}
                    className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
                      selectedChat === conversation.id ? 'bg-primary/5 border-r-2 border-primary' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={conversation.user.avatar} />
                          <AvatarFallback>{conversation.user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(conversation.user.status)}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {conversation.user.name}
                          </p>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">{conversation.timestamp}</span>
                            {conversation.unread > 0 && (
                              <Badge className="bg-primary text-white h-5 w-5 p-0 text-xs flex items-center justify-center">
                                {conversation.unread}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-1">
                          {conversation.lastMessage}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        { /* Chat Activo */}
        <div className="lg:col-span-8">
          <Card className="shadow-sm border-0 bg-white dark:bg-gray-800/50 h-full flex flex-col">
            { /* Header del Chat */}
            <CardHeader className="border-b border-gray-100 dark:border-gray-700 pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedConversation?.user.avatar} />
                      <AvatarFallback>{selectedConversation?.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(selectedConversation?.user.status || 'offline')}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{selectedConversation?.user.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{selectedConversation?.user.status}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            { /* Mensajes */}
            <CardContent className="flex-1 p-4 overflow-y-auto space-y-4 max-h-[400px]">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md ${message.isOwn ? 'order-2' : 'order-1'}`}>
                    {!message.isOwn && (
                      <div className="flex items-center space-x-2 mb-1">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={selectedConversation?.user.avatar} />
                          <AvatarFallback className="text-xs">{message.sender.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{message.sender}</span>
                      </div>
                    )}
                    <div
                      className={`rounded-lg px-4 py-2 ${
                        message.isOwn
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                    <div className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'} mt-1`}>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{message.timestamp}</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>

            { /* Input para nuevo mensaje */}
            <div className="border-t border-gray-100 dark:border-gray-700 p-4">
              <div className="flex items-end space-x-2">
                <Button variant="ghost" size="sm" className="mb-2">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <div className="flex-1">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Escribe un mensaje..."
                    className="min-h-[40px] max-h-[120px] resize-none border-0 bg-gray-50 dark:bg-gray-700 /50 focus:bg-white dark:bg-gray-800/50 focus:ring-2 focus:ring-primary/20"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                </div>
                <div className="flex items-center space-x-1 mb-2">
                  <Button variant="ghost" size="sm">
                    <Smile className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="bg-primary hover:bg-primary/90 text-white"
                    size="sm"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Messages;
