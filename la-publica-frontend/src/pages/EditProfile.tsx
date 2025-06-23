import { useState, useEffect } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import apiClient from "@/api/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { AxiosError } from "axios";

// Importar los nuevos componentes de sección
import { GeneralInformationSection } from "@/components/profile/GeneralInformationSection";
import { BiographySection } from "@/components/profile/BiographySection";
import { WorkExperienceSection } from "@/components/profile/WorkExperienceSection";
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
}

// Props para los componentes de sección
export interface ProfileSectionProps {
  form: UseFormReturn<ProfileFormData>;
}

const EditProfile = () => {
  const [profileImage, setProfileImage] = useState<string>("");
  const [skills, setSkills] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm<ProfileFormData>();
  
  // La lógica para cargar y enviar datos permanece igual
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
    setSuccessMessage(null);
    
    const updatedProfile = { ...data, skills };

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
            profileImage={profileImage}
            onImageUpload={handleImageUpload}
          />
          <GeneralInformationSection form={form} />
          <BiographySection form={form} />
          <WorkExperienceSection form={form} />
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
      </div>
    </div>
  );
};

export default EditProfile; 