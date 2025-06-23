import { ChangeEvent } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, User } from "lucide-react";

interface ProfilePhotoSectionProps {
  profileImage: string;
  onImageUpload: (e: ChangeEvent<HTMLInputElement>) => void;
}

export const ProfilePhotoSection = ({ profileImage, onImageUpload }: ProfilePhotoSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Camera className="h-5 w-5 mr-2 text-[#4F8FF7]" />
          Foto de perfil
        </CardTitle>
        <CardDescription>Sube una foto profesional para tu perfil</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={profileImage} />
            <AvatarFallback className="bg-[#4F8FF7]/10 text-[#4F8FF7] text-xl">
              <User className="h-8 w-8" />
            </AvatarFallback>
          </Avatar>
          <div>
            <Label htmlFor="profile-image" className="cursor-pointer">
              <div className="bg-[#4F8FF7] text-white px-4 py-2 rounded-lg hover:bg-[#4F8FF7]/90 transition-colors inline-flex items-center">
                <Camera className="h-4 w-4 mr-2" />
                Subir foto
              </div>
            </Label>
            <Input
              id="profile-image"
              type="file"
              accept="image/*"
              onChange={onImageUpload}
              className="hidden"
            />
            <p className="text-sm text-gray-500 mt-2">JPG, PNG o GIF (máx. 5MB)</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};