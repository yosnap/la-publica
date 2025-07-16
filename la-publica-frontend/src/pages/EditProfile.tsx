import { useState, useEffect } from "react";
import { useForm, UseFormReturn, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import apiClient from "@/api/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { AxiosError } from "axios";

 // Importar los nuevos componentes de sección
import GeneralInformationSection from "@/components/profile/GeneralInformationSection";
import BiographySection from "@/components/profile/BiographySection";
import WorkExperienceSection from "@/components/profile/WorkExperienceSection";
import { SkillsSection } from "@/components/profile/SkillsSection";
import { ProfilePhotoSection } from "@/components/profile/ProfilePhotoSection";
import SectionTabs from "@/components/profile/SectionTabs";
import SocialLinksSection from "@/components/profile/SocialLinksSection";

 // La interfaz de datos del formulario sigue siendo la misma
export interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  position: string;
  company: string;
  experience: string;
  education: string;
  birthDay: string;
  birthMonth: string;
  birthYear: string;
  gender: string;
  workExperience: {
    jobTitle: string;
    company: string;
    startDate?: string;
    endDate?: string;
    isCurrentJob?: boolean;
    description?: string;
  }[];
  socialLinks: {
    facebook?: string;
    twitter?: string;
    youtube?: string;
  };
  username: string;
}

 // Props para los componentes de sección
export interface ProfileSectionProps {
  form: UseFormReturn<ProfileFormData>;
}

type ProfileDataWithBirthDate = ProfileFormData & { birthDate?: string };

 // Esquema de validación con Zod
