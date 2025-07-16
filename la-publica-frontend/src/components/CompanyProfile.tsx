
import { Edit, MapPin, Calendar, Users, Camera, Settings, Building2, Globe, Phone, Mail } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CompanyProfileProps {
  companyData: {
    name: string;
    description: string;
    logo: string;
    coverImage: string;
    location: string;
    foundedYear: string;
    website: string;
    phone: string;
    email: string;
    employees: string;
    industry: string;
  };
}

const CompanyProfile = ({ companyData }: CompanyProfileProps) => {
  const companyStats = [
    { label: "Servicios", value: "24" },
    { label: "Clientes", value: "150+" },
    { label: "Proyectos", value: "89" },
    { label: "Años", value: "8" }
  ];

  const companyServices = [
    {
      id: 1,
      title: "Desarrollo Web",
      description: "Creamos sitios web modernos y responsivos usando las últimas tecnologías",
      category: "Tecnología",
      price: "Desde €2,500",
      duration: "2-4 semanas"
    },
    {
      id: 2,
      title: "Consultoría Digital",
      description: "Asesoramiento estratégico para la transformación digital de tu empresa",
      category: "Consultoría",
      price: "€150/hora",
      duration: "Flexible"
    }
  ];

  const companyProjects = [
    { name: "E-commerce Fashion", client: "Moda XYZ", year: "2024", category: "Web Development" },
    { name: "App Móvil Delivery", client: "Food Express", year: "2023", category: "Mobile App" },
    { name: "Sistema CRM", client: "Sales Corp", year: "2023", category: "Software" }
  ];

  const certifications = [
    { title: "ISO 9001:2015", description: "Certificación de calidad", icon: "🏆" },
    { title: "Partner Google", description: "Google Cloud Partner certificado", icon: "✨" },
    { title: "AWS Certified", description: "Amazon Web Services Partner", icon: "☁️" }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      { /* Header del Perfil de Empresa */}
      <Card className="shadow-sm border-0 bg-white overflow-hidden">
        { /* Cover Photo */}
        <div className="h-48 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
          <Button
            variant="secondary"
            size="sm"
            className="absolute top-4 right-4 bg-white /20 backdrop-blur-sm text-white hover:bg-white/30"
          >
            <Camera className="h-4 w-4 mr-2" />
            Cambiar portada
          </Button>
        </div>

        <CardContent className="px-6 pb-6 pt-0 relative">
          { /* Logo solapando la imagen de portada */}
          <div className="flex justify-center -mt-16 mb-4">
            <div className="relative">
              <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                <AvatarImage src={companyData.logo} />
                <AvatarFallback className="text-2xl">
                  <Building2 className="h-12 w-12" />
                </AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary hover:bg-primary/90 p-0"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
          </div>

          { /* Información de la Empresa Centrada */}
          <div className="text-center space-y-3 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{companyData.name}</h1>
              <p className="text-gray-600 text-lg">{companyData.description}</p>
              <Badge className="mt-2 bg-blue-100 text-blue-800">{companyData.industry}</Badge>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-500 max-w-md mx-auto">
              <div className="flex items-center justify-center">
                <MapPin className="h-4 w-4 mr-1" />
                {companyData.location}
              </div>
              <div className="flex items-center justify-center">
                <Calendar className="h-4 w-4 mr-1" />
                Fundada en {companyData.foundedYear}
              </div>
              <div className="flex items-center justify-center">
                <Globe className="h-4 w-4 mr-1" />
                {companyData.website}
              </div>
              <div className="flex items-center justify-center">
                <Users className="h-4 w-4 mr-1" />
                {companyData.employees} empleados
              </div>
            </div>

            { /* Botones de Acción */}
            <div className="flex justify-center gap-3 pt-2">
              <Button size="sm">
                <Phone className="h-4 w-4 mr-2" />
                Contactar
              </Button>
              <Button variant="outline" size="sm">
                <Mail className="h-4 w-4 mr-2" />
                Enviar Mensaje
              </Button>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Seguir
              </Button>
            </div>
          </div>

          { /* Estadísticas en una fila horizontal */}
          <div className="grid grid-cols-4 gap-4 text-center border-t pt-6">
            {companyStats.map((stat, index) => (
              <div key={index}>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      { /* Contenido con Tabs */}
      <Tabs defaultValue="services" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-white border">
          <TabsTrigger value="services" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            Servicios
          </TabsTrigger>
          <TabsTrigger value="about" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            Acerca de
          </TabsTrigger>
          <TabsTrigger value="projects" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            Proyectos
          </TabsTrigger>
          <TabsTrigger value="certifications" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            Certificaciones
          </TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-4">
          {companyServices.map((service) => (
            <Card key={service.id} className="shadow-sm border-0 bg-white">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{service.title}</h3>
                      <Badge variant="secondary">{service.category}</Badge>
                    </div>
                    <p className="text-gray-600 mb-3">{service.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span><strong>Precio:< /strong> {service.price}</span>
                      <span><strong>Duración:< /strong> {service.duration}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm">Ver Detalles</Button>
                    <Button variant="outline" size="sm">Solicitar</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="about" className="space-y-6">
          <Card className="shadow-sm border-0 bg-white">
            <CardHeader>
              <h3 className="text-lg font-semibold">Información de la Empresa</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Descripción</h4>
                <p className="text-gray-700">
                  Somos una empresa líder en desarrollo de software y consultoría digital. 
                  Con más de 8 años de experiencia, hemos ayudado a cientos de empresas 
                  a transformar sus procesos y crear soluciones tecnológicas innovadoras.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Especialidades</h4>
                <div className="flex flex-wrap gap-2">
                  {["Desarrollo Web", "Apps Móviles", "Consultoría IT", "Cloud Computing", "E-commerce", "CRM"].map((specialty) => (
                    <Badge key={specialty} variant="secondary" className="bg-primary/10 text-primary">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Contacto</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span>{companyData.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span>{companyData.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4 text-gray-500" />
                    <span>{companyData.website}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          {companyProjects.map((project, index) => (
            <Card key={index} className="shadow-sm border-0 bg-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{project.name}</h3>
                      <p className="text-sm text-gray-600">{project.client} • {project.year}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant="secondary">{project.category}</Badge>
                    <Button variant="outline" size="sm">Ver Proyecto</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="certifications" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {certifications.map((cert, index) => (
              <Card key={index} className="shadow-sm border-0 bg-white">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="text-3xl">{cert.icon}</div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{cert.title}</h3>
                      <p className="text-sm text-gray-600">{cert.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CompanyProfile;
