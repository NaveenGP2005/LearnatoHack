# Discussion Forum Frontend

Modern React application with Tailwind CSS and beautiful animations for the Discussion Forum.

## 🎨 Features

- Beautiful, responsive UI with Tailwind CSS
- Smooth animations with Framer Motion
- Real-time upvoting and reply system
- Search and filter functionality
- Mobile-first design

## 🚀 Getting Started

### Install Dependencies

```bash
npm install
```

### Configure Environment

Create `.env` file:

```env
VITE_API_URL=http://localhost:5000
```

### Development

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 📁 Project Structure

```
src/
├── components/          # Reusable components
│   ├── Navbar.jsx
│   ├── PostCard.jsx
│   ├── CreatePostModal.jsx
│   └── ReplySection.jsx
├── pages/              # Page components
│   ├── HomePage.jsx
│   └── PostDetailPage.jsx
├── services/           # API integration
│   └── api.js
├── App.jsx            # Main app component
├── main.jsx           # Entry point
└── index.css          # Global styles
```

## 🎨 Design System

### Colors

- Primary: Indigo (500-700)
- Accent: Purple, Pink
- Neutral: Gray (50-900)

### Typography

- Font: Inter
- Sizes: text-sm, text-base, text-lg, text-xl, text-2xl, text-3xl, text-4xl

### Components

- Cards with rounded-xl and shadow
- Buttons with hover and active states
- Inputs with focus rings
- Smooth transitions

## 📦 Dependencies

- **react**: UI library
- **react-router-dom**: Routing
- **axios**: HTTP client
- **framer-motion**: Animations
- **lucide-react**: Icons
- **tailwindcss**: Styling

## 🐳 Docker

Build and run with Docker:

```bash
docker build -t discussion-forum-frontend .
docker run -p 3000:80 discussion-forum-frontend
```

## 📝 License

MIT
