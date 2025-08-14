import { useState, useEffect } from 'react';
import { FileText, Eye, Star, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { getAllAnnouncements } from '@/api/announcements';

interface Announcement {
  _id: string;
  type: 'offer' | 'demand';
  title: string;
  description: string;
  slug: string;
  price?: number | { amount?: number; min?: number; max?: number };
  featured: boolean;
  views: number;
  createdAt: string;
  category?: {
    name: string;
    color: string;
  };
}

export function AnnouncementsWidget() {
  const navigate = useNavigate();
  const [latestAnnouncements, setLatestAnnouncements] = useState<Announcement[]>([]);
  const [featuredAnnouncements, setFeaturedAnnouncements] = useState<Announcement[]>([]);
  const [mostViewedAnnouncements, setMostViewedAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnnouncementsData();
  }, []);

  const loadAnnouncementsData = async () => {
    try {
      setLoading(true);
      
      const [latestRes, featuredRes, mostViewedRes] = await Promise.all([
        getAllAnnouncements({ active: true }).catch(() => ({ data: [] })),
        getAllAnnouncements({ featured: true, active: true }).catch(() => ({ data: [] })),
        getAllAnnouncements({ active: true }).catch(() => ({ data: [] }))
      ]);

      // Últimos - ordenados por fecha
      const latest = Array.isArray(latestRes.data) 
        ? latestRes.data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6)
        : [];

      // Destacados - los que tienen featured: true
      const featured = Array.isArray(featuredRes.data) ? featuredRes.data.slice(0, 6) : [];

      // Más vistos - ordenados por views
      const mostViewed = Array.isArray(mostViewedRes.data)
        ? mostViewedRes.data.sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 6)
        : [];

      setLatestAnnouncements(latest);
      setFeaturedAnnouncements(featured);
      setMostViewedAnnouncements(mostViewed);
    } catch (error) {
      console.error('Error loading announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const LoadingSkeleton = () => (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="p-2">
          <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1"></div>
          <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
      ))}
    </div>
  );


  const AnnouncementItem = ({ announcement }: { announcement: Announcement }) => {
    const announcementSlug = announcement.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
      .replace(/^-+|-+$/g, '');
    
    return (
    <div 
      className="flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
      onClick={() => navigate(`/anunci/${announcementSlug}`)}
    >
      <div className="w-10 h-10 rounded-full flex-shrink-0 bg-green-500 text-white flex items-center justify-center">
        <span className="font-semibold text-sm">{announcement.title.charAt(0).toUpperCase()}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
          {announcement.title}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {announcement.type === 'offer' ? 'Oferta' : 'Demanda'} • {announcement.views} vistes
        </p>
      </div>
    </div>
  );
  };

  return (
    <Card className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
          <FileText className="h-5 w-5 mr-2 text-green-500" />
          Anuncis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="ultims" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4 h-8 gap-0">
            <TabsTrigger value="ultims" className="text-[9px] font-medium px-0">ÚLTIMS</TabsTrigger>
            <TabsTrigger value="destacats" className="text-[9px] font-medium px-0">DESTACATS</TabsTrigger>
            <TabsTrigger value="mes-vistos" className="text-[8px] font-medium px-0">MÉS VISTOS</TabsTrigger>
          </TabsList>
          
          <TabsContent value="ultims" className="mt-0">
            {loading ? (
              <div className="px-6">
                <LoadingSkeleton />
              </div>
            ) : latestAnnouncements.length > 0 ? (
              <div>
                {latestAnnouncements.slice(0, 4).map((announcement) => (
                  <AnnouncementItem key={announcement._id} announcement={announcement} />
                ))}
              </div>
            ) : (
              <div className="text-center py-6 px-6">
                <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No hi ha anuncis recents</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="destacats" className="mt-0">
            {loading ? (
              <div className="px-6">
                <LoadingSkeleton />
              </div>
            ) : featuredAnnouncements.length > 0 ? (
              <div>
                {featuredAnnouncements.slice(0, 4).map((announcement) => (
                  <AnnouncementItem key={announcement._id} announcement={announcement} />
                ))}
              </div>
            ) : (
              <div className="text-center py-6 px-6">
                <Star className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No hi ha anuncis destacats</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="mes-vistos" className="mt-0">
            {loading ? (
              <div className="px-6">
                <LoadingSkeleton />
              </div>
            ) : mostViewedAnnouncements.length > 0 ? (
              <div>
                {mostViewedAnnouncements.slice(0, 4).map((announcement) => (
                  <AnnouncementItem key={announcement._id} announcement={announcement} />
                ))}
              </div>
            ) : (
              <div className="text-center py-6 px-6">
                <Eye className="h-8 w-8 text-gray-400 mx-auto mb-2" />
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
            onClick={() => navigate('/announcements')}
          >
            VEURE TOT
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}