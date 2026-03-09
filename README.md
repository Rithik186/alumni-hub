# 🌟 AlumniHub: Smart Alumni Association & Management Platform

AlumniHub is a premium, full-stack networking platform designed to bridge the gap between students and alumni. Built with a focus on high-end aesthetics and seamless user experience, it facilitates mentorship, networking, and real-time communication within an academic community.

---

## ✨ Key Features

### 🔐 Secure Authentication & Role Management
- **OTP-Based Registration:** Enhanced security via mobile/email verification.
- **Role-Based Dashboards:** Specialized experiences for **Students** and **Alumni**.
- **JWT Security:** Persistent sessions with secure JSON Web Tokens.

### 📱 Dynamic Social Feed
- **Rich Media Posts:** Share updates with high-quality images and videos.
- **Engagement Engine:** Real-time like system and nested comment threads.
- **Domain Filtering:** Filter feed transmissions by professional domains (e.g., Software, Data Science, Product).

### 🤝 Networking & Discovery
- **Follow System:** Connect with alumni and peers to build your network.
- **Advanced Search:** Find alumni using persistent filters for company, role, batch, and department.
- **Peer Suggestions:** AI-driven suggestions based on shared interests and backgrounds.

### 💬 Premium Real-time Chat
- **Instant Messaging:** Direct communication with low-latency polling.
- **Rich Attachments:** Send images and videos directly in chats.
- **Interactive Messaging:** Full emoji support, message editing, and deletion.
- **Lightbox Preview:** View and download shared media in high resolution.

### 👤 Profile Excellence
- **Luxury Aesthetic:** Glassmorphism-inspired UI with smooth Framer Motion transitions.
- **Portfolio Management:** Showcase professional achievements and academic history.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS, Framer Motion |
| **State Management** | React Context API, TanStack Query (v5) |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL |
| **Media Handling** | Multer, Local Binary Storage |
| **Authentication** | JWT, BcryptJS, Firebase |
| **Icons & Styling** | Lucide React, Glassmorphism CSS |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18+)
- **PostgreSQL** (Running instance)
- **NPM** or **Yarn**

## 📂 Project Structure

```text
├── backend/            # Express controllers, routes, and logic
│   ├── config/         # DB and service configurations
│   ├── controllers/    # Business logic (MVC)
│   ├── middleware/     # Auth and validation
│   └── routes/         # API endpoint definitions
├── src/                # React frontend source
│   ├── components/     # Reusable UI (shared, dashboard, landing)
│   ├── context/        # Global state (User, Auth)
│   └── pages/          # Full page views (Chat, Profile, Dashboard)
├── public/             # Static assets
└── server.js           # Main backend entry point
```

---

## 🎨 Design Philosophy
AlumniHub isn't just a tool; it's an experience. We use:
- **Glassmorphism:** For a modern, clean, and futuristic feel.
- **Micro-animations:** Subtle interactions that make the app feel alive.
- **Dark/Light Harmony:** A balanced palette optimized for professional use.

---

## 🤝 Contributing
Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.

Developed with ❤️ by **AlumniHub Team**
