import { useState, useEffect } from 'react';
import { BookOpen, Star, TrendingUp, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { getBlogs } from '@/api/blogs';
import { getImageUrl } from '@/utils/getImageUrl';

interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string;
  featured: boolean;
  viewCount: number;
  publishedAt?: string;
  createdAt: string;
  author: {
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  category?: {
    name: string;
    color: string;
  };
}

export function BlogsWidget() {
  const navigate = useNavigate();
  const [latestBlogs, setLatestBlogs] = useState<Blog[]>([]);
  const [featuredBlogs, setFeaturedBlogs] = useState<Blog[]>([]);
  const [trendingBlogs, setTrendingBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBlogsData();
  }, []);

  const loadBlogsData = async () => {
    try {
      setLoading(true);
      
      const [latestRes, featuredRes, trendingRes] = await Promise.all([
        getBlogs({ limit: 10, status: 'published', sort: 'recent' }).catch(() => ({ data: [] })),
        getBlogs({ featured: true, status: 'published', limit: 6 }).catch(() => ({ data: [] })),
        getBlogs({ limit: 10, status: 'published' }).catch(() => ({ data: [] }))
      ]);

      // Últims - ordenados por fecha de publicación
      const latest = Array.isArray(latestRes.data) 
        ? latestRes.data.slice(0, 6)
        : [];

      // Destacats - los que tienen featured: true
      const featured = Array.isArray(featuredRes.data) ? featuredRes.data.slice(0, 6) : [];

      // Tendència - ordenados por viewCount
      const trending = Array.isArray(trendingRes.data)
        ? trendingRes.data
            .filter((blog: Blog) => blog.viewCount > 0)
            .sort((a: Blog, b: Blog) => (b.viewCount || 0) - (a.viewCount || 0))
            .slice(0, 6)
        : [];

      setLatestBlogs(latest);
      setFeaturedBlogs(featured);
      setTrendingBlogs(trending);
    } catch (error) {
      console.error('Error loading blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const LoadingSkeleton = () => (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-start space-x-3 p-2">
          <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
          <div className="flex-1">
            <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1"></div>
            <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>
  );

  const BlogItem = ({ blog }: { blog: Blog }) => (
    <div 
      className="flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
      onClick={() => navigate(`/blogs/${blog.slug}`)}
    >
      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-orange-100 dark:bg-orange-900/20">
        {blog.coverImage ? (
          <img src={getImageUrl(blog.coverImage)} alt={blog.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-orange-500 text-white">
            <span className="font-semibold text-sm">{blog.title.charAt(0).toUpperCase()}</span>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
          {blog.title}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {blog.author.firstName} {blog.author.lastName} • {blog.viewCount || 0} vistes
        </p>
      </div>
    </div>
  );

  return (
    <Card className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
          <BookOpen className="h-5 w-5 mr-2 text-orange-500" />
          Blog
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="ultims" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4 h-8 gap-0">
            <TabsTrigger value="ultims" className="text-[9px] font-medium px-0">ÚLTIMS</TabsTrigger>
            <TabsTrigger value="destacats" className="text-[9px] font-medium px-0">DESTACATS</TabsTrigger>
            <TabsTrigger value="tendencia" className="text-[8px] font-medium px-0">TENDÈNCIA</TabsTrigger>
          </TabsList>
          
          <TabsContent value="ultims" className="mt-0">
            {loading ? (
              <div className="px-6">
                <LoadingSkeleton />
              </div>
            ) : latestBlogs.length > 0 ? (
              <div>
                {latestBlogs.slice(0, 4).map((blog) => (
                  <BlogItem key={blog._id} blog={blog} />
                ))}
              </div>
            ) : (
              <div className="text-center py-6 px-6">
                <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No hi ha entrades recents</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="destacats" className="mt-0">
            {loading ? (
              <div className="px-6">
                <LoadingSkeleton />
              </div>
            ) : featuredBlogs.length > 0 ? (
              <div>
                {featuredBlogs.slice(0, 4).map((blog) => (
                  <BlogItem key={blog._id} blog={blog} />
                ))}
              </div>
            ) : (
              <div className="text-center py-6 px-6">
                <Star className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No hi ha entrades destacades</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="tendencia" className="mt-0">
            {loading ? (
              <div className="px-6">
                <LoadingSkeleton />
              </div>
            ) : trendingBlogs.length > 0 ? (
              <div>
                {trendingBlogs.slice(0, 4).map((blog) => (
                  <BlogItem key={blog._id} blog={blog} />
                ))}
              </div>
            ) : (
              <div className="text-center py-6 px-6">
                <TrendingUp className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No hi ha estadístiques de visualitzacions</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <div className="border-t mt-4 pt-4 px-6">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-sm font-medium text-gray-700 dark:text-gray-300"
            onClick={() => navigate('/blogs')}
          >
            VEURE TOT
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}