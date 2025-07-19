import { useState, useEffect } from "react";
import { 
  Users, Building, MessageSquare, Briefcase, Megaphone, 
  HelpCircle, Tag, Edit, Trash2, UserPlus, Search, Filter,
  ChevronLeft, ChevronRight, MoreHorizontal, CheckSquare,
  Square, Eye, Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageWrapper } from "@/components/PageWrapper";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  getUsers,
  getPosts,
  getCompanies,
  getGroups,
  getForums,
  getJobOffers,
  getAnnouncements,
  getAdvisories,
  updateUser,
  deleteUser,
  updatePost,
  deletePost,
  updateCompany,
  bulkUpdateItems,
  bulkDeleteItems,
  assignAuthor,
  assignCategory,
  type PaginationParams,
  type User,
  type Post,
  type Company,
  type Group,
  type Forum,
  type JobOffer,
  type Announcement,
  type Advisory
} from "@/api/adminData";
import { getCategoriesTree } from "@/api/categories";

type DataType = 'users' | 'posts' | 'companies' | 'groups' | 'forums' | 'jobOffers' | 'announcements' | 'advisories';

interface DataTypeConfig {
  key: DataType;
  label: string;
  icon: React.ComponentType<any>;
  endpoint: Function;
  canEdit: boolean;
  canDelete: boolean;
  canAssignAuthor: boolean;
  canAssignCategory: boolean;
}

const dataTypes: DataTypeConfig[] = [
  {
    key: 'users',
    label: 'Usuaris',
    icon: Users,
    endpoint: getUsers,
    canEdit: true,
    canDelete: true,
    canAssignAuthor: false,
    canAssignCategory: false
  },
  {
    key: 'posts',
    label: 'Posts',
    icon: MessageSquare,
    endpoint: getPosts,
    canEdit: true,
    canDelete: true,
    canAssignAuthor: true,
    canAssignCategory: false
  },
  {
    key: 'companies',
    label: 'Empreses',
    icon: Building,
    endpoint: getCompanies,
    canEdit: true,
    canDelete: false,
    canAssignAuthor: true,
    canAssignCategory: true
  },
  {
    key: 'groups',
    label: 'Grups',
    icon: Users,
    endpoint: getGroups,
    canEdit: false,
    canDelete: false,
    canAssignAuthor: true,
    canAssignCategory: true
  },
  {
    key: 'forums',
    label: 'Fòrums',
    icon: MessageSquare,
    endpoint: getForums,
    canEdit: false,
    canDelete: false,
    canAssignAuthor: true,
    canAssignCategory: true
  },
  {
    key: 'jobOffers',
    label: 'Ofertes de Treball',
    icon: Briefcase,
    endpoint: getJobOffers,
    canEdit: false,
    canDelete: false,
    canAssignAuthor: true,
    canAssignCategory: true
  },
  {
    key: 'announcements',
    label: 'Anuncis',
    icon: Megaphone,
    endpoint: getAnnouncements,
    canEdit: false,
    canDelete: false,
    canAssignAuthor: true,
    canAssignCategory: true
  },
  {
    key: 'advisories',
    label: 'Assessoraments',
    icon: HelpCircle,
    endpoint: getAdvisories,
    canEdit: false,
    canDelete: false,
    canAssignAuthor: true,
    canAssignCategory: true
  }
];