const profileSchema = z.object({
  firstName: z.string().min(1, "El nombre es requerido"),
  lastName: z.string().min(1, "El apellido es requerido"),
  username: z.string().min(1, "El apodo es requerido"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().optional(),
  position: z.string().optional(),
  company: z.string().optional(),
  experience: z.string().optional(),
  education: z.string().optional(),
  birthDay: z.string().min(1, "Selecciona el día"),
  birthMonth: z.string().min(1, "Selecciona el mes"),
  birthYear: z.string().min(1, "Selecciona el año"),
  gender: z.string().optional(),
  workExperience: z.array(z.object({
    jobTitle: z.string(),
    company: z.string(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    isCurrentJob: z.boolean().optional(),
    description: z.string().optional(),
  })),
  socialLinks: z.object({
    facebook: z.string().optional(),
    twitter: z.string().optional(),
    youtube: z.string().optional(),
  }),
});

const EditProfile = () => {
  console.log('MONTANDO EditProfile');
  const [profileImage, setProfileImage] = useState<string>("");
  const [skills, setSkills] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [profileData, setProfileData] = useState<ProfileDataWithBirthDate | null>(null);
  const [activeSection, setActiveSection] = useState("general");
  
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      username: '',
      bio: '',
      phone: '',
      gender: '',
      birthDay: '',
      birthMonth: '',
      birthYear: '',
      workExperience: [],
      socialLinks: {
        facebook: "",
        twitter: "",
        youtube: "",
      },
      email: "",
      location: '',
      position: '',
      company: '',
      experience: '',
      education: '',
    }
  });
  
   // Log para depuración de defaultValues
  console.log('Default values:', form.getValues());

   // La lógica para cargar y enviar datos permanece igual
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.get('/users/profile');
        console.log('📥 Respuesta del backend:', response.data);
        if (response.data.success) {
          console.log('📋 Datos del usuario:', response.data.data);
          setProfileData(response.data.data);
          if (response.data.data.skills) setSkills(response.data.data.skills);
          if (response.data.data.profilePicture) setProfileImage(response.data.data.profilePicture);
        }
      } catch (err) {
        console.error('Error al obtener perfil:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    console.log('useEffect de reset ejecutado', profileData);
    if (profileData) {
      let birthDay = '', birthMonth = '', birthYear = '';
      if (profileData.birthDate) {
        const date = new Date(profileData.birthDate);
        if (!isNaN(date.getTime())) {
          birthDay = String(date.getDate());
          birthMonth = String(date.getMonth() + 1);
          birthYear = String(date.getFullYear());
        }
      }
      const resetValues = {
        ...profileData,
        birthDay,
        birthMonth,
        birthYear,
        gender: profileData.gender || "",
        socialLinks: {
          facebook: profileData.socialLinks?.facebook || "",
          twitter: profileData.socialLinks?.twitter || "",
          youtube: profileData.socialLinks?.youtube || "",
        },
      };
       // Eliminar birthDate del resetValues ya que no existe en el esquema del formulario
      delete resetValues.birthDate;
       // LOG para depuración
      console.log('Valores para reset:', { birthDay, birthMonth, birthYear });
      form.reset(resetValues);
      setFormKey(prev => prev + 1);
    }
  }, [profileData, form]);

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

     // Limpiar los campos de socialLinks para que solo se envíen si son URLs no vacías
    const cleanedSocialLinks: Record<string, string> = {};
    if (data.socialLinks?.facebook?.trim()) cleanedSocialLinks.facebook = data.socialLinks.facebook.trim();
    if (data.socialLinks?.twitter?.trim()) cleanedSocialLinks.twitter = data.socialLinks.twitter.trim();
    if (data.socialLinks?.youtube?.trim()) cleanedSocialLinks.youtube = data.socialLinks.youtube.trim();

    const updatedProfile = {
      ...data,
      skills,
      gender: data.gender,
      workExperience: data.workExperience,
       // birthDate fuera del payload
      birthDay: String(data.birthDay),
      birthMonth: String(data.birthMonth),
      birthYear: String(data.birthYear),
    };

    if (Object.keys(cleanedSocialLinks).length > 0) {
      updatedProfile.socialLinks = cleanedSocialLinks;
    } else {
      delete updatedProfile.socialLinks;
    }

     // Eliminar birthDate si existe por error
    if ('birthDate' in updatedProfile) {
      delete (updatedProfile as Record<string, unknown>).birthDate;
    }

    try {
      const response = await apiClient.put('/users/profile', updatedProfile);
      if (response.data.success) {
        setSuccessMessage("¡Perfil actualizado con éxito!");
      }
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.message || "No se pudo actualizar el perfil.");
      } else {
        setError("Ocurrió un error inesperado.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
         // Aquí también deberíamos tener la lógica para subir la imagen al servidor
        console.log("Imagen lista para subir (simulado)");
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Editar tu perfil</h1>
          <p className="text-gray-600">Mantén tu información profesional al día</p>
        </div>

        { /* Renderizar el formulario solo si profileData está disponible */}
        {profileData && (
          <FormProvider {...form} key={formKey}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {successMessage && (
                <Alert variant="default" className="bg-green-100 border-green-300 text-green-800">
                   <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Éxito</AlertTitle>
                  <AlertDescription>{successMessage}</AlertDescription>
                </Alert>
              )}
              { /* Componentes de sección refactorizados */}
              <ProfilePhotoSection
                profileImageUrl={profileImage}
                onProfileImageChange={(newImageUrl) => {
                  setProfileImage(newImageUrl || "");
                  console.log('📸 Imagen actualizada:', newImageUrl);
                }}
              />
              <SectionTabs activeSection={activeSection} onSectionChange={setActiveSection} />

              <div className="mt-6">
                {activeSection === "general" && <GeneralInformationSection skills={skills} setSkills={setSkills} />}
                {activeSection === "work" && <WorkExperienceSection />}
                {activeSection === "social" && <SocialLinksSection />}
                {activeSection === "biography" && <BiographySection />}
              </div>
              <div className="flex justify-end gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.history.back()}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-[#4F8FF7] hover:bg-[#4F8FF7]/90"
                >
                  {isLoading ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </div>
            </form>
          </FormProvider>
        )}
      </div>
    </div>
  );
};

export default EditProfile; 


