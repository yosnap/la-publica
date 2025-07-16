import { useState, useEffect, ChangeEvent } from "react";
import { useForm, UseFormReturn, FormProvider } from "react-hook-form";
import { Button } from "@/components/ui/button";
import apiClient from "@/api/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, X, User, Loader2 } from "lucide-react";
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
import { getImageUrl } from '@/utils/getImageUrl';

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

 // Función getImageUrl ahora se importa desde utils

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

  const [formKey, setFormKey] = useState(0);

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
           // Mapeo correcto de imágenes, socialLinks y fecha de nacimiento
          let birthDay = '', birthMonth = '', birthYear = '';
          if (profile.birthDate) {
            const date = new Date(profile.birthDate);
            if (!isNaN(date.getTime())) {
              birthDay = String(date.getDate());
              birthMonth = String(date.getMonth() + 1);
              birthYear = String(date.getFullYear());
            }
          }
          const formValues = {
            ...profile,
            birthDay,
            birthMonth,
            birthYear,
            gender: profile.gender || "",
            socialLinks: {
              facebook: profile.socialLinks?.facebook || "",
              twitter: profile.socialLinks?.twitter || "",
              youtube: profile.socialLinks?.youtube || "",
            },
            facebook: profile.socialLinks?.facebook || "",
            twitter: profile.socialLinks?.twitter || "",
            youtube: profile.socialLinks?.youtube || "",
            profilePictureUrl: profile.profilePicture,
            coverPhotoUrl: profile.coverPhoto,
            ...(profile.socialLinks || {}),
          };
          delete formValues.socialLinks;
          delete formValues.profilePicture;
          delete formValues.coverPhoto;
          delete formValues.birthDate;
          form.reset(formValues);
          setFormKey(prev => prev + 1);

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
  const hasFormChanges = isDirty || skillsChanged;

    const handleImageUpload = async (file: File, imageType: 'profile' | 'cover') => {
    const toastId = toast.loading("Subiendo imagen...");
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await apiClient.post('/uploads/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.imageUrl) {
        const imageUrl = res.data.imageUrl;
        if (imageType === 'profile') {
          form.setValue('profilePictureUrl', imageUrl, { shouldDirty: true });
          await handleProfileImageChange(imageUrl);  // Trigger auto-save
        } else {
          form.setValue('coverPhotoUrl', imageUrl, { shouldDirty: true });
          await handleCoverImageChange(file);  // Trigger auto-save
        }
        toast.success("Imagen subida con éxito", { id: toastId });
      } else {
        throw new Error("La URL de la imagen no fue devuelta por el servidor.");
      }
    } catch (err) {
      toast.error("Error al subir la imagen", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    const toastId = toast.loading("Guardando cambios...");
    setIsLoading(true);
    setError(null);

    try {
       // Helper function to clean the payload
      const cleanPayload = (payload) => {
        const cleaned = { ...payload };

         // Convert empty strings to null for optional fields
        const optionalFields = ['bio', 'location', 'phone'];
        optionalFields.forEach(field => {
          if (cleaned[field] === '') {
            cleaned[field] = null;
          }
        });

         // Handle image URLs
        cleaned.profilePicture = getImageUrl(cleaned.profilePictureUrl) || null;
        cleaned.coverPhoto = getImageUrl(cleaned.coverPhotoUrl) || null;
        delete cleaned.profilePictureUrl;
        delete cleaned.coverPhotoUrl;

         // Clean social links
        const isValidUrl = (url) => {
          if (!url || typeof url !== 'string') return false;
          try {
            new URL(url);
            return true;
          } catch {
            return false;
          }
        };
         // Normalizar URLs: anteponer https:// si falta
        const normalizeUrl = (url) => {
          if (!url || typeof url !== 'string') return url;
          if ( /^https?:\/\//i.test(url)) return url;
          return 'https://' + url;
        };
         // Priorizar los valores planos si existen
        let fb = typeof cleaned.facebook !== 'undefined' ? cleaned.facebook : cleaned.socialLinks?.facebook;
        let tw = typeof cleaned.twitter !== 'undefined' ? cleaned.twitter : cleaned.socialLinks?.twitter;
        let yt = typeof cleaned.youtube !== 'undefined' ? cleaned.youtube : cleaned.socialLinks?.youtube;
        fb = fb ? normalizeUrl(fb) : fb;
        tw = tw ? normalizeUrl(tw) : tw;
        yt = yt ? normalizeUrl(yt) : yt;
        cleaned.socialLinks = {};
        cleaned.socialLinks.facebook = isValidUrl(fb) ? fb : (fb === '' ? null : undefined);
        cleaned.socialLinks.twitter = isValidUrl(tw) ? tw : (tw === '' ? null : undefined);
        cleaned.socialLinks.youtube = isValidUrl(yt) ? yt : (yt === '' ? null : undefined);
         // Eliminar propiedades undefined
        Object.keys(cleaned.socialLinks).forEach(key => {
          if (typeof cleaned.socialLinks[key] === 'undefined') {
            delete cleaned.socialLinks[key];
          }
        });
        delete cleaned.facebook;
        delete cleaned.twitter;
        delete cleaned.youtube;

         // Clean work experience dates
        if (cleaned.workExperience) {
          cleaned.workExperience = cleaned.workExperience.map(exp => ({
            ...exp,
            startDate: exp.startDate || null,
            endDate: exp.isCurrentJob ? null : exp.endDate || null,
          }));
        }

         // Handle birth date
        if (cleaned.birthDay) cleaned.birthDay = String(cleaned.birthDay);
        if (cleaned.birthMonth) cleaned.birthMonth = String(cleaned.birthMonth);
        if (cleaned.birthYear) cleaned.birthYear = String(cleaned.birthYear);

        return cleaned;
      };

      const finalPayload = cleanPayload(data);

      const response = await apiClient.put('/users/profile', finalPayload);

      if (response.data.success) {
        toast.success("¡Perfil actualizado con éxito!", { id: toastId });
        const updatedProfile = response.data.data;
         // Mapeo correcto de fecha de nacimiento tras guardar
        let birthDay = '', birthMonth = '', birthYear = '';
        if (updatedProfile.birthDate) {
          const date = new Date(updatedProfile.birthDate);
          if (!isNaN(date.getTime())) {
            birthDay = String(date.getDate());
            birthMonth = String(date.getMonth() + 1);
            birthYear = String(date.getFullYear());
          }
        }
        const formValues = {
          ...updatedProfile,
          birthDay,
          birthMonth,
          birthYear,
          gender: updatedProfile.gender || "",
          socialLinks: {
            facebook: updatedProfile.socialLinks?.facebook || "",
            twitter: updatedProfile.socialLinks?.twitter || "",
            youtube: updatedProfile.socialLinks?.youtube || "",
          },
          facebook: updatedProfile.socialLinks?.facebook || "",
          twitter: updatedProfile.socialLinks?.twitter || "",
          youtube: updatedProfile.socialLinks?.youtube || "",
          profilePictureUrl: updatedProfile.profilePicture,
          coverPhotoUrl: updatedProfile.coverPhoto,
          ...(updatedProfile.socialLinks || {}),
        };
        delete formValues.socialLinks;
        delete formValues.profilePicture;
        delete formValues.coverPhoto;
        delete formValues.birthDate;
        form.reset(formValues);
        setInitialSkills(updatedProfile.skills || []);
      }
    } catch (err) {
      const message = err instanceof AxiosError ? err.response?.data?.message : "Ocurrió un error inesperado.";
      toast.error(message, { id: toastId });
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

   // Lógica de guardado automático para la foto de portada
  const handleCoverImageChange = async (file: File | null) => {
    const toastId = toast.loading(file ? "Subiendo imagen..." : "Eliminando imagen...");
    setIsLoading(true);
    let imageUrl: string | null = null;
    
    try {
      if (file) {
        const formData = new FormData();
        formData.append('image', file);
        const res = await apiClient.post('/uploads/image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        imageUrl = res.data.imageUrl;
      }
      
      const payload = { coverPhoto: imageUrl || '' };
      const response = await apiClient.put('/users/profile', payload);
      
      if (response.data.success) {
        toast.success(file ? 'Foto de portada actualizada' : 'Foto de portada eliminada', { id: toastId });
        const updatedProfile = response.data.data;
        form.reset({ ...form.getValues(), coverPhotoUrl: updatedProfile.coverPhoto });
      }
    } catch (err) {
      toast.error("Error al actualizar la foto de portada", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  

   // Lógica de guardado automático para la foto de perfil
  const handleProfileImageChange = async (url: string | null) => {
    const toastId = toast.loading(url ? "Actualizando foto..." : "Eliminando foto...");
    setIsLoading(true);
    try {
      const payload = { profilePicture: url || '' };
      const response = await apiClient.put('/users/profile', payload);
      if (response.data.success) {
        toast.success(url ? 'Foto de perfil actualizada' : 'Foto de perfil eliminada', { id: toastId });
        const updatedProfile = response.data.data;
        form.reset({ ...form.getValues(), profilePictureUrl: updatedProfile.profilePicture });
      }
    } catch (err) {
      toast.error('Error al actualizar la foto de perfil', { id: toastId });
    } finally {
      setIsLoading(false);
    }
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
                {isLoading && !form.getValues("firstName") ? (
                  <div className="flex flex-col items-center justify-center min-h-[300px]">
                    <Loader2 className="animate-spin h-10 w-10 text-[#4F8FF7] mb-4" />
                    <span className="text-gray-500">Cargando perfil...</span>
                  </div>
                ) : (
                  <FormProvider {...form} key={formKey}>
                    { /* El contenido cambia según la pestaña activa */}
                    {activeTab === 'edit' && (
                      <div key={`edit-tab-${formKey}`}>
                        <SectionTabs activeSection={activeSection} onSectionChange={setActiveSection} />
                        <div className="mt-6">
                          {activeSection === "general" && (
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" key={`${formKey}-general`}>
                              {error && (
                                <Alert variant="destructive" className="relative pr-10" key="error-alert">
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
                              <GeneralInformationSection key="general-section" skills={skills} setSkills={setSkills} />
                              <div className="flex justify-end gap-4 pt-8 border-t border-gray-200" key="general-buttons">
                                <Button type="button" variant="outline" onClick={() => window.history.back()} disabled={isLoading}>
                                  Cancelar
                                </Button>
                                <Button type="submit" disabled={isLoading || !hasFormChanges} className="bg-[#4F8FF7] hover:bg-[#4F8FF7]/90 text-white">
                                  {isLoading ? "Guardando..." : "Guardar Cambios"}
                                </Button>
                              </div>
                            </form>
                          )}
                          {activeSection === "work" && (
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" key={`${formKey}-work`}>
                              <WorkExperienceSection key="work-section" />
                              <div className="flex justify-end gap-4 pt-8 border-t border-gray-200" key="work-buttons">
                                <Button type="button" variant="outline" onClick={() => window.history.back()} disabled={isLoading}>
                                  Cancelar
                                </Button>
                                <Button type="submit" disabled={isLoading || !hasFormChanges} className="bg-[#4F8FF7] hover:bg-[#4F8FF7]/90 text-white">
                                  {isLoading ? "Guardando..." : "Guardar Cambios"}
                                </Button>
                              </div>
                            </form>
                          )}
                          {activeSection === "social" && (
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" key={`${formKey}-social`}>
                              <SocialLinksSection key="social-section" />
                              <div className="flex justify-end gap-4 pt-8 border-t border-gray-200" key="social-buttons">
                                <Button type="button" variant="outline" onClick={() => window.history.back()} disabled={isLoading}>
                                  Cancelar
                                </Button>
                                <Button type="submit" disabled={isLoading || !hasFormChanges} className="bg-[#4F8FF7] hover:bg-[#4F8FF7]/90 text-white">
                                  {isLoading ? "Guardando..." : "Guardar Cambios"}
                                </Button>
                              </div>
                            </form>
                          )}
                          {activeSection === "biography" && (
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" key={`${formKey}-biography`}>
                              <BiographySection key="biography-section" />
                              <div className="flex justify-end gap-4 pt-8 border-t border-gray-200" key="biography-buttons">
                                <Button type="button" variant="outline" onClick={() => window.history.back()} disabled={isLoading}>
                                  Cancelar
                                </Button>
                                <Button type="submit" disabled={isLoading || !hasFormChanges} className="bg-[#4F8FF7] hover:bg-[#4F8FF7]/90 text-white">
                                  {isLoading ? "Guardando..." : "Guardar Cambios"}
                                </Button>
                              </div>
                            </form>
                          )}
                        </div>
                      </div>
                    )}

                    {activeTab === "profile-photo" && (
                      <ProfilePhotoSection
                        key="profile-photo-section"
                        profileImageUrl={getImageUrl(profilePictureUrl)}
                        onProfileImageChange={handleProfileImageChange}
                      />
                    )}

                    {activeTab === "cover-photo" && (
                      <CoverPhotoSection
                        key="cover-photo-section"
                        coverImage={getImageUrl(coverPhotoUrl)}
                        onImageChange={handleCoverImageChange}
                        isLoading={isLoading}
                      />
                    )}
                  </FormProvider>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;