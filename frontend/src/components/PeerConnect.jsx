import React, { useState, useEffect, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import axios from 'axios';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { FirebaseContext } from '../App';
import { 
  Users, 
  MessageCircle, 
  Heart, 
  ThumbsUp, 
  ThumbsDown,
  Reply,
  Share,
  Search,
  Plus,
  Bookmark,
  Flag,
  TrendingUp,
  Clock,
  User,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Send,
  Loader2,
  RefreshCw,
  Hash,
  X
} from 'lucide-react';

const API_BASE = "http://localhost:5000/api/peer";

// Helper to format relative time
function formatTimeAgo(dateString) {
  if (!dateString) return "just now";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  const now = new Date();
  const diffSec = Math.floor((now - date) / 1000);
  if (diffSec < 45) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function PeerConnect() {
  const { authUser, userData } = useContext(FirebaseContext) || {};
  
  // Tabs & Navigation State
  const [activeTab, setActiveTab] = useState('browse');
  const [myActivitySubTab, setMyActivitySubTab] = useState('posts');
  
  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'upvoted' | 'discussed'
  const [onlyBookmarked, setOnlyBookmarked] = useState(false);

  // Discussions & Interaction State
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [replyInputs, setReplyInputs] = useState({});
  const [replyAnonymous, setReplyAnonymous] = useState({});
  const [submittingReply, setSubmittingReply] = useState({});
  const [votingPostId, setVotingPostId] = useState(null);
  const [reportedPosts, setReportedPosts] = useState(new Set());

  // Stats & Activity
  const [stats, setStats] = useState({
    activeMembers: 1250,
    totalDiscussions: 0,
    todayPosts: 0,
    totalReplies: 0,
    feedbackPercentage: 96,
    categoryCounts: { all: 0, anxiety: 0, depression: 0, selfcare: 0, relationships: 0, work: 0, general: 0 }
  });
  const [userActivity, setUserActivity] = useState({
    postsCount: 0,
    repliesCount: 0,
    bookmarksCount: 0,
    helpfulVotes: 0,
    myPosts: [],
    myReplies: [],
    bookmarkedPosts: []
  });

  // Create Post Form State
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState('general');
  const [newPostTags, setNewPostTags] = useState('');
  const [newPostAnonymous, setNewPostAnonymous] = useState(false);
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const [postError, setPostError] = useState('');

  // Toast State
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Resolve current active user ID
  const getUserId = useCallback(() => {
    if (authUser?.uid) return authUser.uid;
    let localId = localStorage.getItem("peer_user_id");
    if (!localId) {
      localId = "guest_" + Math.random().toString(36).substring(2, 9);
      localStorage.setItem("peer_user_id", localId);
    }
    return localId;
  }, [authUser]);

  // Resolve current active user Display Name
  const getUserName = useCallback(() => {
    if (userData?.firstName) {
      return `${userData.firstName} ${userData.lastName || ''}`.trim();
    }
    if (authUser?.displayName) return authUser.displayName;
    if (authUser?.email) return authUser.email.split('@')[0];
    return "Kind Peer";
  }, [authUser, userData]);

  // Categories config
  const categories = [
    { id: 'all', label: 'All Topics' },
    { id: 'anxiety', label: 'Anxiety Support' },
    { id: 'depression', label: 'Depression' },
    { id: 'selfcare', label: 'Self Care' },
    { id: 'relationships', label: 'Relationships' },
    { id: 'work', label: 'Work Stress' },
    { id: 'general', label: 'General Support' }
  ];

  // Fetch discussions from backend API
  const fetchPosts = useCallback(async () => {
    setLoadingPosts(true);
    try {
      const userId = getUserId();
      const res = await axios.get(`${API_BASE}/posts`, {
        params: {
          category: selectedCategory,
          search: searchQuery,
          sort: sortBy,
          userId
        }
      });
      if (res.data && res.data.success) {
        setPosts(res.data.posts);
      }
    } catch (err) {
      console.warn("Could not fetch posts from API, using cached state:", err.message);
    } finally {
      setLoadingPosts(false);
    }
  }, [selectedCategory, searchQuery, sortBy, getUserId]);

  // Fetch community stats & user activity
  const fetchStatsAndActivity = useCallback(async () => {
    const userId = getUserId();
    try {
      const [statsRes, activityRes] = await Promise.all([
        axios.get(`${API_BASE}/stats`),
        axios.get(`${API_BASE}/my-activity`, { params: { userId } })
      ]);
      if (statsRes.data?.success) {
        setStats(statsRes.data.stats);
      }
      if (activityRes.data?.success) {
        setUserActivity(activityRes.data.activity);
      }
    } catch (err) {
      console.warn("Could not fetch stats/activity:", err.message);
    }
  }, [getUserId]);

  // Initial load
  useEffect(() => {
    fetchPosts();
    fetchStatsAndActivity();
  }, [fetchPosts, fetchStatsAndActivity]);

  // Handle Post Creation
  const handleCreatePost = async (e) => {
    e?.preventDefault();
    setPostError('');

    if (!newPostTitle.trim()) {
      setPostError('Please enter a clear title for your discussion');
      return;
    }
    if (!newPostContent.trim()) {
      setPostError('Please share details or context for your discussion');
      return;
    }

    setIsSubmittingPost(true);
    try {
      const userId = getUserId();
      const authorName = getUserName();
      const initials = authorName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'KP';

      const payload = {
        title: newPostTitle.trim(),
        content: newPostContent.trim(),
        category: newPostCategory,
        tags: newPostTags,
        author: authorName,
        authorInitials: initials,
        authorId: userId,
        isAnonymous: newPostAnonymous
      };

      const res = await axios.post(`${API_BASE}/posts`, payload);

      if (res.data?.success && res.data.post) {
        // Clear form
        setNewPostTitle('');
        setNewPostContent('');
        setNewPostTags('');
        setNewPostAnonymous(false);
        setActiveTab('browse');
        setSelectedCategory('all');
        showToast('Discussion published successfully! Thank you for sharing.');
        // Refresh posts & stats
        fetchPosts();
        fetchStatsAndActivity();
      }
    } catch (err) {
      console.error('Failed to create post:', err);
      setPostError(err.response?.data?.message || 'Failed to publish discussion. Please try again.');
    } finally {
      setIsSubmittingPost(false);
    }
  };

  // Handle Post Voting (Upvote / Downvote)
  const handleVote = async (postId, voteType) => {
    if (votingPostId === postId) return;
    setVotingPostId(postId);

    const userId = getUserId();

    // Optimistic UI update
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id !== postId) return post;
        const currentVote = post.userVote;
        let upvotes = post.upvotes || 0;
        let downvotes = post.downvotes || 0;
        let nextVote = null;

        if (currentVote === voteType) {
          // Toggle off
          if (voteType === 'up') upvotes = Math.max(0, upvotes - 1);
          if (voteType === 'down') downvotes = Math.max(0, downvotes - 1);
          nextVote = null;
        } else {
          // Switch or add vote
          if (currentVote === 'up') upvotes = Math.max(0, upvotes - 1);
          if (currentVote === 'down') downvotes = Math.max(0, downvotes - 1);

          if (voteType === 'up') upvotes += 1;
          if (voteType === 'down') downvotes += 1;
          nextVote = voteType;
        }

        return { ...post, upvotes, downvotes, userVote: nextVote };
      })
    );

    try {
      const res = await axios.post(`${API_BASE}/posts/${postId}/vote`, {
        voteType,
        userId
      });
      if (res.data?.success) {
        setPosts((prevPosts) =>
          prevPosts.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  upvotes: res.data.upvotes,
                  downvotes: res.data.downvotes,
                  userVote: res.data.userVote
                }
              : p
          )
        );
        fetchStatsAndActivity();
      }
    } catch (err) {
      console.error('Vote failed:', err);
      fetchPosts(); // Rollback on error
    } finally {
      setVotingPostId(null);
    }
  };

  // Handle Post Bookmark Toggle
  const handleBookmark = async (postId) => {
    const userId = getUserId();
    // Optimistic UI toggle
    setPosts((prevPosts) =>
      prevPosts.map((p) =>
        p.id === postId ? { ...p, isBookmarked: !p.isBookmarked } : p
      )
    );

    try {
      const res = await axios.post(`${API_BASE}/posts/${postId}/bookmark`, { userId });
      if (res.data?.success) {
        showToast(res.data.isBookmarked ? 'Discussion saved to your bookmarks' : 'Discussion removed from bookmarks');
        fetchStatsAndActivity();
      }
    } catch (err) {
      console.error('Bookmark toggle failed:', err);
      fetchPosts();
    }
  };

  // Handle Submitting a Reply
  const handleAddReply = async (postId) => {
    const content = replyInputs[postId]?.trim();
    if (!content) return;

    setSubmittingReply((prev) => ({ ...prev, [postId]: true }));
    const userId = getUserId();
    const isAnon = replyAnonymous[postId] || false;
    const authorName = getUserName();
    const initials = authorName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'KP';

    try {
      const res = await axios.post(`${API_BASE}/posts/${postId}/replies`, {
        content,
        author: authorName,
        authorInitials: initials,
        authorId: userId,
        isAnonymous: isAnon
      });

      if (res.data?.success && res.data.reply) {
        const newReply = res.data.reply;
        setPosts((prevPosts) =>
          prevPosts.map((p) => {
            if (p.id !== postId) return p;
            const updatedReplies = [...(p.replies || []), newReply];
            return {
              ...p,
              replies: updatedReplies,
              replyCount: updatedReplies.length
            };
          })
        );
        // Clear reply box
        setReplyInputs((prev) => ({ ...prev, [postId]: '' }));
        showToast('Your supportive reply was added!');
        fetchStatsAndActivity();
      }
    } catch (err) {
      console.error('Failed to post reply:', err);
      showToast('Could not post reply. Please check connection.', 'error');
    } finally {
      setSubmittingReply((prev) => ({ ...prev, [postId]: false }));
    }
  };

  // Handle Reply Upvote
  const handleReplyVote = async (postId, replyId) => {
    const userId = getUserId();
    // Optimistic UI update
    setPosts((prevPosts) =>
      prevPosts.map((p) => {
        if (p.id !== postId || !p.replies) return p;
        const updatedReplies = p.replies.map((r) => {
          if (r.id !== replyId) return r;
          const hasVoted = r.userVotes?.[userId] === 'up';
          const upvotes = hasVoted ? Math.max(0, (r.upvotes || 0) - 1) : (r.upvotes || 0) + 1;
          const userVotes = { ...(r.userVotes || {}) };
          if (hasVoted) delete userVotes[userId];
          else userVotes[userId] = 'up';
          return { ...r, upvotes, userVotes };
        });
        return { ...p, replies: updatedReplies };
      })
    );

    try {
      const res = await axios.post(`${API_BASE}/replies/${replyId}/vote`, { userId });
      if (res.data?.success) {
        fetchStatsAndActivity();
      }
    } catch (err) {
      console.error('Failed to vote reply:', err);
    }
  };

  // Handle Share Link
  const handleShare = (post) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(`${window.location.origin}/peer#${post.id} — "${post.title}"`);
      showToast('Discussion link copied to clipboard!');
    } else {
      showToast(`Sharing: ${post.title}`);
    }
  };

  // Handle Flag / Report
  const handleFlag = (postId) => {
    setReportedPosts((prev) => new Set(prev).add(postId));
    showToast('Thank you. Discussion has been flagged for moderation review.');
  };

  // Category styling helper
  const getCategoryColor = (category) => {
    const colors = {
      anxiety: 'bg-amber-100 text-amber-900 border-amber-200',
      depression: 'bg-blue-100 text-blue-900 border-blue-200',
      selfcare: 'bg-emerald-100 text-emerald-900 border-emerald-200',
      relationships: 'bg-purple-100 text-purple-900 border-purple-200',
      work: 'bg-orange-100 text-orange-900 border-orange-200',
      general: 'bg-gray-100 text-gray-900 border-gray-200'
    };
    return colors[category] || colors.general;
  };

  // Filter posts client-side if "only bookmarked" is active
  const displayedPosts = onlyBookmarked
    ? posts.filter((p) => p.isBookmarked)
    : posts;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-20 right-6 z-50 flex items-center space-x-3 px-4 py-3 rounded-xl shadow-xl text-white text-sm font-medium ${
              toastMessage.type === 'error' ? 'bg-red-600' : 'bg-teal-600'
            }`}
          >
            {toastMessage.type === 'error' ? (
              <AlertCircle className="h-5 w-5" />
            ) : (
              <CheckCircle2 className="h-5 w-5" />
            )}
            <span>{toastMessage.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header Hero */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="flex justify-center"
          >
            <div className="p-4 bg-gradient-to-br from-teal-100 via-indigo-50 to-purple-100 rounded-2xl shadow-inner border border-teal-100/50">
              <Users className="h-10 w-10 text-teal-600" />
            </div>
          </motion.div>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
              Peer Connect
            </h1>
            <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto mt-2">
              A safe, empathetic space where you can share thoughts, discuss challenges, and find strength in shared journeys.
            </p>
          </div>
        </div>

        {/* Live Community Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border border-teal-100/60 shadow-sm bg-gradient-to-b from-teal-50/40 to-white">
            <CardContent className="p-4 text-center">
              <div className="text-2xl md:text-3xl font-extrabold text-teal-700">
                {stats.activeMembers?.toLocaleString() || '1,250'}
              </div>
              <div className="text-xs md:text-sm font-medium text-gray-600 mt-0.5">Active Members</div>
            </CardContent>
          </Card>
          <Card className="border border-blue-100/60 shadow-sm bg-gradient-to-b from-blue-50/40 to-white">
            <CardContent className="p-4 text-center">
              <div className="text-2xl md:text-3xl font-extrabold text-blue-700">
                {stats.totalDiscussions || posts.length}
              </div>
              <div className="text-xs md:text-sm font-medium text-gray-600 mt-0.5">Live Discussions</div>
            </CardContent>
          </Card>
          <Card className="border border-purple-100/60 shadow-sm bg-gradient-to-b from-purple-50/40 to-white">
            <CardContent className="p-4 text-center">
              <div className="text-2xl md:text-3xl font-extrabold text-purple-700">
                {stats.totalReplies || 24}
              </div>
              <div className="text-xs md:text-sm font-medium text-gray-600 mt-0.5">Peer Replies</div>
            </CardContent>
          </Card>
          <Card className="border border-emerald-100/60 shadow-sm bg-gradient-to-b from-emerald-50/40 to-white">
            <CardContent className="p-4 text-center">
              <div className="text-2xl md:text-3xl font-extrabold text-emerald-700">
                {stats.feedbackPercentage || 96}%
              </div>
              <div className="text-xs md:text-sm font-medium text-gray-600 mt-0.5">Supportive Score</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex items-center justify-between border-b pb-3">
            <TabsList className="grid grid-cols-3 w-full max-w-md bg-gray-100/80 p-1 rounded-xl">
              <TabsTrigger value="browse" className="rounded-lg text-sm font-medium">
                Browse Discussions
              </TabsTrigger>
              <TabsTrigger value="create" className="rounded-lg text-sm font-medium">
                Create Post
              </TabsTrigger>
              <TabsTrigger value="my-posts" className="rounded-lg text-sm font-medium">
                My Activity
              </TabsTrigger>
            </TabsList>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                fetchPosts();
                fetchStatsAndActivity();
                showToast('Refreshed discussions');
              }}
              className="hidden sm:flex items-center space-x-1.5 text-gray-600 border-gray-200"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Refresh</span>
            </Button>
          </div>

          {/* ══════════════════════════════════════════════════════
              TAB 1: BROWSE DISCUSSIONS
          ══════════════════════════════════════════════════════ */}
          <TabsContent value="browse" className="space-y-6">
            {/* Search, Sort, and Bookmark Filter Bar */}
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search discussions by keyword, topic, or hashtag..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-9 bg-white shadow-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Sort selector */}
              <div className="flex items-center space-x-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="h-10 px-3 text-sm bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium text-gray-700"
                >
                  <option value="newest">🕒 Newest First</option>
                  <option value="upvoted">🔥 Most Upvoted</option>
                  <option value="discussed">💬 Most Discussed</option>
                </select>

                {/* Bookmark Filter Toggle */}
                <Button
                  variant={onlyBookmarked ? "default" : "outline"}
                  size="sm"
                  onClick={() => setOnlyBookmarked(!onlyBookmarked)}
                  className={`h-10 px-3.5 flex items-center space-x-1.5 ${
                    onlyBookmarked
                      ? "bg-amber-600 hover:bg-amber-700 text-white"
                      : "text-gray-700"
                  }`}
                >
                  <Bookmark className={`h-4 w-4 ${onlyBookmarked ? "fill-current" : ""}`} />
                  <span className="hidden sm:inline">Saved</span>
                </Button>
              </div>
            </div>

            <div className="grid lg:grid-cols-4 gap-6">
              {/* Category Filter Sidebar */}
              <div className="lg:col-span-1 space-y-4">
                <Card className="border-gray-200 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-bold text-gray-800">
                      Categories
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Filter by discussion theme
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-1.5 p-3 pt-0">
                    {categories.map((category) => {
                      const count =
                        category.id === 'all'
                          ? stats.totalDiscussions || posts.length
                          : stats.categoryCounts?.[category.id] ?? 0;
                      const isSelected = selectedCategory === category.id;

                      return (
                        <button
                          key={category.id}
                          onClick={() => {
                            setSelectedCategory(category.id);
                            setOnlyBookmarked(false);
                          }}
                          className={`w-full text-left px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-between text-sm ${
                            isSelected
                              ? 'bg-teal-600 text-white font-semibold shadow-sm'
                              : 'text-gray-700 hover:bg-gray-100 font-medium'
                          }`}
                        >
                          <span>{category.label}</span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              isSelected
                                ? 'bg-teal-700/80 text-teal-100'
                                : 'bg-gray-200/80 text-gray-700'
                            }`}
                          >
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </CardContent>
                </Card>

                {/* Supportive Prompt Card */}
                <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-100">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center space-x-2 text-purple-700 font-semibold text-sm">
                      <Sparkles className="h-4 w-4" />
                      <span>Need Support?</span>
                    </div>
                    <p className="text-xs text-purple-900/80 leading-relaxed">
                      Every voice matters here. Whether you have questions or small victories to celebrate, the peer community is here with open arms.
                    </p>
                    <Button
                      size="sm"
                      onClick={() => setActiveTab('create')}
                      className="w-full mt-2 bg-purple-600 hover:bg-purple-700 text-white text-xs h-8"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" /> Start Discussion
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Main Posts Feed */}
              <div className="lg:col-span-3 space-y-4">
                {loadingPosts ? (
                  <div className="py-16 text-center space-y-3">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-teal-600" />
                    <p className="text-sm text-gray-500 font-medium">Loading discussions...</p>
                  </div>
                ) : displayedPosts.length === 0 ? (
                  <Card className="p-10 text-center space-y-4 bg-gray-50/50 border-dashed border-2">
                    <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                      <MessageCircle className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 text-lg">No discussions found</h3>
                      <p className="text-sm text-gray-500 max-w-sm mx-auto mt-1">
                        {onlyBookmarked
                          ? "You haven't bookmarked any discussions yet."
                          : searchQuery
                          ? `No discussions match "${searchQuery}". Try different keywords.`
                          : "Be the first person to start a conversation in this topic!"}
                      </p>
                    </div>
                    {onlyBookmarked ? (
                      <Button variant="outline" size="sm" onClick={() => setOnlyBookmarked(false)}>
                        Show All Discussions
                      </Button>
                    ) : (
                      <Button size="sm" onClick={() => setActiveTab('create')}>
                        <Plus className="h-4 w-4 mr-1.5" /> Start First Post
                      </Button>
                    )}
                  </Card>
                ) : (
                  displayedPosts.map((post, index) => {
                    const isExpanded = selectedPost === post.id;
                    const isReported = reportedPosts.has(post.id);

                    return (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(index * 0.05, 0.4) }}
                      >
                        <Card className="hover:shadow-md transition-all duration-200 border-gray-200">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start space-x-3 flex-1">
                                <Avatar className="h-10 w-10 border border-gray-100 bg-gradient-to-br from-teal-400 to-indigo-500 text-white font-bold">
                                  <AvatarFallback className="bg-transparent text-white text-xs font-bold">
                                    {post.authorInitials || 'KP'}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-2 flex-wrap">
                                    <h3 className="font-bold text-base md:text-lg text-gray-900 leading-snug">
                                      {post.title}
                                    </h3>
                                    {post.isBookmarked && (
                                      <Bookmark className="h-4 w-4 text-amber-500 fill-current flex-shrink-0" />
                                    )}
                                  </div>
                                  <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1 flex-wrap">
                                    <span className="font-semibold text-gray-700">
                                      {post.author || 'Anonymous'}
                                    </span>
                                    <span>•</span>
                                    <span className="flex items-center">
                                      <Clock className="h-3 w-3 mr-1 text-gray-400" />
                                      {formatTimeAgo(post.createdAt)}
                                    </span>
                                    <span>•</span>
                                    <span
                                      className={`px-2 py-0.5 rounded-full border text-[11px] font-medium ${getCategoryColor(
                                        post.category
                                      )}`}
                                    >
                                      {categories.find((c) => c.id === post.category)?.label || post.category}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Flag button */}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleFlag(post.id)}
                                title={isReported ? "Flagged for review" : "Report inappropriate post"}
                                className={`h-8 w-8 text-gray-400 hover:text-red-500 ${
                                  isReported ? "text-red-500 bg-red-50" : ""
                                }`}
                              >
                                <Flag className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </CardHeader>

                          <CardContent className="space-y-3.5">
                            {/* Post Body */}
                            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                              {post.content}
                            </p>

                            {/* Tags */}
                            {Array.isArray(post.tags) && post.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {post.tags.map((tag) => (
                                  <button
                                    key={tag}
                                    onClick={() => setSearchQuery(tag)}
                                    className="inline-flex items-center text-xs px-2.5 py-0.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium transition-colors"
                                  >
                                    <Hash className="h-3 w-3 mr-0.5 text-gray-400" />
                                    {tag}
                                  </button>
                                ))}
                              </div>
                            )}

                            {/* Action Row */}
                            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                              <div className="flex items-center space-x-1.5 sm:space-x-3">
                                {/* Upvote Button */}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleVote(post.id, 'up')}
                                  className={`flex items-center space-x-1.5 text-xs h-8 px-2.5 rounded-lg transition-colors ${
                                    post.userVote === 'up'
                                      ? 'bg-teal-50 text-teal-700 font-semibold border border-teal-200'
                                      : 'text-gray-600 hover:bg-gray-100'
                                  }`}
                                >
                                  <ThumbsUp
                                    className={`h-3.5 w-3.5 ${
                                      post.userVote === 'up' ? 'fill-current text-teal-600' : ''
                                    }`}
                                  />
                                  <span>{post.upvotes || 0}</span>
                                </Button>

                                {/* Downvote Button */}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleVote(post.id, 'down')}
                                  className={`flex items-center space-x-1.5 text-xs h-8 px-2.5 rounded-lg transition-colors ${
                                    post.userVote === 'down'
                                      ? 'bg-red-50 text-red-600 font-semibold border border-red-200'
                                      : 'text-gray-600 hover:bg-gray-100'
                                  }`}
                                >
                                  <ThumbsDown
                                    className={`h-3.5 w-3.5 ${
                                      post.userVote === 'down' ? 'fill-current text-red-600' : ''
                                    }`}
                                  />
                                  <span>{post.downvotes || 0}</span>
                                </Button>

                                {/* Reply Toggle Button */}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    setSelectedPost(isExpanded ? null : post.id)
                                  }
                                  className={`flex items-center space-x-1.5 text-xs h-8 px-2.5 rounded-lg transition-colors ${
                                    isExpanded
                                      ? 'bg-blue-50 text-blue-700 font-semibold'
                                      : 'text-gray-600 hover:bg-gray-100'
                                  }`}
                                >
                                  <MessageCircle className="h-3.5 w-3.5" />
                                  <span>{post.replies?.length ?? post.replyCount ?? 0}</span>
                                  <span className="hidden sm:inline">
                                    {(post.replies?.length ?? post.replyCount) === 1 ? 'Reply' : 'Replies'}
                                  </span>
                                </Button>
                              </div>

                              <div className="flex items-center space-x-1">
                                {/* Bookmark Button */}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleBookmark(post.id)}
                                  className={`h-8 w-8 ${
                                    post.isBookmarked
                                      ? 'text-amber-500 hover:text-amber-600'
                                      : 'text-gray-400 hover:text-gray-600'
                                  }`}
                                >
                                  <Bookmark
                                    className={`h-4 w-4 ${post.isBookmarked ? 'fill-current' : ''}`}
                                  />
                                </Button>

                                {/* Share Button */}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleShare(post)}
                                  className="h-8 w-8 text-gray-400 hover:text-gray-600"
                                >
                                  <Share className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            {/* Replies Section (Collapsible Accordion) */}
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="mt-4 pt-4 border-t border-gray-100 space-y-4 overflow-hidden"
                                >
                                  <div className="space-y-3">
                                    {(!post.replies || post.replies.length === 0) ? (
                                      <div className="text-center py-4 bg-gray-50/50 rounded-xl border border-gray-100">
                                        <p className="text-xs text-gray-500">
                                          No replies yet. Be the first to leave a comforting note or helpful tip!
                                        </p>
                                      </div>
                                    ) : (
                                      post.replies.map((reply) => {
                                        const userId = getUserId();
                                        const hasLikedReply = reply.userVotes?.[userId] === 'up';

                                        return (
                                          <div
                                            key={reply.id}
                                            className="flex items-start space-x-3 bg-gray-50/80 rounded-xl p-3 border border-gray-100/80"
                                          >
                                            <Avatar className="h-7 w-7 text-xs bg-gradient-to-br from-indigo-400 to-purple-500 text-white font-bold">
                                              <AvatarFallback className="bg-transparent text-white text-[10px] font-bold">
                                                {reply.authorInitials || 'KP'}
                                              </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                              <div className="flex items-center justify-between mb-1">
                                                <span className="font-semibold text-xs text-gray-800">
                                                  {reply.author || 'Anonymous'}
                                                </span>
                                                <span className="text-[11px] text-gray-400">
                                                  {formatTimeAgo(reply.createdAt)}
                                                </span>
                                              </div>
                                              <p className="text-xs md:text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                                                {reply.content}
                                              </p>
                                              <div className="flex items-center space-x-2 mt-2">
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  onClick={() => handleReplyVote(post.id, reply.id)}
                                                  className={`text-[11px] h-6 px-2 rounded-md ${
                                                    hasLikedReply
                                                      ? 'text-teal-700 bg-teal-50 font-semibold'
                                                      : 'text-gray-500 hover:text-gray-700'
                                                  }`}
                                                >
                                                  <ThumbsUp
                                                    className={`h-3 w-3 mr-1 ${
                                                      hasLikedReply ? 'fill-current text-teal-600' : ''
                                                    }`}
                                                  />
                                                  {reply.upvotes || 0}
                                                </Button>
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })
                                    )}
                                  </div>

                                  {/* Add Reply Input */}
                                  <div className="bg-white rounded-xl border border-gray-200 p-3 space-y-2.5">
                                    <Textarea
                                      placeholder="Write a supportive reply or share what helped you..."
                                      value={replyInputs[post.id] || ''}
                                      onChange={(e) =>
                                        setReplyInputs({
                                          ...replyInputs,
                                          [post.id]: e.target.value
                                        })
                                      }
                                      className="min-h-[70px] text-xs md:text-sm border-gray-200 resize-none"
                                    />
                                    <div className="flex items-center justify-between pt-1">
                                      <label className="flex items-center space-x-1.5 text-xs text-gray-500 cursor-pointer">
                                        <input
                                          type="checkbox"
                                          checked={replyAnonymous[post.id] || false}
                                          onChange={(e) =>
                                            setReplyAnonymous({
                                              ...replyAnonymous,
                                              [post.id]: e.target.checked
                                            })
                                          }
                                          className="rounded text-teal-600 focus:ring-teal-500 h-3.5 w-3.5"
                                        />
                                        <span>Reply anonymously</span>
                                      </label>

                                      <Button
                                        size="sm"
                                        onClick={() => handleAddReply(post.id)}
                                        disabled={
                                          submittingReply[post.id] ||
                                          !replyInputs[post.id]?.trim()
                                        }
                                        className="h-8 px-3.5 bg-teal-600 hover:bg-teal-700 text-white text-xs"
                                      >
                                        {submittingReply[post.id] ? (
                                          <>
                                            <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                                            Posting...
                                          </>
                                        ) : (
                                          <>
                                            <Send className="h-3.5 w-3.5 mr-1.5" />
                                            Reply
                                          </>
                                        )}
                                      </Button>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>
          </TabsContent>

          {/* ══════════════════════════════════════════════════════
              TAB 2: CREATE POST
          ══════════════════════════════════════════════════════ */}
          <TabsContent value="create" className="space-y-6">
            <Card className="max-w-3xl mx-auto border-gray-200 shadow-sm">
              <CardHeader className="border-b bg-gray-50/50 pb-4">
                <div className="flex items-center space-x-2 text-teal-700">
                  <Plus className="h-5 w-5" />
                  <CardTitle className="text-xl">Create a New Discussion</CardTitle>
                </div>
                <CardDescription>
                  Share experiences, ask questions, or offer words of encouragement. You are among peers who care.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-5">
                {postError && (
                  <div className="flex items-center space-x-2 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{postError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Topic Category *
                  </label>
                  <select
                    value={newPostCategory}
                    onChange={(e) => setNewPostCategory(e.target.value)}
                    className="w-full p-2.5 border border-gray-200 rounded-xl bg-white shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium text-gray-800"
                  >
                    {categories
                      .filter((c) => c.id !== 'all')
                      .map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.label}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-sm font-semibold text-gray-700">
                      Title *
                    </label>
                    <span className="text-xs text-gray-400">
                      {newPostTitle.length}/120
                    </span>
                  </div>
                  <Input
                    value={newPostTitle}
                    maxLength={120}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                    placeholder="Give your discussion a clear, relatable title (e.g., How do you navigate exam burnout?)"
                    className="border-gray-200 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Description & Details *
                  </label>
                  <Textarea
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="Share your thoughts, feelings, or questions. Be as open as you feel comfortable being..."
                    className="min-h-[140px] border-gray-200 text-sm leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Hashtags / Tags (Optional)
                  </label>
                  <Input
                    value={newPostTags}
                    onChange={(e) => setNewPostTags(e.target.value)}
                    placeholder="e.g. mindfulness, presentation, sleep, family (separated by commas)"
                    className="border-gray-200 text-sm"
                  />
                </div>

                {/* Anonymous Checkbox */}
                <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-sm font-medium text-gray-800 block">
                      Post Anonymously
                    </span>
                    <span className="text-xs text-gray-500">
                      Hides your real username and displays as "Anonymous Peer"
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={newPostAnonymous}
                    onChange={(e) => setNewPostAnonymous(e.target.checked)}
                    className="h-4 w-4 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t">
                  <p className="text-xs text-gray-500">
                    💡 Please keep posts respectful, considerate, and non-judgmental.
                  </p>
                  <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab('browse')}
                      className="flex-1 sm:flex-none"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreatePost}
                      disabled={isSubmittingPost || !newPostTitle.trim() || !newPostContent.trim()}
                      className="flex-1 sm:flex-none bg-teal-600 hover:bg-teal-700 text-white"
                    >
                      {isSubmittingPost ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Publishing...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Publish Discussion
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ══════════════════════════════════════════════════════
              TAB 3: MY ACTIVITY
          ══════════════════════════════════════════════════════ */}
          <TabsContent value="my-posts" className="space-y-6">
            {/* Dynamic Activity Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border border-teal-100 shadow-sm text-center p-4">
                <div className="text-2xl md:text-3xl font-extrabold text-teal-700">
                  {userActivity.postsCount}
                </div>
                <div className="text-xs text-gray-500 mt-1 font-medium">Discussions Created</div>
              </Card>
              <Card className="border border-blue-100 shadow-sm text-center p-4">
                <div className="text-2xl md:text-3xl font-extrabold text-blue-700">
                  {userActivity.repliesCount}
                </div>
                <div className="text-xs text-gray-500 mt-1 font-medium">Replies Given</div>
              </Card>
              <Card className="border border-amber-100 shadow-sm text-center p-4">
                <div className="text-2xl md:text-3xl font-extrabold text-amber-700">
                  {userActivity.bookmarksCount}
                </div>
                <div className="text-xs text-gray-500 mt-1 font-medium">Saved Bookmarks</div>
              </Card>
              <Card className="border border-emerald-100 shadow-sm text-center p-4">
                <div className="text-2xl md:text-3xl font-extrabold text-emerald-700">
                  {userActivity.helpfulVotes}
                </div>
                <div className="text-xs text-gray-500 mt-1 font-medium">Helpful Votes Received</div>
              </Card>
            </div>

            {/* Sub-tab selection */}
            <div className="flex space-x-2 border-b pb-2">
              <button
                onClick={() => setMyActivitySubTab('posts')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  myActivitySubTab === 'posts'
                    ? 'bg-teal-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                My Discussions ({userActivity.postsCount})
              </button>
              <button
                onClick={() => setMyActivitySubTab('replies')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  myActivitySubTab === 'replies'
                    ? 'bg-teal-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                My Replies ({userActivity.repliesCount})
              </button>
              <button
                onClick={() => setMyActivitySubTab('bookmarks')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  myActivitySubTab === 'bookmarks'
                    ? 'bg-teal-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Saved Discussions ({userActivity.bookmarksCount})
              </button>
            </div>

            {/* Sub-tab content */}
            <div className="space-y-3">
              {myActivitySubTab === 'posts' && (
                userActivity.myPosts?.length === 0 ? (
                  <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed">
                    <p className="text-sm text-gray-500">You haven't posted any discussions yet.</p>
                    <Button size="sm" onClick={() => setActiveTab('create')} className="mt-3">
                      Start Your First Post
                    </Button>
                  </div>
                ) : (
                  userActivity.myPosts.map((post) => (
                    <Card key={post.id} className="p-4 flex items-center justify-between hover:shadow-sm">
                      <div className="space-y-1 flex-1 pr-4">
                        <h4 className="font-semibold text-gray-800 text-sm md:text-base">
                          {post.title}
                        </h4>
                        <div className="flex items-center space-x-3 text-xs text-gray-500">
                          <span>{formatTimeAgo(post.createdAt)}</span>
                          <span>•</span>
                          <span>👍 {post.upvotes || 0} upvotes</span>
                          <span>•</span>
                          <span>💬 {post.replies?.length || 0} replies</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedCategory('all');
                          setSelectedPost(post.id);
                          setActiveTab('browse');
                        }}
                      >
                        View Post
                      </Button>
                    </Card>
                  ))
                )
              )}

              {myActivitySubTab === 'replies' && (
                userActivity.myReplies?.length === 0 ? (
                  <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed">
                    <p className="text-sm text-gray-500">You haven't replied to any discussions yet.</p>
                    <Button size="sm" onClick={() => setActiveTab('browse')} className="mt-3">
                      Browse and Support Peers
                    </Button>
                  </div>
                ) : (
                  userActivity.myReplies.map((reply) => (
                    <Card key={reply.id} className="p-4 flex items-center justify-between hover:shadow-sm">
                      <div className="space-y-1 flex-1 pr-4">
                        <p className="text-xs text-gray-400">
                          Replied to: <span className="font-semibold text-gray-700">{reply.postTitle}</span>
                        </p>
                        <p className="text-sm text-gray-800 italic">
                          "{reply.content}"
                        </p>
                        <div className="flex items-center space-x-3 text-xs text-gray-500 pt-1">
                          <span>{formatTimeAgo(reply.createdAt)}</span>
                          <span>•</span>
                          <span>👍 {reply.upvotes || 0} upvotes</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedCategory('all');
                          setSelectedPost(reply.postId);
                          setActiveTab('browse');
                        }}
                      >
                        View Thread
                      </Button>
                    </Card>
                  ))
                )
              )}

              {myActivitySubTab === 'bookmarks' && (
                userActivity.bookmarkedPosts?.length === 0 ? (
                  <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed">
                    <p className="text-sm text-gray-500">No saved discussions yet. Click the bookmark icon on any post to save it for later.</p>
                  </div>
                ) : (
                  userActivity.bookmarkedPosts.map((post) => (
                    <Card key={post.id} className="p-4 flex items-center justify-between hover:shadow-sm">
                      <div className="space-y-1 flex-1 pr-4">
                        <h4 className="font-semibold text-gray-800 text-sm md:text-base">
                          {post.title}
                        </h4>
                        <div className="flex items-center space-x-3 text-xs text-gray-500">
                          <span>{formatTimeAgo(post.createdAt)}</span>
                          <span>•</span>
                          <span>by {post.author}</span>
                          <span>•</span>
                          <span>💬 {post.replies?.length || 0} replies</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedCategory('all');
                          setSelectedPost(post.id);
                          setActiveTab('browse');
                        }}
                      >
                        Open Discussion
                      </Button>
                    </Card>
                  ))
                )
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Community Guidelines */}
        <Card className="bg-gradient-to-r from-blue-50/80 to-teal-50/80 border-blue-200/70 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start space-x-3.5">
              <div className="p-2 bg-blue-100 rounded-xl text-blue-700 flex-shrink-0 mt-0.5">
                <Heart className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-blue-950 text-sm mb-1.5">
                  Peer Community Guidelines & Safety
                </h3>
                <div className="text-xs text-blue-900/80 space-y-1 leading-relaxed">
                  <p>• <strong>Empathy first:</strong> Be kind, patient, and respectful of diverse lived experiences.</p>
                  <p>• <strong>Personal perspective:</strong> Share what works for you, but avoid prescriptive medical advice.</p>
                  <p>• <strong>Confidentiality:</strong> Respect peer privacy; what is shared in confidence stays within the community.</p>
                  <p>• <strong>Crisis support:</strong> If you or someone you know is in immediate crisis, please reach out to emergency resources or a verified counselor via the Find Counselor tab.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
export default PeerConnect;