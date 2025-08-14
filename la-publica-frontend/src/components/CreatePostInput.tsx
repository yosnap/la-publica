import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Paperclip, Image as ImageIcon, Smile, BarChart2, Globe, Lock, Users as UsersIcon } from "lucide-react";
import { getImageUrl } from '@/utils/getImageUrl';
import { createPost } from "@/api/posts";
import { RichTextEditor, RichTextEditorRef } from "@/components/ui/rich-text-editor";
import { toast } from "sonner";
import apiClient from '@/api/client';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
}

interface CreatePostInputProps {
  currentUser: User;
  targetUser?: User; // Usuario en cuyo perfil se está escribiendo (opcional)
  onPostCreated?: () => void; // Callback para actualizar la lista de posts
  placeholder?: string; // Placeholder personalizado
}

export function CreatePostInput({ 
  currentUser, 
  targetUser, 
  onPostCreated, 
  placeholder 
}: CreatePostInputProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const editorRef = useRef<RichTextEditorRef>(null);
  const [posting, setPosting] = useState(false);
  const [editorKey, setEditorKey] = useState(0);
  const [privacy, setPrivacy] = useState("public");
  
  // Estados para herramientas de posts
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showPollOptions, setShowPollOptions] = useState(false);
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  const [pollDuration, setPollDuration] = useState("1d");
  const [selectedMood, setSelectedMood] = useState<{emoji: string, label: string} | null>(null);
  const [showMoodPicker, setShowMoodPicker] = useState(false);

  const defaultPlaceholder = targetUser 
    ? `Escriu alguna cosa al mur de ${targetUser.firstName}...`
    : `Què estàs pensant, ${currentUser.firstName}?`;

  const handleOpenModal = () => setModalOpen(true);
  
  const handleCloseModal = () => {
    setModalOpen(false);
    clearPostForm();
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;
    setPosting(true);
    
    try {
      let imageUrl = null;
      
      // Subir imagen si existe
      if (selectedImage) {
        const formData = new FormData();
        formData.append('image', selectedImage);
        const uploadResponse = await apiClient.post('/uploads/image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        imageUrl = uploadResponse.data.imageUrl;
      }

      // Crear el post con contenido e imagen
      const postData = {
        content: newPostContent,
        ...(imageUrl && { image: imageUrl }),
        ...(selectedMood && { mood: selectedMood }),
        ...(targetUser && { targetUserId: targetUser._id }), // Especificar usuario objetivo
        ...(showPollOptions && pollOptions.some(opt => opt.trim()) && {
          poll: {
            options: pollOptions.filter(opt => opt.trim()),
            duration: pollDuration
          }
        })
      };

      await createPost(postData);
      
      clearPostForm();
      setModalOpen(false);
      toast.success("Post publicado exitosamente");
      
      // Llamar callback para actualizar posts
      if (onPostCreated) {
        onPostCreated();
      }
    } catch (err) {
      toast.error("Error al publicar el post");
    } finally {
      setPosting(false);
    }
  };

  // Función para manejar selección de imagen
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {  // 5MB limit
        toast.error("La imagen no puede ser mayor a 5MB");
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Función para remover imagen seleccionada
  const removeSelectedImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  // Función para manejar selección de archivo
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {  // 10MB limit
        toast.error("El archivo no puede ser mayor a 10MB");
        return;
      }
      setSelectedFile(file);
    }
  };

  // Función para remover archivo seleccionado
  const removeSelectedFile = () => {
    setSelectedFile(null);
  };

  // Función para agregar opción de encuesta
  const addPollOption = () => {
    if (pollOptions.length < 4) {
      setPollOptions([...pollOptions, ""]);
    }
  };

  // Función para remover opción de encuesta
  const removePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  // Función para actualizar opción de encuesta
  const updatePollOption = (index: number, value: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  // Función para toggle encuesta
  const togglePoll = () => {
    setShowPollOptions(!showPollOptions);
    if (!showPollOptions) {
      setPollOptions(["", ""]);
    }
  };

  // Función para seleccionar mood/estado
  const selectMood = (mood: {emoji: string, label: string}) => {
    setSelectedMood(mood);
    setShowMoodPicker(false);
  };

  // Función para remover mood seleccionado
  const removeMood = () => {
    setSelectedMood(null);
  };

  // Función para limpiar formulario de post
  const clearPostForm = () => {
    setNewPostContent("");
    setEditorKey(prev => prev + 1); // Forzar recreación del editor
    setSelectedImage(null);
    setImagePreview(null);
    setSelectedFile(null);
    setShowPollOptions(false);
    setPollOptions(["", ""]);
    setSelectedMood(null);
    setShowMoodPicker(false);
  };

  return (
    <Dialog open={modalOpen} onOpenChange={(open) => {
      setModalOpen(open);
      if (!open) {
        clearPostForm(); // Limpiar cuando se cierre el modal por cualquier razón
      }
    }}>
      <DialogTrigger asChild>
        <Card className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center gap-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={getImageUrl(currentUser?.profilePicture)} />
              <AvatarFallback>{currentUser?.firstName?.[0]}{currentUser?.lastName?.[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <input
                className="w-full bg-gray-100 dark:bg-gray-700/50 rounded-full px-4 py-2 text-gray-500 dark:text-gray-400 cursor-pointer outline-none"
                placeholder={placeholder || defaultPlaceholder}
                readOnly
                onClick={handleOpenModal}
              />
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>
      
      <DialogContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-gray-100">
            {targetUser ? `Escribir en el muro de ${targetUser.firstName}` : 'Crear una publicación'}
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            {targetUser 
              ? `Comparteix alguna cosa al mur de ${targetUser.firstName}`
              : 'Comparteix alguna cosa amb la comunitat'
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleCreatePost} className="space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <Avatar className="h-12 w-12">
              <AvatarImage src={getImageUrl(currentUser?.profilePicture)} />
              <AvatarFallback>{currentUser?.firstName?.[0]}{currentUser?.lastName?.[0]}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold text-gray-900 dark:text-gray-100">
                {currentUser?.firstName} {currentUser?.lastName}
                {selectedMood && (
                  <span className="ml-2 text-sm font-normal text-gray-600 dark:text-gray-400">
                    se siente {selectedMood.emoji} {selectedMood.label}
                  </span>
                )}
                {targetUser && (
                  <span className="ml-2 text-sm font-normal text-gray-600 dark:text-gray-400">
                    → {targetUser.firstName} {targetUser.lastName}
                  </span>
                )}
              </div>
              {/* Selector de privacidad */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 rounded px-2 py-1 mt-1 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600">
                    {privacy === "public" ? <Globe className="h-4 w-4 mr-1"  /> : privacy === "friends" ? <UsersIcon className="h-4 w-4 mr-1" /> : <Lock className="h-4 w-4 mr-1" />}
                    {privacy === "public" ? "Público" : privacy === "friends" ? "Solo amigos" : "Privado"}
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <DropdownMenuItem onClick={() => setPrivacy("public")} className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Globe className="h-4 w-4 mr-2" />
                    Público
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setPrivacy("friends")} className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <UsersIcon className="h-4 w-4 mr-2" />
                    Solo amigos
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setPrivacy("private")} className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Lock className="h-4 w-4 mr-2" />
                    Privado
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <RichTextEditor
            key={`editor-${editorKey}`}
            ref={editorRef}
            value={newPostContent}
            onChange={setNewPostContent}
            placeholder={targetUser 
              ? `Comparteix alguna cosa al mur de ${targetUser.firstName}...`
              : `Comparteix alguna cosa amb la comunitat, ${currentUser.firstName}...`
            }
            className="mb-2"
          />
          
          {/* Preview de imagen seleccionada */}
          {imagePreview && (
            <div className="relative mt-4">
              <img src={imagePreview} alt="Preview" className="max-h-64 rounded-lg object-cover" />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={removeSelectedImage}
              >
                ✕
              </Button>
            </div>
          )}

          {/* Preview de archivo seleccionado */}
          {selectedFile && (
            <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Paperclip className="h-4 w-4" />
                <span className="text-sm">{selectedFile.name}</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={removeSelectedFile}
              >
                ✕
              </Button>
            </div>
          )}

          {/* Opciones de encuesta */}
          {showPollOptions && (
            <div className="mt-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900 dark:text-gray-100">Opciones de encuesta</span>
                <Button type="button" variant="ghost" size="sm" onClick={togglePoll}>✕</Button>
              </div>
              {pollOptions.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={`Opció ${index + 1}`}
                    value={option}
                    onChange={(e) => updatePollOption(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                  {pollOptions.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removePollOption(index)}
                    >
                      ✕
                    </Button>
                  )}
                </div>
              ))}
              {pollOptions.length < 4 && (
                <Button type="button" variant="outline" size="sm" onClick={addPollOption}>
                  + Agregar opción
                </Button>
              )}
            </div>
          )}

          {/* Mood/Estado seleccionado */}
          {selectedMood && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">{selectedMood.emoji}</span>
                <span className="text-sm font-medium text-blue-800 dark:text-blue-300">se siente {selectedMood.label}</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={removeMood}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
              >
                ✕
              </Button>
            </div>
          )}

          {/* Selector de mood/estado */}
          {showMoodPicker && (
            <div className="mt-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900 dark:text-gray-100">¿Cómo te sientes?</span>
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowMoodPicker(false)}>✕</Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  {emoji: '😊', label: 'feliz'},
                  {emoji: '😍', label: 'enamorado'},
                  {emoji: '🤔', label: 'pensativo'},
                  {emoji: '😎', label: 'genial'},
                  {emoji: '🎉', label: 'emocionado'},
                  {emoji: '😴', label: 'cansado'},
                  {emoji: '🔥', label: 'motivado'},
                  {emoji: '😂', label: 'divertido'},
                  {emoji: '💪', label: 'fuerte'},
                  {emoji: '🌟', label: 'brillante'},
                  {emoji: '😌', label: 'relajado'},
                  {emoji: '🚀', label: 'productivo'}
                ].map((mood) => (
                  <button
                    key={mood.label}
                    type="button"
                    className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-left"
                    onClick={() => selectMood(mood)}
                  >
                    <span className="text-lg">{mood.emoji}</span>
                    <span className="text-sm">{mood.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-2">
            <div className="flex gap-2">
              {/* Input oculto para imagen */}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                id="image-upload"
              />
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                onClick={() => document.getElementById('image-upload')?.click()}
                title="Adjuntar imagen"
                className={`hover:bg-gray-50 dark:hover:bg-gray-700/30 ${selectedImage ? "text-blue-600 bg-blue-50 dark:bg-gray-700/50" : "text-gray-600 dark:text-gray-400"}`}
              >
                <ImageIcon className="h-5 w-5" />
              </Button>

              {/* Input oculto para archivo */}
              <input
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                onClick={() => document.getElementById('file-upload')?.click()}
                title="Adjuntar archivo"
                className={`hover:bg-gray-50 dark:hover:bg-gray-700/30 ${selectedFile ? "text-blue-600 bg-blue-50 dark:bg-gray-700/50" : "text-gray-600 dark:text-gray-400"}`}
              >
                <Paperclip className="h-5 w-5" />
              </Button>

              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowMoodPicker(!showMoodPicker)}
                title="Agregar estado de ánimo"
                className={`hover:bg-gray-50 dark:hover:bg-gray-700/30 ${showMoodPicker || selectedMood ? "text-blue-600 bg-blue-50 dark:bg-gray-700/50" : "text-gray-600 dark:text-gray-400"}`}
              >
                <Smile className="h-5 w-5" />
              </Button>

              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                onClick={togglePoll}
                title="Crear encuesta"
                className={`hover:bg-gray-50 dark:hover:bg-gray-700/30 ${showPollOptions ? "text-blue-600 bg-blue-50 dark:bg-gray-700/50" : "text-gray-600 dark:text-gray-400"}`}
              >
                <BarChart2 className="h-5 w-5" />
              </Button>
            </div>
            <Button 
              type="submit" 
              disabled={posting || (!newPostContent.trim() && !selectedImage && !selectedFile)}
              className="bg-[#4F8FF7] text-white"
            >
              {posting ? "Publicando..." : "Publicar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}