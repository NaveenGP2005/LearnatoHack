# Bug Fixes - Round 2

## Date: November 8, 2025

### Issues Reported
1. ❌ Admin dashboard not showing data (0 total users, invalid date, etc.)
2. ❌ Reply form showing "optional name" but still displaying username
3. ❌ Missing "Mark as Resolved" button for admins

---

## 1. Admin Dashboard Data Not Displaying ✅

### Problem
- Frontend expected flat structure: `stats.totalUsers`, `stats.totalPosts`
- Backend returns nested structure: `stats.overview.totalUsers`, `stats.overview.totalPosts`
- Date field was `day.date` but backend returns `day._id`
- Tag field was `tag.tag` but backend returns `tag._id`
- Moderation suggestions structure was `moderation.duplicates` but backend returns `moderation.suggestions` array with type field

### Solution
**File: `/frontend/src/pages/AdminDashboard.jsx`**

Changed all data access patterns:
```javascript
// Stats Cards
stats?.overview?.totalUsers || 0
stats?.overview?.totalPosts || 0
stats?.overview?.totalReplies || 0
stats?.overview?.resolutionRate || 0

// Posts Per Day
day._id instead of day.date
new Date(day._id).toLocaleDateString()

// Trending Tags
tag._id instead of tag.tag

// Moderation Suggestions
moderation.suggestions.filter(s => s.type === 'duplicate')
moderation.suggestions.filter(s => s.type === 'toxic')
moderation.suggestions.filter(s => s.type === 'low_quality')
item.toxicityScore instead of item.confidence
```

Added fallbacks for empty data:
- "No activity in the last 7 days"
- "No contributors yet"
- "No trending tags yet"

---

## 2. Reply Form Name Field Fixed ✅

### Problem
- Name input showed for all users with placeholder "Your name (optional)"
- Even logged-in users saw this field and their username appeared in replies
- Confusing UX - logged-in users shouldn't need to enter name

### Solution
**File: `/frontend/src/components/ReplySection.jsx`**

1. **Import useAuth hook:**
```javascript
import { useAuth } from "../contexts/AuthContext";
const { user } = useAuth();
```

2. **Conditional name field rendering:**
```javascript
{!user && (
  <div>
    <input
      type="text"
      value={author}
      onChange={(e) => setAuthor(e.target.value)}
      placeholder="Your name (optional)"
      className="input-field"
      maxLength={50}
    />
  </div>
)}
```

3. **Smart author submission:**
```javascript
await postsAPI.addReply(postId, {
  content: replyContent,
  author: user ? undefined : (author || "Anonymous"),
});
```

4. **Button styling adjustment:**
```javascript
className={`btn-primary flex items-center justify-center gap-2 ${!user ? '' : 'sm:col-span-2'}`}
```

**Behavior:**
- ✅ Logged-in users: Name field hidden, reply uses their username automatically
- ✅ Guest users: Name field shown, can enter name or leave as "Anonymous"
- ✅ Button spans full width when logged in for better UX

---

## 3. Mark as Resolved Button Added ✅

### Problem
- No way for admins to mark posts as resolved from the post detail page
- Resolve functionality existed in backend but no frontend UI

### Solution
**File: `/frontend/src/pages/PostDetailPage.jsx`**

1. **Import adminAPI:**
```javascript
import { adminAPI } from "../services/authAPI";
```

2. **Add admin check and state:**
```javascript
const [isResolving, setIsResolving] = useState(false);
const isAdmin = user?.role === 'admin' || user?.role === 'moderator';
```

3. **Create resolve handler:**
```javascript
const handleMarkResolved = async () => {
  if (!isAdmin || isResolving || isResolved) return;

  try {
    setIsResolving(true);
    await adminAPI.markPostResolved(post._id);
    setPost({ ...post, isResolved: true, resolvedAt: new Date() });
    toast.success("Post marked as resolved! ✅");
  } catch (error) {
    const message = error.response?.data?.message || "Error marking as resolved";
    toast.error(message);
    console.error("Error marking resolved:", error);
  } finally {
    setIsResolving(false);
  }
};
```

4. **Add button to UI:**
```javascript
{isAdmin && !isResolved && (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={handleMarkResolved}
    disabled={isResolving}
    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
  >
    {isResolving ? (
      <>
        <Loader2 className="w-4 h-4 animate-spin" />
        Resolving...
      </>
    ) : (
      <>
        <Shield className="w-4 h-4" />
        Mark as Resolved
      </>
    )}
  </motion.button>
)}
```

**Features:**
- ✅ Only visible to admins and moderators
- ✅ Only shown when post is NOT already resolved
- ✅ Shows loading spinner while processing
- ✅ Updates UI immediately after success
- ✅ Displays success toast notification
- ✅ Positioned next to "Answered" badge for consistency

---

## Testing Checklist

### Admin Dashboard
- [ ] Navigate to `/admin` as admin user
- [ ] Verify total users, posts, replies display correctly
- [ ] Check posts per day chart shows dates and counts
- [ ] Verify top contributors list displays
- [ ] Check trending tags appear
- [ ] Test AI moderation suggestions (if any posts match criteria)
- [ ] Verify user management table shows all users

### Reply Form
- [ ] Log out and create a reply → Name field should appear
- [ ] Log in and create a reply → Name field should be hidden
- [ ] Verify guest replies show custom name or "Anonymous"
- [ ] Verify logged-in replies show username automatically

### Mark as Resolved
- [ ] Log in as admin
- [ ] Visit any unresolved post
- [ ] Click "Mark as Resolved" button
- [ ] Verify button changes to "Resolved" badge
- [ ] Verify toast notification appears
- [ ] Refresh page → "Resolved" badge should persist
- [ ] Test as regular user → Button should not appear

---

## Files Modified
1. `/frontend/src/pages/AdminDashboard.jsx` - Fixed data structure mapping
2. `/frontend/src/components/ReplySection.jsx` - Conditional name field for auth users
3. `/frontend/src/pages/PostDetailPage.jsx` - Added mark as resolved button for admins

---

## Next Steps
1. Test all three fixes thoroughly
2. Verify admin dashboard loads without errors
3. Test reply creation as both logged-in and guest users
4. Test mark as resolved as admin, moderator, and regular user
5. Check for any console errors
