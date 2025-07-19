import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getImageUrl } from "@/utils/getImageUrl";
import { fetchPosts } from "@/api/posts";

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
      const response = await fetchPosts({ limit: 5 });
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
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Últimes Actualitzacions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : posts.length > 0 ? (
          <>
            {posts.filter(post => post.author && post.author.firstName).map((post) => (
              <div key={post._id} className="flex items-start gap-3">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={post.author?.profilePicture ? getImageUrl(post.author.profilePicture) : undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                    {post.author?.firstName?.[0] || '?'}{post.author?.lastName?.[0] || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    <span className="font-medium">{post.author?.firstName || 'Usuari'}</span>{' '}
                    ha publicat una actualització
                  </p>
                  <div 
                    className="text-xs text-gray-600 mt-1 line-clamp-2"
                    dangerouslySetInnerHTML={{ __html: truncateContent(post.content) }}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formatTimeAgo(post.createdAt)}
                  </p>
                </div>
              </div>
            ))}
            
            <Button variant="ghost" className="w-full text-sm mt-4">
              VEURE TOT
            </Button>
          </>
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">
            No hi ha actualitzacions recents
          </p>
        )}
      </CardContent>
    </Card>
  );
}