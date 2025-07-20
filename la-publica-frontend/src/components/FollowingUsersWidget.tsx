import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getImageUrl } from "@/utils/getImageUrl";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getUserFollowing } from "@/api/users";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  slug: string;
  profilePicture?: string;
  bio?: string;
}

interface FollowingUsersWidgetProps {
  userId: string;
  isOwnProfile?: boolean;
  maxUsers?: number;
}

export function FollowingUsersWidget({ userId, isOwnProfile = false, maxUsers = 5 }: FollowingUsersWidgetProps) {
  const navigate = useNavigate();
  const [followingUsers, setFollowingUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFollowingUsers = async () => {
      try {
        setLoading(true);
        const response = await getUserFollowing(userId);
        if (response.success && response.data) {
          setFollowingUsers(response.data.slice(0, maxUsers));
        }
      } catch (err) {
        console.error('Error loading following users:', err);
        setError('Error al cargar usuarios seguidos');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadFollowingUsers();
    }
  }, [userId, maxUsers]);

  const handleUserClick = (user: User) => {
    if (user.slug) {
      navigate(`/usuario/${user.slug}`);
    }
  };

  if (loading) {
    return (
      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle className="text-lg">
            {isOwnProfile ? 'Usuaris que segueixes' : 'Usuaris que segueix'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error || followingUsers.length === 0) {
    return (
      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle className="text-lg">
            {isOwnProfile ? 'Usuaris que segueixes' : 'Usuaris que segueix'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center text-gray-500 py-8">
          <p className="text-sm">
            {error || (isOwnProfile 
              ? 'No segueixes cap usuari encara' 
              : 'No segueix cap usuari'
            )}
          </p>
          {isOwnProfile && !error && (
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-3"
              onClick={() => navigate('/miembros')}
            >
              Explorar Usuaris
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-xl">
      <CardHeader>
        <CardTitle className="text-lg">
          {isOwnProfile ? 'Usuaris que segueixes' : 'Usuaris que segueix'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {followingUsers.map((user) => (
          <div 
            key={user._id}
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
            onClick={() => handleUserClick(user)}
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={getImageUrl(user.profilePicture)} />
              <AvatarFallback>{user.firstName?.[0]}{user.lastName?.[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-gray-500 truncate">
                @{user.username}
              </p>
            </div>
          </div>
        ))}
        
        {followingUsers.length >= maxUsers && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full mt-2"
            onClick={() => navigate(isOwnProfile ? '/perfil?tab=following' : `/usuario/${followingUsers[0]?.slug}?tab=following`)}
          >
            Veure tots
          </Button>
        )}
      </CardContent>
    </Card>
  );
}