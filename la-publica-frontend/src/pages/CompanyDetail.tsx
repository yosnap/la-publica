import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageWrapper } from "@/components/PageWrapper";
import CompanyProfile from "@/components/CompanyProfile";
import { getJobOffersByCompany } from "@/api/jobOffers";
import { getAdvisoriesByCompany } from "@/api/advisories";
import { getCompanyById } from "@/api/companies";
import { useUserProfile } from "@/hooks/useUser";

export default function CompanyDetail() {
  const { slugId } = useParams<{ slugId: string }>();
  const navigate = useNavigate();
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [jobOffers, setJobOffers] = useState<any[]>([]);
  const [advisories, setAdvisories] = useState<any[]>([]);
  const { user: currentUser } = useUserProfile();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanyData = async () => {
      if (!slugId) {
        navigate('/companies');
        return;
      }

      try {
        setLoading(true);
        
        // Extraer el ID de la URL amigable (format: slug-id)
        const lastDashIndex = slugId.lastIndexOf('-');
        if (lastDashIndex === -1) {
          navigate('/companies');
          return;
        }
        
        const companyId = slugId.substring(lastDashIndex + 1);
        
        // Obtener datos de la empresa
        const companyResponse = await getCompanyById(companyId);
        if (!companyResponse.success) {
          navigate('/companies');
          return;
        }

        setSelectedCompany(companyResponse.data);

        // Obtener ofertas de trabajo y asesorías en paralelo
        const [offersResponse, advisoriesResponse] = await Promise.all([
          getJobOffersByCompany(companyId),
          getAdvisoriesByCompany(companyId)
        ]);
        
        setJobOffers(offersResponse.data || []);
        setAdvisories(advisoriesResponse.data || []);
      } catch (error) {
        console.error('Error fetching company data:', error);
        navigate('/companies');
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, [slugId, navigate]);

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
            onClick={() => navigate('/companies')}
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
          onClick={() => navigate('/companies')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Tornar a Empreses
        </Button>
        <CompanyProfile 
          companyData={companyData} 
          isOwner={isOwner}
          jobOffers={jobOffers}
          advisories={advisories}
        />
      </div>
    </PageWrapper>
  );
}