import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  BookOpen, 
  Search, 
  Calendar, 
  Eye, 
  User, 
  Tag, 
  Grid, 
  List,
  Star,
  Plus,
  Clock,
  TrendingUp,
  Filter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  Blog, 
  getBlogs, 
  getBlogStats, 
  getPopularTags, 
  getBlogCategories,
  BlogFilters 
} from '@/api/blogs';
import { formatDistanceToNow } from 'date-fns';
import { ca } from 'date-fns/locale';
import { getImageUrl } from '@/utils/getImageUrl';
import { useUserProfile } from '@/hooks/useUser';
import { PageWrapper } from '@/components/PageWrapper';

const Blogs = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [popularTags, setPopularTags] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [sortBy, setSortBy] = useState('-publishedAt');

  const navigate = useNavigate();
  const { user, loading: userLoading } = useUserProfile();

  const canCreateBlogs = user?.role === 'admin' || user?.role === 'editor';
  
  // Debug: Log user role for troubleshooting
  console.log('🔍 Blog permissions debug:');
  console.log('- User loading:', userLoading);
  console.log('- Full user object:', user);
  console.log('- User role:', user?.role);
  console.log('- Role type:', typeof user?.role);
  console.log('- Can create blogs:', canCreateBlogs);
  console.log('- Is admin?:', user?.role === 'admin');
  console.log('- Is editor?:', user?.role === 'editor');

  const loadBlogs = async () => {
    try {
      setLoading(true);
      
      const filters: BlogFilters = {
        page: currentPage,
        limit: 12,
        sort: sortBy
      };

      if (activeTab === 'featured') {
        filters.featured = true;
      } else if (activeTab === 'draft' && canCreateBlogs) {
        filters.status = 'draft';
      } else {
        filters.status = 'published';
      }

      if (searchTerm) filters.search = searchTerm;
      if (selectedCategory) filters.category = selectedCategory;
      if (selectedTag) filters.tag = selectedTag;

      const response = await getBlogs(filters);
      if (response.success) {
        setBlogs(response.data);
        setTotalPages(response.pagination.totalPages);
        
        // Scroll to top on page change
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      toast.error('Error al cargar blogs');
    } finally {
      setLoading(false);
    }
  };

  const loadInitialData = async () => {
    try {
      const [statsResponse, tagsResponse, categoriesResponse] = await Promise.all([
        getBlogStats(),
        getPopularTags(),
        getBlogCategories()
      ]);

      if (statsResponse.success) setStats(statsResponse.data);
      if (tagsResponse.success) setPopularTags(tagsResponse.data);
      if (categoriesResponse.success) setCategories(categoriesResponse.data);
    } catch (error) {
      toast.error('Error al cargar datos iniciales');
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm, selectedCategory, selectedTag, sortBy]);

  useEffect(() => {
    loadBlogs();
  }, [currentPage, activeTab, searchTerm, selectedCategory, selectedTag, sortBy]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadBlogs();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedTag('');
    setSortBy('-publishedAt');
    setCurrentPage(1);
  };

  const formatDate = (date: string | Date) => {
    return formatDistanceToNow(new Date(date), { 
      addSuffix: true, 
      locale: ca 
    });
  };

  const BlogCard = ({ blog, isListView = false }: { blog: Blog; isListView?: boolean }) => (
    <Card className={`hover:shadow-lg transition-shadow cursor-pointer group ${
      isListView ? 'mb-4' : 'h-full flex flex-col'
    }`}>
      <Link to={`/blogs/${blog.slug}`} className={!isListView ? 'h-full flex flex-col' : ''}>
        {blog.coverImage && !isListView && (
          <div className="aspect-[4/3] overflow-hidden rounded-t-lg">
            <img
              src={getImageUrl(blog.coverImage)}
              alt={blog.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          </div>
        )}
        
        <CardHeader className={`${isListView ? 'pb-2' : 'flex-1 p-4'}`}>
          <div className="flex items-start justify-between gap-3 h-full">
            <div className="flex-1 flex flex-col">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
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
              
              <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                {blog.title}
              </h3>
              
              <p className="text-gray-600 text-sm line-clamp-2 flex-1 min-h-[2.5rem]">
                {blog.excerpt}
              </p>
            </div>
            
            {blog.coverImage && isListView && (
              <div className="w-24 h-16 flex-shrink-0 overflow-hidden rounded-lg">
                <img
                  src={getImageUrl(blog.coverImage)}
                  alt={blog.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="pt-0 mt-auto p-4">
          <div className="space-y-2">
            {/* Autor */}
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Avatar className="h-5 w-5">
                <AvatarImage src={getImageUrl(blog.author.profilePicture)} />
                <AvatarFallback className="text-xs">
                  {blog.author.firstName[0]}{blog.author.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <User className="h-3 w-3" />
              <span className="text-xs">{blog.author.firstName} {blog.author.lastName}</span>
            </div>
            
            {/* Fecha */}
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Calendar className="h-3 w-3" />
              <span className="text-xs">{formatDate(blog.publishedAt || blog.createdAt)}</span>
            </div>
            
            {/* Vistas */}
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Eye className="h-3 w-3" />
              <span className="text-xs">{blog.viewCount} visualitzacions</span>
            </div>
            
            {/* Tags */}
            {blog.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {blog.tags.slice(0, 2).map((tag) => (
                  <Badge 
                    key={tag}
                    variant="outline" 
                    className="text-xs cursor-pointer hover:bg-gray-100"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedTag(tag);
                    }}
                  >
                    #{tag}
                  </Badge>
                ))}
                {blog.tags.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{blog.tags.length - 2}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  );

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <Icon className={`h-8 w-8 ${color}`} />
          <div className="text-right">
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-gray-500">{title}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const CategoriesWidget = () => (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Categories</h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Button
            variant={selectedCategory === '' ? 'default' : 'ghost'}
            className="w-full justify-start text-sm"
            onClick={() => setSelectedCategory('')}
          >
            Totes les categories
          </Button>
          {categories.map((category) => (
            <Button
              key={category._id}
              variant={selectedCategory === category._id ? 'default' : 'ghost'}
              className="w-full justify-start text-sm"
              onClick={() => setSelectedCategory(category._id)}
            >
              <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: category.color }}
              />
              {category.name}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const PopularTagsWidget = () => (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Tags Populars</h3>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {popularTags.map((tag) => (
            <Badge
              key={tag.tag}
              variant="outline"
              className="cursor-pointer hover:bg-gray-100"
              onClick={() => setSelectedTag(tag.tag)}
            >
              #{tag.tag} ({tag.count})
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <PageWrapper>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-blue-600" />
              Blogs
            </h1>
            <p className="text-gray-600 mt-2">
              Articles, tutorials i contingut editorial de la comunitat
            </p>
          </div>
          
          {!userLoading && canCreateBlogs && (
            <Button onClick={() => navigate('/blogs/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Nou Blog
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard 
            title="Total Blogs" 
            value={stats.published} 
            icon={BookOpen} 
            color="text-blue-500" 
          />
          <StatCard 
            title="Destacats" 
            value={stats.featured} 
            icon={Star} 
            color="text-yellow-500" 
          />
          <StatCard 
            title="Visualitzacions" 
            value={stats.totalViews.toLocaleString()} 
            icon={Eye} 
            color="text-green-500" 
          />
          <StatCard 
            title="Categories" 
            value={stats.categoriesWithCount.length} 
            icon={Tag} 
            color="text-purple-500" 
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Filters and Search */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <form onSubmit={handleSearch} className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Cercar blogs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </form>
                
                <div className="flex gap-2">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Ordenar per" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="-publishedAt">Més recents</SelectItem>
                      <SelectItem value="publishedAt">Més antics</SelectItem>
                      <SelectItem value="-viewCount">Més vistos</SelectItem>
                      <SelectItem value="title">Títol A-Z</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  >
                    {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
                  </Button>
                  
                  <Button variant="outline" onClick={clearFilters}>
                    <Filter className="h-4 w-4 mr-2" />
                    Netejar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className={`grid w-full ${!userLoading && canCreateBlogs ? 'grid-cols-3' : 'grid-cols-2'}`}>
              <TabsTrigger value="all">
                Tots ({stats?.published || 0})
              </TabsTrigger>
              <TabsTrigger value="featured">
                Destacats ({stats?.featured || 0})
              </TabsTrigger>
              {!userLoading && canCreateBlogs && (
                <TabsTrigger value="draft">
                  Esborranys ({stats?.draft || 0})
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <p>Carregant blogs...</p>
                </div>
              ) : blogs.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No s'han trobat blogs</p>
                  {!userLoading && canCreateBlogs && (
                    <Button onClick={() => navigate('/blogs/new')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Crear el primer blog
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {blogs.map((blog) => (
                        <BlogCard key={blog._id} blog={blog} />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {blogs.map((blog) => (
                        <BlogCard key={blog._id} blog={blog} isListView />
                      ))}
                    </div>
                  )}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-8">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      
                      <span className="px-4 py-2 text-sm">
                        Pàgina {currentPage} de {totalPages}
                      </span>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <CategoriesWidget />
          <PopularTagsWidget />
        </div>
      </div>
    </PageWrapper>
  );
};

export default Blogs;