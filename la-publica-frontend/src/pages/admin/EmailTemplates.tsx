import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Edit, Trash2, Eye, Send, Loader2, Code, Settings } from 'lucide-react';
import apiClient from '@/api/client';
import { useToast } from '@/hooks/use-toast';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import EmailConfigTab from '@/components/admin/EmailConfigTab';

interface EmailTemplate {
  _id: string;
  name: string;
  slug: string;
  subject: string;
  htmlBody: string;
  textBody?: string;
  variables: string[];
  description?: string;
  category: 'auth' | 'notification' | 'system' | 'custom';
  isActive: boolean;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TemplateFormData {
  name: string;
  slug: string;
  subject: string;
  htmlBody: string;
  textBody: string;
  description: string;
  category: 'auth' | 'notification' | 'system' | 'custom';
  isActive: boolean;
  variables: string;
}

const CATEGORY_LABELS = {
  auth: 'Autenticació',
  notification: 'Notificacions',
  system: 'Sistema',
  custom: 'Personalitzat'
};

export default function EmailTemplates() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [htmlEditorMode, setHtmlEditorMode] = useState<'visual' | 'code'>('visual');
  const { toast } = useToast();

  const [formData, setFormData] = useState<TemplateFormData>({
    name: '',
    slug: '',
    subject: '',
    htmlBody: '',
    textBody: '',
    description: '',
    category: 'custom',
    isActive: true,
    variables: ''
  });

