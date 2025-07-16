import React, { useRef, useState, ChangeEvent } from 'react';
import Cropper from 'react-easy-crop';
import Webcam from 'react-webcam';
import * as Tabs from '@radix-ui/react-tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Trash2, Upload } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import apiClient from '@/api/client';
import { getImageUrl } from '@/utils/getImageUrl';

interface ProfilePhotoSectionProps {
  profileImageUrl?: string;
  onProfileImageChange: (url: string | null) => void;
}

type CropArea = { x: number; y: number; width: number; height: number };

export const ProfilePhotoSection: React.FC<ProfilePhotoSectionProps> = ({ profileImageUrl, onProfileImageChange }) => {
  const [tab, setTab] = useState<'upload' | 'camera' | 'delete'>('upload');
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [cropping, setCropping] = useState(false);
  const webcamRef = useRef<Webcam>(null);
  const inputRef = useRef<HTMLInputElement>(null);

   // Drag & drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

   // File input
  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

   // Tomar foto con webcam
  const handleTakePhoto = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) setImageSrc(imageSrc);
    }
  };

   // Procesar archivo o imagen base64
  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setTab('upload');
    };
    reader.readAsDataURL(file);
  };

   // Crop terminado
  const onCropComplete = (_: CropArea, croppedAreaPixels: CropArea) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

   // Subir imagen recortada
  const uploadCroppedImage = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setCropping(true);
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      const formData = new FormData();
      formData.append('image', croppedBlob, 'profile.jpg');
      const res = await apiClient.post('/uploads/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const data = res.data;
      if (data.imageUrl) {
        toast.success('Foto de perfil actualizada');
        onProfileImageChange(data.imageUrl);
        setImageSrc(null);
      } else {
        toast.error('Error al subir la imagen');
      }
    } catch (err) {
      toast.error('Error al procesar la imagen');
    } finally {
      setCropping(false);
    }
  };

   // Eliminar foto
  const handleDelete = () => {
    onProfileImageChange('');
    setImageSrc(null);
    toast.success('Foto de perfil eliminada');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Camera className="h-5 w-5 mr-2 text-[#4F8FF7]" />
          Foto de perfil
        </CardTitle>
        <CardDescription>Sube, toma o elimina tu foto de perfil</CardDescription>
      </CardHeader>
      <CardContent>
      <Tabs.Root value={tab} onValueChange={(v: 'upload' | 'camera' | 'delete') => setTab(v)} className="w-full">
          <Tabs.List className="flex space-x-4 mb-4">
            <Tabs.Trigger key="upload" value="upload" className={tab === 'upload' ? 'font-bold' : ''}>Subir</Tabs.Trigger>
            <Tabs.Trigger key="camera" value="camera" className={tab === 'camera' ? 'font-bold' : ''}>Tomar foto</Tabs.Trigger>
            <Tabs.Trigger key="delete" value="delete" className={tab === 'delete' ? 'font-bold' : ''}>Eliminar</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="upload">
            <div
              className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-white"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              {!imageSrc ? (
                <>
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src={getImageUrl(profileImageUrl)} />
                    <AvatarFallback className="bg-[#4F8FF7]/10 text-[#4F8FF7] text-xl">
                      <Camera className="h-8 w-8" />
                    </AvatarFallback>
                  </Avatar>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={inputRef}
                    onChange={handleFileInput}
                  />
                  <Button onClick={() => inputRef.current?.click()} className="mb-2">
                    <Upload className="h-4 w-4 mr-2" />Seleccionar archivo
                  </Button>
                  <p className="text-xs text-gray-500">Arrastra una imagen aquí o selecciónala. JPG, PNG o GIF (máx. 5MB)</p>
                </>
              ) : (
                <div className="w-full flex flex-col items-center">
                  <div className="relative w-64 h-64 bg-gray-100">
                    <Cropper
                      image={imageSrc}
                      crop={crop}
                      zoom={zoom}
                      aspect={1}
                      cropShape="round"
                      showGrid={false}
                      onCropChange={setCrop}
                      onZoomChange={setZoom}
                      onCropComplete={onCropComplete}
                    />
                  </div>
                  <div className="flex space-x-4 mt-4">
                    <Button onClick={uploadCroppedImage} disabled={cropping} className="bg-[#4F8FF7] text-white">
                      {cropping ? 'Subiendo...' : 'Recortar y subir'}
                    </Button>
                    <Button variant="outline" onClick={() => setImageSrc(null)} disabled={cropping}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Tabs.Content>
          <Tabs.Content value="camera">
            <div className="flex flex-col items-center">
              {!imageSrc ? (
                <>
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    className="rounded-lg mb-4"
                    width={256}
                    height={256}
                  />
                  <Button onClick={handleTakePhoto} className="mb-2">
                    <Camera className="h-4 w-4 mr-2" />Tomar foto
                  </Button>
                </>
              ) : (
                <div className="w-full flex flex-col items-center">
                  <div className="relative w-64 h-64 bg-gray-100">
                    <Cropper
                      image={imageSrc}
                      crop={crop}
                      zoom={zoom}
                      aspect={1}
                      cropShape="round"
                      showGrid={false}
                      onCropChange={setCrop}
                      onZoomChange={setZoom}
                      onCropComplete={onCropComplete}
                    />
                  </div>
                  <div className="flex space-x-4 mt-4">
                    <Button onClick={uploadCroppedImage} disabled={cropping} className="bg-[#4F8FF7] text-white">
                      {cropping ? 'Subiendo...' : 'Recortar y subir'}
                    </Button>
                    <Button variant="outline" onClick={() => setImageSrc(null)} disabled={cropping}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Tabs.Content>
          <Tabs.Content value="delete">
            <div className="flex flex-col items-center justify-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={getImageUrl(profileImageUrl)} />
                <AvatarFallback className="bg-[#4F8FF7]/10 text-[#4F8FF7] text-xl">
                  <Camera className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-2" />Eliminar foto de perfil
              </Button>
            </div>
          </Tabs.Content>
        </Tabs.Root>
      </CardContent>
    </Card>
  );
};

 // Utilidad para recortar la imagen
function getCroppedImg(imageSrc: string, crop: CropArea): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = crop.width;
      canvas.height = crop.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject();
      ctx.drawImage(
        image,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        crop.width,
        crop.height
      );
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject();
      }, 'image/jpeg');
    };
    image.onerror = reject;
  });
}