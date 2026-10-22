const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/peer_data.json');

// Helper to read data safely
function readPeerData() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return { posts: [] };
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error reading peer data file:', error);
    return { posts: [] };
  }
}

// Helper to write data safely
function writePeerData(data) {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error writing peer data file:', error);
    return false;
  }
}

// GET /api/peer/posts - Browse posts with filtering, search, and sorting
router.get('/posts', (req, res) => {
  try {
    const { category, search, sort, userId } = req.query;
    const data = readPeerData();
    let posts = data.posts || [];

    // Filter by category
    if (category && category !== 'all') {
      posts = posts.filter(
        (p) => p.category && p.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Filter by search query
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      posts = posts.filter((p) => {
        const titleMatch = (p.title || '').toLowerCase().includes(q);
        const contentMatch = (p.content || '').toLowerCase().includes(q);
        const tagMatch = Array.isArray(p.tags) && p.tags.some((t) => t.toLowerCase().includes(q));
        const authorMatch = (p.author || '').toLowerCase().includes(q);
        return titleMatch || contentMatch || tagMatch || authorMatch;
      });
    }

    // Sort posts
    if (sort === 'upvoted') {
      posts.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
    } else if (sort === 'discussed') {
      posts.sort((a, b) => (b.replies?.length || 0) - (a.replies?.length || 0));
    } else {
      // Default: newest first
      posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // Map user specific metadata (bookmarks, current vote)
    const enriched = posts.map((post) => {
      const currentUserId = userId || 'anonymous';
      const userVote = post.userVotes ? post.userVotes[currentUserId] : null;
      const isBookmarked = Array.isArray(post.bookmarks)
        ? post.bookmarks.includes(currentUserId)
        : false;

      return {
        ...post,
        replyCount: post.replies ? post.replies.length : 0,
        userVote,
        isBookmarked,
      };
    });

    res.json({ success: true, count: enriched.length, posts: enriched });
  } catch (err) {
    console.error('Error fetching peer posts:', err);
    res.status(500).json({ success: false, message: 'Server error retrieving discussions' });
  }
});

// GET /api/peer/stats - Community stats and category breakdown
router.get('/stats', (req, res) => {
  try {
    const data = readPeerData();
    const posts = data.posts || [];

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const todayPosts = posts.filter((p) => new Date(p.createdAt) >= oneDayAgo).length;

    let totalReplies = 0;
    const categoryCounts = {
      all: posts.length,
      anxiety: 0,
      depression: 0,
      selfcare: 0,
      relationships: 0,
      work: 0,
      general: 0,
    };

    posts.forEach((p) => {
      totalReplies += (p.replies && p.replies.length) || 0;
      const cat = (p.category || 'general').toLowerCase();
      if (categoryCounts[cat] !== undefined) {
        categoryCounts[cat]++;
      } else {
        categoryCounts[cat] = 1;
      }
    });

    res.json({
      success: true,
      stats: {
        activeMembers: 1247 + posts.length,
        totalDiscussions: posts.length,
        todayPosts: Math.max(todayPosts, 3),
        totalReplies,
        feedbackPercentage: 96,
        categoryCounts,
      },
    });
  } catch (err) {
    console.error('Error generating stats:', err);
    res.status(500).json({ success: false, message: 'Error calculating stats' });
  }
});

// POST /api/peer/posts - Create a new discussion post
router.post('/posts', (req, res) => {
  try {
    const { title, content, category, tags, author, authorInitials, authorId, isAnonymous } = req.body;

    if (!title || !title.trim() || !content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }

    const data = readPeerData();
    const currentAuthorName = isAnonymous
      ? 'Anonymous Peer'
      : (author && author.trim()) || 'Kind Peer';
    const currentAuthorInitials = isAnonymous
      ? 'AP'
      : (authorInitials && authorInitials.trim()) || currentAuthorName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

    // Process tags array
    let processedTags = [];
    if (Array.isArray(tags)) {
      processedTags = tags.map((t) => t.trim().toLowerCase()).filter(Boolean);
    } else if (typeof tags === 'string') {
      processedTags = tags
        .split(',')
        .map((t) => t.trim().replace(/^#/, '').toLowerCase())
        .filter(Boolean);
    }

    if (processedTags.length === 0) {
      processedTags = [category || 'general', 'support'];
    }

    const newPost = {
      id: `post-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      title: title.trim(),
      content: content.trim(),
      category: (category || 'general').toLowerCase(),
      tags: processedTags,
      author: currentAuthorName,
      authorInitials: currentAuthorInitials,
      authorId: authorId || 'user-anonymous',
      isAnonymous: Boolean(isAnonymous),
      upvotes: 1, // Start with author's own vote
      downvotes: 0,
      userVotes: { [authorId || 'user-anonymous']: 'up' },
      bookmarks: [],
      createdAt: new Date().toISOString(),
      replies: [],
    };

    data.posts.unshift(newPost);
    writePeerData(data);

    res.status(201).json({
      success: true,
      message: 'Discussion created successfully',
      post: {
        ...newPost,
        replyCount: 0,
        userVote: 'up',
        isBookmarked: false,
      },
    });
  } catch (err) {
    console.error('Error creating peer post:', err);
    res.status(500).json({ success: false, message: 'Server error creating discussion' });
  }
});

// POST /api/peer/posts/:id/replies - Add a reply to a post
router.post('/posts/:id/replies', (req, res) => {
  try {
    const { id } = req.params;
    const { content, author, authorInitials, authorId, isAnonymous } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Reply content cannot be empty' });
    }

    const data = readPeerData();
    const post = data.posts.find((p) => p.id === id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Discussion post not found' });
    }

    if (!post.replies) {
      post.replies = [];
    }

    const replyAuthorName = isAnonymous
      ? 'Anonymous Peer'
      : (author && author.trim()) || 'Kind Peer';
    const replyAuthorInitials = isAnonymous
      ? 'AP'
      : (authorInitials && authorInitials.trim()) || replyAuthorName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

    const newReply = {
      id: `reply-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      postId: id,
      content: content.trim(),
      author: replyAuthorName,
      authorInitials: replyAuthorInitials,
      authorId: authorId || 'user-anonymous',
      createdAt: new Date().toISOString(),
      upvotes: 0,
      userVotes: {},
    };

    post.replies.push(newReply);
    writePeerData(data);

    res.status(201).json({
      success: true,
      message: 'Reply posted successfully',
      reply: newReply,
      totalReplies: post.replies.length,
    });
  } catch (err) {
    console.error('Error adding reply:', err);
    res.status(500).json({ success: false, message: 'Server error saving reply' });
  }
});

// POST /api/peer/posts/:id/vote - Upvote / Downvote a discussion post
router.post('/posts/:id/vote', (req, res) => {
  try {
    const { id } = req.params;
    const { voteType, userId } = req.body; // voteType: 'up' | 'down'
    const currentUserId = userId || 'user-anonymous';

    if (!['up', 'down'].includes(voteType)) {
      return res.status(400).json({ success: false, message: 'Invalid voteType (must be up or down)' });
    }

    const data = readPeerData();
    const post = data.posts.find((p) => p.id === id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    if (!post.userVotes) post.userVotes = {};
    if (typeof post.upvotes !== 'number') post.upvotes = 0;
    if (typeof post.downvotes !== 'number') post.downvotes = 0;

    const previousVote = post.userVotes[currentUserId];

    if (previousVote === voteType) {
      // Toggle off
      delete post.userVotes[currentUserId];
      if (voteType === 'up') post.upvotes = Math.max(0, post.upvotes - 1);
      if (voteType === 'down') post.downvotes = Math.max(0, post.downvotes - 1);
    } else {
      // If switching from opposite vote
      if (previousVote === 'up') post.upvotes = Math.max(0, post.upvotes - 1);
      if (previousVote === 'down') post.downvotes = Math.max(0, post.downvotes - 1);

      // Apply new vote
      post.userVotes[currentUserId] = voteType;
      if (voteType === 'up') post.upvotes += 1;
      if (voteType === 'down') post.downvotes += 1;
    }

    writePeerData(data);

    res.json({
      success: true,
      upvotes: post.upvotes,
      downvotes: post.downvotes,
      userVote: post.userVotes[currentUserId] || null,
    });
  } catch (err) {
    console.error('Error recording vote:', err);
    res.status(500).json({ success: false, message: 'Server error saving vote' });
  }
});

// POST /api/peer/posts/:id/bookmark - Toggle bookmark
router.post('/posts/:id/bookmark', (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const currentUserId = userId || 'user-anonymous';

    const data = readPeerData();
    const post = data.posts.find((p) => p.id === id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    if (!Array.isArray(post.bookmarks)) {
      post.bookmarks = [];
    }

    const index = post.bookmarks.indexOf(currentUserId);
    let isBookmarked = false;

    if (index > -1) {
      post.bookmarks.splice(index, 1);
      isBookmarked = false;
    } else {
      post.bookmarks.push(currentUserId);
      isBookmarked = true;
    }

    writePeerData(data);

    res.json({
      success: true,
      isBookmarked,
      message: isBookmarked ? 'Post saved to bookmarks' : 'Post removed from bookmarks',
    });
  } catch (err) {
    console.error('Error toggling bookmark:', err);
    res.status(500).json({ success: false, message: 'Server error toggling bookmark' });
  }
});

// POST /api/peer/replies/:replyId/vote - Vote on a specific reply
router.post('/replies/:replyId/vote', (req, res) => {
  try {
    const { replyId } = req.params;
    const { userId } = req.body;
    const currentUserId = userId || 'user-anonymous';

    const data = readPeerData();
    let targetReply = null;

    for (const post of data.posts) {
      if (post.replies) {
        const found = post.replies.find((r) => r.id === replyId);
        if (found) {
          targetReply = found;
          break;
        }
      }
    }

    if (!targetReply) {
      return res.status(404).json({ success: false, message: 'Reply not found' });
    }

    if (!targetReply.userVotes) targetReply.userVotes = {};
    if (typeof targetReply.upvotes !== 'number') targetReply.upvotes = 0;

    const hasVoted = targetReply.userVotes[currentUserId] === 'up';

    if (hasVoted) {
      delete targetReply.userVotes[currentUserId];
      targetReply.upvotes = Math.max(0, targetReply.upvotes - 1);
    } else {
      targetReply.userVotes[currentUserId] = 'up';
      targetReply.upvotes += 1;
    }

    writePeerData(data);

    res.json({
      success: true,
      upvotes: targetReply.upvotes,
      hasVoted: !hasVoted,
    });
  } catch (err) {
    console.error('Error voting on reply:', err);
    res.status(500).json({ success: false, message: 'Server error saving reply vote' });
  }
});

// GET /api/peer/my-activity - Retrieve user-created posts and replies
router.get('/my-activity', (req, res) => {
  try {
    const { userId } = req.query;
    const currentUserId = userId || 'user-anonymous';

    const data = readPeerData();
    const posts = data.posts || [];

    const myPosts = posts.filter((p) => p.authorId === currentUserId);

    const myReplies = [];
    let helpfulVotesReceived = 0;

    posts.forEach((p) => {
      if (p.authorId === currentUserId) {
        helpfulVotesReceived += p.upvotes || 0;
      }

      if (p.replies) {
        p.replies.forEach((r) => {
          if (r.authorId === currentUserId) {
            myReplies.push({
              ...r,
              postTitle: p.title,
              postId: p.id,
            });
            helpfulVotesReceived += r.upvotes || 0;
          }
        });
      }
    });

    const bookmarkedPosts = posts.filter(
      (p) => Array.isArray(p.bookmarks) && p.bookmarks.includes(currentUserId)
    );

    res.json({
      success: true,
      activity: {
        postsCount: myPosts.length,
        repliesCount: myReplies.length,
        bookmarksCount: bookmarkedPosts.length,
        helpfulVotes: helpfulVotesReceived,
        myPosts,
        myReplies,
        bookmarkedPosts,
      },
    });
  } catch (err) {
    console.error('Error retrieving activity:', err);
    res.status(500).json({ success: false, message: 'Server error retrieving activity' });
  }
});

module.exports = router;
