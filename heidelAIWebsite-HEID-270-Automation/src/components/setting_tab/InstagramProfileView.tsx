import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, ExternalLink, Instagram } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/components/ui/use-toast";
import { getData, DB_KEYS } from '@/lib/indexedDB';

interface InstagramPost {
  id: string;
  media_url: string;
  permalink: string;
  caption: string;
  media_type: string;
  thumbnail_url?: string;
  timestamp: string;
}

interface InstagramData {
  status: boolean;
  username: string;
  profileImage: string;
  userId: string;
  businessInfo: {
    id?: string;
    biography?: string;
    followers_count?: number;
    follows_count?: number;
    media_count?: number;
    name?: string;
    website?: string;
  };
  lastUpdated?: number;
}

interface InstagramProfileViewProps {
  isOpen: boolean;
  onClose: () => void;
}

const InstagramProfileView = ({ isOpen, onClose }: InstagramProfileViewProps) => {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [profile, setProfile] = useState<InstagramData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<InstagramPost | null>(null);

  useEffect(() => {
    const loadFromDB = async () => {
      setLoading(true);
      try {
        const dbProfile = await getData<InstagramData>('integrations', DB_KEYS.INTEGRATIONS.INSTAGRAM);
        const dbPosts = await getData<{ posts: InstagramPost[] }>(
          'integrations',
          DB_KEYS.INTEGRATIONS.INSTAGRAM_POSTS
        );

        if (!dbProfile || !dbProfile.status) {
          setError('No Instagram account connected. Please connect first.');
          return;
        }

        setProfile(dbProfile);
        setPosts(dbPosts?.posts || []);
        setError(null);
      } catch (err) {
        console.error("Error loading Instagram data from IndexedDB:", err);
        setError('Failed to load Instagram data from device storage.');
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load Instagram data from storage.",
        });
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      loadFromDB();
    }
  }, [isOpen]);

    return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-6xl w-full h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-4 py-4">
          <DialogTitle className='text-black'>Instagram Profile</DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex-1 flex justify-center items-center">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          </div>
        ) : (
          <ScrollArea className="flex-1 px-4">
            <div className="py-6 max-w-4xl mx-auto">
              {/* Profile Header */}
              {profile && (
                <div className="flex flex-col md:flex-row items-start gap-6 mb-8">
                  <Avatar className="h-24 w-24 border-2 border-purple-200">
                    <AvatarImage src={profile.profileImage} alt={profile.username} />
                    <AvatarFallback>{profile.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  
                  <div className="space-y-2">
                    <h2 className="text-2xl text-black font-bold">{profile.username}</h2>
                    <p className='text-black'>{profile.businessInfo.name}</p>
                    <p className="text-sm text-gray-600">{profile.businessInfo.biography}</p>
                    
                    {profile.businessInfo.website && (
                      <a
                        href={profile.businessInfo.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1 text-sm"
                      >
                        {profile.businessInfo.website} <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    
                    <div className="flex gap-6 mt-2">
                      <div className="text-center">
                        <p className="font-bold text-black">{profile.businessInfo.media_count}</p>
                        <p className="text-xs text-gray-600">Posts</p>
                      </div>
                      <div className="text-center text-black">
                        <p className="font-bold">{profile.businessInfo.followers_count}</p>
                        <p className="text-xs text-gray-600">Followers</p>
                      </div>
                      <div className="text-center text-black">
                        <p className="font-bold">{profile.businessInfo.follows_count}</p>
                        <p className="text-xs text-gray-600">Following</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Posts Grid */}
              <div className="grid grid-cols-3 gap-1 md:gap-2">
                {posts.map((post) => (
                  <div 
                    key={post.id} 
                    className="relative aspect-square overflow-hidden cursor-pointer hover:opacity-90 transition-all"
                    onClick={() => setSelectedPost(post)}
                  >
                    <img 
                      src={post.media_type === 'VIDEO' ? post.thumbnail_url || post.media_url : post.media_url} 
                      alt={post.caption || 'Instagram post'}
                      className="w-full h-full object-cover"
                    />
                    {post.media_type === 'VIDEO' && (
                      <Badge className="absolute top-2 right-2 bg-black/70" variant="secondary">
                        VIDEO
                      </Badge>
                    )}
                    {post.media_type === 'CAROUSEL_ALBUM' && (
                      <Badge className="absolute top-2 right-2 bg-black/70" variant="secondary">
                        ALBUM
                      </Badge>
                    )}
                  </div>
                ))}
              </div>

              {posts.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No posts available</p>
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </DialogContent>

      {/* Post Detail Dialog */}
      {selectedPost && (
        <Dialog open={!!selectedPost} onOpenChange={(open) => !open && setSelectedPost(null)}>
          <DialogContent className="max-w-5xl p-0 overflow-hidden">

            <div className="flex flex-col md:flex-row h-[80vh]">
              <div className="flex-1 bg-black flex items-center justify-center">
                {selectedPost.media_type === 'VIDEO' ? (
                  <video 
                    src={selectedPost.media_url} 
                    controls 
                    className="max-h-full max-w-full" 
                  />
                ) : (
                  <img 
                    src={selectedPost.media_url} 
                    alt={selectedPost.caption || 'Instagram post'} 
                    className="max-h-full max-w-full object-contain"
                  />
                )}
              </div>
              
              <div className="w-full md:w-[350px] p-4">
                <ScrollArea className="h-[calc(80vh-2rem)]">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={profile?.profileImage} />
                        <AvatarFallback>{profile?.username?.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="font-semibold">{profile?.username}</span>
                    </div>
                    
                    {selectedPost.caption && (
                      <p className="text-sm">{selectedPost.caption}</p>
                    )}
                    
                    <p className="text-xs text-gray-500">
                      {new Date(selectedPost.timestamp).toLocaleDateString()}
                    </p>
                    
                    <Button 
                      asChild
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-500"
                    >
                      <a href={selectedPost.permalink} target="_blank" rel="noopener noreferrer" className="flex gap-2 text-white items-center">
                        <Instagram className="h-4 w-4" />
                        View on Instagram
                      </a>
                    </Button>
                  </div>
                </ScrollArea>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
};

export default InstagramProfileView;