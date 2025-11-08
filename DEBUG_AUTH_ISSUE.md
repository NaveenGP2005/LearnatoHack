# Debug: Guest Post Being Created as Admin

## Issue

When creating a question without login, it's being posted as admin.

## Root Cause Analysis

### How It's Supposed to Work:

1. User creates post without logging in
2. Frontend doesn't send token
3. Backend receives no `req.user`
4. Post is created as "Anonymous"

### What's Actually Happening:

1. User thinks they're logged out
2. **BUT**: Token is still in localStorage
3. Frontend api.js interceptor **automatically adds token to ALL requests**
4. Backend receives token → identifies admin → post created as admin

## The Problem Code

**File: `/frontend/src/services/api.js`**

```javascript
// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token to all requests
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // ⚠️ ALWAYS sends token
    }
    return config;
  },
  ...
);
```

## Testing Scenarios

### Scenario 1: User Never Logged Out

- User logged in as admin previously
- Closed browser/tab (token still in localStorage)
- Opens site again (UI might show "logged out" but token exists)
- Creates post → Token sent → Created as admin ❌

### Scenario 2: User Properly Logged Out

- User clicks logout button
- Token removed from localStorage
- Creates post → No token sent → Created as "Anonymous" ✅

## How to Verify This Issue

1. Open browser DevTools → Application → Local Storage
2. Check if there's a "token" key with a JWT value
3. If token exists but UI shows logged out → This is the bug

## Solution Options

### Option 1: Fix AuthContext Initialization (RECOMMENDED)

Make sure AuthContext properly loads user on mount if token exists.

### Option 2: Add Token Validation

Check if token is valid before sending it.

### Option 3: Require Login for Posting

Make posting require authentication (but this defeats the anonymous feature).

## Current System Behavior

**Backend: `optionalAuth` middleware**

- ✅ Allows posts without authentication
- ✅ If token exists, validates and sets `req.user`
- ✅ If no token, continues without `req.user`

**Backend: `createPost` controller**

```javascript
if (req.user && !isAnonymous) {
  postData.author = req.user._id;
  postData.authorName = req.user.username;
  // ...
} else {
  postData.authorName = "Anonymous";
}
```

- ✅ If user exists and not anonymous → Use user's identity
- ✅ Otherwise → "Anonymous"

## The Real Bug

The UI doesn't properly sync with localStorage token state. When a user:

1. Opens the site fresh
2. Token exists in localStorage (from previous session)
3. AuthContext might not initialize properly
4. UI shows logged out (user = null in state)
5. But localStorage still has token
6. API calls still send the token

## Fix Required

Update AuthContext to properly check and validate token on mount.
