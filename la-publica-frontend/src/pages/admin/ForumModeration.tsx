import { useState, useEffect } from "react";
import { 
  Shield, Eye, Flag, CheckCircle, XCircle, Pin, Lock, 
  AlertTriangle, MessageSquare, TrendingUp, BarChart3
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PageWrapper } from "@/components/PageWrapper";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import apiClient from "@/api/client";
import { getImageUrl } from "@/utils/getImageUrl";

interface ModerationPost {
  _id: string;
  title: string;
  content: string;
  author: {
    _id: string;
    firstName: string;
    lastName: string;
    profilePhoto?: string;
  };
  forum: {
    _id: string;
    name: string;
    category: {
      name: string;
      color: string;
    };
  };
  moderationStatus: 'pending' | 'approved' | 'rejected' | 'flagged';
  reports?: Array<{
    _id: string;
    reportedBy: {
      firstName: string;
      lastName: string;
    };
    reason: string;
    description?: string;
    status: 'pending' | 'resolved' | 'dismissed';
    createdAt: string;
  }>;
  createdAt: string;
  isPinned: boolean;
  isLocked: boolean;
}

interface ModerationStats {
  totalPosts: number;
  pendingPosts: number;
  flaggedPosts: number;
  rejectedPosts: number;
  totalReports: number;
  pendingReports: number;
  activeForums: number;
}

