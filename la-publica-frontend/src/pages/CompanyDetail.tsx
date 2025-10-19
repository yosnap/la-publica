import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageWrapper } from "@/components/PageWrapper";
import CompanyProfile from "@/components/CompanyProfile";
import { getOffersByCompany } from "@/api/offers";
import { getAdvisoriesByCompany } from "@/api/advisories";
import { getCompanies } from "@/api/companies";
import { useUserProfile } from "@/hooks/useUser";

export default function CompanyDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [offers, setOffers] = useState<any[]>([]);
  const [advisories, setAdvisories] = useState<any[]>([]);
  const { user: currentUser } = useUserProfile();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchCompanyData = async () => {
      if (!slug) {
        navigate('/empreses');
        return;
      }

      try {
        setLoading(true);

        // Obtenir totes les empreses i buscar la que coincideixi amb el slug
        const allCompaniesResponse = await getCompanies();
        if (!allCompaniesResponse.success) {
          navigate('/empreses');
          return;
        }

        // Buscar l'empresa que coincideixi amb el slug
        const company = allCompaniesResponse.data.find((comp: any) => comp.slug === slug);

        if (!company) {
          navigate('/empreses');
          return;
        }

        setSelectedCompany(company);

        // Obtener ofertas promocionales y asesorías en paralelo
        const [offersResponse, advisoriesResponse] = await Promise.all([
          getOffersByCompany(company._id),
          getAdvisoriesByCompany(company._id)
        ]);

        setOffers(offersResponse.offers || []);
        setAdvisories(advisoriesResponse.data || []);
      } catch (error) {
        console.error('Error fetching company data:', error);
        navigate('/empreses');
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, [slug, navigate]);

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      </PageWrapper>
    );
  }

  if (!selectedCompany) {
    return (
      <PageWrapper>
        <div className="space-y-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/empreses')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Tornar a Empreses
          </Button>
          <div className="text-center py-8">
            <p className="text-gray-500">No s'ha trobat l'empresa</p>
          </div>
        </div>
      </PageWrapper>
    );
  }

  const isOwner = currentUser && currentUser._id === selectedCompany.owner;
  
  // Mapear los datos de la empresa real al formato esperado por CompanyProfile
  const companyData = {
    _id: selectedCompany._id,
    name: selectedCompany.name,
    description: selectedCompany.description,
    logo: selectedCompany.logo || '',
    coverImage: selectedCompany.banner || '',
    location: `${selectedCompany.location.city}, ${selectedCompany.location.country}`,
    foundedYear: selectedCompany.stats.founded?.toString() || '',
    website: selectedCompany.website || '',
    phone: selectedCompany.phone || '',
    email: selectedCompany.email,
    employees: selectedCompany.stats.employees?.toString() || '',
    industry: selectedCompany.category
  };
  
  return (
    <PageWrapper>
      <div className="space-y-6">
        <Button 
          variant="outline" 
          onClick={() => navigate('/empreses')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Tornar a Empreses
        </Button>
        <CompanyProfile
          companyData={companyData}
          isOwner={isOwner}
          offers={offers}
          advisories={advisories}
        />
      </div>
    </PageWrapper>
  );
}