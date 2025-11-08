# 🎯 Quick Test Guide - 5 Minutes

## ✅ **Both Servers Running!**

- Frontend: http://localhost:3000
- Backend: http://localhost:5000

---

## 🚀 **Test These Features in Order:**

### 1️⃣ **Admin Login** (30 seconds)

```
1. Go to http://localhost:3000/login
2. Email: admin@learnato.com
3. Password: Admin@123456
4. ✅ You should see avatar + reputation in navbar
```

### 2️⃣ **Admin Dashboard** (1 minute)

```
1. Click your avatar in navbar
2. Click "Admin Dashboard"
3. ✅ See stats cards, charts, top contributors
4. ✅ Scroll to "AI Moderation Suggestions"
5. ✅ Check "User Management" table
```

### 3️⃣ **Create Anonymous Post** (1 minute)

```
1. Go back to home
2. Click "Ask Question"
3. Toggle "Posting Anonymously" ON (switch turns purple)
4. Title: "How to use React hooks?"
5. Content: "I'm learning React and confused about useState and useEffect..."
6. Tags: react, javascript
7. Click "Post Question"
8. ✅ Post appears as "Anonymous"
9. ✅ See AI-suggested tags notification
```

### 4️⃣ **Test Duplicate Vote Prevention** (1 minute)

```
1. Find any post on home page
2. Click thumbs up to vote
3. ✅ Thumb icon becomes filled/blue
4. Try clicking again
5. ✅ Button is disabled, tooltip says "You already voted"
```

### 5️⃣ **Test Related Questions** (30 seconds)

```
1. Click on any post to open detail page
2. Look at right sidebar
3. ✅ See "Related Questions" with similarity percentages
4. Click on a related question to navigate
```

### 6️⃣ **Create New User** (1 minute)

```
1. Logout (click avatar → Logout)
2. Click "Sign Up"
3. Username: test_user
4. Email: test@example.com
5. Password: Test123
6. ✅ Auto-login after registration
7. ✅ See your avatar in navbar
```

### 7️⃣ **Test AI Duplicate Detection** (30 seconds)

```
1. Create post with title: "How to use React hooks?"
2. ✅ Yellow warning appears: "Similar question already exists"
3. ✅ Shows the similar post + similarity percentage
```

---

## 🎉 **That's it! You've tested:**

✅ Authentication & Login  
✅ Admin Dashboard with AI  
✅ Anonymous Posting  
✅ Duplicate Vote Prevention  
✅ Related Questions AI  
✅ User Registration  
✅ Duplicate Post Detection

---

## 🔑 **Key URLs**

- Home: http://localhost:3000
- Login: http://localhost:3000/login
- Register: http://localhost:3000/register
- Admin: http://localhost:3000/admin

## 🔐 **Quick Credentials**

```
Admin:
  Email: admin@learnato.com
  Password: Admin@123456
```

---

## 🤖 **AI Features Working:**

- Auto-tagging posts with NLP
- Duplicate detection (85% threshold)
- Related questions (similarity algorithm)
- Toxicity detection in admin
- Smart search ranking

## 🗳️ **Vote System:**

- Requires login
- Tracks voters in database
- Prevents duplicates
- Visual feedback

## 👤 **Anonymous System:**

- Toggle on create post
- Shows as "Anonymous"
- Still earns reputation

---

**Everything is ready! Test away! 🚀**
