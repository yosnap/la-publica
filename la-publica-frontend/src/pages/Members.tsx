import { useState, useEffect } from "react";
import { Users, MessageSquare, UserPlus, UserMinus, Filter, Search, MoreHorizontal, Grid, List, User, TrendingUp, UserCheck, UserX, Clock, Edit, Radio, CheckCircle, XCircle, Send, Inbox, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageWrapper } from "@/components/PageWrapper";
import { toast } from "sonner";
import { getImageUrl } from "@/utils/getImageUrl";
import { useUserProfile } from "@/hooks/useUser";
import { fetchAllUsers, toggleFollowUser, sendUserMessage, User } from "@/api/users";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LatestUpdatesWidget } from "@/components/LatestUpdatesWidget";
import { useNavigate } from "react-router-dom";


interface Group {
  _id: string;
  name: string;
  memberCount: number;
  avatar?: string;
}

const MOCK_GROUPS: Group[] = [
  { _id: '1', name: 'Mountain Riders', memberCount: 20, avatar: '/placeholder-group.jpg' },
  { _id: '2', name: 'Graphic Design', memberCount: 20, avatar: '/placeholder-group.jpg' },
  { _id: '3', name: 'Nature Lovers', memberCount: 19, avatar: '/placeholder-group.jpg' },
  { _id: '4', name: 'Coffee Addicts', memberCount: 19, avatar: '/placeholder-group.jpg' },
  { _id: '5', name: 'Architecture', memberCount: 17, avatar: '/placeholder-group.jpg' },
];