  // Configuración del editor Quill
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean']
    ],
  };

  const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list', 'bullet',
    'align',
    'link', 'image'
  ];

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await apiClient.get('/admin/email-templates');
      setTemplates(response.data.data || []);
    } catch (error) {
      console.error('Error al obtener plantillas:', error);
      toast({
        title: 'Error',
        description: 'No s\'han pogut carregar les plantilles d\'email',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    try {
      const variables = formData.variables.split(',').map(v => v.trim()).filter(v => v);

      const response = await apiClient.post('/admin/email-templates', {
        ...formData,
        variables
      });

      if (response.data.success) {
        toast({
          title: 'Èxit',
          description: 'Plantilla creada correctament'
        });
        fetchTemplates();
        setIsCreating(false);
        resetForm();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error al crear la plantilla',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateTemplate = async () => {
    if (!selectedTemplate) return;

    try {
      const variables = formData.variables.split(',').map(v => v.trim()).filter(v => v);

      const response = await apiClient.put(`/admin/email-templates/${selectedTemplate._id}`, {
        ...formData,
        variables
      });

      if (response.data.success) {
        toast({
          title: 'Èxit',
          description: 'Plantilla actualitzada correctament'
        });
        fetchTemplates();
        setIsEditing(false);
        setSelectedTemplate(null);
        resetForm();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error al actualitzar la plantilla',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Estàs segur que vols eliminar aquesta plantilla?')) return;

    try {
      const response = await apiClient.delete(`/admin/email-templates/${id}`);

      if (response.data.success) {
        toast({
          title: 'Èxit',
          description: 'Plantilla eliminada correctament'
        });
        fetchTemplates();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error al eliminar la plantilla',
        variant: 'destructive'
      });
    }
  };

  const handlePreview = async (template: EmailTemplate) => {
    try {
      const testData: any = {};
      template.variables.forEach(variable => {
        testData[variable] = `[${variable}]`;
      });

      const response = await apiClient.post(`/admin/email-templates/${template._id}/preview`, testData);

      if (response.data.success) {
        setPreviewHtml(response.data.data.html);
        setShowPreview(true);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error al generar la vista prèvia',
        variant: 'destructive'
      });
    }
  };

  const handleSendTest = async (template: EmailTemplate) => {
    if (!testEmail) {
      toast({
        title: 'Error',
        description: 'Introdueix un email de prova',
        variant: 'destructive'
      });
      return;
    }

    setSendingTest(true);
    try {
      const testData: any = { testEmail };
      template.variables.forEach(variable => {
        testData[variable] = `[Valor de prova per ${variable}]`;
      });

      const response = await apiClient.post(`/admin/email-templates/${template._id}/send-test`, testData);

      if (response.data.success) {
        toast({
          title: 'Èxit',
          description: 'Email de prova enviat correctament'
        });
        setTestEmail('');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error al enviar l\'email de prova',
        variant: 'destructive'
      });
    } finally {
      setSendingTest(false);
    }
  };

  const handleEdit = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      slug: template.slug,
      subject: template.subject,
      htmlBody: template.htmlBody,
      textBody: template.textBody || '',
      description: template.description || '',
      category: template.category,
      isActive: template.isActive,
      variables: template.variables.join(', ')
    });
    setIsEditing(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      subject: '',
      htmlBody: '',
      textBody: '',
      description: '',
      category: 'custom',
      isActive: true,
      variables: ''
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Emails</h1>
        <p className="text-muted-foreground mt-2">Gestiona les plantilles i la configuració dels emails del sistema</p>
      </div>

      <Tabs defaultValue="plantilles" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="plantilles">Plantilles</TabsTrigger>
          <TabsTrigger value="configuracio">
            <Settings className="mr-2 h-4 w-4" />
            Configuració Global
          </TabsTrigger>
        </TabsList>

        <TabsContent value="plantilles" className="space-y-6">
          <div className="flex justify-end">
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Plantilla
            </Button>
          </div>

          {/* Lista de plantillas */}
          <div className="grid grid-cols-1 gap-4">
        {templates.map((template) => (
          <Card key={template._id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-xl">{template.name}</CardTitle>
                    <Badge variant={template.isActive ? 'default' : 'secondary'}>
                      {template.isActive ? 'Activa' : 'Inactiva'}
                    </Badge>
                    {template.isSystem && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        Sistema
                      </Badge>
                    )}
                    <Badge variant="outline">{CATEGORY_LABELS[template.category]}</Badge>
                  </div>
                  <CardDescription className="text-sm space-y-1">
                    <span className="block"><strong>Slug:</strong> {template.slug}</span>
                    <span className="block"><strong>Assumpte:</strong> {template.subject}</span>
                    {template.description && <span className="block mt-1">{template.description}</span>}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreview(template)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {!template.isSystem && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(template)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteTemplate(template._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {template.variables.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">Variables disponibles:</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {template.variables.map((variable) => (
                        <Badge key={variable} variant="secondary" className="font-mono text-xs">
                          {`{{${variable}}}`}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Input
                    type="email"
                    placeholder="Email de prova"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    className="max-w-xs"
                  />
                  <Button
                    onClick={() => handleSendTest(template)}
                    disabled={sendingTest}
                    size="sm"
                  >
                    {sendingTest ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="mr-2 h-4 w-4" />
                    )}
                    Enviar prova
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog para crear/editar plantilla */}
      <Dialog open={isCreating || isEditing} onOpenChange={(open) => {
        if (!open) {
          setIsCreating(false);
          setIsEditing(false);
          setSelectedTemplate(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isCreating ? 'Crear Nova Plantilla' : 'Editar Plantilla'}</DialogTitle>
            <DialogDescription>
              {isCreating ? 'Crea una nova plantilla d\'email personalitzada' : 'Modifica la plantilla d\'email'}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="html">HTML</TabsTrigger>
              <TabsTrigger value="text">Text Pla</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom de la plantilla</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nom descriptiu"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug (identificador únic)</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="slug-de-la-plantilla"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Assumpte de l'email</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Assumpte de l'email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripció</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descripció de la plantilla"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value: any) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auth">Autenticació</SelectItem>
                      <SelectItem value="notification">Notificacions</SelectItem>
                      <SelectItem value="system">Sistema</SelectItem>
                      <SelectItem value="custom">Personalitzat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="variables">Variables (separades per comes)</Label>
                  <Input
                    id="variables"
                    value={formData.variables}
                    onChange={(e) => setFormData({ ...formData, variables: e.target.value })}
                    placeholder="firstName, lastName, url"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive">Plantilla activa</Label>
              </div>
            </TabsContent>

            <TabsContent value="html" className="space-y-4">
              <Alert>
                <Code className="h-4 w-4" />
                <AlertDescription>
                  Utilitza {'{{variable}}'} per inserir variables. Exemple: {'{{firstName}}'}, {'{{url}}'}
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="htmlBody">Contingut HTML</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={htmlEditorMode === 'visual' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setHtmlEditorMode('visual')}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Visual
                    </Button>
                    <Button
                      type="button"
                      variant={htmlEditorMode === 'code' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setHtmlEditorMode('code')}
                    >
                      <Code className="mr-2 h-4 w-4" />
                      Codi
                    </Button>
                  </div>
                </div>

                {htmlEditorMode === 'visual' ? (
                  <div className="border rounded-md overflow-hidden bg-white">
                    <ReactQuill
                      theme="snow"
                      value={formData.htmlBody}
                      onChange={(value) => setFormData({ ...formData, htmlBody: value })}
                      modules={quillModules}
                      formats={quillFormats}
                      style={{ height: '400px', marginBottom: '42px' }}
                    />
                  </div>
                ) : (
                  <Textarea
                    id="htmlBody"
                    value={formData.htmlBody}
                    onChange={(e) => setFormData({ ...formData, htmlBody: e.target.value })}
                    className="font-mono text-sm"
                    rows={20}
                    placeholder="<div>...</div>"
                  />
                )}
              </div>
            </TabsContent>

            <TabsContent value="text" className="space-y-4">
              <Alert>
                <Code className="h-4 w-4" />
                <AlertDescription>
                  Versió en text pla per clients de correu que no suporten HTML
                </AlertDescription>
              </Alert>
              <div className="space-y-2">
                <Label htmlFor="textBody">Contingut Text Pla</Label>
                <Textarea
                  id="textBody"
                  value={formData.textBody}
                  onChange={(e) => setFormData({ ...formData, textBody: e.target.value })}
                  className="font-mono text-sm"
                  rows={20}
                  placeholder="Text pla sense format..."
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsCreating(false);
                setIsEditing(false);
                setSelectedTemplate(null);
                resetForm();
              }}
            >
              Cancel·lar
            </Button>
            <Button onClick={isCreating ? handleCreateTemplate : handleUpdateTemplate}>
              {isCreating ? 'Crear Plantilla' : 'Guardar Canvis'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

          {/* Dialog de vista previa */}
          <Dialog open={showPreview} onOpenChange={setShowPreview}>
            <DialogContent className="max-w-4xl max-h-[90vh]">
              <DialogHeader>
                <DialogTitle>Vista Prèvia de l'Email</DialogTitle>
                <DialogDescription>
                  Aquesta és una vista prèvia de com es veurà l'email amb dades d'exemple
                </DialogDescription>
              </DialogHeader>
              <div className="border rounded-lg overflow-auto max-h-[70vh] bg-gray-50 p-4">
                <div
                  className="bg-white p-4 rounded-md shadow-sm"
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="configuracio">
          <EmailConfigTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
