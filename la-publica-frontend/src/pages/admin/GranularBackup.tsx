import { useState, useRef, useEffect } from "react";
import { 
  Download, Upload, FileText, CheckCircle, AlertTriangle, 
  Settings, Database, Shield, Info, X, Eye, Calendar,
  User, Building, Users, MessageSquare, Briefcase,
  Megaphone, HelpCircle, Tag, Filter, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { PageWrapper } from "@/components/PageWrapper";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  getBackupPreview,
  exportGranularData,
  importGranularData,
  downloadBackupFile,
  readBackupFile,
  type BackupOptions,
  type BackupData,
  type ImportOptions,
  type BackupPreview,
  type ImportResult
} from "@/api/granularBackup";
import { getUsers } from "@/api/adminData";
import { getCategoriesTree } from "@/api/categories";

export default function GranularBackup() {
  const [activeTab, setActiveTab] = useState("export");
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [backupData, setBackupData] = useState<BackupData | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [preview, setPreview] = useState<BackupPreview | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Export options
  const [exportOptions, setExportOptions] = useState<BackupOptions>({
    includeUsers: true,
    includePosts: true,
    includeCompanies: true,
    includeGroups: true,
    includeGroupPosts: false,
    includeForums: true,
    includeForumPosts: false,
    includeJobOffers: true,
    includeAnnouncements: true,
    includeAdvisories: true,
    includeCategories: true,
    includeGroupCategories: true,
    includeForumCategories: true,
    maxRecords: 1000
  });
  
  // Import options
  const [importOptions, setImportOptions] = useState<ImportOptions>({
    replaceExisting: false,
    importUsers: false, // More cautious defaults for import
    importPosts: false,
    importCompanies: true,
    importGroups: true,
    importGroupPosts: false,
    importForums: true,
    importForumPosts: false,
    importJobOffers: true,
    importAnnouncements: true,
    importAdvisories: true,
    importCategories: true,
    importGroupCategories: true,
    importForumCategories: true
  });

  // Filters
  const [authors, setAuthors] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    loadFilters();
  }, []);

  const loadFilters = async () => {
    try {
      const [authorsRes, categoriesRes] = await Promise.all([
        getUsers({ limit: 100 }),
        getCategoriesTree('company')
      ]);
      
      setAuthors(authorsRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Error loading filters:', error);
    }
  };

  const loadPreview = async () => {
    try {
      setLoadingPreview(true);
      const result = await getBackupPreview(exportOptions);
      setPreview(result.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al carregar vista prèvia');
    } finally {
      setLoadingPreview(false);
    }
  };

  useEffect(() => {
    loadPreview();
  }, [exportOptions]);

  const handleExport = async () => {
    try {
      setExporting(true);
      const data = await exportGranularData(exportOptions);
      
      // Download automatically
      downloadBackupFile(data);
      
      toast.success('Backup exportat exitosament');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al exportar backup');
    } finally {
      setExporting(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      toast.error('Només es permeten arxius JSON');
      return;
    }

    try {
      setSelectedFile(file);
      
      const data = await readBackupFile(file);
      setBackupData(data);
      
      toast.success('Arxiu llegit correctament - Llest per importar');
    } catch (error: any) {
      toast.error(error.message || 'Error al llegir l\'arxiu');
      setSelectedFile(null);
      setBackupData(null);
    }
  };

  const handleImport = async () => {
    if (!backupData) return;

    try {
      setImporting(true);
      setShowImportDialog(false);
      
      const result = await importGranularData(backupData, importOptions);
      setImportResult(result.data.results);
      
      toast.success('Dades importades exitosament');
      
      // Clear state
      setSelectedFile(null);
      setBackupData(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al importar dades');
    } finally {
      setImporting(false);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setBackupData(null);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ca-ES');
  };

  const dataTypeIcons = {
    users: User,
    posts: MessageSquare,
    companies: Building,
    groups: Users,
    groupPosts: MessageSquare,
    forums: MessageSquare,
    forumPosts: MessageSquare,
    jobOffers: Briefcase,
    announcements: Megaphone,
    advisories: HelpCircle,
    categories: Tag,
    groupCategories: Tag,
    forumCategories: Tag
  };

  const dataTypeLabels = {
    users: 'Usuaris',
    posts: 'Posts',
    companies: 'Empreses',
    groups: 'Grups',
    groupPosts: 'Posts de Grups',
    forums: 'Fòrums',
    forumPosts: 'Posts de Fòrums',
    jobOffers: 'Ofertes de Treball',
    announcements: 'Anuncis',
    advisories: 'Assessoraments',
    categories: 'Categories',
    groupCategories: 'Categories de Grups',
    forumCategories: 'Categories de Fòrums'
  };

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Backup Granular</h1>
            <p className="text-gray-600">
              Sistema avançat d'exportació i importació de dades
            </p>
          </div>
          <Badge variant="secondary" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Només Administradors
          </Badge>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="export">Exportar Dades</TabsTrigger>
            <TabsTrigger value="import">Importar Dades</TabsTrigger>
          </TabsList>

          {/* Export Tab */}
          <TabsContent value="export" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Export Options */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Opcions d'Exportació
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Data Types Selection */}
                      <div>
                        <Label className="text-base font-medium mb-3 block">Tipus de Dades</Label>
                        <div className="grid grid-cols-2 gap-3">
                          {Object.entries(dataTypeLabels).map(([key, label]) => {
                            const Icon = dataTypeIcons[key as keyof typeof dataTypeIcons];
                            const optionKey = `include${key.charAt(0).toUpperCase() + key.slice(1)}` as keyof BackupOptions;
                            
                            return (
                              <div key={key} className="flex items-center space-x-2">
                                <Checkbox
                                  id={key}
                                  checked={exportOptions[optionKey] as boolean}
                                  onCheckedChange={(checked) => 
                                    setExportOptions(prev => ({ ...prev, [optionKey]: !!checked }))
                                  }
                                />
                                <Label htmlFor={key} className="flex items-center gap-2 cursor-pointer">
                                  <Icon className="h-4 w-4" />
                                  {label}
                                </Label>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Filters */}
                      <div className="space-y-4">
                        <Label className="text-base font-medium">Filtres</Label>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="dateFrom">Data d'inici</Label>
                            <Input
                              id="dateFrom"
                              type="date"
                              value={exportOptions.dateFrom || ''}
                              onChange={(e) => setExportOptions(prev => ({ ...prev, dateFrom: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="dateTo">Data final</Label>
                            <Input
                              id="dateTo"
                              type="date"
                              value={exportOptions.dateTo || ''}
                              onChange={(e) => setExportOptions(prev => ({ ...prev, dateTo: e.target.value }))}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="author">Filtrar per autor</Label>
                            <Select 
                              value={exportOptions.authorId || 'all'} 
                              onValueChange={(value) => setExportOptions(prev => ({ ...prev, authorId: value === 'all' ? undefined : value }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Tots els autors" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">Tots els autors</SelectItem>
                                {authors.map(author => (
                                  <SelectItem key={author._id} value={author._id}>
                                    {author.firstName} {author.lastName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="maxRecords">Màxim registres</Label>
                            <Input
                              id="maxRecords"
                              type="number"
                              value={exportOptions.maxRecords || 1000}
                              onChange={(e) => setExportOptions(prev => ({ ...prev, maxRecords: parseInt(e.target.value) || 1000 }))}
                              min="1"
                              max="10000"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Preview Panel */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Vista Prèvia
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={loadPreview}
                        disabled={loadingPreview}
                      >
                        <RefreshCw className={`h-4 w-4 ${loadingPreview ? 'animate-spin' : ''}`} />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingPreview ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    ) : preview ? (
                      <div className="space-y-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{preview.totalRecords}</div>
                          <div className="text-sm text-gray-600">Total registres</div>
                        </div>
                        
                        <div className="space-y-2">
                          {Object.entries(preview.statistics).map(([key, count]) => {
                            if (count === 0) return null;
                            const Icon = dataTypeIcons[key as keyof typeof dataTypeIcons];
                            const label = dataTypeLabels[key as keyof typeof dataTypeLabels];
                            
                            return (
                              <div key={key} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <Icon className="h-4 w-4 text-gray-500" />
                                  {label}
                                </div>
                                <Badge variant="secondary">{count}</Badge>
                              </div>
                            );
                          })}
                        </div>

                        <Button
                          onClick={handleExport}
                          disabled={exporting || preview.totalRecords === 0}
                          className="w-full"
                        >
                          {exporting ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Exportant...
                            </>
                          ) : (
                            <>
                              <Download className="h-4 w-4 mr-2" />
                              Exportar ({preview.totalRecords} registres)
                            </>
                          )}
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        Selecciona opcions per veure la vista prèvia
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Import Tab */}
          <TabsContent value="import" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Importar Dades
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Precaució:</strong> Aquesta acció pot modificar o afegir dades a la plataforma. 
                      Assegura't de tenir un backup abans de procedir.
                    </AlertDescription>
                  </Alert>

                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json"
                      onChange={handleFileSelect}
                      className="hidden"
                      disabled={importing}
                    />
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={importing}
                      className="w-full sm:w-auto"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Seleccionar Arxiu JSON
                    </Button>
                  </div>

                  {selectedFile && backupData && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-blue-500" />
                          <div>
                            <p className="font-medium">{selectedFile.name}</p>
                            <p className="text-sm text-gray-500">
                              {(selectedFile.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowPreview(true)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Vista Prèvia
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearSelection}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-center">
                        {Object.entries(backupData.statistics).map(([key, count]) => {
                          if (count === 0) return null;
                          const Icon = dataTypeIcons[key as keyof typeof dataTypeIcons];
                          const label = dataTypeLabels[key as keyof typeof dataTypeLabels];
                          
                          return (
                            <div key={key} className="p-3 border rounded-lg">
                              <div className="flex items-center justify-center mb-1">
                                <Icon className="h-5 w-5 text-blue-600" />
                              </div>
                              <div className="text-xl font-bold text-blue-600">{count}</div>
                              <div className="text-xs text-gray-600">{label}</div>
                            </div>
                          );
                        })}
                      </div>

                      <Button
                        onClick={() => setShowImportDialog(true)}
                        disabled={importing}
                        className="w-full sm:w-auto"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Configurar Importació
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Import Results */}
            {importResult && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Resultat de la Importació
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    {Object.entries(importResult).map(([key, result]) => (
                      <div key={key} className="space-y-2">
                        <h4 className="font-medium">{dataTypeLabels[key as keyof typeof dataTypeLabels]}</h4>
                        <div className="text-sm space-y-1">
                          <div className="flex justify-between">
                            <span>Creats:</span>
                            <Badge variant="default">{result.created}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Actualitzats:</span>
                            <Badge variant="secondary">{result.updated}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Omesos:</span>
                            <Badge variant="outline">{result.skipped}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Errors:</span>
                            <Badge variant="destructive">{result.errors}</Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Preview Dialog */}
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Vista Prèvia del Backup</DialogTitle>
              <DialogDescription>
                Informació detallada de l'arxiu de backup seleccionat
              </DialogDescription>
            </DialogHeader>
            {backupData && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Versió:</span> {backupData.version}
                  </div>
                  <div>
                    <span className="font-medium">Data d'Exportació:</span> {formatDate(backupData.exportDate)}
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium">Plataforma:</span> {backupData.platform}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium">Contingut de l'Arxiu</h4>
                  <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                    <pre className="text-xs">
                      {JSON.stringify(backupData, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Import Configuration Dialog */}
        <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Configurar Importació</DialogTitle>
              <DialogDescription>
                Selecciona quins elements importar i com gestionar els conflictes
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-3">
                <Label className="text-base font-medium">Elements a importar:</Label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(dataTypeLabels).map(([key, label]) => {
                    const Icon = dataTypeIcons[key as keyof typeof dataTypeIcons];
                    const optionKey = `import${key.charAt(0).toUpperCase() + key.slice(1)}` as keyof ImportOptions;
                    
                    return (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox
                          id={`import-${key}`}
                          checked={importOptions[optionKey] as boolean}
                          onCheckedChange={(checked) => 
                            setImportOptions(prev => ({ ...prev, [optionKey]: !!checked }))
                          }
                        />
                        <Label htmlFor={`import-${key}`} className="flex items-center gap-2 cursor-pointer">
                          <Icon className="h-4 w-4" />
                          {label}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-medium">Gestió de conflictes:</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="replaceExisting"
                    checked={importOptions.replaceExisting}
                    onCheckedChange={(checked) => 
                      setImportOptions(prev => ({ ...prev, replaceExisting: !!checked }))
                    }
                  />
                  <Label htmlFor="replaceExisting">
                    Reemplaçar elements existents amb el mateix nom/ID
                  </Label>
                </div>
                {!importOptions.replaceExisting && (
                  <p className="text-sm text-gray-600">
                    Els elements existents s'ometran durant la importació.
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowImportDialog(false)}>
                  Cancel·lar
                </Button>
                <Button onClick={handleImport} disabled={importing}>
                  {importing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Important...
                    </>
                  ) : (
                    <>
                      <Database className="h-4 w-4 mr-2" />
                      Importar Dades
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PageWrapper>
  );
}