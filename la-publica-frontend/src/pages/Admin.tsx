import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Server, 
  Database, 
  Users, 
  Building, 
  FileText, 
  AlertCircle,
  Info,
  AlertTriangle,
  XCircle,
  Eye,
  Trash2,
  Download,
  RefreshCw,
  Activity,
  HardDrive,
  Cpu,
  MemoryStick,
  Package
} from 'lucide-react';
import { toast } from 'sonner';
import { getSystemInfo, getSystemLogs, getLogById, deleteLogs, updateSystemVersion } from '@/api/system';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

// Tipos
interface SystemInfo {
  system: {
    version: string;
    lastUpdated: Date;
    environment: string;
    settings: {
      maintenanceMode: boolean;
      registrationEnabled: boolean;
    };
  };
  statistics: {
    users: number;
    companies: number;
    posts: number;
    jobOffers: number;
    announcements: number;
    advisories: number;
    totalContent: number;
  };
  server: {
    platform: string;
    arch: string;
    hostname: string;
    nodeVersion: string;
    uptime: number;
    memory: {
      total: number;
      free: number;
      used: number;
      usage: string;
    };
    cpu: {
      model: string;
      cores: number;
      usage: number[];
    };
  };
  database: {
    version: string;
    database: string;
    collections: number;
    dataSize: string;
    storageSize: string;
    indexes: number;
    indexSize: string;
  };
  dependencies: {
    express: string;
    mongoose: string;
    typescript: string;
    node: string;
  };
}

