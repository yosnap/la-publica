import { useState } from "react";
import { Plus, MessageSquare, Eye, Clock, Users, Pin, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { PageWrapper } from "@/components/PageWrapper";

const forumCategories = [
  {
    id: 1,
    name: "Discusión General",
    description: "Conversaciones generales de la comunidad",
    topics: 45,
    posts: 342,
    lastPost: {
      title: "Bienvenidos al nuevo foro",
      author: "Ana García",
      time: "hace 2 horas",
      avatar: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=40&h=40&fit=crop&crop=face"
    },
    color: "bg-blue-500"
  },
  {
    id: 2,
    name: "Ayuda y Soporte",
    description: "Resuelve tus dudas y obtén ayuda",
    topics: 23,
    posts: 156,
    lastPost: {
      title: "¿Cómo cambiar mi contraseña?",
      author: "Carlos López",
      time: "hace 1 día",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
    },
    color: "bg-green-500"
  },
  {
    id: 3,
    name: "Anuncios",
    description: "Noticias y anuncios oficiales",
    topics: 12,
    posts: 89,
    lastPost: {
      title: "Nuevas funcionalidades disponibles",
      author: "Equipo Admin",
      time: "hace 3 días",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face"
    },
    color: "bg-red-500"
  },
  {
    id: 4,
    name: "Networking",
    description: "Conecta con otros profesionales",
    topics: 67,
    posts: 234,
    lastPost: {
      title: "Evento de networking virtual",
      author: "María Rodríguez",
      time: "hace 5 horas",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face"
    },
    color: "bg-purple-500"
  }
];

const recentTopics = [
  {
    id: 1,
    title: "Mejores prácticas para el networking online",
    author: "Pedro Martínez",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
    category: "Networking",
    replies: 12,
    views: 89,
    lastActivity: "hace 30 min",
    isPinned: true,
    isLocked: false
  },
  {
    id: 2,
    title: "¿Cómo optimizar mi perfil profesional?",
    author: "Laura Sánchez",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face",
    category: "Ayuda y Soporte",
    replies: 8,
    views: 45,
    lastActivity: "hace 1 hora",
    isPinned: false,
    isLocked: false
  },
  {
    id: 3,
    title: "Nueva función de mensajes privados",
    author: "Admin",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face",
    category: "Anuncios",
    replies: 15,
    views: 234,
    lastActivity: "hace 2 horas",
    isPinned: true,
    isLocked: true
  }
];

export default function Forums() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Foros de Discusión</h1>
            <p className="text-gray-600">Participa en conversaciones de la comunidad</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Tema
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Input
            placeholder="Buscar en los foros..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-4"
          />
        </div>

        {/* Forum Categories */}
        <div className="grid gap-4">
          <h2 className="text-lg font-semibold text-gray-900">Categorías del Foro</h2>
          <div className="space-y-4">
            {forumCategories.map((category) => (
              <Card key={category.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center`}>
                        <MessageSquare className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                        <p className="text-gray-600 text-sm mb-3">{category.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            {category.topics} temas
                          </span>
                          <span>{category.posts} posts</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right min-w-0 ml-4">
                      <p className="text-sm font-medium text-gray-900 truncate">{category.lastPost.title}</p>
                      <div className="flex items-center justify-end space-x-2 mt-1">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={category.lastPost.avatar} />
                          <AvatarFallback>{category.lastPost.author[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-gray-500">{category.lastPost.author}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{category.lastPost.time}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Topics */}
        <div className="grid gap-4">
          <h2 className="text-lg font-semibold text-gray-900">Temas Recientes</h2>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-200">
                {recentTopics.map((topic) => (
                  <div key={topic.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={topic.avatar} />
                          <AvatarFallback>{topic.author[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            {topic.isPinned && <Pin className="h-4 w-4 text-primary" />}
                            {topic.isLocked && <Lock className="h-4 w-4 text-gray-400" />}
                            <h3 className="font-medium text-gray-900 hover:text-primary cursor-pointer">
                              {topic.title}
                            </h3>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>por {topic.author}</span>
                            <Badge variant="secondary" className="text-xs">
                              {topic.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <div className="text-center">
                          <div className="flex items-center space-x-1">
                            <MessageSquare className="h-4 w-4" />
                            <span>{topic.replies}</span>
                          </div>
                          <span className="text-xs">respuestas</span>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center space-x-1">
                            <Eye className="h-4 w-4" />
                            <span>{topic.views}</span>
                          </div>
                          <span className="text-xs">vistas</span>
                        </div>
                        <div className="text-center min-w-0">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span className="truncate">{topic.lastActivity}</span>
                          </div>
                          <span className="text-xs">última actividad</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
}
