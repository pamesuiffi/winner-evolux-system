import { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Pin, Send, Share2, Copy, MessageCircle, Image as ImageIcon, Video, X, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Feed() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [newContent, setNewContent] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [userReactions, setUserReactions] = useState({});
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['feed-posts'],
    queryFn: () => base44.entities.FeedPost.list('-created_date', 50),
  });

  const { data: comments = [] } = useQuery({
    queryKey: ['feed-comments'],
    queryFn: () => base44.entities.FeedComment.list('-created_date', 200),
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      let imageUrl = null;
      let videoUrl = null;

      if (imagePreview) {
        const imgResp = await base44.integrations.Core.UploadFile({ file: imagePreview });
        imageUrl = imgResp.file_url;
      }
      if (videoPreview) {
        const vidResp = await base44.integrations.Core.UploadFile({ file: videoPreview });
        videoUrl = vidResp.file_url;
      }

      return base44.entities.FeedPost.create({
        ...data,
        image_url: imageUrl,
        video_url: videoUrl,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed-posts'] });
      setNewContent('');
      setImagePreview(null);
      setVideoPreview(null);
    },
  });

  const handlePost = () => {
    if (!newContent.trim() && !imagePreview && !videoPreview) return;
    createMutation.mutate({
      author_id: user?.id || 'coach',
      author_name: user?.full_name || 'Coach',
      author_role: user?.role === 'admin' ? 'coach' : 'student',
      coach_id: user?.id || 'coach',
      content: newContent,
      post_type: 'general',
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) setVideoPreview(file);
  };

  const handleReact = async (postId, field) => {
    const key = `${postId}-${field}`;
    const already = userReactions[key];
    setUserReactions(r => ({ ...r, [key]: !already }));
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    const currentVal = post[field] || 0;
    await base44.entities.FeedPost.update(postId, { [field]: already ? Math.max(0, currentVal - 1) : currentVal + 1 });
    queryClient.invalidateQueries({ queryKey: ['feed-posts'] });

    // Notificar al autor si no es el mismo usuario y es una reacción nueva
    if (!already && post.author_id && post.author_id !== user?.id) {
      const emojiMap = { reactions_strong: '💪', reactions_fire: '🔥', reactions_star: '⭐' };
      base44.functions.invoke('createNotification', {
        receiver_id: post.author_id,
        type: 'student_pr',
        title: `${emojiMap[field] || '👍'} ${user?.full_name || 'Alguien'} reaccionó a tu publicación`,
        message: post.content?.substring(0, 60) || '',
        action_url: '/feed',
      });
    }
  };

  const pinnedPosts = posts.filter(p => p.is_pinned);
  const regularPosts = posts.filter(p => !p.is_pinned);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display font-black text-4xl text-white tracking-wider">FEED</h1>
        <p className="text-muted-foreground text-sm">Comunidad Winner Evolux</p>
      </div>

      {/* Create Post */}
      <div className="rounded-2xl p-4" style={{ background: '#111', border: '1px solid rgba(255,77,0,0.2)' }}>
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-sm"
            style={{ background: 'linear-gradient(135deg, #FF4D00, #FFB800)' }}>
            {user?.full_name?.[0] || 'C'}
          </div>
          <div className="flex-1">
            <textarea
              value={newContent}
              onChange={e => setNewContent(e.target.value)}
              placeholder="Comparte un logro, WOD o motivación..."
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-600 resize-none"
              rows={3}
            />
            
            {/* Media previews */}
            {imagePreview && (
              <div className="mt-3 relative inline-block">
                <img src={URL.createObjectURL(imagePreview)} alt="preview" className="max-h-32 rounded-lg" />
                <button onClick={() => setImagePreview(null)} className="absolute top-1 right-1 p-1 rounded-full bg-red-500/80 hover:bg-red-600">
                  <X size={14} className="text-white" />
                </button>
              </div>
            )}
            {videoPreview && (
              <div className="mt-3 relative inline-block">
                <div className="bg-black/20 rounded-lg px-4 py-2 text-xs text-gray-300 flex items-center gap-2">
                  <Video size={14} /> {videoPreview.name}
                </div>
                <button onClick={() => setVideoPreview(null)} className="absolute top-1 right-1 p-1 rounded-full bg-red-500/80 hover:bg-red-600">
                  <X size={14} className="text-white" />
                </button>
              </div>
            )}

            <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex gap-2">
                <button onClick={() => imageInputRef.current?.click()}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-all">
                  <ImageIcon size={14} /> Foto
                </button>
                <button onClick={() => videoInputRef.current?.click()}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-all">
                  <Video size={14} /> Video
                </button>
                <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                <input ref={videoInputRef} type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
              </div>
              <button onClick={handlePost} disabled={(!newContent.trim() && !imagePreview && !videoPreview) || createMutation.isPending}
                className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium text-white disabled:opacity-40 transition-all"
                style={{ background: '#FF4D00' }}>
                {createMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                {createMutation.isPending ? 'Publicando...' : 'Publicar'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="text-center py-10 text-muted-foreground text-sm">Cargando feed...</div>
      )}

      {!isLoading && posts.length === 0 && (
        <div className="text-center py-10 text-muted-foreground text-sm">
          <p className="text-4xl mb-3">🏋️</p>
          <p>Aún no hay publicaciones. ¡Sé el primero!</p>
        </div>
      )}

      {pinnedPosts.map(post => (
        <PostCard key={post.id} post={post} comments={comments.filter(c => c.post_id === post.id)} 
          onReact={handleReact} userReactions={userReactions} user={user} queryClient={queryClient} />
      ))}
      {regularPosts.map(post => (
        <PostCard key={post.id} post={post} comments={comments.filter(c => c.post_id === post.id)} 
          onReact={handleReact} userReactions={userReactions} user={user} queryClient={queryClient} />
      ))}
    </div>
  );
}