interface Log {
  _id: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  details?: any;
  source?: string;
  userId?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

const Admin = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'system');
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [logs, setLogs] = useState<Log[]>([]);
  const [loadingSystem, setLoadingSystem] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);
  const [logModalOpen, setLogModalOpen] = useState(false);
  
  // Filtros de logs
  const [logLevel, setLogLevel] = useState<string>('all');
  const [logPage, setLogPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Cargar información del sistema
  const loadSystemInfo = async () => {
    try {
      setLoadingSystem(true);
      const response = await getSystemInfo();
      if (response.success) {
        setSystemInfo(response.data);
      }
    } catch (error) {
      toast.error('Error en carregar informació del sistema');
    } finally {
      setLoadingSystem(false);
    }
  };

  // Cargar logs
  const loadLogs = async () => {
    try {
      setLoadingLogs(true);
      const params: any = {
        page: logPage,
        limit: 20
      };
      
      if (logLevel !== 'all') {
        params.level = logLevel;
      }

      const response = await getSystemLogs(params);
      if (response.success) {
        setLogs(response.data);
        setTotalPages(response.pagination.totalPages);
      }
    } catch (error) {
      toast.error('Error en carregar logs');
    } finally {
      setLoadingLogs(false);
    }
  };

  // Ver detalles de un log
  const viewLogDetails = async (logId: string) => {
    try {
      const response = await getLogById(logId);
      if (response.success) {
        setSelectedLog(response.data);
        setLogModalOpen(true);
      }
    } catch (error) {
      toast.error('Error en carregar detalls del log');
    }
  };

  // Eliminar logs seleccionados
  const handleDeleteLogs = async (ids: string[]) => {
    if (!confirm('¿Estás seguro de eliminar los logs seleccionados?')) return;
    
    try {
      const response = await deleteLogs({ ids });
      if (response.success) {
        toast.success(response.message);
        loadLogs();
      }
    } catch (error) {
      toast.error('Error en eliminar logs');
    }
  };

  // Formatear uptime
  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  // Formatear bytes
  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Establecer la URL inicial cuando se monta el componente
  useEffect(() => {
    const currentTab = searchParams.get('tab');
    if (!currentTab) {
      setSearchParams({ tab: 'system' });
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'system') {
      loadSystemInfo();
    } else if (activeTab === 'logs') {
      loadLogs();
    }
  }, [activeTab, logLevel, logPage]);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Panell d'Administració</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Gestión y monitoreo del sistema</p>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => {
        setActiveTab(value);
        setSearchParams({ tab: value });
      }} className="space-y-4">
        <TabsList>
          <TabsTrigger value="system">Informació del Sistema</TabsTrigger>
          <TabsTrigger value="logs">Registros del Sistema</TabsTrigger>
        </TabsList>

        {/* Tab de Informació del Sistema */}
        <TabsContent value="system" className="space-y-6">
          {loadingSystem ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : systemInfo && (
            <>
              {/* Informació General */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">Sistema</CardTitle>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={loadSystemInfo}
                        disabled={loadingSystem}
                      >
                        <RefreshCw className={`h-4 w-4 ${loadingSystem ? 'animate-spin' : ''}`} />
                      </Button>
                      <Info className="h-5 w-5 text-blue-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Versión:</span>
                        <Badge>{systemInfo.system.version}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Entorno:</span>
                        <span className="font-medium">{systemInfo.system.environment}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Uptime:</span>
                        <span className="font-medium">{formatUptime(systemInfo.server.uptime)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">Servidor</CardTitle>
                    <Server className="h-5 w-5 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Plataforma:</span>
                        <span className="font-medium">{systemInfo.server.platform}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Node.js:</span>
                        <span className="font-medium">{systemInfo.server.nodeVersion}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Host:</span>
                        <span className="font-medium text-sm">{systemInfo.server.hostname}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">Base de Datos</CardTitle>
                    <Database className="h-5 w-5 text-purple-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-500">MongoDB:</span>
                        <span className="font-medium">v{systemInfo.database.version}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Tamaño:</span>
                        <span className="font-medium">{systemInfo.database.dataSize}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Colecciones:</span>
                        <span className="font-medium">{systemInfo.database.collections}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Estadísticas */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <Users className="h-8 w-8 text-blue-500" />
                      <div className="text-right">
                        <p className="text-2xl font-bold">{systemInfo.statistics.users}</p>
                        <p className="text-sm text-gray-500">Usuarios</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <Building className="h-8 w-8 text-green-500" />
                      <div className="text-right">
                        <p className="text-2xl font-bold">{systemInfo.statistics.companies}</p>
                        <p className="text-sm text-gray-500">Empresas</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <FileText className="h-8 w-8 text-purple-500" />
                      <div className="text-right">
                        <p className="text-2xl font-bold">{systemInfo.statistics.posts}</p>
                        <p className="text-sm text-gray-500">Posts</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <Package className="h-8 w-8 text-orange-500" />
                      <div className="text-right">
                        <p className="text-2xl font-bold">{systemInfo.statistics.jobOffers}</p>
                        <p className="text-sm text-gray-500">Ofertas</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <AlertCircle className="h-8 w-8 text-cyan-500" />
                      <div className="text-right">
                        <p className="text-2xl font-bold">{systemInfo.statistics.announcements}</p>
                        <p className="text-sm text-gray-500">Anuncios</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <Activity className="h-8 w-8 text-pink-500" />
                      <div className="text-right">
                        <p className="text-2xl font-bold">{systemInfo.statistics.advisories}</p>
                        <p className="text-sm text-gray-500">Asesorías</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recursos del Sistema */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MemoryStick className="h-5 w-5" />
                      Memoria
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Usado: {formatBytes(systemInfo.server.memory.used)}</span>
                        <span>Total: {formatBytes(systemInfo.server.memory.total)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-blue-500 h-3 rounded-full"
                          style={{ width: systemInfo.server.memory.usage }}
                        />
                      </div>
                      <p className="text-center text-sm font-medium">{systemInfo.server.memory.usage} en uso</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Cpu className="h-5 w-5" />
                      CPU
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">{systemInfo.server.cpu.model}</p>
                      <div className="flex justify-between">
                        <span className="text-sm">Núcleos:</span>
                        <span className="font-medium">{systemInfo.server.cpu.cores}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Carga (1m/5m/15m):</span>
                        <span className="font-medium text-sm">
                          {systemInfo.server.cpu.usage.map(u => u.toFixed(2)).join(' / ')}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Dependencias */}
              <Card>
                <CardHeader>
                  <CardTitle>Tecnologies i Dependències</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-500">Node.js</p>
                      <p className="font-bold text-lg">{systemInfo.dependencies.node}</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-500">Express</p>
                      <p className="font-bold text-lg">{systemInfo.dependencies.express}</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-500">Mongoose</p>
                      <p className="font-bold text-lg">{systemInfo.dependencies.mongoose}</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-500">TypeScript</p>
                      <p className="font-bold text-lg">{systemInfo.dependencies.typescript}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Tab de Logs */}
        <TabsContent value="logs" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-4 items-center">
              <Select value={logLevel} onValueChange={setLogLevel}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar per nivell" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los niveles</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="debug">Debug</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => loadLogs()}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar
              </Button>
            </div>
          </div>

          {loadingLogs ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map(log => (
                <Card key={log._id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {log.level === 'error' && <XCircle className="h-5 w-5 text-red-500 mt-0.5" />}
                        {log.level === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />}
                        {log.level === 'info' && <Info className="h-5 w-5 text-blue-500 mt-0.5" />}
                        {log.level === 'debug' && <AlertCircle className="h-5 w-5 text-gray-500 mt-0.5" />}
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={
                              log.level === 'error' ? 'destructive' : 
                              log.level === 'warning' ? 'secondary' : 
                              'default'
                            }>
                              {log.level}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {new Date(log.timestamp).toLocaleString()}
                            </span>
                            {log.userId && (
                              <span className="text-sm text-gray-500">
                                • {log.userId.firstName} {log.userId.lastName}
                              </span>
                            )}
                          </div>
                          <p className="text-gray-700 dark:text-gray-300">{log.message}</p>
                          {log.source && (
                            <p className="text-sm text-gray-500 mt-1">Fuente: {log.source}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => viewLogDetails(log._id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteLogs([log._id])}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLogPage(p => Math.max(1, p - 1))}
                disabled={logPage === 1}
              >
                Anterior
              </Button>
              <span className="flex items-center px-4">
                Página {logPage} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLogPage(p => Math.min(totalPages, p + 1))}
                disabled={logPage === totalPages}
              >
                Siguiente
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Modal de detalles del log */}
      <Dialog open={logModalOpen} onOpenChange={setLogModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalls del Log</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <ScrollArea className="max-h-[600px]">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Nivel</p>
                    <Badge variant={
                      selectedLog.level === 'error' ? 'destructive' : 
                      selectedLog.level === 'warning' ? 'secondary' : 
                      'default'
                    }>
                      {selectedLog.level}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Fecha</p>
                    <p className="font-medium">
                      {new Date(selectedLog.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Mensaje</p>
                  <p className="font-medium">{selectedLog.message}</p>
                </div>

                {selectedLog.userId && (
                  <div>
                    <p className="text-sm text-gray-500">Usuario</p>
                    <p className="font-medium">
                      {selectedLog.userId.firstName} {selectedLog.userId.lastName} ({selectedLog.userId.email})
                    </p>
                  </div>
                )}

                {selectedLog.ipAddress && (
                  <div>
                    <p className="text-sm text-gray-500">IP</p>
                    <p className="font-medium">{selectedLog.ipAddress}</p>
                  </div>
                )}

                {selectedLog.userAgent && (
                  <div>
                    <p className="text-sm text-gray-500">User Agent</p>
                    <p className="font-medium text-sm">{selectedLog.userAgent}</p>
                  </div>
                )}

                {selectedLog.details && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Detalls</p>
                    <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-sm overflow-x-auto">
                      {JSON.stringify(selectedLog.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;