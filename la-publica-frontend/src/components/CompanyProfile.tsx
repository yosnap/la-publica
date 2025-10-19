
import { Edit, MapPin, Calendar, Users, Camera, Settings, Building2, Globe, Phone, Mail, Briefcase, HelpCircle, Star, DollarSign, Clock } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CompanyProfileProps {
  companyData: {
    _id: string;
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
  isOwner?: boolean;
  offers?: any[];
  advisories?: any[];
}

const CompanyProfile = ({ companyData, isOwner = false, offers = [], advisories = [] }: CompanyProfileProps) => {
  const companyStats = [
    { label: "Serveis", value: "24" },
    { label: "Clients", value: "150+" },
    { label: "Projectes", value: "89" },
    { label: "Anys", value: "8" }
  ];

  const companyServices = [
    {
      id: 1,
      title: "Desenvolupament Web",
      description: "Creem llocs web moderns i responsius utilitzant les últimes tecnologies",
      category: "Tecnologia",
      price: "Des de €2,500",
      duration: "2-4 setmanes"
    },
    {
      id: 2,
      title: "Consultoria Digital",
      description: "Assessorament estratègic per a la transformació digital de la teva empresa",
      category: "Consultoria",
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
          {isOwner && (
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
            >
              <Camera className="h-4 w-4 mr-2" />
              Canviar portada
            </Button>
          )}
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
              {isOwner && (
                <Button
                  size="sm"
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary hover:bg-primary/90 p-0"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              )}
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
              {isOwner ? (
                <Button variant="default" size="sm" onClick={() => window.location.href = '/colaborador/empresas'}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Empresa
                </Button>
              ) : (
                <>
                  <Button variant="default" size="sm">
                    <Phone className="h-4 w-4 mr-2" />
                    Contactar
                  </Button>
                  <Button variant="outline" size="sm">
                    <Mail className="h-4 w-4 mr-2" />
                    Enviar Missatge
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Seguir
                  </Button>
                </>
              )}
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
        <TabsList className="grid w-full grid-cols-6 bg-white border">
          <TabsTrigger value="services" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            Serveis
          </TabsTrigger>
          <TabsTrigger value="offers" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            Ofertes
          </TabsTrigger>
          <TabsTrigger value="advisories" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            Assessoraments
          </TabsTrigger>
          <TabsTrigger value="about" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            Sobre nosaltres
          </TabsTrigger>
          <TabsTrigger value="projects" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            Projectes
          </TabsTrigger>
          <TabsTrigger value="certifications" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            Certificacions
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
                      <span><strong>Preu:</strong> {service.price}</span>
                      <span><strong>Durada:</strong> {service.duration}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="default" size="sm">Veure Detalls</Button>
                    <Button variant="outline" size="sm">Sol·licitar</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="offers" className="space-y-4">
          {offers.length === 0 ? (
            <Card className="shadow-sm border-0 bg-white">
              <CardContent className="p-12 text-center">
                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay ofertas disponibles</h3>
                <p className="text-gray-600">Esta empresa no tiene ofertas de trabajo activas en este momento.</p>
              </CardContent>
            </Card>
          ) : (
            offers.map((offer) => (
              <Card key={offer._id} className="shadow-sm border-0 bg-white">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{offer.title}</h3>
                        <Badge variant={offer.isActive ? "default" : "secondary"}>
                          {offer.isActive ? "Activa" : "Tancada"}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-3">{offer.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        {offer.location && (
                          <span className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {offer.location.isRemote ? "Remot" : `${offer.location.city}, ${offer.location.country}`}
                          </span>
                        )}
                        {offer.employmentType && (
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {offer.employmentType}
                          </span>
                        )}
                        {offer.salary && (offer.salary.min || offer.salary.max) && (
                          <span className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            {offer.salary?.min && offer.salary?.max ? `€${offer.salary.min} - €${offer.salary.max}` : "A convenir"}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="default" size="sm">Veure Detalls</Button>
                      <Button variant="outline" size="sm">Aplicar</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="advisories" className="space-y-4">
          {advisories.length === 0 ? (
            <Card className="shadow-sm border-0 bg-white">
              <CardContent className="p-12 text-center">
                <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay asesoramientos disponibles</h3>
                <p className="text-gray-600">Esta empresa no ofrece servicios de asesoría en este momento.</p>
              </CardContent>
            </Card>
          ) : (
            advisories.map((advisory) => (
              <Card key={advisory._id} className="shadow-sm border-0 bg-white">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{advisory.title}</h3>
                        <Badge variant={advisory.isActive ? "default" : "secondary"}>
                          {advisory.isActive ? "Disponible" : "No disponible"}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-3">{advisory.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {advisory.pricing?.sessionDuration || 60} min
                        </span>
                        <span className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          {advisory.pricing?.type === 'free' ? 'Gratuït' : 
                           advisory.pricing?.hourlyRate ? `€${advisory.pricing.hourlyRate}/hora` : 
                           advisory.pricing?.sessionRate ? `€${advisory.pricing.sessionRate}/sessió` : 'Consultar'}
                        </span>
                        {advisory.stats?.averageRating > 0 && (
                          <span className="flex items-center">
                            <Star className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-400" />
                            {advisory.stats.averageRating.toFixed(1)}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {advisory.expertise?.slice(0, 3).map((skill: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="default" size="sm">Veure Detalls</Button>
                      <Button variant="outline" size="sm">Contactar</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
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
                    <Button variant="outline" size="sm">Veure Projecte</Button>
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
