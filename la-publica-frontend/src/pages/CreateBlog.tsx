import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { 
  ArrowLeft,
  Save,
  Eye,
  Upload,
  X,
  BookOpen,
  Plus,
  Tag as TagIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  Blog, 
  createBlog, 
  updateBlog, 
  getBlogById,
  getBlogCategories 
} from '@/api/blogs';
import { uploadFile } from '@/api/uploads';
import { useUserProfile } from '@/hooks/useUser';
import { PageWrapper } from '@/components/PageWrapper';

const blogSchema = z.object({
  title: z.string().min(1, 'El títol és obligatori').max(200, 'El títol no pot superar els 200 caràcters'),
  excerpt: z.string().min(1, 'L\'extracte és obligatori').max(500, 'L\'extracte no pot superar els 500 caràcters'),
  content: z.string().min(1, 'El contingut és obligatori'),
  category: z.string().min(1, 'La categoria és obligatòria'),
  tags: z.array(z.string()).optional(),
  coverImage: z.string().optional(),
  status: z.enum(['draft', 'published']).default('draft'),
  featured: z.boolean().default(false),
  metaDescription: z.string().max(160, 'La descripció meta no pot superar els 160 caràcters').optional(),
  metaKeywords: z.array(z.string()).optional()
});

type BlogFormData = z.infer<typeof blogSchema>;

