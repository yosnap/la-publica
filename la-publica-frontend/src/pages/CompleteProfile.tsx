import { useState, useEffect } from "react";
import { useForm, UseFormReturn, FormProvider } from "react-hook-form";
import { Button } from "@/components/ui/button";
import apiClient from "@/api/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, X, User } from "lucide-react";
import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { ProfileEditSidebar } from "@/components/profile/ProfileEditSidebar";
import SectionTabs from "@/components/profile/SectionTabs";
import { GeneralInformationSection } from "@/components/profile/GeneralInformationSection";
import { WorkExperienceSection } from "@/components/profile/WorkExperienceSection";
import { SocialLinksSection } from "@/components/profile/SocialLinksSection";
import { BiographySection } from "@/components/profile/BiographySection";
import { ProfilePhotoSection } from "@/components/profile/ProfilePhotoSection";
import { CoverPhotoSection } from "@/components/profile/CoverPhotoSection";
import { SkillsSection } from "@/components/profile/SkillsSection";
import { toast } from "sonner";

interface ProfileFormData {
  firstName: string;
  lastName: string;
  nickname: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  position: string;
  company: string;
  experience: string;
  education: string;
  skills: string;
  gender: string;
  birthDay: string;
  birthMonth: string;
  birthYear: string;
  facebook: string;
  youtube: string;
  twitter: string;
}

export interface ProfileSectionProps {
  form: UseFormReturn<ProfileFormData>;
}

const CompleteProfile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("edit");
  const [activeSection, setActiveSection] = useState("general");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string>("");
  const [skills, setSkills] = useState<string[]>([]);

  const form = useForm<ProfileFormData>({
    defaultValues: {
      firstName: '',
      lastName: '',
      nickname: '',
      email: '',
      phone: '',
      location: '',
      bio: '',
      position: '',
      company: '',
      experience: '',
      education: '',
      skills: '',
      gender: '',
      birthDay: '',
      birthMonth: '',
      birthYear: '',
      facebook: '',
      youtube: '',
      twitter: '',
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.get('/users/profile');
        if (response.data.success) {
          const profile = response.data.data;
          form.reset(profile);
          if (profile.skills) setSkills(profile.skills);
          if (profile.profilePicture) setProfileImage(profile.profilePicture);
        }
      } catch (err) {
        if (err instanceof AxiosError) {
          setError(err.response?.data?.message || "No se pudieron cargar los datos del perfil.");
        } else {
          setError("Ocurrió un error inesperado.");
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [form]);

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    setError(null);
    
    const updatedProfile = { ...data, skills };

    try {
      const response = await apiClient.put('/users/profile', updatedProfile);
      if (response.data.success) {
        toast.success("¡Perfil actualizado con éxito!");
      }
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.message || "No se pudo actualizar el perfil.");
        toast.error("Error al actualizar el perfil.");
      } else {
        setError("Ocurrió un error inesperado.");
        toast.error("Ocurrió un error inesperado.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfileImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const renderEditContent = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Editar "Información General"</h3>
      
      <SectionTabs activeSection={activeSection} onSectionChange={setActiveSection} />

      {activeSection === "general" && <GeneralInformationSection form={form} />}
      {activeSection === "work" && <WorkExperienceSection form={form} />}
      {activeSection === "social" && <SocialLinksSection form={form} />}
      {activeSection === "biography" && <BiographySection form={form} />}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Editar Perfil</h1>
          <Button variant="outline" onClick={() => navigate('/perfil')} className="border-gray-300">
            <User className="h-4 w-4 mr-2" />
            Ver Perfil
          </Button>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-3">
            <ProfileEditSidebar activeTab={activeTab} onTabChange={setActiveTab} />
          </div>

          <div className="col-span-12 lg:col-span-9">
            <Card className="shadow-sm border-gray-200">
              <CardContent className="p-8">
                <FormProvider {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    {error && (
                      <Alert variant="destructive" className="relative pr-10">
                        <button
                          type="button"
                          className="absolute top-2 right-2 p-1 text-red-700 hover:text-red-900"
                          onClick={() => setError(null)}
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    
                    {activeTab === "edit" && renderEditContent()}
                    {activeTab === "profile-photo" && <ProfilePhotoSection profileImage={profileImage} onImageUpload={handleImageUpload} />}
                    {activeTab === "cover-photo" && <CoverPhotoSection />}
                    <SkillsSection skills={skills} setSkills={setSkills} />

                    <div className="flex justify-end gap-4 pt-8 border-t border-gray-200">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => window.history.back()}
                        disabled={isLoading}
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="bg-[#4F8FF7] hover:bg-[#4F8FF7]/90 text-white"
                      >
                        {isLoading ? "Guardando..." : "Guardar Cambios"}
                      </Button>
                    </div>
                  </form>
                </FormProvider>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;