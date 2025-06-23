import { ChangeEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Camera, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CoverPhotoSectionProps {
  coverImage?: string;
  onImageUpload: (e: ChangeEvent<HTMLInputElement>) => void;
  onImageDelete: () => void;
}

export const CoverPhotoSection = ({ coverImage, onImageUpload, onImageDelete }: CoverPhotoSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-800">Foto de Portada</h3>
      
      <div 
        className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-cover bg-center"
        style={{ backgroundImage: `url(${coverImage})` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-30 rounded-lg flex flex-col items-center justify-center space-y-3">
          <p className="text-white font-semibold">Arrastra tu imagen aquí o selecciónala</p>
          <Label htmlFor="cover-image" className="cursor-pointer">
            <div className="bg-white text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors inline-flex items-center">
              <Camera className="h-4 w-4 mr-2" />
              {coverImage ? 'Cambiar foto' : 'Seleccionar archivo'}
            </div>
          </Label>
          <Input
            id="cover-image"
            type="file"
            accept="image/*"
            onChange={onImageUpload}
            className="hidden"
          />
          <p className="text-xs text-white/80">
            Para mejores resultados, sube una imagen de 1950px por 450px o más grande.
          </p>
        </div>
      </div>
      
      {coverImage && (
        <div>
          <Button variant="destructive" onClick={onImageDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar mi Foto de Portada
          </Button>
        </div>
      )}
    </div>
  );
};

export default CoverPhotoSection;