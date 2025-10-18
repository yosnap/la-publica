import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save, RotateCcw, Info } from 'lucide-react';
import apiClient from '@/api/client';
import { useToast } from '@/hooks/use-toast';

interface EmailConfig {
  _id: string;
  headerHtml: string;
  footerHtml: string;
  logoUrl: string;
  primaryColor: string;
  footerText: string;
}

export default function EmailConfigTab() {
  const [config, setConfig] = useState<EmailConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    headerHtml: '',
    footerHtml: '',
    logoUrl: '',
    primaryColor: '#4F8FF7',
    footerText: ''
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await apiClient.get('/admin/email-config');
      const data = response.data.data;
      setConfig(data);
      setFormData({
        headerHtml: data.headerHtml || '',
        footerHtml: data.footerHtml || '',
        logoUrl: data.logoUrl || '',
        primaryColor: data.primaryColor || '#4F8FF7',
        footerText: data.footerText || ''
      });
    } catch (error) {
      console.error('Error al obtener configuración:', error);
      toast({
        title: 'Error',
        description: 'No s\'ha pogut carregar la configuració d\'emails',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await apiClient.put('/admin/email-config', formData);

      if (response.data.success) {
        toast({
          title: 'Èxit',
          description: 'Configuració guardada correctament'
        });
        fetchConfig();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error al guardar la configuració',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Estàs segur que vols restablir la configuració als valors per defecte?')) return;

    try {
      const response = await apiClient.post('/admin/email-config/reset');

      if (response.data.success) {
        toast({
          title: 'Èxit',
          description: 'Configuració restablerta correctament'
        });
        fetchConfig();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error al restablir la configuració',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          El header i footer configurats aquí s'aplicaran automàticament a totes les plantilles d'email del sistema.
          Utilitza les variables {'{{logoUrl}}'}, {'{{primaryColor}}'}, {'{{year}}'} i {'{{footerText}}'}.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Configuració General</CardTitle>
          <CardDescription>
            Paràmetres bàsics per a tots els emails
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="logoUrl">URL del Logo</Label>
              <Input
                id="logoUrl"
                value={formData.logoUrl}
                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                placeholder="https://lapublica.cat/logo.svg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Color Primari</Label>
              <div className="flex gap-2">
                <Input
                  id="primaryColor"
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="w-20 h-10"
                />
                <Input
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  placeholder="#4F8FF7"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="footerText">Text del Footer</Label>
            <Textarea
              id="footerText"
              value={formData.footerText}
              onChange={(e) => setFormData({ ...formData, footerText: e.target.value })}
              placeholder="Aquesta és una notificació automàtica..."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>HTML del Header</CardTitle>
          <CardDescription>
            Codi HTML que apareixerà al principi de tots els emails
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Textarea
            value={formData.headerHtml}
            onChange={(e) => setFormData({ ...formData, headerHtml: e.target.value })}
            className="font-mono text-sm"
            rows={12}
            placeholder="<div>...</div>"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>HTML del Footer</CardTitle>
          <CardDescription>
            Codi HTML que apareixerà al final de tots els emails
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Textarea
            value={formData.footerHtml}
            onChange={(e) => setFormData({ ...formData, footerHtml: e.target.value })}
            className="font-mono text-sm"
            rows={12}
            placeholder="<div>...</div>"
          />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={handleReset}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Restablir
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Guardar Canvis
        </Button>
      </div>
    </div>
  );
}