function PostCard({ post, comments, onReact, userReactions, user, queryClient }) {
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const [commentText, setCommentText] = useState('');

  const createCommentMutation = useMutation({
    mutationFn: (data) => base44.entities.FeedComment.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['feed-comments'] });
      base44.entities.FeedPost.update(post.id, { comments_count: (post.comments_count || 0) + 1 });
      // Notificar al autor del post
      if (post.author_id && post.author_id !== user?.id) {
        base44.functions.invoke('createNotification', {
          receiver_id: post.author_id,
          type: 'new_message',
          title: `💬 ${user?.full_name || 'Alguien'} comentó tu publicación`,
          message: variables.content?.substring(0, 60) || '',
          action_url: '/feed',
        });
      }
      setCommentText('');
    },
  });

  const typeColors = {
    logro:      { bg: 'rgba(255,184,0,0.15)', color: '#FFB800', label: '🏆 Logro' },
    pr:         { bg: 'rgba(255,77,0,0.15)',  color: '#FF4D00', label: '⚡ PR Nuevo' },
    skill_unlock: { bg: 'rgba(0,200,150,0.15)', color: '#00C896', label: '🔓 Skill' },
    motivacion: { bg: 'rgba(150,100,255,0.15)', color: '#9B6DFF', label: '🚀 Motivación' },
    general:    null,
  };
  const badge = typeColors[post.post_type];

  const reactions = [
    { key: 'reactions_strong', emoji: '💪' },
    { key: 'reactions_fire',   emoji: '🔥' },
    { key: 'reactions_star',   emoji: '⭐' },
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(post.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(post.content)}`, '_blank');
  };

  const handleNative = () => {
    if (navigator.share) {
      navigator.share({ title: 'Winner Evolux', text: post.content });
    } else {
      handleCopy();
    }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    createCommentMutation.mutate({
      post_id: post.id,
      author_id: user?.id || 'coach',
      author_name: user?.full_name || 'Coach',
      author_role: user?.role === 'admin' ? 'coach' : 'student',
      content: commentText,
      coach_id: user?.id || 'coach',
    });
  };

  const dateLabel = post.created_date
    ? format(new Date(post.created_date), "d 'de' MMM", { locale: es })
    : '';

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#111', border: `1px solid ${post.is_pinned ? 'rgba(255,184,0,0.2)' : 'rgba(255,255,255,0.06)'}` }}>
      {post.is_pinned && (
        <div className="flex items-center gap-2 px-4 py-2 text-xs font-medium" style={{ background: 'rgba(255,184,0,0.1)', color: '#FFB800' }}>
          <Pin size={12} /> Post anclado
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-sm"
            style={{ background: post.author_role === 'coach' ? 'linear-gradient(135deg, #FF4D00, #FFB800)' : 'linear-gradient(135deg, #333, #555)' }}>
            {post.author_name?.[0] || '?'}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-white text-sm">{post.author_name}</span>
              {post.author_role === 'coach' && (
                <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,77,0,0.2)', color: '#FF4D00' }}>Coach</span>
              )}
              {badge && (
                <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: badge.bg, color: badge.color }}>{badge.label}</span>
              )}
              {dateLabel && <span className="text-xs text-gray-600 ml-auto">{dateLabel}</span>}
            </div>
          </div>
        </div>

        <p className="text-gray-200 text-sm leading-relaxed mb-3 whitespace-pre-line">{post.content}</p>

        {/* Media */}
        {post.image_url && (
          <img src={post.image_url} alt="post" className="w-full rounded-lg mb-3 max-h-96 object-cover" />
        )}
        {post.video_url && (
          <video src={post.video_url} controls className="w-full rounded-lg mb-3 max-h-96" />
        )}

        {/* Reactions + actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {reactions.map(({ key, emoji }) => {
            const reacted = userReactions[`${post.id}-${key}`];
            return (
              <button key={key} onClick={() => onReact(post.id, key)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm transition-all hover:scale-105"
                style={{
                  background: reacted ? 'rgba(255,77,0,0.2)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${reacted ? 'rgba(255,77,0,0.4)' : 'rgba(255,255,255,0.08)'}`,
                  color: reacted ? '#FF4D00' : '#888'
                }}>
                {emoji} <span className="text-xs">{post[key] || 0}</span>
              </button>
            );
          })}

          <div className="ml-auto flex items-center gap-1">
            <button onClick={() => setShowComments(s => !s)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-gray-500 hover:text-gray-300 transition-all"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <MessageCircle size={13} /> {comments.length}
            </button>
            <button onClick={() => setShowShare(s => !s)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all"
              style={{
                background: showShare ? 'rgba(255,77,0,0.15)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${showShare ? 'rgba(255,77,0,0.3)' : 'rgba(255,255,255,0.06)'}`,
                color: showShare ? '#FF4D00' : '#888'
              }}>
              <Share2 size={13} /> Compartir
            </button>
          </div>
        </div>

        {/* Share options */}
        {showShare && (
          <div className="mt-3 p-3 rounded-xl flex flex-wrap gap-2" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <button onClick={handleWhatsApp}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-80"
              style={{ background: '#25D366' }}>
              <span>🟢</span> WhatsApp
            </button>
            <button onClick={handleNative}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-80"
              style={{ background: '#FF4D00' }}>
              <span>📤</span> Compartir
            </button>
            <button onClick={handleCopy}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
              style={{ background: 'rgba(255,255,255,0.08)', color: copied ? '#00C896' : '#ccc' }}>
              <Copy size={12} /> {copied ? '¡Copiado!' : 'Copiar'}
            </button>
          </div>
        )}

        {/* Comments */}
        {showComments && (
          <div className="mt-4 space-y-3">
            <div className="w-full h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
            
            {comments.map(comment => (
              <div key={comment.id} className="flex gap-2">
                <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: comment.author_role === 'coach' ? 'linear-gradient(135deg, #FF4D00, #FFB800)' : '#333' }}>
                  {comment.author_name?.[0]}
                </div>
                <div className="flex-1 bg-white/5 rounded-lg px-3 py-2">
                  <span className="text-xs font-medium text-white mr-1">{comment.author_name}</span>
                  {comment.author_role === 'coach' && <span className="text-[10px] text-orange-400">Coach</span>}
                  <p className="text-xs text-gray-300 mt-0.5">{comment.content}</p>
                </div>
              </div>
            ))}

            <div className="flex gap-2 pt-2 border-t border-white/10">
              <input value={commentText} onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleComment()}
                placeholder="Escribe un comentario..."
                className="flex-1 rounded-lg px-3 py-2 text-xs text-white outline-none"
                style={{ background: '#0D0D0D', border: '1px solid rgba(255,255,255,0.1)' }} />
              <button onClick={handleComment} disabled={!commentText.trim() || createCommentMutation.isPending}
                className="p-2 rounded-lg transition-all disabled:opacity-40"
                style={{ background: '#FF4D00' }}>
                {createCommentMutation.isPending ? <Loader2 size={12} className="animate-spin text-white" /> : <Send size={12} className="text-white" />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}