export default function Members() {
  const navigate = useNavigate();
  const { user: currentUser } = useUserProfile();
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");
  const [activeTab, setActiveTab] = useState<"all" | "connections" | "following" | "followers">("all");
  const [activeMemberFilter, setActiveMemberFilter] = useState<"newest" | "active" | "popular">("newest");
  const [activeGroupFilter, setActiveGroupFilter] = useState<"newest" | "active" | "popular">("newest");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingConnections, setPendingConnections] = useState<string[]>([]); // Solicitudes que yo envié
  const [acceptedConnections, setAcceptedConnections] = useState<string[]>([]); // Conexiones aceptadas (bidireccional)
  const [rejectedConnections, setRejectedConnections] = useState<string[]>([]); // Conexiones rechazadas (no pueden volver a invitar)
  const [incomingConnections, setIncomingConnections] = useState<string[]>([]); // Solicitudes que me enviaron a mí
  
  // Estado global simulado para todas las conexiones (simula base de datos)
  const [globalConnections, setGlobalConnections] = useState<{
    [userId: string]: {
      accepted: string[];
      pendingOut: string[]; // Solicitudes que este usuario envió
      pendingIn: string[];  // Solicitudes que este usuario recibió
      rejected: string[];
    }
  }>({});
  const [activeConnectionTab, setActiveConnectionTab] = useState<"accepted" | "pending" | "rejected">("accepted");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    loadUsers();
  }, [activeMemberFilter, searchTerm]);

  // Initialize global connections state and sync with local state
  useEffect(() => {
    if (users.length > 0 && currentUser) {
      // Initialize global connections if not exists
      setGlobalConnections(prev => {
        const newGlobal = { ...prev };
        
        // Initialize current user if not exists
        if (!newGlobal[currentUser._id]) {
          newGlobal[currentUser._id] = {
            accepted: [users[1]?._id, users[2]?._id].filter(Boolean),
            pendingOut: [users[3]?._id].filter(Boolean),
            pendingIn: [users[5]?._id].filter(Boolean),
            rejected: [users[4]?._id].filter(Boolean)
          };
        }
        
        // Initialize other users
        users.forEach(user => {
          if (!newGlobal[user._id]) {
            newGlobal[user._id] = {
              accepted: [],
              pendingOut: [],
              pendingIn: [],
              rejected: []
            };
          }
        });
        
        // Sync bidirectional connections
        if (newGlobal[currentUser._id]) {
          // For each accepted connection, ensure it's bidirectional
          newGlobal[currentUser._id].accepted.forEach(connectedUserId => {
            if (newGlobal[connectedUserId] && !newGlobal[connectedUserId].accepted.includes(currentUser._id)) {
              newGlobal[connectedUserId].accepted.push(currentUser._id);
            }
          });
          
          // For each outgoing request, add as incoming to the other user
          newGlobal[currentUser._id].pendingOut.forEach(targetUserId => {
            if (newGlobal[targetUserId] && !newGlobal[targetUserId].pendingIn.includes(currentUser._id)) {
              newGlobal[targetUserId].pendingIn.push(currentUser._id);
            }
          });
          
          // For each incoming request, add as outgoing from the other user
          newGlobal[currentUser._id].pendingIn.forEach(fromUserId => {
            if (newGlobal[fromUserId] && !newGlobal[fromUserId].pendingOut.includes(currentUser._id)) {
              newGlobal[fromUserId].pendingOut.push(currentUser._id);
            }
          });
        }
        
        return newGlobal;
      });
    }
  }, [users, currentUser]);

  // Sync local state with global state for current user
  useEffect(() => {
    if (currentUser && globalConnections[currentUser._id]) {
      const myConnections = globalConnections[currentUser._id];
      setAcceptedConnections(myConnections.accepted);
      setPendingConnections(myConnections.pendingOut);
      setIncomingConnections(myConnections.pendingIn);
      setRejectedConnections(myConnections.rejected);
    }
  }, [globalConnections, currentUser]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await fetchAllUsers({
        sortBy: activeMemberFilter,
        search: searchTerm
      });
      setUsers(response.data || []);
    } catch (error: any) {
      console.error('Error loading users:', error);
      toast.error('Error al carregar els usuaris');
    } finally {
      setLoading(false);
    }
  };

  const handleFollowUser = async (userId: string) => {
    try {
      const response = await toggleFollowUser(userId);
      toast.success(response.message || 'Estat de seguiment actualitzat');
      // Reload users to update follow state
      await loadUsers();
    } catch (error: any) {
      console.error('Error following user:', error);
      toast.error('Error en actualitzar l\'estat de seguiment');
    }
  };

  const handleSendMessage = async (userId: string) => {
    // For now, just show a placeholder
    toast.info('Sistema de missatges per implementar');
  };

  const handleConnectUser = async (userId: string) => {
    try {
      if (!currentUser) return;
      
      const status = getConnectionStatus(userId);
      
      setGlobalConnections(prev => {
        const newGlobal = { ...prev };
        
        // Ensure both users exist in global state
        if (!newGlobal[currentUser._id]) {
          newGlobal[currentUser._id] = { accepted: [], pendingOut: [], pendingIn: [], rejected: [] };
        }
        if (!newGlobal[userId]) {
          newGlobal[userId] = { accepted: [], pendingOut: [], pendingIn: [], rejected: [] };
        }
        
        if (status === 'connected') {
          // Disconnect - remove from both users' accepted lists
          newGlobal[currentUser._id].accepted = newGlobal[currentUser._id].accepted.filter(id => id !== userId);
          newGlobal[userId].accepted = newGlobal[userId].accepted.filter(id => id !== currentUser._id);
          toast.success('Connexió eliminada');
        } 
        else if (status === 'pending') {
          // Cancel my pending request - remove from my pendingOut and their pendingIn
          newGlobal[currentUser._id].pendingOut = newGlobal[currentUser._id].pendingOut.filter(id => id !== userId);
          newGlobal[userId].pendingIn = newGlobal[userId].pendingIn.filter(id => id !== currentUser._id);
          toast.success('Sol·licitud cancel·lada');
        } 
        else if (status === 'incoming') {
          // Accept incoming request - move to accepted for both users and remove from pending
          newGlobal[currentUser._id].pendingIn = newGlobal[currentUser._id].pendingIn.filter(id => id !== userId);
          newGlobal[userId].pendingOut = newGlobal[userId].pendingOut.filter(id => id !== currentUser._id);
          
          if (!newGlobal[currentUser._id].accepted.includes(userId)) {
            newGlobal[currentUser._id].accepted.push(userId);
          }
          if (!newGlobal[userId].accepted.includes(currentUser._id)) {
            newGlobal[userId].accepted.push(currentUser._id);
          }
          toast.success('Sol·licitud acceptada');
        }
        else if (status === 'none') {
          // Send new connection request - add to my pendingOut and their pendingIn
          if (!newGlobal[currentUser._id].pendingOut.includes(userId)) {
            newGlobal[currentUser._id].pendingOut.push(userId);
          }
          if (!newGlobal[userId].pendingIn.includes(currentUser._id)) {
            newGlobal[userId].pendingIn.push(currentUser._id);
          }
          toast.success('Sol·licitud de connexió enviada');
        }
        
        return newGlobal;
      });
    } catch (error: any) {
      console.error('Error with connection:', error);
      toast.error('Error en la connexió');
    }
  };

  const handleCancelRequest = async (userId: string) => {
    // This is now handled by handleConnectUser
    await handleConnectUser(userId);
  };

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    return `Joined ${date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
  };

  const getRoleBadge = (role: string) => {
    const roleMap = {
      'admin': { label: 'Admin', color: 'bg-red-500' },
      'colaborador': { label: 'Colaborador', color: 'bg-pink-500' },
      'user': { label: 'Usuari', color: 'bg-green-500' }
    };
    const roleInfo = roleMap[role as keyof typeof roleMap] || { label: 'Usuari', color: 'bg-green-500' };
    
    return (
      <Badge className={`${roleInfo.color} text-white text-xs`}>
        {roleInfo.label}
      </Badge>
    );
  };

  const handleUserClick = (user: User) => {
    // If it's the current user, navigate to their own profile
    if (user._id === currentUser?._id) {
      navigate(`/perfil`);
    } else {
      // For other users, navigate to their individual profile page using slug
      navigate(`/usuario/${user.slug}`);
    }
  };

  const getFilteredUsers = () => {
    let filtered = users.filter(user => 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    switch (activeTab) {
      case 'connections':
        // Filter users based on connection sub-tab
        switch (activeConnectionTab) {
          case 'accepted':
            filtered = filtered.filter(user => acceptedConnections.includes(user._id));
            break;
          case 'pending':
            // Mostrar tanto solicitudes enviadas como recibidas (se separarán en la UI)
            filtered = filtered.filter(user => 
              pendingConnections.includes(user._id) || incomingConnections.includes(user._id)
            );
            break;
          case 'rejected':
            filtered = filtered.filter(user => rejectedConnections.includes(user._id));
            break;
        }
        break;
      case 'following':
        filtered = filtered.filter(user => 
          currentUser?.following?.includes(user._id)
        );
        break;
      case 'followers':
        filtered = filtered.filter(user => 
          currentUser?.followers?.includes(user._id)
        );
        break;
      default:
        break;
    }

    // Sort based on filter
    switch (activeMemberFilter) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'active':
        filtered.sort((a, b) => {
          const aActive = a.lastActive ? new Date(a.lastActive).getTime() : 0;
          const bActive = b.lastActive ? new Date(b.lastActive).getTime() : 0;
          return bActive - aActive;
        });
        break;
      case 'popular':
        filtered.sort((a, b) => (b.followers?.length || 0) - (a.followers?.length || 0));
        break;
    }

    // Put current user first if they're in the results
    if (currentUser) {
      const currentUserIndex = filtered.findIndex(user => user._id === currentUser._id);
      if (currentUserIndex > 0) {
        const currentUserData = filtered.splice(currentUserIndex, 1)[0];
        filtered.unshift(currentUserData);
      }
    }

    return filtered;
  };

  const isFollowingUser = (userId: string) => {
    return currentUser?.following?.includes(userId) || false;
  };

  const getFollowButtonText = (userId: string) => {
    if (userId === currentUser?._id) return 'Tu';
    return isFollowingUser(userId) ? 'Deixar de Seguir' : 'Seguir';
  };

  const getConnectionStatus = (userId: string) => {
    // Las conexiones aceptadas son bidireccionales
    if (acceptedConnections.includes(userId)) {
      return 'connected'; // Connectat (pot desconnectar)
    } 
    // Si yo envié una solicitud que está pendiente
    else if (pendingConnections.includes(userId)) {
      return 'pending'; // Sol·licitud enviada (pot cancel·lar)
    } 
    // Si el otro usuario me envió una solicitud
    else if (incomingConnections.includes(userId)) {
      return 'incoming'; // Sol·licitud rebuda (pot acceptar)
    }
    // Si fue rechazado (no puede volver a enviar)
    else if (rejectedConnections.includes(userId)) {
      return 'rejected'; // Rebutjat (no pot enviar més sol·licituds)
    } 
    else {
      return 'none'; // Pot enviar sol·licitud
    }
  };

  const getConnectionButtonIcon = (userId: string) => {
    const status = getConnectionStatus(userId);
    switch (status) {
      case 'connected':
        return UserMinus; // Pot desconnectar
      case 'pending':
        return Clock; // Esperant resposta
      case 'incoming':
        return CheckCircle; // Pot acceptar sol·licitud
      case 'rejected':
        return null; // No mostrar botó si està rebutjat
      default:
        return UserPlus; // Pot connectar
    }
  };

  const canConnect = (userId: string) => {
    return !rejectedConnections.includes(userId);
  };

  const UserCard = ({ user, isGrid }: { user: User; isGrid: boolean }) => (
    <Card className={`hover:shadow-lg transition-shadow ${isGrid ? 'h-full' : ''}`}>
      <CardContent className={`p-6 ${isGrid ? 'text-center' : 'flex items-start gap-4'}`}>
        <div className={`${isGrid ? 'flex flex-col items-center' : 'flex-shrink-0'}`}>
          <div className="relative">
            <Avatar className={`${isGrid ? 'h-20 w-20 mb-3' : 'h-16 w-16'}`}>
              <AvatarImage src={user.profilePicture ? getImageUrl(user.profilePicture) : undefined} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                {user.firstName[0]}{user.lastName[0]}
              </AvatarFallback>
            </Avatar>
            {user.isActive && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            )}
          </div>
          {isGrid && getRoleBadge(user.role)}
        </div>

        <div className={`${isGrid ? 'mt-2' : 'flex-1 min-w-0'}`}>
          <div className={`${isGrid ? 'text-center' : 'flex items-start justify-between'}`}>
            <div className={`${isGrid ? '' : 'flex-1 min-w-0'}`}>
              <h3 
                className={`font-semibold text-gray-900 hover:text-primary cursor-pointer ${isGrid ? 'text-lg mb-1' : 'text-base mb-1'}`}
                onClick={() => handleUserClick(user)}
              >
                {user.firstName} {user.lastName}
              </h3>
              <p className="text-gray-600 text-sm mb-2">
                {formatJoinDate(user.createdAt)}
              </p>
              {!isGrid && (
                <div className="mb-3">
                  {getRoleBadge(user.role)}
                </div>
              )}
              <p className="text-gray-500 text-sm mb-4">
                {user.followers?.length || 0} seguidors
              </p>
            </div>
            
            {!isGrid && user._id !== currentUser?._id && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleSendMessage(user._id)}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Enviar Missatge
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleFollowUser(user._id)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    {getFollowButtonText(user._id)}
                  </DropdownMenuItem>
                  {canConnect(user._id) && (
                    <DropdownMenuItem onClick={() => handleConnectUser(user._id)}>
                      {(() => {
                        const IconComponent = getConnectionButtonIcon(user._id);
                        return IconComponent ? <IconComponent className="h-4 w-4 mr-2" /> : null;
                      })()}
                      {getConnectionStatus(user._id) === 'connected' ? 'Desconnectar' : 
                       getConnectionStatus(user._id) === 'pending' ? 'Cancel·lar Sol·licitud' : 
                       getConnectionStatus(user._id) === 'incoming' ? 'Acceptar Sol·licitud' : 'Connectar'}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {!isGrid && user._id === currentUser?._id && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/editar-perfil')}
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar Perfil
              </Button>
            )}
          </div>

          {isGrid && user._id !== currentUser?._id && (
            <div className="flex flex-col gap-2">
              <Button 
                size="sm" 
                onClick={() => handleSendMessage(user._id)}
                className="w-full"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Enviar Missatge
              </Button>
              <div className="flex gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline"
                      size="sm" 
                      onClick={() => handleFollowUser(user._id)}
                      className="flex-1"
                    >
                      <Radio className={`h-4 w-4 ${isFollowingUser(user._id) ? 'text-primary' : 'text-gray-400'}`} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isFollowingUser(user._id) ? 'Deixar de seguir' : 'Seguir actualitzacions'}</p>
                  </TooltipContent>
                </Tooltip>
                {canConnect(user._id) && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant={
                          getConnectionStatus(user._id) === 'connected' ? "default" : 
                          getConnectionStatus(user._id) === 'pending' ? "secondary" : "outline"
                        } 
                        size="sm" 
                        onClick={() => handleConnectUser(user._id)}
                        className="flex-1"
                      >
                        {(() => {
                          const IconComponent = getConnectionButtonIcon(user._id);
                          return IconComponent ? <IconComponent className="h-4 w-4" /> : null;
                        })()}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {getConnectionStatus(user._id) === 'connected' ? 'Desconnectar' : 
                         getConnectionStatus(user._id) === 'pending' ? 'A la espera de confirmació' : 
                         getConnectionStatus(user._id) === 'incoming' ? 'Acceptar sol·licitud' : 'Connectar'}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
          )}
          {isGrid && user._id === currentUser?._id && (
            <div className="mt-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => navigate('/editar-perfil')}
                className="w-full"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar Perfil
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const filteredUsers = getFilteredUsers();
  
  // Separate outgoing and incoming requests for pending tab
  const outgoingRequests = filteredUsers.filter(user => pendingConnections.includes(user._id));
  const incomingRequests = filteredUsers.filter(user => incomingConnections.includes(user._id));
  
  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, activeConnectionTab, searchTerm, activeMemberFilter]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <TooltipProvider>
      <PageWrapper>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Miembros</h1>
              <p className="text-gray-600">Connecta amb altres membres de la comunitat</p>
            </div>
          </div>

          {/* Search and Quick Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Cercar membres..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
            </div>
            <Card className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">Total Miembros</p>
                  <p className="text-lg font-bold">{users.length}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center space-x-2">
                <UserCheck className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium">En Línia</p>
                  <p className="text-lg font-bold">{users.filter(u => u.isActive).length}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* View Toggle and Filter Tabs */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <Tabs value={activeTab} onValueChange={setActiveTab as any} className="flex-1">
              <TabsList className="grid w-full grid-cols-4 max-w-2xl bg-white border">
                <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                  Tots ({users.length})
                </TabsTrigger>
                <TabsTrigger value="connections" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                  Connexions ({acceptedConnections.length + pendingConnections.length + incomingConnections.length + rejectedConnections.length})
                </TabsTrigger>
                <TabsTrigger value="following" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                  Seguint ({currentUser?.following?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="followers" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                  Seguidors ({currentUser?.followers?.length || 0})
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="flex items-center gap-2">
              <select
                value={activeMemberFilter}
                onChange={(e) => setActiveMemberFilter(e.target.value as any)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="newest">Més Recents</option>
                <option value="active">Més Actius</option>
                <option value="popular">Més Populars</option>
              </select>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Connection Sub-tabs */}
          {activeTab === 'connections' && (
            <div className="flex gap-2 mb-4">
              <Button
                variant={activeConnectionTab === 'accepted' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveConnectionTab('accepted')}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Aceptades ({acceptedConnections.length})
              </Button>
              <Button
                variant={activeConnectionTab === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveConnectionTab('pending')}
              >
                <Clock className="h-4 w-4 mr-2" />
                Pendents ({pendingConnections.length + incomingConnections.length})
              </Button>
              <Button
                variant={activeConnectionTab === 'rejected' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveConnectionTab('rejected')}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Rebutjades ({rejectedConnections.length})
              </Button>
            </div>
          )}

          {/* Members Grid/List */}
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredUsers.length > 0 ? (
            <>
              {/* Special layout for pending connections */}
              {activeTab === 'connections' && activeConnectionTab === 'pending' ? (
                <div className="space-y-8">
                  {/* Outgoing Requests Section */}
                  {outgoingRequests.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Send className="h-5 w-5 text-gray-600" />
                        <h3 className="text-lg font-semibold text-gray-900">
                          Salientes ({outgoingRequests.length})
                        </h3>
                        <p className="text-sm text-gray-500">Sol·licituds que he enviat i estan pendents</p>
                      </div>
                      <div className={`grid gap-6 ${
                        viewMode === "grid" 
                          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                          : 'grid-cols-1'
                      }`}>
                        {outgoingRequests.map((user) => (
                          <UserCard key={user._id} user={user} isGrid={viewMode === "grid"} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Incoming Requests Section */}
                  {incomingRequests.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Inbox className="h-5 w-5 text-gray-600" />
                        <h3 className="text-lg font-semibold text-gray-900">
                          Entrantes ({incomingRequests.length})
                        </h3>
                        <p className="text-sm text-gray-500">Sol·licituds que he rebut i puc acceptar</p>
                      </div>
                      <div className={`grid gap-6 ${
                        viewMode === "grid" 
                          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                          : 'grid-cols-1'
                      }`}>
                        {incomingRequests.map((user) => (
                          <UserCard key={user._id} user={user} isGrid={viewMode === "grid"} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Empty state for pending */}
                  {outgoingRequests.length === 0 && incomingRequests.length === 0 && (
                    <div className="text-center py-12">
                      <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No hi ha sol·licituds pendents
                      </h3>
                      <p className="text-gray-600">
                        Les sol·licituds de connexió apareixeran aquí.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                /* Normal layout for other tabs */
                <>
                  <div className={`grid gap-6 ${
                    viewMode === "grid" 
                      ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                      : 'grid-cols-1'
                  }`}>
                    {paginatedUsers.map((user) => (
                      <UserCard key={user._id} user={user} isGrid={viewMode === "grid"} />
                    ))}
                  </div>
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-8">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      
                      <div className="flex gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(page)}
                            className="min-w-[2.5rem]"
                          >
                            {page}
                          </Button>
                        ))}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No s'han trobat membres
              </h3>
              <p className="text-gray-600">
                Prova amb altres termes de cerca o ajusta els filtres.
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">

          {/* Latest Updates Widget */}
          <LatestUpdatesWidget />

          {/* Members Widget */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Miembros</CardTitle>
              <div className="flex gap-2 text-sm">
                {['newest', 'active', 'popular'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveMemberFilter(filter as any)}
                    className={`px-2 py-1 rounded uppercase tracking-wide text-xs font-medium ${
                      activeMemberFilter === filter
                        ? 'bg-blue-100 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {filter === 'newest' ? 'Nous' : filter === 'active' ? 'Actius' : 'Populars'}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredUsers.slice(0, 6).map((user) => (
                <div key={user._id} className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.profilePicture ? getImageUrl(user.profilePicture) : undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
                        {user.firstName[0]}{user.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    {user.isActive && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p 
                      className="text-sm font-medium text-gray-900 hover:text-primary cursor-pointer truncate"
                      onClick={() => handleUserClick(user)}
                    >
                      {user.firstName} {user.lastName}
                    </p>
                  </div>
                </div>
              ))}
              <Button variant="ghost" className="w-full text-sm">
                VEURE TOT
              </Button>
            </CardContent>
          </Card>

          {/* Groups Widget */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Grups</CardTitle>
              <div className="flex gap-2 text-sm">
                {['newest', 'active', 'popular'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveGroupFilter(filter as any)}
                    className={`px-2 py-1 rounded uppercase tracking-wide text-xs font-medium ${
                      activeGroupFilter === filter
                        ? 'bg-blue-100 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {filter === 'newest' ? 'Nous' : filter === 'active' ? 'Actius' : 'Populars'}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {MOCK_GROUPS.map((group) => (
                <div key={group._id} className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={group.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-600 text-white text-sm">
                      {group.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {group.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {group.memberCount} membres
                    </p>
                  </div>
                </div>
              ))}
              <Button variant="ghost" className="w-full text-sm">
                VEURE TOT
              </Button>
            </CardContent>
          </Card>
        </div>
        </div>
      </PageWrapper>
    </TooltipProvider>
  );
}