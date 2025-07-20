import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity } from "lucide-react";
import { getImageUrl } from "@/utils/getImageUrl";
import { fetchUserFeed } from "@/api/posts";

interface Post {
  _id: string;
  content: string;
  author: {
    _id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  likes: string[];
  comments: any[];
  createdAt: string;
  updatedAt: string;
  image?: string;
}


export function LatestUpdatesWidget() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentPosts();
  }, []);

  const loadRecentPosts = async () => {
    try {
      setLoading(true);
      const response = await fetchUserFeed(1, 10);
      if (response.success) {
        setPosts(response.data || []);
      }
    } catch (error) {
      console.error('Error loading recent posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const then = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'ara mateix';
    if (diffInSeconds < 3600) return `fa ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `fa ${Math.floor(diffInSeconds / 3600)}h`;
    
    const diffInDays = Math.floor(diffInSeconds / 86400);
    if (diffInDays === 1) return 'ahir';
    if (diffInDays < 365) return `fa ${diffInDays} dies`;
    
    return `fa ${Math.floor(diffInDays / 365)} anys`;
  };

  const truncateContent = (content: string, maxLength: number = 60) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <Card className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
          <Activity className="h-5 w-5 mr-2 text-blue-500" />
          Últimes Actualitzacions
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Últimes 10</p>
      </CardHeader>
      <CardContent className="px-0">
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : posts.length > 0 ? (
          <>
            <div className="space-y-3">
              {posts.filter(post => post.author && post.author.firstName).slice(0, 10).map((post) => (
                <div key={post._id} className="flex items-start gap-3 px-6">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={post.author?.profilePicture ? getImageUrl(post.author.profilePicture) : undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                      {post.author?.firstName?.[0] || '?'}{post.author?.lastName?.[0] || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      <span className="font-medium">{post.author?.firstName || 'Usuari'}</span>{' '}
                      ha publicat una actualització
                    </p>
                    <div 
                      className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2"
                      dangerouslySetInnerHTML={{ __html: truncateContent(post.content) }}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatTimeAgo(post.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t mt-4 pt-4 px-6">
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                VEURE TOT
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-6 px-6">
            <Activity className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No hi ha actualitzacions recents
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}