import { useState, useRef } from "react";
import { 
  Download, Upload, FileText, CheckCircle, AlertTriangle, 
  Settings, Database, Shield, Info, X, Eye 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PageWrapper } from "@/components/PageWrapper";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  exportConfiguration,
  importConfiguration,
  validateConfiguration,
  downloadConfigurationFile,
  readConfigurationFile,
  type BackupConfiguration,
  type ImportOptions,
  type ValidationResult,
  type ImportResult
} from "@/api/backup";

export default function PlatformBackup() {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [validating, setValidating] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [configuration, setConfiguration] = useState<BackupConfiguration | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [importOptions, setImportOptions] = useState<ImportOptions>({
    replaceExisting: false,
    importGroupCategories: true,
    importForumCategories: true,
    importForums: true
  });

  const handleExport = async () => {
    try {
      setExporting(true);
      const config = await exportConfiguration();
      
       // Descargar automáticamente
      downloadConfigurationFile(config);
      
      toast.success('Configuración exportada exitosamente');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al exportar la configuración');
    } finally {
      setExporting(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      toast.error('Solo se permiten archivos JSON');
      return;
    }

    try {
      setSelectedFile(file);
      setValidating(true);
      
      const config = await readConfigurationFile(file);
      setConfiguration(config);
      
       // Validar automáticamente
      const validationResult = await validateConfiguration(config);
      setValidation(validationResult.data);
      
      if (validationResult.data.isValid) {
        toast.success('Archivo válido - Listo para importar');
      } else {
        toast.warning('El archivo tiene errores de validación');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al leer el archivo');
      setSelectedFile(null);
      setConfiguration(null);
      setValidation(null);
    } finally {
      setValidating(false);
    }
  };

  const handleImport = async () => {
    if (!configuration) return;

    try {
      setImporting(true);
      setShowImportDialog(false);
      
      const result = await importConfiguration(configuration, importOptions);
      setImportResult(result.data.results);
      
      toast.success('Configuración importada exitosamente');
      
       // Limpiar estado
      setSelectedFile(null);
      setConfiguration(null);
      setValidation(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al importar la configuración');
    } finally {
      setImporting(false);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setConfiguration(null);
    setValidation(null);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES');
  };

  return (
    <PageWrapper>
      <div className="space-y-6">
        { /* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Respaldo de Configuración</h1>
            <p className="text-gray-600">
              Exporta e importa la configuración de la plataforma
            </p>
          </div>
          <Badge variant="secondary" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Solo Administradores
          </Badge>
        </div>

        { /* Export Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Exportar Configuración
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600">
                Descarga un archivo JSON con toda la configuración actual de la plataforma, 
                incluyendo categorías de grupos, categorías de foros y foros.
              </p>
              
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  El archivo exportado <strong>NO incluye</strong> datos de usuarios, posts o contenido. 
                  Solo incluye la estructura y configuración de la plataforma.
                </AlertDescription>
              </Alert>

              <Button 
                onClick={handleExport} 
                disabled={exporting}
                className="w-full sm:w-auto"
              >
                {exporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Exportando...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Exportar Configuración
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        { /* Import Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Importar Configuración
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600">
                Sube un archivo de configuración previamente exportado para restaurar 
                la configuración de la plataforma.
              </p>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Precaución:</strong> Esta acción puede modificar la configuración existente. 
                  Asegúrate de tener un respaldo antes de proceder.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={validating || importing}
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={validating || importing}
                    className="w-full sm:w-auto"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Seleccionar Archivo JSON
                  </Button>
                </div>

                {selectedFile && (
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
                        {configuration && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowPreview(true)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Vista Previa
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearSelection}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {validating && (
                      <div className="flex items-center gap-2 text-blue-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        Validando archivo...
                      </div>
                    )}

                    {validation && (
                      <div className="space-y-3">
                        <div className={`flex items-center gap-2 ${
                          validation.isValid ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {validation.isValid ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : (
                            <AlertTriangle className="h-5 w-5" />
                          )}
                          <span className="font-medium">
                            {validation.isValid ? 'Archivo válido' : 'Archivo con errores'}
                          </span>
                        </div>

                        {validation.errors.length > 0 && (
                          <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              <div className="space-y-1">
                                <p className="font-medium">Errores encontrados:</p>
                                <ul className="list-disc list-inside space-y-1">
                                  {validation.errors.map((error, index) => (
                                    <li key={index} className="text-sm">{error}</li>
                                  ))}
                                </ul>
                              </div>
                            </AlertDescription>
                          </Alert>
                        )}

                        {validation.warnings.length > 0 && (
                          <Alert>
                            <Info className="h-4 w-4" />
                            <AlertDescription>
                              <div className="space-y-1">
                                <p className="font-medium">Advertencias:</p>
                                <ul className="list-disc list-inside space-y-1">
                                  {validation.warnings.map((warning, index) => (
                                    <li key={index} className="text-sm">{warning}</li>
                                  ))}
                                </ul>
                              </div>
                            </AlertDescription>
                          </Alert>
                        )}

                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div className="p-3 border rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">
                              {validation.statistics.groupCategories}
                            </div>
                            <div className="text-sm text-gray-600">
                              Categorías de Grupos
                            </div>
                          </div>
                          <div className="p-3 border rounded-lg">
                            <div className="text-2xl font-bold text-green-600">
                              {validation.statistics.forumCategories}
                            </div>
                            <div className="text-sm text-gray-600">
                              Categorías de Foros
                            </div>
                          </div>
                          <div className="p-3 border rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">
                              {validation.statistics.forums}
                            </div>
                            <div className="text-sm text-gray-600">
                              Foros
                            </div>
                          </div>
                        </div>

                        {validation.isValid && (
                          <Button
                            onClick={() => setShowImportDialog(true)}
                            disabled={importing}
                            className="w-full sm:w-auto"
                          >
                            <Settings className="h-4 w-4 mr-2" />
                            Configurar Importación
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        { /* Import Results */}
        {importResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Resultado de la Importación
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <h4 className="font-medium">Categorías de Grupos</h4>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Creadas:</span>
                      <Badge variant="default">{importResult.groupCategories.created}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Omitidas:</span>
                      <Badge variant="secondary">{importResult.groupCategories.skipped}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Errores:</span>
                      <Badge variant="destructive">{importResult.groupCategories.errors}</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Categorías de Foros</h4>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Creadas:</span>
                      <Badge variant="default">{importResult.forumCategories.created}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Omitidas:</span>
                      <Badge variant="secondary">{importResult.forumCategories.skipped}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Errores:</span>
                      <Badge variant="destructive">{importResult.forumCategories.errors}</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Foros</h4>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Creados:</span>
                      <Badge variant="default">{importResult.forums.created}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Omitidos:</span>
                      <Badge variant="secondary">{importResult.forums.skipped}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Errores:</span>
                      <Badge variant="destructive">{importResult.forums.errors}</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        { /* Preview Dialog */}
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Vista Previa de la Configuración</DialogTitle>
              <DialogDescription>
                Información detallada del archivo de configuración seleccionado
              </DialogDescription>
            </DialogHeader>
            {configuration && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Versión:</span> {configuration.version}
                  </div>
                  <div>
                    <span className="font-medium">Fecha de Exportación:</span> {formatDate(configuration.exportDate)}
                  </div>
                  <div>
                    <span className="font-medium">Plataforma:</span> {configuration.platform}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium">Contenido del Archivo</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="text-xs overflow-x-auto">
                      {JSON.stringify(configuration, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        { /* Import Configuration Dialog */}
        <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Configurar Importación</DialogTitle>
              <DialogDescription>
                Selecciona qué elementos importar y cómo manejar los conflictos
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-3">
                <Label className="text-base font-medium">Elementos a importar:</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="groupCategories"
                      checked={importOptions.importGroupCategories}
                      onCheckedChange={(checked) => 
                        setImportOptions(prev => ({ ...prev, importGroupCategories: !!checked }))
                      }
                    />
                    <Label htmlFor="groupCategories">Categorías de Grupos</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="forumCategories"
                      checked={importOptions.importForumCategories}
                      onCheckedChange={(checked) => 
                        setImportOptions(prev => ({ ...prev, importForumCategories: !!checked }))
                      }
                    />
                    <Label htmlFor="forumCategories">Categorías de Foros</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="forums"
                      checked={importOptions.importForums}
                      onCheckedChange={(checked) => 
                        setImportOptions(prev => ({ ...prev, importForums: !!checked }))
                      }
                    />
                    <Label htmlFor="forums">Foros</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-medium">Manejo de conflictos:</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="replaceExisting"
                    checked={importOptions.replaceExisting}
                    onCheckedChange={(checked) => 
                      setImportOptions(prev => ({ ...prev, replaceExisting: !!checked }))
                    }
                  />
                  <Label htmlFor="replaceExisting">
                    Reemplazar elementos existentes con el mismo nombre
                  </Label>
                </div>
                {!importOptions.replaceExisting && (
                  <p className="text-sm text-gray-600">
                    Los elementos existentes se omitirán durante la importación.
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowImportDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleImport} disabled={importing}>
                  {importing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Importando...
                    </>
                  ) : (
                    <>
                      <Database className="h-4 w-4 mr-2" />
                      Importar Configuración
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