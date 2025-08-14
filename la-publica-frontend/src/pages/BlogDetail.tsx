import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft,
  Calendar, 
  Eye, 
  User, 
  Tag,
  Star,
  Clock,
  Edit,
  Trash2,
  Share2,
  BookOpen,
  Heart,
  MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';
import { Blog, getBlogBySlug, deleteBlog } from '@/api/blogs';
import { formatDistanceToNow, format } from 'date-fns';
import { ca } from 'date-fns/locale';
import { getImageUrl } from '@/utils/getImageUrl';
import { useUserProfile } from '@/hooks/useUser';
import { PageWrapper } from '@/components/PageWrapper';

const BlogDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, loading: userLoading } = useUserProfile();
  
  const [blog, setBlog] = useState<Blog | null>(null);
  const [relatedBlogs, setRelatedBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (slug) {
      loadBlog();
    }
  }, [slug]);

  const loadBlog = async () => {
    try {
      setLoading(true);
      const response = await getBlogBySlug(slug!);
      if (response.success) {
        setBlog(response.data.blog);
        setRelatedBlogs(response.data.related);
      } else {
        toast.error('Blog no encontrado');
        navigate('/blogs');
      }
    } catch (error) {
      toast.error('Error al cargar el blog');
      navigate('/blogs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!blog || !window.confirm('¿Estás seguro de que quieres eliminar este blog?')) {
      return;
    }

    try {
      setDeleting(true);
      const response = await deleteBlog(blog._id);
      if (response.success) {
        toast.success('Blog eliminado exitosamente');
        navigate('/blogs');
      }
    } catch (error) {
      toast.error('Error al eliminar el blog');
    } finally {
      setDeleting(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: blog?.title,
          text: blog?.excerpt,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to copying URL
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Enllaç copiat al portapapers');
    }
  };

  const canEdit = !userLoading && user && blog && (
    user._id === blog.author._id || 
    user.role === 'admin' || 
    user.role === 'editor'
  );

  const formatDate = (date: string | Date) => {
    return format(new Date(date), "d 'de' MMMM 'de' yyyy", { locale: ca });
  };

  const formatRelativeDate = (date: string | Date) => {
    return formatDistanceToNow(new Date(date), { 
      addSuffix: true, 
      locale: ca 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-500">Carregant blog...</p>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">Blog no trobat</p>
          <Button onClick={() => navigate('/blogs')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Tornar als blogs
          </Button>
        </div>
      </div>
    );
  }

  return (
    <PageWrapper className="!p-0">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/blogs')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Tornar als blogs
            </Button>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Compartir
              </Button>
              
              {canEdit && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/blogs/${blog._id}/edit`)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <article className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Cover Image */}
              {blog.coverImage && (
                <div className="aspect-video overflow-hidden">
                  <img
                    src={getImageUrl(blog.coverImage)}
                    alt={blog.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Content */}
              <div className="p-8">
                {/* Meta Info */}
                <div className="flex items-center gap-2 mb-4">
                  <Badge 
                    variant="secondary"
                    style={{ backgroundColor: blog.category.color + '20', color: blog.category.color }}
                  >
                    {blog.category.name}
                  </Badge>
                  {blog.featured && (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      <Star className="h-3 w-3 mr-1" />
                      Destacat
                    </Badge>
                  )}
                  {blog.status === 'draft' && (
                    <Badge variant="outline">
                      <Clock className="h-3 w-3 mr-1" />
                      Esborrany
                    </Badge>
                  )}
                </div>

                {/* Title */}
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                  {blog.title}
                </h1>

                {/* Excerpt */}
                <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                  {blog.excerpt}
                </p>

                {/* Author and Meta */}
                <div className="flex items-center justify-between mb-8 pb-6 border-b">
                  <div className="flex items-center space-x-4">
                    <Link 
                      to={`/perfil/${blog.author._id}`}
                      className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
                    >
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={getImageUrl(blog.author.profilePicture)} />
                        <AvatarFallback>
                          {blog.author.firstName[0]}{blog.author.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-900">
                          {blog.author.firstName} {blog.author.lastName}
                        </p>
                        {blog.author.bio && (
                          <p className="text-sm text-gray-500 line-clamp-1">
                            {blog.author.bio}
                          </p>
                        )}
                      </div>
                    </Link>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(blog.publishedAt || blog.createdAt)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="h-4 w-4" />
                      <span>{blog.viewCount} visualitzacions</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div 
                  className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-900"
                  dangerouslySetInnerHTML={{ __html: blog.content }}
                />

                {/* Tags */}
                {blog.tags.length > 0 && (
                  <div className="mt-8 pt-6 border-t">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Tags:</h3>
                    <div className="flex flex-wrap gap-2">
                      {blog.tags.map((tag) => (
                        <Link
                          key={tag}
                          to={`/blogs?tag=${tag}`}
                          className="inline-flex items-center"
                        >
                          <Badge variant="outline" className="hover:bg-gray-100 cursor-pointer">
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </article>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Author Info */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Sobre l'autor</h3>
              </CardHeader>
              <CardContent>
                <Link 
                  to={`/perfil/${blog.author._id}`}
                  className="block hover:opacity-80 transition-opacity"
                >
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={getImageUrl(blog.author.profilePicture)} />
                      <AvatarFallback>
                        {blog.author.firstName[0]}{blog.author.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-900">
                        {blog.author.firstName} {blog.author.lastName}
                      </p>
                      {blog.author.bio && (
                        <p className="text-sm text-gray-600 mt-1">
                          {blog.author.bio}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>

            {/* Related Blogs */}
            {relatedBlogs.length > 0 && (
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Articles relacionats</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {relatedBlogs.map((relatedBlog) => (
                      <Link
                        key={relatedBlog._id}
                        to={`/blogs/${relatedBlog.slug}`}
                        className="block hover:opacity-80 transition-opacity"
                      >
                        <div className="flex items-start space-x-3">
                          {relatedBlog.coverImage && (
                            <div className="w-16 h-12 flex-shrink-0 overflow-hidden rounded">
                              <img
                                src={getImageUrl(relatedBlog.coverImage)}
                                alt={relatedBlog.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 line-clamp-2">
                              {relatedBlog.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatRelativeDate(relatedBlog.publishedAt || relatedBlog.createdAt)}
                            </p>
                          </div>
                        </div>
                        {relatedBlog !== relatedBlogs[relatedBlogs.length - 1] && (
                          <Separator className="mt-4" />
                        )}
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Share Widget */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Compartir article</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={handleShare}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Compartir enllaç
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      const text = `${blog.title} - ${window.location.href}`;
                      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
                      window.open(url, '_blank');
                    }}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Compartir a Twitter
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default BlogDetail;