const ForumModeration = () => {
  const [stats, setStats] = useState<ModerationStats | null>(null);
  const [pendingPosts, setPendingPosts] = useState<ModerationPost[]>([]);
  const [reportedPosts, setReportedPosts] = useState<ModerationPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedPost, setSelectedPost] = useState<ModerationPost | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Cargar estadísticas
      const statsResponse = await apiClient.get('/forums/moderation/stats');
      if (statsResponse.data.success) {
        setStats(statsResponse.data.data);
      }

      // Cargar posts pendientes
      const pendingResponse = await apiClient.get('/forums/moderation/pending?status=pending');
      if (pendingResponse.data.success) {
        setPendingPosts(pendingResponse.data.data);
      }

      // Cargar posts reportados
      const reportsResponse = await apiClient.get('/forums/moderation/reports?status=pending');
      if (reportsResponse.data.success) {
        setReportedPosts(reportsResponse.data.data);
      }

    } catch (error) {
      console.error('Error loading moderation data:', error);
      toast.error('Error al cargar datos de moderación');
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePost = async (postId: string) => {
    try {
      await apiClient.post(`/forums/moderation/posts/${postId}/approve`);
      toast.success('Post aprobado exitosamente');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al aprobar el post');
    }
  };

  const handleRejectPost = async () => {
    if (!selectedPost || !rejectReason.trim()) {
      toast.error('La razón de rechazo es obligatoria');
      return;
    }

    try {
      await apiClient.post(`/forums/moderation/posts/${selectedPost._id}/reject`, {
        reason: rejectReason
      });
      toast.success('Post rechazado exitosamente');
      setShowRejectDialog(false);
      setSelectedPost(null);
      setRejectReason("");
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al rechazar el post');
    }
  };

  const handleResolveReport = async (postId: string, reportId: string, action: 'resolve' | 'dismiss') => {
    try {
      await apiClient.post(`/forums/moderation/posts/${postId}/reports/${reportId}/resolve`, {
        action,
        reason: action === 'resolve' ? 'Contenido inapropiado removido' : 'Reporte sin fundamento'
      });
      toast.success(action === 'resolve' ? 'Reporte resuelto y post removido' : 'Reporte descartado');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al procesar el reporte');
    }
  };

  const handleTogglePin = async (postId: string) => {
    try {
      await apiClient.post(`/forums/moderation/posts/${postId}/toggle-pin`);
      toast.success('Estado de fijado actualizado');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al cambiar el estado');
    }
  };

  const handleToggleLock = async (postId: string) => {
    try {
      await apiClient.post(`/forums/moderation/posts/${postId}/toggle-lock`);
      toast.success('Estado de bloqueo actualizado');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al cambiar el estado');
    }
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diffInHours = Math.floor((now.getTime() - then.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'hace menos de 1h';
    if (diffInHours < 24) return `hace ${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `hace ${diffInDays}d`;
  };

  if (loading) {
    return (
      <PageWrapper title="Moderación de Foros">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="Moderación de Foros">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Moderación de Foros
          </h1>
          <p className="text-gray-600">Gestiona y modera el contenido de los foros</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Posts Totales</p>
                    <p className="text-2xl font-bold">{stats.totalPosts}</p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pendientes</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.pendingPosts}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Reportes</p>
                    <p className="text-2xl font-bold text-red-600">{stats.pendingReports}</p>
                  </div>
                  <Flag className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Foros Activos</p>
                    <p className="text-2xl font-bold text-green-600">{stats.activeForums}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="pending">
              Posts Pendientes ({pendingPosts.length})
            </TabsTrigger>
            <TabsTrigger value="reports">
              Reportes ({reportedPosts.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Posts Pendientes Recientes</CardTitle>
                </CardHeader>
                <CardContent>
                  {pendingPosts.slice(0, 3).map((post) => (
                    <div key={post._id} className="flex items-start space-x-3 py-3 border-b last:border-b-0">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={getImageUrl(post.author.profilePhoto)} />
                        <AvatarFallback>
                          {post.author.firstName[0]}{post.author.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {post.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          por {post.author.firstName} {post.author.lastName} • {formatTimeAgo(post.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {pendingPosts.length === 0 && (
                    <p className="text-center text-gray-500 py-4">No hay posts pendientes</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Reportes Recientes</CardTitle>
                </CardHeader>
                <CardContent>
                  {reportedPosts.slice(0, 3).map((post) => (
                    <div key={post._id} className="py-3 border-b last:border-b-0">
                      <p className="text-sm font-medium text-gray-900 truncate mb-1">
                        {post.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {post.reports?.[0]?.reason} • {formatTimeAgo(post.reports?.[0]?.createdAt || '')}
                      </p>
                    </div>
                  ))}
                  {reportedPosts.length === 0 && (
                    <p className="text-center text-gray-500 py-4">No hay reportes pendientes</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {pendingPosts.map((post) => (
              <Card key={post._id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={getImageUrl(post.author.profilePhoto)} />
                        <AvatarFallback>
                          {post.author.firstName[0]}{post.author.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{post.title}</h3>
                          {post.isPinned && <Pin className="h-4 w-4 text-primary" />}
                          {post.isLocked && <Lock className="h-4 w-4 text-gray-400" />}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          por {post.author.firstName} {post.author.lastName} • {formatTimeAgo(post.createdAt)}
                        </p>
                        <Badge 
                          variant="secondary" 
                          style={{ backgroundColor: post.forum.category.color + '20', color: post.forum.category.color }}
                          className="mb-2"
                        >
                          {post.forum.name}
                        </Badge>
                        <p className="text-gray-700 text-sm line-clamp-3">
                          {post.content.replace(/<[^>]*>/g, '').substring(0, 200)}...
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <Button 
                        size="sm" 
                        onClick={() => handleApprovePost(post._id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Aprobar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => {
                          setSelectedPost(post);
                          setShowRejectDialog(true);
                        }}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Rechazar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleTogglePin(post._id)}
                      >
                        <Pin className="h-4 w-4 mr-1" />
                        {post.isPinned ? 'Desfijar' : 'Fijar'}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleToggleLock(post._id)}
                      >
                        <Lock className="h-4 w-4 mr-1" />
                        {post.isLocked ? 'Desbloquear' : 'Bloquear'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {pendingPosts.length === 0 && (
              <Card>
                <CardContent className="p-6 text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-gray-500">No hay posts pendientes de moderación</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            {reportedPosts.map((post) => (
              <Card key={post._id}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={getImageUrl(post.author.profilePhoto)} />
                          <AvatarFallback>
                            {post.author.firstName[0]}{post.author.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{post.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">
                            por {post.author.firstName} {post.author.lastName} • {formatTimeAgo(post.createdAt)}
                          </p>
                          <Badge variant="secondary" className="mb-2">
                            {post.forum.name}
                          </Badge>
                          <p className="text-gray-700 text-sm line-clamp-2">
                            {post.content.replace(/<[^>]*>/g, '').substring(0, 200)}...
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Reports */}
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-900 mb-3">Reportes:</h4>
                      {post.reports?.map((report) => (
                        <div key={report._id} className="bg-red-50 border border-red-200 rounded-lg p-4 mb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="destructive">{report.reason}</Badge>
                                <span className="text-sm text-gray-600">
                                  por {report.reportedBy.firstName} {report.reportedBy.lastName}
                                </span>
                              </div>
                              {report.description && (
                                <p className="text-sm text-gray-700">{report.description}</p>
                              )}
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleResolveReport(post._id, report._id, 'resolve')}
                              >
                                Resolver y Remover
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleResolveReport(post._id, report._id, 'dismiss')}
                              >
                                Descartar
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {reportedPosts.length === 0 && (
              <Card>
                <CardContent className="p-6 text-center">
                  <Shield className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-gray-500">No hay reportes pendientes</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Reject Dialog */}
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rechazar Post</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="reason">Razón de rechazo *</Label>
                <Textarea
                  id="reason"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Explica por qué estás rechazando este post..."
                  rows={4}
                  className="mt-1"
                />
              </div>
              <div className="flex justify-end gap-4">
                <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                  Cancelar
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleRejectPost}
                  disabled={!rejectReason.trim()}
                >
                  Rechazar Post
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PageWrapper>
  );
};

export default ForumModeration;