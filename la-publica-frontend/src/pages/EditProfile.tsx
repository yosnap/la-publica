import { useState, useEffect } from "react";
import { useForm, UseFormReturn, FormProvider } from "react-hook-form";
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

const EditProfile = () => {
  console.log('MONTANDO EditProfile');
  const [profileImage, setProfileImage] = useState<string>("");
  const [skills, setSkills] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [profileData, setProfileData] = useState<ProfileDataWithBirthDate | null>(null);

  const form = useForm<ProfileFormData>({
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
        facebook: '',
        twitter: '',
        youtube: '',
      },
      email: '',
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
    console.log('Ejecutando fetch de perfil...');
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.get('/users/profile');
        console.log('Respuesta del backend:', response.data.data);
        if (response.data.success) {
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
    if (profileData) {
      let birthDay = "";
      let birthMonth = "";
      let birthYear = "";
      if (profileData.birthDate) {
        const date = new Date(profileData.birthDate);
        birthDay = String(date.getDate());
        birthMonth = String(date.getMonth() + 1);
        birthYear = String(date.getFullYear());
      }
      const resetValues = {
        ...profileData,
        birthDay,
        birthMonth,
        birthYear,
        gender: profileData.gender || ""
      };
      console.log('Valores enviados a form.reset:', resetValues);
      form.reset(resetValues);
      setFormKey(prev => prev + 1);
    }
  }, [profileData]);

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    // Construir birthDate a partir de los campos separados
    const { birthDay, birthMonth, birthYear, ...rest } = data;
    let birthDate;
    if (birthDay && birthMonth && birthYear) {
      birthDate = new Date(
        Number(birthYear),
        Number(birthMonth) - 1,
        Number(birthDay)
      ).toISOString();
    }
    const updatedProfile = {
      ...rest,
      skills,
      gender: data.gender,
      birthDate: birthDate || undefined,
      socialLinks: data.socialLinks,
      workExperience: data.workExperience,
    };

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
            
            {/* Componentes de sección refactorizados */}
            <ProfilePhotoSection
              profileImageUrl={profileImage}
              onProfileImageChange={setProfileImage}
            />
            <GeneralInformationSection skills={skills} setSkills={setSkills} />
            <BiographySection />
            <WorkExperienceSection />
            <SkillsSection skills={skills} setSkills={setSkills} />

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
      </div>
    </div>
  );
};

export default EditProfile; 