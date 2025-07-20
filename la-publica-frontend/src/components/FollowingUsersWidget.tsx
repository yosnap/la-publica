import { useState, useEffect } from 'react';
import { UserCheck, Users, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { fetchAllUsers } from '@/api/users';
import { useUserProfile } from '@/hooks/useUser';
import { getImageUrl } from '@/utils/getImageUrl';

interface FollowingUser {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  profilePicture?: string;
  isActive?: boolean;
  followers?: string[];
  createdAt: string;
}

export function FollowingUsersWidget() {
  const navigate = useNavigate();
  const { user: currentUser } = useUserProfile();
  const [activeFollowing, setActiveFollowing] = useState<FollowingUser[]>([]);
  const [recentFollowing, setRecentFollowing] = useState<FollowingUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      loadFollowingData();
    }
  }, [currentUser]);

  const loadFollowingData = async () => {
    try {
      setLoading(true);

      // Get all users that the current user is following
      const followingRes = await fetchAllUsers().catch(() => ({ data: [] }));

      if (Array.isArray(followingRes.data) && currentUser?.following) {
        const followingUsers = followingRes.data.filter((user: FollowingUser) =>
          currentUser.following?.includes(user._id)
        );

        // Active following - users that are currently online/active
        const active = followingUsers.filter((user: FollowingUser) => user.isActive).slice(0, 6);

        // Recent following - ordered by when we started following them (latest first)
        const recent = followingUsers
          .sort((a: FollowingUser, b: FollowingUser) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice(0, 6);

        setActiveFollowing(active);
        setRecentFollowing(recent);
      }
    } catch (error) {
      console.error('Error loading following users:', error);
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

  const UserItem = ({ user }: { user: FollowingUser }) => (
    <div
      className="flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
      onClick={() => navigate(`/profile/${user.username}`)}
    >
      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-green-100 dark:bg-green-900/20 relative">
        {user.profilePicture ? (
          <img src={getImageUrl(user.profilePicture)} alt={`${user.firstName} ${user.lastName}`} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-green-500 text-white">
            <span className="font-semibold text-sm">{user.firstName.charAt(0).toUpperCase()}{user.lastName.charAt(0).toUpperCase()}</span>
          </div>
        )}
        {user.isActive && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
          {user.firstName} {user.lastName}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          @{user.username}
        </p>
      </div>
    </div>
  );

  if (!currentUser?.following?.length) {
    return (
      <Card className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
            <UserCheck className="h-5 w-5 mr-2 text-green-500" />
            Seguint
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6">
          <UserCheck className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">No segueixes cap usuari encara</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => navigate('/membres')}
          >
            Descobrir usuaris
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
          <UserCheck className="h-5 w-5 mr-2 text-green-500" />
          Seguint
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="actius" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4 h-8 gap-0">
            <TabsTrigger value="actius" className="text-[10px] font-medium px-0">ACTIUS</TabsTrigger>
            <TabsTrigger value="recents" className="text-[10px] font-medium px-0">RECENTS</TabsTrigger>
          </TabsList>

          <TabsContent value="actius" className="mt-0">
            {loading ? (
              <div className="px-6">
                <LoadingSkeleton />
              </div>
            ) : activeFollowing.length > 0 ? (
              <div>
                {activeFollowing.slice(0, 4).map((user) => (
                  <UserItem key={user._id} user={user} />
                ))}
              </div>
            ) : (
              <div className="text-center py-6 px-6">
                <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Cap usuari actiu ara</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="recents" className="mt-0">
            {loading ? (
              <div className="px-6">
                <LoadingSkeleton />
              </div>
            ) : recentFollowing.length > 0 ? (
              <div>
                {recentFollowing.slice(0, 4).map((user) => (
                  <UserItem key={user._id} user={user} />
                ))}
              </div>
            ) : (
              <div className="text-center py-6 px-6">
                <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No hi ha activitat recent</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="border-t mt-4 pt-4 px-6">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-sm font-medium text-gray-700 dark:text-gray-300"
            onClick={() => navigate('/members?tab=following')}
          >
            VEURE TOT
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
