import { useState, useEffect } from 'react';
import { Users, UserCheck, TrendingUp, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { fetchAllUsers } from '@/api/users';
import { getImageUrl } from '@/utils/getImageUrl';

interface Member {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  profilePicture?: string;
  isActive?: boolean;
  followers?: string[];
  createdAt: string;
}

export function MembersWidget() {
  const navigate = useNavigate();
  const [newestMembers, setNewestMembers] = useState<Member[]>([]);
  const [activeMembers, setActiveMembers] = useState<Member[]>([]);
  const [popularMembers, setPopularMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMembersData();
  }, []);

  const loadMembersData = async () => {
    try {
      setLoading(true);
      
      const [newestRes, activeRes, popularRes] = await Promise.all([
        fetchAllUsers({ sortBy: 'recent', limit: 10 }).catch(() => ({ data: [] })),
        fetchAllUsers({ sortBy: 'active', limit: 6 }).catch(() => ({ data: [] })),
        fetchAllUsers({ sortBy: 'followers', limit: 10 }).catch(() => ({ data: [] }))
      ]);

      // Nous - ordenados por fecha de registro
      const newest = Array.isArray(newestRes.data) 
        ? newestRes.data
            .sort((a: Member, b: Member) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 6)
        : [];

      // Actius - usuarios activos
      const active = Array.isArray(activeRes.data) 
        ? activeRes.data.filter((m: Member) => m.isActive).slice(0, 6)
        : [];

      // Populars - ordenados por seguidores
      const popular = Array.isArray(popularRes.data)
        ? popularRes.data
            .sort((a: Member, b: Member) => (b.followers?.length || 0) - (a.followers?.length || 0))
            .slice(0, 6)
        : [];

      setNewestMembers(newest);
      setActiveMembers(active);
      setPopularMembers(popular);
    } catch (error) {
      console.error('Error loading members:', error);
    } finally {
      setLoading(false);
    }
  };

  const LoadingSkeleton = () => (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-3 p-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
          <div className="flex-1">
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1"></div>
            <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>
  );

  const MemberItem = ({ member }: { member: Member }) => (
    <div 
      className="flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
      onClick={() => navigate(`/profile/${member.username}`)}
    >
      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-blue-100 dark:bg-blue-900/20 relative">
        {member.profilePicture ? (
          <img src={getImageUrl(member.profilePicture)} alt={`${member.firstName} ${member.lastName}`} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-blue-500 text-white">
            <span className="font-semibold text-sm">{member.firstName.charAt(0).toUpperCase()}{member.lastName.charAt(0).toUpperCase()}</span>
          </div>
        )}
        {member.isActive && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
          {member.firstName} {member.lastName}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          @{member.username}
        </p>
      </div>
    </div>
  );

  return (
    <Card className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
          <Users className="h-5 w-5 mr-2 text-blue-500" />
          Miembres
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="nous" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4 h-8 gap-0">
            <TabsTrigger value="nous" className="text-[9px] font-medium px-0">NOUS</TabsTrigger>
            <TabsTrigger value="actius" className="text-[9px] font-medium px-0">ACTIUS</TabsTrigger>
            <TabsTrigger value="populars" className="text-[8px] font-medium px-0">POPULARS</TabsTrigger>
          </TabsList>
          
          <TabsContent value="nous" className="mt-0">
            {loading ? (
              <div className="px-6">
                <LoadingSkeleton />
              </div>
            ) : newestMembers.length > 0 ? (
              <div>
                {newestMembers.slice(0, 4).map((member) => (
                  <MemberItem key={member._id} member={member} />
                ))}
              </div>
            ) : (
              <div className="text-center py-6 px-6">
                <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No hi ha membres nous</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="actius" className="mt-0">
            {loading ? (
              <div className="px-6">
                <LoadingSkeleton />
              </div>
            ) : activeMembers.length > 0 ? (
              <div>
                {activeMembers.slice(0, 4).map((member) => (
                  <MemberItem key={member._id} member={member} />
                ))}
              </div>
            ) : (
              <div className="text-center py-6 px-6">
                <UserCheck className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No hi ha membres actius</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="populars" className="mt-0">
            {loading ? (
              <div className="px-6">
                <LoadingSkeleton />
              </div>
            ) : popularMembers.length > 0 ? (
              <div>
                {popularMembers.slice(0, 4).map((member) => (
                  <MemberItem key={member._id} member={member} />
                ))}
              </div>
            ) : (
              <div className="text-center py-6 px-6">
                <TrendingUp className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No hi ha dades de popularitat</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <div className="border-t mt-4 pt-4 px-6">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-sm font-medium text-gray-700 dark:text-gray-300"
            onClick={() => navigate('/members')}
          >
            VEURE TOT
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}