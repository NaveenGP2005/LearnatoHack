# How to Test Guest Posting

## To test posting WITHOUT being logged in:

### Method 1: Proper Logout

1. Click your profile menu in the top right
2. Click "Logout" button
3. Verify you see "Login" button in navbar
4. Now create a post → It will be "Anonymous"

### Method 2: Clear Browser Data

1. Open DevTools (F12)
2. Go to Application tab
3. Storage → Local Storage → http://localhost:3000
4. Right-click "token" → Delete
5. Refresh page
6. Now create a post → It will be "Anonymous"

### Method 3: Incognito/Private Window

1. Open a new incognito/private browser window
2. Go to http://localhost:3000
3. Create a post → It will be "Anonymous"

### Method 4: Different Browser

1. Use a different browser where you haven't logged in
2. Go to http://localhost:3000
3. Create a post → It will be "Anonymous"

## How to Verify Current Login Status

### Check UI

- Top right corner shows username + profile menu = Logged In ✅
- Top right corner shows "Login" button = Logged Out ✅

### Check DevTools

1. Open DevTools (F12)
2. Console tab
3. Type: `localStorage.getItem('token')`
4. If it returns a long string = Token exists = You're authenticated
5. If it returns `null` = No token = You're a guest

## Current Behavior Explained

### Scenario A: You're Logged In (Have Token)

- Create post WITH anonymous toggle OFF → Post as YOUR USERNAME ✅
- Create post WITH anonymous toggle ON → Post as "Anonymous" ✅

### Scenario B: You're NOT Logged In (No Token)

- Anonymous toggle doesn't show
- All posts are "Anonymous" by default ✅

## The Issue You Reported

> "if create question without login then its being posted as admin"

This happens when:

1. You previously logged in as admin
2. You think you logged out (but token is still in localStorage)
3. The UI might look like you're logged out
4. But the token still exists
5. So posts are created as admin

**Solution**: Always use Method 1 (proper logout) to ensure token is removed.

## Debugging Commands

```javascript
// Check if token exists
localStorage.getItem("token");

// Check user state in React
// (Open React DevTools → Components → AuthProvider)

// Remove token manually
localStorage.removeItem("token");

// Then refresh page
location.reload();
```

## Expected Behavior Summary

| User State      | Anonymous Toggle | Result                   |
| --------------- | ---------------- | ------------------------ |
| Not logged in   | Hidden           | Post as "Anonymous"      |
| Logged in       | OFF              | Post as USERNAME         |
| Logged in       | ON               | Post as "Anonymous"      |
| Admin logged in | OFF              | Post as "admin" username |
| Admin logged in | ON               | Post as "Anonymous"      |

## If Issue Persists

1. Clear all browser data for localhost:3000
2. Close all tabs
3. Open fresh browser tab
4. Go to http://localhost:3000
5. DO NOT login
6. Create post
7. Check if it's still posted as admin

If it's STILL posted as admin, then there's a backend bug. But most likely, you have a token in localStorage from a previous session.
