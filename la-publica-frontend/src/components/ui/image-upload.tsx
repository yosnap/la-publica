import { useState, useRef } from "react";
import { Upload, X, Camera, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  className?: string;
  placeholder?: string;
  aspectRatio?: "square" | "cover" | "auto";
  disabled?: boolean;
}

export const ImageUpload = ({
  value,
  onChange,
  onRemove,
  className = "",
  placeholder = "Subir imagen",
  aspectRatio = "auto",
  disabled = false
}: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

     // Validaciones
    if (file.size > 5 * 1024 * 1024) {  // 5MB
      toast.error("El archivo es muy grande. Máximo 5MB.");
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error("Solo se permiten archivos de imagen.");
      return;
    }

     // Vista previa local
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

     // Upload a Cloudinary
    uploadToCloudinary(file);
  };

  const uploadToCloudinary = async (file: File) => {
    try {
      setUploading(true);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'ml_default');  // Usa tu upload preset
      formData.append('cloud_name', 'dv7k5jjbv');  // Usa tu cloud name

      const response = await fetch(
        'https://api.cloudinary.com/v1_1/dv7k5jjbv/image/upload',
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Error al subir la imagen');
      }

      const data = await response.json();
      onChange(data.secure_url);
      setPreview(null);
      toast.success("Imagen subida exitosamente");
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error("Error al subir la imagen");
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    if (onRemove) {
      onRemove();
    } else {
      onChange("");
    }
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case "square":
        return "aspect-square";
      case "cover":
        return "aspect-[3/1]";
      default:
        return "min-h-[200px]";
    }
  };

  const currentImage = preview || value;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className={`
        relative border-2 border-dashed border-gray-300 rounded-lg overflow-hidden
        ${getAspectRatioClass()}
        ${currentImage ? 'border-solid border-gray-200' : 'hover:border-gray-400'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        transition-colors
      `}>
        {currentImage ? (
           // Imagen existente o preview
          <div className="relative w-full h-full">
            <img
              src={currentImage}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            {!disabled && (
              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-40 transition-opacity flex items-center justify-center">
                <div className="opacity-0 hover:opacity-100 transition-opacity flex space-x-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    disabled={uploading}
                  >
                    <Camera className="h-4 w-4 mr-1" />
                    Cambiar
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove();
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
            {uploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="text-white text-sm">Subiendo...</div>
              </div>
            )}
          </div>
        ) : (
           // Estado vacío
          <div
            className="w-full h-full flex flex-col items-center justify-center text-gray-500 p-6"
            onClick={() => !disabled && fileInputRef.current?.click()}
          >
            {uploading ? (
              <div className="text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 animate-pulse" />
                <p className="text-sm">Subiendo imagen...</p>
              </div>
            ) : (
              <div className="text-center">
                <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm font-medium">{placeholder}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Click para seleccionar o arrastra aquí
                </p>
                <p className="text-xs text-gray-400">
                  PNG, JPG hasta 5MB
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || uploading}
      />

      {currentImage && !disabled && (
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>Imagen actual</span>
          <div className="flex space-x-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Upload className="h-3 w-3 mr-1" />
              Cambiar
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemove}
            >
              <X className="h-3 w-3 mr-1" />
              Quitar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};