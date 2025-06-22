import { Heart, MessageSquare, Share, MoreHorizontal, Camera, Users, Calendar, User, BookOpen, CheckCircle, Activity, Clock, Play, Building, UserPlus, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

const Dashboard = () => {
  const activities = [
    {
      id: 1,
      user: {
        name: "John",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
        username: "@john"
      },
      type: "job",
      content: "This is new job",
      timestamp: "2 hours ago",
      likes: 0,
      comments: 0,
      jobTitle: "View Job"
    },
    {
      id: 2,
      user: {
        name: "John",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
        username: "@john"
      },
      type: "post",
      content: "John posted an update",
      timestamp: "2 years ago",
      likes: 0,
      comments: 0,
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop",
      hasVideo: true
    }
  ];

  const blogPosts = [
    { 
      title: "Tackle Your closet Spring cleaning", 
      date: "May 14, 2019", 
      image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=100&h=100&fit=crop",
      category: "lifestyle"
    },
    { 
      title: "The Truth About Business Blogging", 
      date: "May 14, 2019", 
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      category: "business"
    },
    { 
      title: "10 Tips to stay healthy when...", 
      date: "May 14, 2019", 
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&h=100&fit=crop",
      category: "health"
    },
    { 
      title: "Visiting Amsterdam on a Budget", 
      date: "May 8, 2019", 
      image: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=100&h=100&fit=crop",
      category: "travel"
    },
    { 
      title: "OMA completes renovation of Sotheby's New...", 
      date: "May 8, 2019", 
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop",
      category: "architecture"
    }
  ];

  const myGroups = [
    { 
      name: "Desarrolladores React", 
      members: 234, 
      image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=60&h=60&fit=crop",
      isPrivate: false 
    },
    { 
      name: "Marketing Digital", 
      members: 156, 
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=60&h=60&fit=crop",
      isPrivate: true 
    },
    { 
      name: "Emprendedores Tech", 
      members: 89, 
      image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=60&h=60&fit=crop",
      isPrivate: false 
    }
  ];

  const companies = [
    { 
      name: "Google Inc.", 
      employees: "100k+", 
      logo: "https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=60&h=60&fit=crop",
      industry: "Technology" 
    },
    { 
      name: "Microsoft Corp.", 
      employees: "200k+", 
      logo: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=60&h=60&fit=crop",
      industry: "Software" 
    },
    { 
      name: "Tesla Inc.", 
      employees: "50k+", 
      logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=60&h=60&fit=crop",
      industry: "Automotive" 
    }
  ];

  const collaborators = [
    { 
      name: "Alice Johnson", 
      role: "Frontend Developer", 
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=60&h=60&fit=crop&crop=face",
      status: "online" 
    },
    { 
      name: "Bob Smith", 
      role: "UX Designer", 
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&h=60&fit=crop&crop=face",
      status: "offline" 
    },
    { 
      name: "Carol Davis", 
      role: "Product Manager", 
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face",
      status: "online" 
    }
  ];

  const followingUsers = [
    { name: "Alice", avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face" },
    { name: "Bob", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face" },
    { name: "Carol", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face" },
    { name: "David", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face" },
    { name: "Eve", avatar: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=40&h=40&fit=crop&crop=face" },
    { name: "Frank", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face" },
    { name: "Grace", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face" },
    { name: "Henry", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=40&h=40&fit=crop&crop=face" },
    { name: "Ivy", avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=40&h=40&fit=crop&crop=face" },
    { name: "Jack", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face" }
  ];

  const latestUpdates = [
    {
      user: {
        name: "John",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
      },
      action: "posted an update",
      time: "3 years ago"
    },
    {
      user: {
        name: "Adele",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face"
      },
      action: "posted an update",
      time: "3 years ago"
    },
    {
      user: {
        name: "John",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
      },
      action: "posted an update",
      time: "4 years ago"
    },
    {
      user: {
        name: "John",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
      },
      action: "posted an update in the group",
      group: "Coffee Addicts",
      time: "4 years ago"
    },
    {
      user: {
        name: "John",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
      },
      action: "posted an update",
      time: "4 years ago"
    }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Columna Izquierda - Widgets */}
          <div className="lg:col-span-3 space-y-6">
            {/* Mis Grupos Widget */}
            <Card className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-blue-500" />
                    Mis Grupos
                  </div>
                  <Button variant="ghost" size="sm" className="text-xs text-gray-500 hover:text-blue-600">
                    Ver todos
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {myGroups.map((group, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={group.image} alt={group.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{group.name}</p>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">{group.members} miembros</span>
                        {group.isPrivate && (
                          <Badge variant="secondary" className="text-xs">Privado</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Blog Widget */}
            <Card className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-orange-500" />
                  Blog
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {blogPosts.slice(0, 4).map((post, index) => (
                  <div key={index} className="flex items-start space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg">
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-tight">{post.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{post.date}</p>
                    </div>
                  </div>
                ))}
                <Button variant="ghost" size="sm" className="w-full text-gray-600 mt-4 hover:bg-gray-100">
                  VER TODOS
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Columna Central - Activity Feed */}
          <div className="lg:col-span-6 space-y-6">
            {/* Header */}
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Activity Feed</h1>
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                <span className="cursor-pointer hover:text-gray-900">Show all updates</span>
                <span>·</span>
                <span className="cursor-pointer hover:text-gray-900">by new posts</span>
              </div>
            </div>

            {/* Crear Post */}
            <Card className="bg-white rounded-xl border border-gray-100 shadow-sm">
              <CardContent className="p-6">
                <div className="flex space-x-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" />
                    <AvatarFallback>J</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Textarea
                      placeholder="Share what's on your mind, John..."
                      className="min-h-[60px] border-0 bg-gray-50 resize-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 rounded-lg"
                    />
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" className="text-gray-500 hover:bg-gray-100 rounded-lg p-2">
                          <Camera className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-gray-500 hover:bg-gray-100 rounded-lg p-2">
                          <Users className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-gray-500 hover:bg-gray-100 rounded-lg p-2">
                          <BookOpen className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-gray-500 hover:bg-gray-100 rounded-lg p-2">
                          <Calendar className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feed de Actividades */}
            <div className="space-y-6">
              {activities.map((activity) => (
                <Card key={activity.id} className="bg-white rounded-xl border border-gray-100 shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={activity.user.avatar} />
                          <AvatarFallback>{activity.user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-gray-900">{activity.user.name}</span>
                            <span className="text-gray-500 text-sm">{activity.content}</span>
                          </div>
                          <span className="text-gray-500 text-sm">{activity.timestamp}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {activity.jobTitle && (
                      <div className="mb-4 p-3 bg-orange-50 rounded-lg border border-orange-100">
                        <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700">
                          {activity.jobTitle}
                        </Button>
                      </div>
                    )}
                    {activity.image && (
                      <div className="mb-4 relative">
                        <img
                          src={activity.image}
                          alt="Post content"
                          className="w-full h-64 object-cover rounded-lg"
                        />
                        {activity.hasVideo && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Button size="lg" className="rounded-full bg-white/90 hover:bg-white text-gray-900 w-16 h-16">
                              <Play className="h-6 w-6 ml-1" />
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex items-center space-x-6 pt-2">
                      <Button variant="ghost" size="sm" className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Heart className="h-4 w-4 mr-2" />
                        Like
                      </Button>
                      <Button variant="ghost" size="sm" className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Comment
                      </Button>
                      <Button variant="ghost" size="sm" className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Share className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Columna Derecha - Widgets */}
          <div className="lg:col-span-3 space-y-6">
            {/* Complete Profile Widget - Mejorado */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-500" />
                  Completa tu Perfil
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative w-20 h-20 mx-auto">
                    <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="3"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="3"
                        strokeDasharray="73, 100"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl font-bold text-gray-900">73<span className="text-sm">%</span></span>
                    </div>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-white/50">
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-gray-900">Información General</span>
                      </div>
                      <span className="text-green-600 font-medium">5/5</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-white/50">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-orange-500 mr-2" />
                        <span className="text-gray-600">Experiencia Laboral</span>
                      </div>
                      <span className="text-orange-600 font-medium">1/3</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-white/50">
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-gray-900">Foto de Perfil</span>
                      </div>
                      <span className="text-green-600 font-medium">1/1</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-white/50">
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-gray-900">Foto de Portada</span>
                      </div>
                      <span className="text-green-600 font-medium">1/1</span>
                    </div>
                  </div>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-4">
                    <Settings className="h-4 w-4 mr-2" />
                    Completar Perfil
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Empresas Widget */}
            <Card className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center justify-between">
                  <div className="flex items-center">
                    <Building className="h-5 w-5 mr-2 text-purple-500" />
                    Empresas
                  </div>
                  <Button variant="ghost" size="sm" className="text-xs text-gray-500 hover:text-purple-600">
                    Ver todas
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {companies.map((company, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                      <img src={company.logo} alt={company.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{company.name}</p>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">{company.employees} empleados</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">{company.industry}</span>
                      </div>
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full mt-3 border-purple-200 text-purple-600 hover:bg-purple-50">
                  <Building className="h-4 w-4 mr-2" />
                  Explorar Empresas
                </Button>
              </CardContent>
            </Card>

            {/* Colaboradores Widget */}
            <Card className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center justify-between">
                  <div className="flex items-center">
                    <UserPlus className="h-5 w-5 mr-2 text-green-500" />
                    Colaboradores
                  </div>
                  <Button variant="ghost" size="sm" className="text-xs text-gray-500 hover:text-green-600">
                    Ver todos
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {collaborators.map((collaborator, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={collaborator.avatar} />
                        <AvatarFallback>{collaborator.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                        collaborator.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                      }`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{collaborator.name}</p>
                      <p className="text-xs text-gray-500 truncate">{collaborator.role}</p>
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full mt-3 border-green-200 text-green-600 hover:bg-green-50">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invitar Colaboradores
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
