import { useState } from "react";
import { Briefcase, MapPin, Calendar, DollarSign, Grid, List, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { PageWrapper } from "@/components/PageWrapper";

const offers = [
  {
    id: 1,
    title: "Desarrollador Frontend React",
    company: "TechSolutions S.A.",
    companyLogo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=60&h=60&fit=crop",
    description: "Buscamos desarrollador Frontend con experiencia en React, TypeScript y Tailwind CSS para unirse a nuestro equipo.",
    location: "Madrid, España",
    type: "Tiempo completo",
    salary: "€35,000 - €45,000",
    posted: "hace 2 días",
    category: "Tecnología",
    skills: ["React", "TypeScript", "Tailwind CSS"]
  },
  {
    id: 2,
    title: "Especialista en Marketing Digital",
    company: "Marketing Digital Pro",
    companyLogo: "https://images.unsplash.com/photo-1554774853-719586f82d77?w=60&h=60&fit=crop",
    description: "Oportunidad para especialista en marketing digital con experiencia en SEO, SEM y redes sociales.",
    location: "Barcelona, España",
    type: "Remoto",
    salary: "€28,000 - €38,000",
    posted: "hace 1 día",
    category: "Marketing",
    skills: ["SEO", "Google Ads", "Social Media"]
  },
  {
    id: 3,
    title: "Consultor de Estrategia Empresarial",
    company: "Consultoría Empresarial",
    companyLogo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop",
    description: "Únete a nuestro equipo como consultor estratégico para ayudar a empresas en su crecimiento.",
    location: "Valencia, España",
    type: "Híbrido",
    salary: "€40,000 - €55,000",
    posted: "hace 3 días",
    category: "Consultoría",
    skills: ["Análisis Estratégico", "Finanzas", "Liderazgo"]
  }
];

export default function Offers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("list");

  const OfferCard = ({ offer, isGrid }: { offer: any, isGrid: boolean }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className={`p-6 ${isGrid ? 'h-full' : ''}`}>
        <div className={`flex ${isGrid ? 'flex-col' : 'items-start'} gap-6`}>
          <div className="flex items-start gap-4 flex-1">
            <Avatar className={`${isGrid ? 'h-16 w-16' : 'h-12 w-12'} flex-shrink-0`}>
              <AvatarImage src={offer.companyLogo} />
              <AvatarFallback>
                <Briefcase className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 mb-1 hover:text-primary cursor-pointer">
                {offer.title}
              </h3>
              <p className="text-gray-600 font-medium mb-2">{offer.company}</p>
              <p className="text-gray-600 mb-4">{offer.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {offer.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
                ))}
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{offer.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  <span>{offer.type}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{offer.posted}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className={`${isGrid ? 'w-full mt-4' : 'w-48 flex-shrink-0'}`}>
            <div className="mb-4">
              <div className="text-lg font-bold text-primary mb-2">{offer.salary}</div>
              <Badge className="mb-4">{offer.category}</Badge>
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="flex-1">Ver Oferta</Button>
              <Button size="sm" variant="outline" className="flex-1">Aplicar</Button>
            </div>
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
            <h1 className="text-2xl font-bold text-gray-900">Ofertas de Trabajo</h1>
            <p className="text-gray-600">Encuentra oportunidades laborales en empresas verificadas</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <Briefcase className="h-4 w-4 mr-2" />
            Publicar Oferta
          </Button>
        </div>

        {/* Search and View Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="flex-1">
              <Input
                placeholder="Buscar ofertas de trabajo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
          
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

        {/* Offers Grid/List */}
        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
          {offers.map((offer) => (
            <OfferCard key={offer.id} offer={offer} isGrid={viewMode === "grid"} />
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}
