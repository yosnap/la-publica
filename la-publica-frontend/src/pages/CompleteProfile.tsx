import { useState, useEffect, ChangeEvent } from "react";
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
import GeneralInformationSection from "@/components/profile/GeneralInformationSection";
import WorkExperienceSection from "@/components/profile/WorkExperienceSection";
import SocialLinksSection from "@/components/profile/SocialLinksSection";
import BiographySection from "@/components/profile/BiographySection";
import { ProfilePhotoSection } from "@/components/profile/ProfilePhotoSection";
import { CoverPhotoSection } from "@/components/profile/CoverPhotoSection";
import { SkillsSection } from "@/components/profile/SkillsSection";
import { toast } from "sonner";

interface WorkExperience {
  jobTitle: string;
  company: string;
  startDate?: Date | null;
  endDate?: Date | null;
  description?: string | null;
}

interface ProfileFormData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  position: string;
  company: string;
  experience: string;
  education: string;
  skills: string[];
  gender: string;
  birthDay: string;
  birthMonth: string;
  birthYear: string;
  facebook: string;
  youtube: string;
  twitter: string;
  workExperience: WorkExperience[];
  profilePictureUrl?: string;
  coverPhotoUrl?: string;
}

const CompleteProfile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("edit");
  const [activeSection, setActiveSection] = useState("general");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for image previews and files
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [coverImagePreview, setCoverImagePreview] =useState<string | null>(null);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);

  const [skills, setSkills] = useState<string[]>([]);
  const [initialSkills, setInitialSkills] = useState<string[]>([]);

  const form = useForm<ProfileFormData>({
    defaultValues: {
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      phone: '',
      location: '',
      bio: '',
      position: '',
      company: '',
      experience: '',
      education: '',
      skills: [],
      gender: '',
      birthDay: '',
      birthMonth: '',
      birthYear: '',
      facebook: '',
      youtube: '',
      twitter: '',
      workExperience: [],
      profilePictureUrl: '',
      coverPhotoUrl: '',
    },
  });

  const { formState: { isDirty }, setValue, watch, trigger } = form;

  const profilePictureUrl = watch('profilePictureUrl');
  const coverPhotoUrl = watch('coverPhotoUrl');

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.get('/users/profile');
        if (response.data.success) {
          const profile = response.data.data;
          
          const formValues = {
            ...profile,
            ...(profile.socialLinks || {}),
          };
          
          delete formValues.socialLinks;

          form.reset(formValues);
          
          // Clear previews on new data fetch
          setProfileImagePreview(null);
          setCoverImagePreview(null);
          setProfileImageFile(null);
          setCoverImageFile(null);

          const initialSkillsData = profile.skills || [];
          setSkills(initialSkillsData);
          setInitialSkills(initialSkillsData);
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

  const skillsChanged = JSON.stringify(skills) !== JSON.stringify(initialSkills);
  const hasChanges = isDirty || skillsChanged || !!profileImageFile || !!coverImageFile;

  const onSubmit = async (data: ProfileFormData) => {
    if (!hasChanges) {
      toast.info("No hay cambios para guardar.");
      return;
    }

    const toastId = toast.loading("Guardando cambios...");
    setIsLoading(true);
    setError(null);

    try {
      const tempPayload: Partial<ProfileFormData & { skills: string[] }> = { ...data, skills };

      // Subir imagen de perfil si hay una nueva
      if (profileImageFile) {
        const formData = new FormData();
        formData.append('image', profileImageFile);
        const response = await apiClient.post('/uploads/image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        tempPayload.profilePictureUrl = response.data.imageUrl;
      }

      // Subir imagen de portada si hay una nueva
      if (coverImageFile) {
        const formData = new FormData();
        formData.append('image', coverImageFile);
        const response = await apiClient.post('/uploads/image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        tempPayload.coverPhotoUrl = response.data.imageUrl;
      }
      
      // Si se marcó una imagen para eliminar (preview es string vacío)
      if (profileImagePreview === '') {
        tempPayload.profilePictureUrl = '';
      }
      if (coverImagePreview === '') {
        tempPayload.coverPhotoUrl = '';
      }

      // Mapear nombres del frontend al backend antes de enviar
      const { profilePictureUrl, coverPhotoUrl, ...restOfPayload } = tempPayload;
      const finalPayload = {
        ...restOfPayload,
        profilePicture: profilePictureUrl,
        coverPhoto: coverPhotoUrl,
      };

      const response = await apiClient.put('/users/profile', finalPayload);

      if (response.data.success) {
        toast.success("¡Perfil actualizado con éxito!", { id: toastId });
        // Reseteamos el formulario y el estado local a la nueva versión
        const updatedProfile = response.data.data;
        
        // Mapear nombres del backend al frontend para el reset del formulario
        const formValues = {
            ...updatedProfile,
            profilePictureUrl: updatedProfile.profilePicture,
            coverPhotoUrl: updatedProfile.coverPhoto,
            ...(updatedProfile.socialLinks || {}),
        };
        delete formValues.socialLinks;
        delete formValues.profilePicture;
        delete formValues.coverPhoto;
        
        form.reset(formValues);

        setInitialSkills(updatedProfile.skills || []);
        setProfileImageFile(null);
        setProfileImagePreview(null);
        setCoverImageFile(null);
        setCoverImagePreview(null);
      }
    } catch (err) {
      const message = err instanceof AxiosError ? err.response?.data?.message : "Ocurrió un error inesperado.";
      toast.error(message, { id: toastId });
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>, field: 'profile' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      if (field === 'profile') {
        setProfileImagePreview(result);
        setProfileImageFile(file);
      } else {
        setCoverImagePreview(result);
        setCoverImageFile(file);
      }
      // Marcar el formulario como "sucio" para habilitar el botón de guardar
      setValue('firstName', form.getValues('firstName'), { shouldDirty: true });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };
  
  const handleImageDelete = () => {
    setCoverImagePreview(''); // Usamos string vacío para marcar como borrado
    setCoverImageFile(null);
    setValue('coverPhotoUrl', '', { shouldDirty: true });
  };

  const renderEditContent = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Editar Perfil</h3>
      
      <SectionTabs activeSection={activeSection} onSectionChange={setActiveSection} />

      <div className="mt-6">
        {activeSection === "general" && <GeneralInformationSection skills={skills} setSkills={setSkills} />}
        {activeSection === "work" && <WorkExperienceSection />}
        {activeSection === "social" && <SocialLinksSection />}
        {activeSection === "biography" && <BiographySection />}
      </div>
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
                    {activeTab === "profile-photo" && (
                      <ProfilePhotoSection 
                        profileImage={(profileImagePreview ?? profilePictureUrl) || ''}
                        onImageUpload={(e) => handleImageUpload(e, 'profile')} 
                      />
                    )}
                    {activeTab === "cover-photo" && (
                      <CoverPhotoSection 
                        coverImage={(coverImagePreview ?? coverPhotoUrl) || undefined}
                        onImageUpload={(e) => handleImageUpload(e, 'cover')}
                        onImageDelete={handleImageDelete}
                      />
                    )}
                    
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
                        disabled={isLoading || !hasChanges}
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