export default function DataManagement() {
  const [activeTab, setActiveTab] = useState<DataType>('users');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [assignType, setAssignType] = useState<'author' | 'category'>('author');
  const [assignItemId, setAssignItemId] = useState<string>('');
  
  // Pagination and filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [filters, setFilters] = useState<PaginationParams>({
    page: 1,
    limit: 20,
    search: '',
    category: '',
    author: '',
    status: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // Reference data
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    loadReferenceData();
  }, []);

  useEffect(() => {
    loadData();
  }, [activeTab, filters]);

  const loadReferenceData = async () => {
    try {
      const [usersRes, categoriesRes] = await Promise.all([
        getUsers({ limit: 1000 }),
        getCategoriesTree('company')
      ]);
      
      setUsers(usersRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Error loading reference data:', error);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const config = dataTypes.find(dt => dt.key === activeTab);
      if (!config) return;

      const response = await config.endpoint(filters);
      setData(response.data);
      setCurrentPage(response.pagination.current);
      setTotalPages(response.pagination.pages);
      setTotalItems(response.pagination.total);
      setSelectedItems([]);
    } catch (error: any) {
      toast.error('Error al carregar dades');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof PaginationParams, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filtering
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const toggleSelectItem = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const toggleSelectAll = () => {
    setSelectedItems(prev => 
      prev.length === data.length ? [] : data.map(item => item._id)
    );
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setShowEditDialog(true);
  };

  const handleDelete = async (item: any, permanent = false) => {
    if (!confirm(`Estàs segur que vols ${permanent ? 'eliminar permanentment' : 'desactivar'} aquest element?`)) {
      return;
    }

    try {
      if (activeTab === 'users') {
        await deleteUser(item._id, permanent);
      } else if (activeTab === 'posts') {
        await deletePost(item._id, permanent);
      }
      
      toast.success(`Element ${permanent ? 'eliminat' : 'desactivat'} correctament`);
      loadData();
    } catch (error: any) {
      toast.error('Error al eliminar element');
    }
  };

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (selectedItems.length === 0) {
      toast.error('Selecciona almenys un element');
      return;
    }

    if (!confirm(`Estàs segur que vols aplicar aquesta acció a ${selectedItems.length} elements?`)) {
      return;
    }

    try {
      const config = dataTypes.find(dt => dt.key === activeTab);
      if (!config) return;

      const modelName = activeTab.charAt(0).toUpperCase() + activeTab.slice(1);

      if (action === 'delete') {
        await bulkDeleteItems(modelName, selectedItems);
      } else {
        await bulkUpdateItems(modelName, selectedItems, {
          isActive: action === 'activate'
        });
      }

      toast.success(`Acció aplicada a ${selectedItems.length} elements`);
      loadData();
    } catch (error: any) {
      toast.error('Error en l\'operació massiva');
    }
  };

  const handleAssign = async (targetId: string) => {
    try {
      const config = dataTypes.find(dt => dt.key === activeTab);
      if (!config) return;

      const modelName = activeTab.charAt(0).toUpperCase() + activeTab.slice(1);

      if (assignType === 'author') {
        await assignAuthor(modelName, assignItemId, targetId);
        toast.success('Autor assignat correctament');
      } else {
        await assignCategory(modelName, assignItemId, targetId);
        toast.success('Categoria assignada correctament');
      }

      setShowAssignDialog(false);
      loadData();
    } catch (error: any) {
      toast.error(`Error al assignar ${assignType === 'author' ? 'autor' : 'categoria'}`);
    }
  };

  const renderItem = (item: any) => {
    const config = dataTypes.find(dt => dt.key === activeTab);
    if (!config) return null;

    const isSelected = selectedItems.includes(item._id);
    
    return (
      <div key={item._id} className={`p-4 border rounded-lg ${isSelected ? 'bg-blue-50 border-blue-200' : 'bg-white'}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <button
              onClick={() => toggleSelectItem(item._id)}
              className="mt-1"
            >
              {isSelected ? (
                <CheckSquare className="h-4 w-4 text-blue-600" />
              ) : (
                <Square className="h-4 w-4 text-gray-400" />
              )}
            </button>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-medium">
                  {item.name || item.title || `${item.firstName} ${item.lastName}` || item._id}
                </h3>
                {item.isActive !== undefined && (
                  <Badge variant={item.isActive ? "default" : "secondary"}>
                    {item.isActive ? 'Actiu' : 'Inactiu'}
                  </Badge>
                )}
                {item.role && (
                  <Badge variant="outline">{item.role}</Badge>
                )}
                {item.verified?.status && (
                  <Badge 
                    variant={item.verified.status === 'verified' ? 'default' : 'secondary'}
                    className={
                      item.verified.status === 'verified' ? 'bg-green-500' :
                      item.verified.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                    }
                  >
                    {item.verified.status}
                  </Badge>
                )}
              </div>
              
              {item.email && (
                <p className="text-sm text-gray-600">{item.email}</p>
              )}
              {item.description && (
                <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
              )}
              {item.content && (
                <p className="text-sm text-gray-600 line-clamp-2">{item.content}</p>
              )}
              
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                {item.author && (
                  <span>Autor: {item.author.firstName} {item.author.lastName}</span>
                )}
                {item.category && (
                  <span>Categoria: {typeof item.category === 'string' ? item.category : item.category.name}</span>
                )}
                {item.createdAt && (
                  <span>Creat: {new Date(item.createdAt).toLocaleDateString('ca-ES')}</span>
                )}
              </div>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Accions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {config.canEdit && (
                <DropdownMenuItem onClick={() => handleEdit(item)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </DropdownMenuItem>
              )}
              
              {config.canAssignAuthor && (
                <DropdownMenuItem onClick={() => {
                  setAssignType('author');
                  setAssignItemId(item._id);
                  setShowAssignDialog(true);
                }}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Assignar Autor
                </DropdownMenuItem>
              )}
              
              {config.canAssignCategory && (
                <DropdownMenuItem onClick={() => {
                  setAssignType('category');
                  setAssignItemId(item._id);
                  setShowAssignDialog(true);
                }}>
                  <Tag className="h-4 w-4 mr-2" />
                  Assignar Categoria
                </DropdownMenuItem>
              )}
              
              {config.canDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => handleDelete(item, false)}
                    className="text-orange-600"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Desactivar
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleDelete(item, true)}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  };

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestió de Dades</h1>
            <p className="text-gray-600">
              Administra tots els continguts de la plataforma
            </p>
          </div>
          <Badge variant="secondary" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Administració
          </Badge>
        </div>

        {/* Data Type Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as DataType)}>
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
            {dataTypes.map(dataType => {
              const Icon = dataType.icon;
              return (
                <TabsTrigger key={dataType.key} value={dataType.key} className="text-xs">
                  <Icon className="h-4 w-4 mr-1" />
                  {dataType.label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {dataTypes.map(dataType => (
            <TabsContent key={dataType.key} value={dataType.key} className="space-y-6">
              {/* Filters and Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <dataType.icon className="h-5 w-5" />
                    {dataType.label}
                    <Badge variant="outline">{totalItems} elements</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <Label htmlFor="search">Cercar</Label>
                        <div className="relative">
                          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="search"
                            placeholder="Cercar..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="status">Estat</Label>
                        <Select 
                          value={filters.status} 
                          onValueChange={(value) => handleFilterChange('status', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Tots els estats" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Tots els estats</SelectItem>
                            <SelectItem value="active">Actius</SelectItem>
                            <SelectItem value="inactive">Inactius</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {dataType.canAssignAuthor && (
                        <div>
                          <Label htmlFor="author">Autor</Label>
                          <Select 
                            value={filters.author} 
                            onValueChange={(value) => handleFilterChange('author', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Tots els autors" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">Tots els autors</SelectItem>
                              {users.map(user => (
                                <SelectItem key={user._id} value={user._id}>
                                  {user.firstName} {user.lastName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      
                      {dataType.canAssignCategory && (
                        <div>
                          <Label htmlFor="category">Categoria</Label>
                          <Select 
                            value={filters.category} 
                            onValueChange={(value) => handleFilterChange('category', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Totes les categories" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">Totes les categories</SelectItem>
                              {categories.map(category => (
                                <SelectItem key={category._id} value={category.name}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>

                    {/* Bulk Actions */}
                    {selectedItems.length > 0 && (
                      <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                        <span className="text-sm text-blue-700">
                          {selectedItems.length} elements seleccionats
                        </span>
                        <div className="flex gap-2 ml-auto">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleBulkAction('activate')}
                          >
                            Activar
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleBulkAction('deactivate')}
                          >
                            Desactivar
                          </Button>
                          {dataType.canDelete && (
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleBulkAction('delete')}
                            >
                              Eliminar
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Data List */}
              <Card>
                <CardContent className="p-6">
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : data.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No s'han trobat elements
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Select All */}
                      <div className="flex items-center gap-2 pb-2 border-b">
                        <button
                          onClick={toggleSelectAll}
                          className="flex items-center gap-2"
                        >
                          {selectedItems.length === data.length ? (
                            <CheckSquare className="h-4 w-4 text-blue-600" />
                          ) : (
                            <Square className="h-4 w-4 text-gray-400" />
                          )}
                          <span className="text-sm">
                            Seleccionar tots ({data.length})
                          </span>
                        </button>
                      </div>

                      {/* Items */}
                      {data.map(renderItem)}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Pàgina {currentPage} de {totalPages} ({totalItems} elements)
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Següent
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>

        {/* Assign Dialog */}
        <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Assignar {assignType === 'author' ? 'Autor' : 'Categoria'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Label>
                Selecciona {assignType === 'author' ? 'l\'autor' : 'la categoria'}:
              </Label>
              
              {assignType === 'author' ? (
                <Select onValueChange={handleAssign}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar autor" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map(user => (
                      <SelectItem key={user._id} value={user._id}>
                        {user.firstName} {user.lastName} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Select onValueChange={handleAssign}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category._id} value={category._id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PageWrapper>
  );
}