
import { User, Bell, Shield, Eye, Globe, Trash2, Save } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Settings = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-600">Gestiona tu cuenta y preferencias de privacidad</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-white border border-gray-200">
          <TabsTrigger value="profile" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            <User className="h-4 w-4 mr-2" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            <Bell className="h-4 w-4 mr-2" />
            Notificaciones
          </TabsTrigger>
          <TabsTrigger value="privacy" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            <Shield className="h-4 w-4 mr-2" />
            Privacidad
          </TabsTrigger>
          <TabsTrigger value="appearance" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            <Eye className="h-4 w-4 mr-2" />
            Apariencia
          </TabsTrigger>
          <TabsTrigger value="account" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            <Globe className="h-4 w-4 mr-2" />
            Cuenta
          </TabsTrigger>
        </TabsList>

        {/* Configuración del Perfil */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="shadow-sm border-0 bg-white">
            <CardHeader>
              <h3 className="text-lg font-semibold">Información Personal</h3>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=200&h=200&fit=crop&crop=face" />
                  <AvatarFallback className="text-xl">JD</AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button variant="outline">Cambiar Foto</Button>
                  <Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                    Eliminar Foto
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nombre</Label>
                  <Input id="firstName" defaultValue="Jane" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Apellidos</Label>
                  <Input id="lastName" defaultValue="Doe" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input id="email" type="email" defaultValue="jane@example.com" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Nombre de Usuario</Label>
                <Input id="username" defaultValue="@janedoe" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Biografía</Label>
                <Textarea
                  id="bio"
                  defaultValue="Desarrolladora Full Stack apasionada por crear soluciones innovadoras."
                  className="min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="location">Ubicación</Label>
                  <Input id="location" defaultValue="Madrid, España" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Sitio Web</Label>
                  <Input id="website" defaultValue="https://janedoe.dev" />
                </div>
              </div>

              <Button className="bg-primary hover:bg-primary/90">
                <Save className="h-4 w-4 mr-2" />
                Guardar Cambios
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuración de Notificaciones */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="shadow-sm border-0 bg-white">
            <CardHeader>
              <h3 className="text-lg font-semibold">Preferencias de Notificaciones</h3>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Notificaciones por Email</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Nuevos mensajes</p>
                      <p className="text-sm text-gray-600">Recibe notificaciones de nuevos mensajes privados</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Actividad en grupos</p>
                      <p className="text-sm text-gray-600">Notificaciones de actividad en tus grupos</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Menciones</p>
                      <p className="text-sm text-gray-600">Cuando alguien te menciona en un post</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Resumen semanal</p>
                      <p className="text-sm text-gray-600">Resumen de actividad semanal</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium text-gray-900 mb-4">Notificaciones Push</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Mensajes instantáneos</p>
                      <p className="text-sm text-gray-600">Notificaciones inmediatas de mensajes</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Comentarios</p>
                      <p className="text-sm text-gray-600">Cuando comenten en tus posts</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Nuevos seguidores</p>
                      <p className="text-sm text-gray-600">Cuando alguien te empiece a seguir</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>

              <Button className="bg-primary hover:bg-primary/90">
                <Save className="h-4 w-4 mr-2" />
                Guardar Preferencias
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuración de Privacidad */}
        <TabsContent value="privacy" className="space-y-6">
          <Card className="shadow-sm border-0 bg-white">
            <CardHeader>
              <h3 className="text-lg font-semibold">Configuración de Privacidad</h3>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Perfil público</p>
                    <p className="text-sm text-gray-600">Permite que otros usuarios vean tu perfil</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Mostrar email</p>
                    <p className="text-sm text-gray-600">Permite que otros vean tu dirección de email</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Indexación en buscadores</p>
                    <p className="text-sm text-gray-600">Permite que tu perfil aparezca en motores de búsqueda</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium text-gray-900 mb-4">¿Quién puede contactarte?</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Mensajes privados</Label>
                    <Select defaultValue="everyone">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="everyone">Cualquier persona</SelectItem>
                        <SelectItem value="connections">Solo conexiones</SelectItem>
                        <SelectItem value="groups">Miembros de mis grupos</SelectItem>
                        <SelectItem value="nobody">Nadie</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Invitaciones a grupos</Label>
                    <Select defaultValue="connections">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="everyone">Cualquier persona</SelectItem>
                        <SelectItem value="connections">Solo conexiones</SelectItem>
                        <SelectItem value="nobody">Nadie</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Button className="bg-primary hover:bg-primary/90">
                <Save className="h-4 w-4 mr-2" />
                Guardar Configuración
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuración de Apariencia */}
        <TabsContent value="appearance" className="space-y-6">
          <Card className="shadow-sm border-0 bg-white">
            <CardHeader>
              <h3 className="text-lg font-semibold">Personalización</h3>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Tema</Label>
                  <Select defaultValue="light">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Claro</SelectItem>
                      <SelectItem value="dark">Oscuro</SelectItem>
                      <SelectItem value="system">Sistema</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Idioma</Label>
                  <Select defaultValue="es">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Zona horaria</Label>
                  <Select defaultValue="madrid">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="madrid">Madrid (GMT+1)</SelectItem>
                      <SelectItem value="london">Londres (GMT+0)</SelectItem>
                      <SelectItem value="newyork">Nueva York (GMT-5)</SelectItem>
                      <SelectItem value="tokyo">Tokio (GMT+9)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Animaciones</p>
                    <p className="text-sm text-gray-600">Habilitar animaciones en la interfaz</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Reproducción automática</p>
                    <p className="text-sm text-gray-600">Reproducir videos automáticamente</p>
                  </div>
                  <Switch />
                </div>
              </div>

              <Button className="bg-primary hover:bg-primary/90">
                <Save className="h-4 w-4 mr-2" />
                Aplicar Cambios
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuración de Cuenta */}
        <TabsContent value="account" className="space-y-6">
          <Card className="shadow-sm border-0 bg-white">
            <CardHeader>
              <h3 className="text-lg font-semibold">Gestión de Cuenta</h3>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  Cambiar Contraseña
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Configurar Autenticación de Dos Factores
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Descargar Mis Datos
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Vincular Redes Sociales
                </Button>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Zona de Peligro</h4>
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <h5 className="font-medium text-red-900 mb-2">Eliminar Cuenta</h5>
                  <p className="text-sm text-red-700 mb-4">
                    Esta acción es permanente y no se puede deshacer. Se eliminarán todos tus datos, posts y conexiones.
                  </p>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar Cuenta
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
