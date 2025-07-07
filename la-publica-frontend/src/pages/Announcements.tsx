import { useState } from "react";
import { Megaphone, Filter, Calendar, Tag, Eye, TrendingUp, TrendingDown, Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageWrapper } from "@/components/PageWrapper";

const announcements = [
  {
    id: 1,
    type: "offer",
    title: "Servicios de Desarrollo Web Profesional",
    company: "TechSolutions S.A.",
    companyLogo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=60&h=60&fit=crop",
    description: "Ofrecemos servicios completos de desarrollo web con las últimas tecnologías. React, Node.js, bases de datos y hosting incluido.",
    price: "Desde €2,500",
    category: "Tecnología",
    posted: "hace 1 día",
    views: 156,
    featured: true,
    contact: "contacto@techsolutions.com"
  },
  {
    id: 2,
    type: "demand",
    title: "Busco Diseñador Gráfico para Proyecto",
    company: "StartupXYZ",
    companyLogo: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=60&h=60&fit=crop",
    description: "Necesitamos un diseñador gráfico para crear la identidad visual completa de nuestra startup tecnológica.",
    budget: "€1,500 - €3,000",
    category: "Diseño",
    posted: "hace 2 días",
    views: 89,
    featured: false,
    contact: "jobs@startupxyz.com"
  },
  {
    id: 3,
    type: "offer",
    title: "Consultoría en Marketing Digital",
    company: "Marketing Digital Pro",
    companyLogo: "https://images.unsplash.com/photo-1554774853-719586f82d77?w=60&h=60&fit=crop",
    description: "Estrategias personalizadas de marketing digital para aumentar tu presencia online y conversiones.",
    price: "€500/mes",
    category: "Marketing",
    posted: "hace 3 días",
    views: 234,
    featured: true,
    contact: "info@marketingpro.es"
  },
  {
    id: 4,
    type: "demand",
    title: "Necesito Auditoría de Seguridad Web",
    company: "E-commerce Plus",
    companyLogo: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=60&h=60&fit=crop",
    description: "Buscamos experto en ciberseguridad para realizar auditoría completa de nuestra plataforma e-commerce.",
    budget: "€2,000 - €4,000",
    category: "Seguridad",
    posted: "hace 1 semana",
    views: 67,
    featured: false,
    contact: "security@ecommerceplus.com"
  }
];

export default function Announcements() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [viewMode, setViewMode] = useState("list");

  const offerAnnouncements = announcements.filter(a => a.type === "offer");
  const demandAnnouncements = announcements.filter(a => a.type === "demand");

  const AnnouncementCard = ({ announcement, isGrid }: { announcement: any, isGrid: boolean }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className={`p-6 ${isGrid ? 'h-full' : ''}`}>
        <div className={`flex ${isGrid ? 'flex-col' : 'items-start'} gap-6`}>
          <div className="flex items-start gap-4 flex-1">
            <Avatar className={`${isGrid ? 'h-16 w-16' : 'h-12 w-12'} flex-shrink-0`}>
              <AvatarImage src={announcement.companyLogo} />
              <AvatarFallback>{announcement.company[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900 hover:text-primary cursor-pointer">
                  {announcement.title}
                </h3>
                <div className="flex items-center gap-2 ml-2">
                  {announcement.featured && (
                    <Badge className="bg-yellow-500 text-white">Destacado</Badge>
                  )}
                  <Badge className={announcement.type === "offer" ? "bg-green-500" : "bg-blue-500"}>
                    {announcement.type === "offer" ? (
                      <><TrendingUp className="h-3 w-3 mr-1" /> Oferta</>
                    ) : (
                      <><TrendingDown className="h-3 w-3 mr-1" /> Demanda</>
                    )}
                  </Badge>
                </div>
              </div>
              <p className="text-gray-600 font-medium mb-2">{announcement.company}</p>
              <p className="text-gray-600 mb-4">{announcement.description}</p>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <Tag className="h-4 w-4" />
                  <span>{announcement.category}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{announcement.posted}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{announcement.views} vistas</span>
                </div>
              </div>
              
              <div className="text-lg font-bold text-primary">
                {announcement.type === "offer" ? announcement.price : announcement.budget}
              </div>
            </div>
          </div>
          
          <div className={`${isGrid ? 'w-full mt-4' : 'w-48 flex-shrink-0'}`}>
            <div className="flex gap-2">
              <Button className="flex-1">Ver Detalles</Button>
              <Button variant="outline" className="flex-1">Contactar</Button>
            </div>
            {!isGrid && (
              <Button variant="ghost" size="sm" className="w-full mt-2">
                <Eye className="h-4 w-4 mr-2" />
                Seguir
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Anuncios Empresariales</h1>
            <p className="text-gray-600">Ofertas y demandas de servicios entre empresas</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <Megaphone className="h-4 w-4 mr-2" />
            Publicar Anuncio
          </Button>
        </div>

        {/* Search and Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2">
            <Input
              placeholder="Buscar anuncios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Ofertas Activas</p>
                <p className="text-lg font-bold">{offerAnnouncements.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingDown className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Demandas</p>
                <p className="text-lg font-bold">{demandAnnouncements.length}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* View Toggle and Filter Tabs */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Tabs value={activeFilter} onValueChange={setActiveFilter} className="flex-1">
            <TabsList className="grid w-full grid-cols-3 max-w-md bg-white border">
              <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                Todos
              </TabsTrigger>
              <TabsTrigger value="offers" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                Ofertas ({offerAnnouncements.length})
              </TabsTrigger>
              <TabsTrigger value="demands" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                Demandas ({demandAnnouncements.length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <Tabs value={activeFilter} onValueChange={setActiveFilter} className="w-full">
          <TabsContent value="all" className="space-y-4">
            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
              {announcements.map((announcement) => (
                <AnnouncementCard key={announcement.id} announcement={announcement} isGrid={viewMode === "grid"} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="offers" className="space-y-4">
            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
              {offerAnnouncements.map((announcement) => (
                <AnnouncementCard key={announcement.id} announcement={announcement} isGrid={viewMode === "grid"} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="demands" className="space-y-4">
            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
              {demandAnnouncements.map((announcement) => (
                <AnnouncementCard key={announcement.id} announcement={announcement} isGrid={viewMode === "grid"} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageWrapper>
  );
}
