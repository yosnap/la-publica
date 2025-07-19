
import { useState } from "react";
import { ExternalLink, Globe, Tag, Calendar, Eye, Grid, List, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { PageWrapper } from "@/components/PageWrapper";

const links = [
  {
    id: 1,
    title: "React Documentation",
    url: "https://reactjs.org/docs",
    description: "Documentación oficial de React para aprender y dominar esta biblioteca de JavaScript",
    category: "Tecnología",
    submittedBy: "TechSolutions S.A.",
    submitterLogo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=60&h=60&fit=crop",
    submittedDate: "hace 2 días",
    views: 245,
    tags: ["React", "JavaScript", "Documentación"],
    featured: true
  },
  {
    id: 2,
    title: "Google Analytics Academy",
    url: "https://analytics.google.com/analytics/academy",
    description: "Cursos gratuitos de Google para aprender Analytics y mejorar tus habilidades de análisis de datos",
    category: "Marketing",
    submittedBy: "Marketing Digital Pro",
    submitterLogo: "https://images.unsplash.com/photo-1554774853-719586f82d77?w=60&h=60&fit=crop",
    submittedDate: "hace 1 día",
    views: 189,
    tags: ["Analytics", "Google", "Cursos"],
    featured: false
  },
  {
    id: 3,
    title: "Startup School by Y Combinator",
    url: "https://www.startupschool.org",
    description: "Programa gratuito de 10 semanas diseñado para ayudar a fundadores de startups",
    category: "Emprendimiento",
    submittedBy: "Consultoría Empresarial",
    submitterLogo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop",
    submittedDate: "hace 3 días",
    views: 156,
    tags: ["Startup", "Y Combinator", "Emprendimiento"],
    featured: true
  },
  {
    id: 4,
    title: "Figma Design Resources",
    url: "https://www.figma.com/resources",
    description: "Recursos de diseño, plantillas y componentes para mejorar tu flujo de trabajo en Figma",
    category: "Diseño",
    submittedBy: "Design Studio",
    submitterLogo: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=60&h=60&fit=crop",
    submittedDate: "hace 4 días",
    views: 298,
    tags: ["Figma", "Diseño", "UX/UI"],
    featured: false
  }
];

export default function Links() {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("list");

  const LinkCard = ({ link, isGrid }: { link: any, isGrid: boolean }) => (
    <Card className="hover:shadow-lg transition-shadow overflow-hidden">
      <CardContent className={`p-6 ${isGrid ? 'h-full flex flex-col' : ''}`}>
        <div className={`flex ${isGrid ? 'flex-col' : 'flex-col sm:flex-row items-start'} gap-6`}>
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <Avatar className={`${isGrid ? 'h-16 w-16' : 'h-12 w-12'} flex-shrink-0`}>
              <AvatarImage src={link.submitterLogo} />
              <AvatarFallback>
                <Globe className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2 gap-2">
                <h3 className="text-lg font-semibold text-gray-900 hover:text-primary cursor-pointer break-words">
                  {link.title}
                </h3>
                {link.featured && (
                  <Badge className="bg-yellow-500 text-white flex-shrink-0">Destacado</Badge>
                )}
              </div>
              <p className="text-gray-600 font-medium mb-2 break-words">{link.submittedBy}</p>
              <p className="text-gray-600 mb-4 break-words">{link.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {link.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs break-words">{tag}</Badge>
                ))}
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <Tag className="h-4 w-4 flex-shrink-0" />
                  <span className="break-words">{link.category}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 flex-shrink-0" />
                  <span className="break-words">{link.submittedDate}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4 flex-shrink-0" />
                  <span className="break-words">{link.views} vistas</span>
                </div>
              </div>
              
              <div className="text-sm text-primary font-medium break-all">
                {link.url}
              </div>
            </div>
          </div>
          
          <div className={`${isGrid ? 'w-full mt-auto' : 'w-full sm:w-48 flex-shrink-0'}`}>
            <div className="flex gap-2">
              <Button className="flex-1" onClick={() => window.open(link.url, '_blank')}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Visitar
              </Button>
              <Button variant="outline" className="flex-1">Guardar</Button>
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
        { /* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-gray-900 break-words">Enllaços d'Interès</h1>
            <p className="text-gray-600 break-words">Recursos útiles compartidos por la comunidad empresarial</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90 flex-shrink-0">
            <ExternalLink className="h-4 w-4 mr-2" />
            Compartir Enlace
          </Button>
        </div>

        { /* Search and View Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1 min-w-0">
            <div className="flex-1 min-w-0">
              <Input
                placeholder="Buscar enllaços..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" className="flex-shrink-0">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
          
          <div className="flex items-center space-x-2 flex-shrink-0">
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

        { /* Links Grid/List */}
        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
          {links.map((link) => (
            <LinkCard key={link.id} link={link} isGrid={viewMode === "grid"} />
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}
