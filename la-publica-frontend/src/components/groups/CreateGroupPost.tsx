import { useState } from "react";
import { Send, Image, Paperclip, Smile, X, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { ImageUpload } from "@/components/ui/image-upload";
import { toast } from "sonner";
import { createGroupPost, type CreateGroupPostData } from "@/api/groupPosts";
import { getImageUrl } from "@/utils/getImageUrl";

interface CreateGroupPostProps {
  groupId: string;
  groupName: string;
  userProfilePicture?: string;
  userFirstName: string;
  userLastName: string;
  onPostCreated?: () => void;
  className?: string;
}

const moods = [
  { emoji: "😊", label: "contento" },
  { emoji: "😍", label: "emocionado" },
  { emoji: "🤔", label: "pensativo" },
  { emoji: "😎", label: "genial" },
  { emoji: "💪", label: "motivado" },
  { emoji: "😴", label: "relajado" },
  { emoji: "🎉", label: "celebrando" },
  { emoji: "❤️", label: "agradecido" },
  { emoji: "🚀", label: "inspirado" },
  { emoji: "🌟", label: "optimista" }
];

export const CreateGroupPost = ({
  groupId,
  groupName,
  userProfilePicture,
  userFirstName,
  userLastName,
  onPostCreated,
  className = ""
}: CreateGroupPostProps) => {
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [selectedMood, setSelectedMood] = useState<typeof moods[0] | null>(null);
  const [privacy, setPrivacy] = useState<"public" | "members_only">("members_only");
  const [posting, setPosting] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error("El contenido del post es requerido");
      return;
    }

    try {
      setPosting(true);

      const postData: CreateGroupPostData = {
        content: content.trim(),
        images: images.length > 0 ? images : undefined,
        mood: selectedMood || undefined,
        privacy
      };

      const response = await createGroupPost(groupId, postData);
      
      if (response.success) {
        toast.success("Post publicado exitosamente");
        
         // Reset form
        setContent("");
        setImages([]);
        setSelectedMood(null);
        setPrivacy("members_only");
        setShowImageUpload(false);
        
         // Notify parent component
        if (onPostCreated) {
          onPostCreated();
        }
      }
    } catch (error: any) {
      console.error("Error creating post:", error);
      toast.error(error.response?.data?.message || "Error al crear el post");
    } finally {
      setPosting(false);
    }
  };

  const addImage = (imageUrl: string) => {
    if (images.length < 5) {  // Límite de 5 imágenes
      setImages(prev => [...prev, imageUrl]);
    } else {
      toast.error("Máximo 5 imágenes por post");
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeMood = () => {
    setSelectedMood(null);
  };

  return (
    <Card className={`shadow-sm border-0 bg-white ${className}`}>
      <CardContent className="p-6">
        <div className="space-y-4">
          { /* Header with user info */}
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={getImageUrl(userProfilePicture)} />
              <AvatarFallback>
                {userFirstName[0]}{userLastName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900">
                  {userFirstName} {userLastName}
                </span>
                <span className="text-gray-500 text-sm">→</span>
                <Badge variant="outline" className="text-xs">
                  <Users className="h-3 w-3 mr-1" />
                  {groupName}
                </Badge>
              </div>
              {selectedMood && (
                <div className="flex items-center space-x-1 mt-1">
                  <span className="text-xs text-gray-500">se siente</span>
                  <Badge variant="secondary" className="text-xs flex items-center">
                    <span className="mr-1">{selectedMood.emoji}</span>
                    <span>{selectedMood.label}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={removeMood}
                      className="h-auto p-0 ml-1 hover:bg-transparent"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                </div>
              )}
            </div>
          </div>

          { /* Content editor */}
          <div>
            <RichTextEditor
              content={content}
              onChange={setContent}
              placeholder={`¿Qué quieres compartir con ${groupName}?`}
              className="min-h-[120px]"
            />
          </div>

          { /* Images preview */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
              {images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image}
                    alt={`Imagen ${index + 1}`}
                    className="w-full h-20 object-cover rounded-lg"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          { /* Image upload section */}
          {showImageUpload && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <ImageUpload
                value=""
                onChange={(url) => {
                  addImage(url);
                  setShowImageUpload(false);
                }}
                placeholder="Subir imagen para el post"
                aspectRatio="auto"
              />
            </div>
          )}

          { /* Action buttons and privacy */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center space-x-3">
              { /* Image button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowImageUpload(!showImageUpload)}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                <Image className="h-4 w-4 mr-1" />
                Foto
              </Button>

              { /* Mood selector */}
              <Select
                value={selectedMood?.label || ""}
                onValueChange={(value) => {
                  const mood = moods.find(m => m.label === value);
                  setSelectedMood(mood || null);
                }}
              >
                <SelectTrigger className="w-auto border-0 shadow-none hover:bg-gray-50 text-orange-600 hover:text-orange-700 p-2">
                  <div className="flex items-center">
                    <Smile className="h-4 w-4 mr-1" />
                    <span className="text-sm">Estado</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {moods.map((mood) => (
                    <SelectItem key={mood.label} value={mood.label}>
                      <div className="flex items-center space-x-2">
                        <span>{mood.emoji}</span>
                        <span>{mood.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              { /* Privacy selector */}
              <Select value={privacy} onValueChange={(value: "public" | "members_only") => setPrivacy(value)}>
                <SelectTrigger className="w-auto border-0 shadow-none hover:bg-gray-50 text-gray-600 hover:text-gray-700 p-2">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    <span className="text-sm">
                      {privacy === "public" ? "Público" : "Solo miembros"}
                    </span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="members_only">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>Solo miembros del grupo</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="public">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>Público</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            { /* Post button */}
            <Button
              onClick={handleSubmit}
              disabled={!content.trim() || posting}
              className="bg-primary hover:bg-primary/90"
            >
              {posting ? (
                "Publicando..."
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Publicar
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};