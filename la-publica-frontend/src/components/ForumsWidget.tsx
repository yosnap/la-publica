import { useState, useEffect } from 'react';
import { MessageCircle, Pin, TrendingUp, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { fetchForums } from '@/api/forums';

interface Forum {
  _id: string;
  name: string;
  description: string;
  postCount: number;
  topicCount: number;
  isPinned: boolean;
  isActive: boolean;
  category?: {
    name: string;
    color: string;
  };
  lastPost?: {
    createdAt: string;
    title: string;
  };
  createdAt: string;
}

export function ForumsWidget() {
  const navigate = useNavigate();
  const [latestForums, setLatestForums] = useState<Forum[]>([]);
  const [pinnedForums, setPinnedForums] = useState<Forum[]>([]);
  const [trendingForums, setTrendingForums] = useState<Forum[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadForumsData();
  }, []);

  const loadForumsData = async () => {
    try {
      setLoading(true);
      
      const [latestRes, pinnedRes, trendingRes] = await Promise.all([
        fetchForums({ limit: 10 }).catch(() => ({ data: [] })),
        fetchForums({ limit: 6 }).catch(() => ({ data: [] })),
        fetchForums({ limit: 10 }).catch(() => ({ data: [] }))
      ]);

      // Últimos - ordenados por fecha de creación
      const latest = Array.isArray(latestRes.data) 
        ? latestRes.data
            .filter((f: Forum) => f.isActive && !f.isPinned)
            .sort((a: Forum, b: Forum) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 6)
        : [];

      // Fixats - los que tienen isPinned: true
      const pinned = Array.isArray(pinnedRes.data) 
        ? pinnedRes.data.filter((f: Forum) => f.isPinned && f.isActive).slice(0, 6)
        : [];

      // Tendència - ordenados por actividad (posts + topics)
      const trending = Array.isArray(trendingRes.data)
        ? trendingRes.data
            .filter((f: Forum) => f.isActive)
            .sort((a: Forum, b: Forum) => ((b.postCount || 0) + (b.topicCount || 0)) - ((a.postCount || 0) + (a.topicCount || 0)))
            .slice(0, 6)
        : [];

      setLatestForums(latest);
      setPinnedForums(pinned);
      setTrendingForums(trending);
    } catch (error) {
      console.error('Error loading forums:', error);
    } finally {
      setLoading(false);
    }
  };

  const LoadingSkeleton = () => (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="p-2">
          <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1"></div>
          <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
      ))}
    </div>
  );

  const ForumItem = ({ forum }: { forum: Forum }) => (
    <div 
      className="flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
      onClick={() => navigate(`/forums/${forum._id}`)}
    >
      <div className="w-10 h-10 rounded-full flex-shrink-0 bg-purple-500 text-white flex items-center justify-center">
        <span className="font-semibold text-sm">{forum.name.charAt(0).toUpperCase()}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
          {forum.name}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {forum.postCount || 0} posts • {forum.topicCount || 0} temes
        </p>
      </div>
    </div>
  );

  return (
    <Card className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
          <MessageCircle className="h-5 w-5 mr-2 text-purple-500" />
          Fòrums
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="ultims" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4 h-8 gap-0">
            <TabsTrigger value="ultims" className="text-[9px] font-medium px-0">ÚLTIMS</TabsTrigger>
            <TabsTrigger value="fixats" className="text-[9px] font-medium px-0">FIXATS</TabsTrigger>
            <TabsTrigger value="tendencia" className="text-[8px] font-medium px-0">TENDÈNCIA</TabsTrigger>
          </TabsList>
          
          <TabsContent value="ultims" className="mt-0">
            {loading ? (
              <div className="px-6">
                <LoadingSkeleton />
              </div>
            ) : latestForums.length > 0 ? (
              <div>
                {latestForums.slice(0, 4).map((forum) => (
                  <ForumItem key={forum._id} forum={forum} />
                ))}
              </div>
            ) : (
              <div className="text-center py-6 px-6">
                <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No hi ha fòrums recents</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="fixats" className="mt-0">
            {loading ? (
              <div className="px-6">
                <LoadingSkeleton />
              </div>
            ) : pinnedForums.length > 0 ? (
              <div>
                {pinnedForums.slice(0, 4).map((forum) => (
                  <ForumItem key={forum._id} forum={forum} />
                ))}
              </div>
            ) : (
              <div className="text-center py-6 px-6">
                <Pin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No hi ha fòrums fixats</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="tendencia" className="mt-0">
            {loading ? (
              <div className="px-6">
                <LoadingSkeleton />
              </div>
            ) : trendingForums.length > 0 ? (
              <div>
                {trendingForums.slice(0, 4).map((forum) => (
                  <ForumItem key={forum._id} forum={forum} />
                ))}
              </div>
            ) : (
              <div className="text-center py-6 px-6">
                <TrendingUp className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No hi ha dades de tendència</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <div className="border-t mt-4 pt-4 px-6">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-sm font-medium text-gray-700 dark:text-gray-300"
            onClick={() => navigate('/forums')}
          >
            VEURE TOT
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}