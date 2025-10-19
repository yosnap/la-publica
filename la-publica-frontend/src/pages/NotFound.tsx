import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, Search, Briefcase, Building2, Tag, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-12">
      <div className="max-w-7xl w-full mx-auto">
        {/* Número 404 grande y decorativo */}
        <div className="text-center mb-8">
          <h1 className="text-9xl font-bold text-gray-200 select-none">404</h1>
          <div className="-mt-20">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Pàgina no trobada
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Ho sentim, la pàgina que cerques no existeix o ha estat moguda. Però no et preocupis,
              tens moltes opcions per continuar explorant La Pública.
            </p>
          </div>
        </div>

        {/* Opciones de navegación */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <Link to="/">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <Home className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Inici</h3>
                <p className="text-sm text-gray-600">
                  Torna a la pàgina principal
                </p>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <Link to="/ofertes">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                  <Tag className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Ofertes</h3>
                <p className="text-sm text-gray-600">
                  Descobreix ofertes especials
                </p>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <Link to="/empreses">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Empreses</h3>
                <p className="text-sm text-gray-600">
                  Explora empreses col·laboradores
                </p>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <Link to="/ofertes-feina">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                  <Briefcase className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Feina</h3>
                <p className="text-sm text-gray-600">
                  Troba oportunitats laborals
                </p>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <Link to="/anuncis">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-200 transition-colors">
                  <Search className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Anuncis</h3>
                <p className="text-sm text-gray-600">
                  Consulta anuncis de la comunitat
                </p>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <Link to="/assessories">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-indigo-200 transition-colors">
                  <Briefcase className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Assessories</h3>
                <p className="text-sm text-gray-600">
                  Serveis professionals
                </p>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* Botón principal para volver */}
        <div className="text-center">
          <Button asChild size="lg" className="gap-2">
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
              Tornar a l'inici
            </Link>
          </Button>
        </div>

        {/* Información adicional */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            Si creus que això és un error o necessites ajuda, contacta amb nosaltres a{" "}
            <a href="mailto:suport@lapublica.cat" className="text-primary hover:underline">
              suport@lapublica.cat
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
