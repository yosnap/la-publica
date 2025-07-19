import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PageWrapper } from "@/components/PageWrapper";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { toast } from "sonner";
import { getForumById, createForumPost, type Forum } from "@/api/forums";

const CreateForumPost = () => {
  const { forumId } = useParams<{ forumId: string }>();
  const navigate = useNavigate();
  const [forum, setForum] = useState<Forum | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    tags: [] as string[]
  });
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (forumId) {
      loadForum();
    }
  }, [forumId]);

  const loadForum = async () => {
    try {
      setLoading(true);
      const response = await getForumById(forumId!);
      if (response.success) {
        setForum(response.data);
        
         // Verificar si el foro está bloqueado
        if (response.data.isLocked) {
          toast.error('Aquest fòrum està bloquejat per a noves publicacions');
          navigate(`/forums/${forumId}`);
          return;
        }
      }
    } catch (error) {
      toast.error('Error en carregar el fòrum');
      navigate('/forums');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('El títol i contingut són obligatoris');
      return;
    }

    try {
      setCreating(true);
      const response = await createForumPost({
        title: formData.title.trim(),
        content: formData.content.trim(),
        forumId: forumId!,
        tags: formData.tags
      });

      if (response.success) {
        toast.success('Publicació creada exitosament');
        navigate(`/forums/posts/${response.data._id}`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al crear el post');
    } finally {
      setCreating(false);
    }
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 5) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1 /3"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (!forum) {
    return (
      <PageWrapper>
        <div className="text-center">
          <p>Foro no encontrado</p>
          <Button onClick={() => navigate('/forums')} className="mt-4">
            Volver a Foros
          </Button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto space-y-6">
        { /* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(`/forums/${forumId}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Foro
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Crear Nuevo Post</h1>
            <p className="text-gray-600">
              en <span className="font-medium">{forum.name}</span>
            </p>
          </div>
        </div>

        { /* Forum Rules Reminder */}
        {forum.rules && forum.rules.length > 0 && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-lg text-yellow-800">
                Recuerda las reglas del foro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                {forum.rules.slice(0, 3).map((rule, index) => (
                  <li key={index} className="flex items-start gap-2 text-yellow-700">
                    <span className="font-semibold">{index + 1}.</span>
                    <span className="text-sm">{rule}</span>
                  </li>
                ))}
                {forum.rules.length > 3 && (
                  <li className="text-xs text-yellow-600 mt-2">
                    ... y {forum.rules.length - 3} regla(s) más
                  </li>
                )}
              </ul>
            </CardContent>
          </Card>
        )}

        { /* Form */}
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              { /* Title */}
              <div>
                <Label htmlFor="title">Títol de la Publicació *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Escriu un títol descriptiu per a la teva publicació"
                  maxLength={200}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.title.length}/200 caracteres
                </p>
              </div>

              { /* Content */}
              <div>
                <Label htmlFor="content">Contenido *</Label>
                <div className="mt-1">
                  <RichTextEditor
                    value={formData.content}
                    onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
                    placeholder="Escriu el contingut de la teva publicació aquí..."
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Mínimo 10 caracteres, máximo 10,000
                </p>
              </div>

              { /* Tags */}
              <div>
                <Label htmlFor="tags">Tags (opcional)</Label>
                <div className="mt-1 space-y-2">
                  <div className="flex gap-2">
                    <Input
                      id="tags"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Afegir etiqueta..."
                      maxLength={20}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={addTag}
                      disabled={!tagInput.trim() || formData.tags.length >= 5}
                    >
                      Agregar
                    </Button>
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary" 
                          className="cursor-pointer hover:bg-red-100"
                          onClick={() => removeTag(tag)}
                        >
                          #{tag}
                          <X className="h-3 w-3 ml-1" />
                        </Badge>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-gray-500">
                    Máximo 5 tags. Haz clic en un tag para eliminarlo.
                  </p>
                </div>
              </div>

              { /* Actions */}
              <div className="flex justify-end gap-4 pt-4 border-t">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => navigate(`/forums/${forumId}`)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={creating || !formData.title.trim() || !formData.content.trim()}
                  className="bg-primary hover:bg-primary/90"
                >
                  {creating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Crear Post
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
};

export default CreateForumPost;