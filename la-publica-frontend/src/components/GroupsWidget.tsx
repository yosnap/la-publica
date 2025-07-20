import { useState, useEffect } from 'react';
import { Users, Globe, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { fetchUserGroups, fetchGroups } from '@/api/groups';
import { getImageUrl } from '@/utils/getImageUrl';

interface Group {
  _id: string;
  name: string;
  description: string;
  memberCount: number;
  privacy: 'public' | 'private';
  image?: string;
  category?: {
    name: string;
    color: string;
  };
}

export function GroupsWidget() {
  const navigate = useNavigate();
  const [userGroups, setUserGroups] = useState<Group[]>([]);
  const [exploreGroups, setExploreGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGroupsData();
  }, []);

  const loadGroupsData = async () => {
    try {
      setLoading(true);
      
      const [userGroupsRes, exploreGroupsRes] = await Promise.all([
        fetchUserGroups().catch(() => ({ data: [] })),
        fetchGroups({ limit: 6 }).catch(() => ({ data: [] }))
      ]);

      setUserGroups(Array.isArray(userGroupsRes.data) ? userGroupsRes.data.slice(0, 6) : []);
      setExploreGroups(Array.isArray(exploreGroupsRes.data) ? exploreGroupsRes.data.slice(0, 6) : []);
    } catch (error) {
      console.error('Error loading groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const LoadingSkeleton = () => (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-3 p-2">
          <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
          <div className="flex-1">
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1"></div>
            <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>
  );

  const GroupItem = ({ group }: { group: Group }) => (
    <div 
      className="flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
      onClick={() => navigate(`/groups/${group._id}`)}
    >
      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-purple-100 dark:bg-purple-900/20">
        {group.image ? (
          <img src={getImageUrl(group.image)} alt={group.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-purple-500 text-white">
            <span className="font-semibold text-sm">{group.name.charAt(0).toUpperCase()}</span>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{group.name}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{group.memberCount} membres</p>
      </div>
    </div>
  );

  return (
    <Card className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
          <Users className="h-5 w-5 mr-2 text-blue-500" />
          Grups
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="mis-grupos" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4 h-8 gap-0">
            <TabsTrigger value="mis-grupos" className="text-[10px] font-medium px-0">NOUS</TabsTrigger>
            <TabsTrigger value="explorar" className="text-[10px] font-medium px-0">ACTIUS</TabsTrigger>
          </TabsList>
          
          <TabsContent value="mis-grupos" className="mt-0">
            {loading ? (
              <div className="px-6">
                <LoadingSkeleton />
              </div>
            ) : userGroups.length > 0 ? (
              <div>
                {userGroups.slice(0, 4).map((group) => (
                  <GroupItem key={group._id} group={group} />
                ))}
              </div>
            ) : (
              <div className="text-center py-6 px-6">
                <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No tens grups encara</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="explorar" className="mt-0">
            {loading ? (
              <div className="px-6">
                <LoadingSkeleton />
              </div>
            ) : exploreGroups.length > 0 ? (
              <div>
                {exploreGroups.slice(0, 4).map((group) => (
                  <GroupItem key={group._id} group={group} />
                ))}
              </div>
            ) : (
              <div className="text-center py-6 px-6">
                <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No hi ha grups disponibles</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <div className="border-t mt-4 pt-4 px-6">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-sm font-medium text-gray-700 dark:text-gray-300"
            onClick={() => navigate('/groups')}
          >
            VEURE TOT
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}