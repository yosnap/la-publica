import { useState, useEffect } from "react";
import { Plus, MessageSquare, Eye, Clock, Users, Pin, Lock, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { PageWrapper } from "@/components/PageWrapper";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { fetchForums, getForumPosts, type Forum, type ForumPost } from "@/api/forums";
import { fetchForumCategories, type ForumCategory } from "@/api/forumCategories";
import { getImageUrl } from "@/utils/getImageUrl";
import { useNavigate } from "react-router-dom";

export default function Forums() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [forums, setForums] = useState<Forum[]>([]);
  const [recentPosts, setRecentPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  useEffect(() => {
    loadData();
  }, [selectedCategory, searchTerm]);

  const loadData = async () => {
    try {
      setLoading(true);
      
       // Cargar categorías
      const categoriesResponse = await fetchForumCategories();
      if (categoriesResponse.success) {
        setCategories(categoriesResponse.data);
      }

       // Cargar foros
      const forumsResponse = await fetchForums({
        categoryId: selectedCategory || undefined,
        search: searchTerm || undefined,
        limit: 20
      });
      if (forumsResponse.success) {
        setForums(forumsResponse.data);
      }

    } catch (error) {
      console.error('Error loading forums data:', error);
      toast.error('Error en carregar les dades dels fòrums');
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - then.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'ahora mismo';
    if (diffInMinutes < 60) return `hace ${diffInMinutes} min`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `hace ${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `hace ${diffInDays}d`;
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'MessageCircle': return MessageSquare;
      case 'Users': return Users;
      default: return MessageSquare;
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Skeleton className="w-12 h-12 rounded-lg" />
                    <div className="flex-1">
                      <Skeleton className="h-6 w-48 mb-2" />
                      <Skeleton className="h-4 w-full mb-3" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="space-y-6">
        { /* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Foros de Discusión</h1>
            <p className="text-gray-600">Participa en conversaciones de la comunidad</p>
          </div>
          <Button 
            className="bg-primary hover:bg-primary/90"
            onClick={() => navigate('/forums/new-post')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Tema
          </Button>
        </div>

        { /* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1 /2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar en los foros..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">Todas las categorías</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        { /* Forums List */}
        <div className="grid gap-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {selectedCategory ? 'Foros Filtrados' : 'Todos los Foros'}
          </h2>
          <div className="space-y-4">
            {forums.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No se encontraron foros</p>
                  <p className="text-sm text-gray-400 mt-1">
                    {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Aún no hay foros creados'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              forums.map((forum) => {
                const IconComponent = getIconComponent(forum.category.icon);
                return (
                  <Card 
                    key={forum._id} 
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigate(`/forums/${forum._id}`)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div 
                            className="w-12 h-12 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: forum.category.color }}
                          >
                            <IconComponent className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900">{forum.name}</h3>
                              {forum.isPinned && <Pin className="h-4 w-4 text-primary" />}
                              {forum.isLocked && <Lock className="h-4 w-4 text-gray-400" />}
                            </div>
                            <p className="text-gray-600 text-sm mb-2">{forum.description}</p>
                            <Badge variant="secondary" className="text-xs mb-3">
                              {forum.category.name}
                            </Badge>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span className="flex items-center">
                                <MessageSquare className="h-4 w-4 mr-1" />
                                {forum.postCount} posts
                              </span>
                              <span className="flex items-center">
                                <Users className="h-4 w-4 mr-1" />
                                {forum.moderators.length + 1} moderadores
                              </span>
                            </div>
                          </div>
                        </div>
                        {forum.lastPost && forum.lastPost.author && (
                          <div className="text-right min-w-0 ml-4">
                            <p className="text-sm font-medium text-gray-900 truncate max-w-48">
                              {forum.lastPost.title}
                            </p>
                            <div className="flex items-center justify-end space-x-2 mt-1">
                              <Avatar className="h-5 w-5">
                                <AvatarImage src={forum.lastPost.author.profilePicture ? getImageUrl(forum.lastPost.author.profilePicture) : undefined} />
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-xs">
                                  {forum.lastPost.author.firstName?.[0] || '?'}{forum.lastPost.author.lastName?.[0] || '?'}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs text-gray-500">
                                {forum.lastPost.author.firstName} {forum.lastPost.author.lastName}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatTimeAgo(forum.lastPost.createdAt)}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>

      </div>
    </PageWrapper>
  );
}
