import { ChangeEvent, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Camera, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CoverPhotoSectionProps {
  coverImage?: string;
  isLoading: boolean;
  onImageChange: (file: File | null) => void;
}

export const CoverPhotoSection = ({ coverImage, isLoading, onImageChange }: CoverPhotoSectionProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageChange(e.target.files[0]);
    }
    // Limpiar el input para permitir volver a seleccionar el mismo archivo
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onImageChange(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-800">Foto de Portada</h3>
      
      <div 
        className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-cover bg-center"
        style={{ backgroundImage: `url(${coverImage})`, minHeight: '200px' }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="absolute inset-0 bg-black bg-opacity-30 rounded-lg flex flex-col items-center justify-center space-y-3">
          <p className="text-white font-semibold">
            {isLoading ? 'Procesando...' : 'Arrastra tu imagen aquí o selecciónala'}
          </p>
          <Label htmlFor="cover-image" className="cursor-pointer">
            <div className={`bg-white text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors inline-flex items-center ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <Camera className="h-4 w-4 mr-2" />
              {coverImage ? 'Cambiar foto' : 'Seleccionar archivo'}
            </div>
          </Label>
          <Input
            id="cover-image"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            ref={inputRef}
            disabled={isLoading}
          />
          <p className="text-xs text-white/80">
            Para mejores resultados, sube una imagen de 1950px por 450px o más grande.
          </p>
        </div>
      </div>
      
      {coverImage && (
        <div>
          <Button variant="destructive" onClick={() => onImageChange(null)} disabled={isLoading}>
            <Trash2 className="h-4 w-4 mr-2" />
            {isLoading ? 'Eliminando...' : 'Eliminar mi Foto de Portada'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default CoverPhotoSection;