const CreateBlog = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user, loading: userLoading } = useUserProfile();
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [imageMethod, setImageMethod] = useState<'upload' | 'url'>('upload');

  const isEditing = !!id;
  const canCreate = user?.role === 'admin' || user?.role === 'editor';

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm<BlogFormData>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      status: 'draft',
      featured: false,
      tags: [],
      metaKeywords: []
    }
  });

  const watchedValues = watch();

  useEffect(() => {
    // Solo verificar permisos si ya hemos cargado el usuario
    if (!userLoading && !canCreate) {
      toast.error('No tens permisos per crear blogs');
      navigate('/blogs');
      return;
    }

    // Solo cargar datos si el usuario ya está cargado
    if (!userLoading) {
      loadCategories();
      
      if (isEditing) {
        loadBlog();
      }
    }
  }, [isEditing, id, canCreate, userLoading]);

  const loadCategories = async () => {
    try {
      const response = await getBlogCategories();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      toast.error('Error al carregar categories');
    }
  };

  const loadBlog = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = await getBlogById(id);
      if (response.success) {
        const blog = response.data;
        
        // Llenar el formulario con los datos del blog
        reset({
          title: blog.title,
          excerpt: blog.excerpt,
          content: blog.content,
          category: blog.category._id,
          tags: blog.tags || [],
          coverImage: blog.coverImage || '',
          status: blog.status,
          featured: blog.featured,
          metaDescription: blog.metaDescription || '',
          metaKeywords: blog.metaKeywords || []
        });
        
        toast.success('Blog carregat per a edició');
      } else {
        toast.error('Error al carregar el blog');
        navigate('/blogs');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al carregar el blog');
      navigate('/blogs');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imatge no pot superar els 5MB');
      return;
    }

    try {
      setUploading(true);
      const response = await uploadFile(file, 'blog-covers');
      if (response.success) {
        setValue('coverImage', response.data.url);
        toast.success('Imatge pujada correctament');
      }
    } catch (error) {
      toast.error('Error al pujar la imatge');
    } finally {
      setUploading(false);
    }
  };

  const handleImageUrl = () => {
    if (!imageUrlInput.trim()) {
      toast.error('Introdueix una URL vàlida');
      return;
    }

    // Validar que sea una URL de imagen válida
    const imageUrlPattern = /\.(jpg|jpeg|png|gif|webp)$/i;
    const isValidImageUrl = imageUrlPattern.test(imageUrlInput) || 
                           imageUrlInput.includes('unsplash.com') ||
                           imageUrlInput.includes('pexels.com') ||
                           imageUrlInput.includes('pixabay.com') ||
                           imageUrlInput.includes('cloudinary.com');

    if (!isValidImageUrl) {
      toast.error('La URL ha de ser una imatge vàlida (jpg, png, gif, webp)');
      return;
    }

    setValue('coverImage', imageUrlInput);
    setImageUrlInput('');
    toast.success('Imatge afegida des de URL');
  };

  const addTag = () => {
    if (!tagInput.trim()) return;
    
    const currentTags = watchedValues.tags || [];
    if (currentTags.includes(tagInput.trim())) {
      toast.error('Aquest tag ja existeix');
      return;
    }
    
    setValue('tags', [...currentTags, tagInput.trim()]);
    setTagInput('');
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = watchedValues.tags || [];
    setValue('tags', currentTags.filter(tag => tag !== tagToRemove));
  };

  const addKeyword = () => {
    if (!tagInput.trim()) return;
    
    const currentKeywords = watchedValues.metaKeywords || [];
    if (currentKeywords.includes(tagInput.trim())) {
      toast.error('Aquesta paraula clau ja existeix');
      return;
    }
    
    setValue('metaKeywords', [...currentKeywords, tagInput.trim()]);
    setTagInput('');
  };

  const removeKeyword = (keywordToRemove: string) => {
    const currentKeywords = watchedValues.metaKeywords || [];
    setValue('metaKeywords', currentKeywords.filter(keyword => keyword !== keywordToRemove));
  };

  const onSubmit = async (data: BlogFormData) => {
    try {
      setLoading(true);
      
      const response = isEditing 
        ? await updateBlog(id!, data)
        : await createBlog(data);

      if (response.success) {
        toast.success(isEditing ? 'Blog actualitzat correctament' : 'Blog creat correctament');
        navigate(`/blogs/${response.data.slug}`);
      }
    } catch (error) {
      toast.error(isEditing ? 'Error al actualitzar el blog' : 'Error al crear el blog');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[àáâäå]/g, 'a')
      .replace(/[èéêë]/g, 'e')
      .replace(/[ìíîï]/g, 'i')
      .replace(/[òóôö]/g, 'o')
      .replace(/[ùúûü]/g, 'u')
      .replace(/[ñ]/g, 'n')
      .replace(/[ç]/g, 'c')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  // Mostrar loading mientras se verifica el usuario
  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-500">Verificant permisos...</p>
        </div>
      </div>
    );
  }

  if (!canCreate) {
    return null;
  }

  return (
    <PageWrapper className="!p-0">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/blogs')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Tornar als blogs
              </Button>
              
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                <h1 className="text-xl font-semibold">
                  {isEditing ? 'Editar Blog' : 'Nou Blog'}
                </h1>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPreviewMode(!previewMode)}
              >
                <Eye className="h-4 w-4 mr-2" />
                {previewMode ? 'Editar' : 'Vista prèvia'}
              </Button>
              
              <Button
                onClick={handleSubmit(onSubmit)}
                disabled={loading}
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Guardant...' : (isEditing ? 'Actualitzar' : 'Publicar')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {previewMode ? (
          // Preview Mode
          <Card>
            <CardContent className="p-8">
              {watchedValues.coverImage && (
                <div className="aspect-video overflow-hidden rounded-lg mb-6">
                  <img
                    src={watchedValues.coverImage}
                    alt={watchedValues.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <h1 className="text-3xl font-bold mb-4">{watchedValues.title || 'Títol del blog'}</h1>
              <p className="text-xl text-gray-600 mb-6">{watchedValues.excerpt || 'Extracte del blog'}</p>
              
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: watchedValues.content || '<p>Contingut del blog...</p>' }}
              />
              
              {watchedValues.tags && watchedValues.tags.length > 0 && (
                <div className="mt-8 pt-6 border-t">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Tags:</h3>
                  <div className="flex flex-wrap gap-2">
                    {watchedValues.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          // Edit Mode
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Contingut Principal</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="title">Títol *</Label>
                      <Input
                        id="title"
                        {...register('title')}
                        placeholder="Títol del blog"
                        className="mt-1"
                      />
                      {errors.title && (
                        <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
                      )}
                      {watchedValues.title && (
                        <p className="text-xs text-gray-500 mt-1">
                          Slug: {generateSlug(watchedValues.title)}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="excerpt">Extracte *</Label>
                      <Textarea
                        id="excerpt"
                        {...register('excerpt')}
                        placeholder="Resum curt del blog (apareixerà a les llistes)"
                        rows={3}
                        className="mt-1"
                      />
                      {errors.excerpt && (
                        <p className="text-sm text-red-600 mt-1">{errors.excerpt.message}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {watchedValues.excerpt?.length || 0}/500 caràcters
                      </p>
                    </div>

                    <div>
                      <Label>Contingut *</Label>
                      <div className="mt-1">
                        <RichTextEditor
                          value={watchedValues.content || ''}
                          onChange={(value) => setValue('content', value)}
                          placeholder="Escriu el contingut del blog..."
                        />
                      </div>
                      {errors.content && (
                        <p className="text-sm text-red-600 mt-1">{errors.content.message}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Cover Image */}
                <Card>
                  <CardHeader>
                    <CardTitle>Imatge de Portada</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Tabs value={imageMethod} onValueChange={(value) => setImageMethod(value as 'upload' | 'url')}>
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="upload">Pujar Arxiu</TabsTrigger>
                          <TabsTrigger value="url">Des d'URL</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="upload">
                          <div>
                            <Label htmlFor="coverImage">Seleccionar imatge</Label>
                            <div className="mt-2">
                              <input
                                type="file"
                                id="coverImage"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => document.getElementById('coverImage')?.click()}
                                disabled={uploading}
                                className="w-full"
                              >
                                <Upload className="h-4 w-4 mr-2" />
                                {uploading ? 'Pujant...' : 'Pujar Imatge'}
                              </Button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Formats: JPG, PNG, GIF, WebP. Mida màxima: 5MB
                            </p>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="url">
                          <div>
                            <Label htmlFor="imageUrl">URL de la imatge</Label>
                            <div className="flex gap-2 mt-2">
                              <Input
                                id="imageUrl"
                                placeholder="https://example.com/image.jpg"
                                value={imageUrlInput}
                                onChange={(e) => setImageUrlInput(e.target.value)}
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleImageUrl();
                                  }
                                }}
                              />
                              <Button
                                type="button"
                                onClick={handleImageUrl}
                                disabled={!imageUrlInput.trim()}
                              >
                                Afegir
                              </Button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Funciona amb Unsplash, Pexels, Pixabay, Cloudinary, o URLs directes d'imatge
                            </p>
                          </div>
                        </TabsContent>
                      </Tabs>

                      {watchedValues.coverImage && (
                        <div className="relative">
                          <img
                            src={watchedValues.coverImage}
                            alt="Cover preview"
                            className="w-full h-40 object-cover rounded-lg"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder-image.jpg';
                              toast.error('Error al carregar la imatge');
                            }}
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => {
                              setValue('coverImage', '');
                              setImageUrlInput('');
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Publish Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Configuració</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="status">Estat</Label>
                      <Select 
                        value={watchedValues.status} 
                        onValueChange={(value) => setValue('status', value as 'draft' | 'published')}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Esborrany</SelectItem>
                          <SelectItem value="published">Publicat</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="category">Categoria *</Label>
                      <Select 
                        value={watchedValues.category} 
                        onValueChange={(value) => setValue('category', value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Selecciona una categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category._id} value={category._id}>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: category.color }}
                                />
                                {category.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.category && (
                        <p className="text-sm text-red-600 mt-1">{errors.category.message}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="featured">Article destacat</Label>
                      <Switch
                        id="featured"
                        checked={watchedValues.featured}
                        onCheckedChange={(checked) => setValue('featured', checked)}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Tags */}
                <Card>
                  <CardHeader>
                    <CardTitle>Tags</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Afegir tag"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addTag();
                          }
                        }}
                      />
                      <Button type="button" onClick={addTag} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {watchedValues.tags && watchedValues.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {watchedValues.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                            <TagIcon className="h-3 w-3" />
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="ml-1 hover:text-red-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* SEO */}
                <Card>
                  <CardHeader>
                    <CardTitle>SEO</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="metaDescription">Meta Descripció</Label>
                      <Textarea
                        id="metaDescription"
                        {...register('metaDescription')}
                        placeholder="Descripció per als motors de cerca"
                        rows={2}
                        className="mt-1"
                      />
                      {errors.metaDescription && (
                        <p className="text-sm text-red-600 mt-1">{errors.metaDescription.message}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {watchedValues.metaDescription?.length || 0}/160 caràcters
                      </p>
                    </div>

                    <Separator />

                    <div>
                      <Label>Paraules Clau</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          placeholder="Afegir paraula clau"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addKeyword();
                            }
                          }}
                        />
                        <Button type="button" onClick={addKeyword} size="sm">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      {watchedValues.metaKeywords && watchedValues.metaKeywords.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {watchedValues.metaKeywords.map((keyword) => (
                            <Badge key={keyword} variant="outline" className="flex items-center gap-1">
                              {keyword}
                              <button
                                type="button"
                                onClick={() => removeKeyword(keyword)}
                                className="ml-1 hover:text-red-600"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        )}
      </div>
    </PageWrapper>
  );
};

export default CreateBlog;