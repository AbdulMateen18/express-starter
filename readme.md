# Express Starter - Video Sharing Platform Backend

A comprehensive, production-ready backend API built with Express.js, MongoDB, and Cloudinary for a full-featured video sharing platform similar to YouTube. This project implements industry-standard authentication, file upload handling, and RESTful API design patterns.

## 🚀 Features

### Core Functionality

- **User Management**: Complete authentication system with JWT tokens and refresh token rotation
- **Video Operations**: Upload, update, delete, and stream videos with metadata management
- **Social Features**:
  - User subscriptions and channel management
  - Likes on videos, comments, and tweets
  - Comment system with nested replies
  - Tweet/Post functionality
  - Playlist creation and management
- **Dashboard Analytics**: User statistics and engagement metrics
- **File Handling**: Image and video uploads via Cloudinary integration
- **Watch History**: Track and retrieve user viewing history

### Technical Features

- 🔐 Secure authentication with JWT (Access & Refresh tokens)
- 📁 File upload handling with Multer
- ☁️ Cloud storage integration with Cloudinary
- 🗃️ MongoDB with Mongoose ODM
- 🔒 Password encryption with bcrypt
- 🍪 Cookie-based session management
- 🌐 CORS enabled for cross-origin requests
- ⚡ Async error handling middleware
- 📊 Pagination support with mongoose-aggregate-paginate-v2
- 🎯 Clean architecture with separation of concerns

## 📋 Prerequisites

Before running this project, ensure you have the following installed:

- **Node.js** (v14 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** or **yarn** package manager
- **Cloudinary Account** (for media storage)

## 🛠️ Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/AbdulMateen18/express-starter.git
   cd express-starter
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   Create a `.env` file in the root directory with the following variables:

   ```env
   # Server Configuration
   PORT=8000

   # Database
   MONGODB_URI=mongodb://localhost:27017/video-platform
   # Or use MongoDB Atlas
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname

   # CORS
   CORS_ORIGIN=*

   # JWT Secrets
   ACCESS_TOKEN_SECRET=your_access_token_secret_here
   ACCESS_TOKEN_EXPIRY=1d
   REFRESH_TOKEN_SECRET=your_refresh_token_secret_here
   REFRESH_TOKEN_EXPIRY=10d

   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

4. **Create required directories**
   ```bash
   mkdir -p public/temp
   ```

## 🚦 Running the Application

### Development Mode

```bash
npm run dev
```

The server will start on `http://localhost:8000` (or your specified PORT) with hot-reloading enabled via nodemon.

### Production Mode

```bash
node src/index.js
```

## 📁 Project Structure

```
express-starter/
├── public/
│   └── temp/              # Temporary file storage for uploads
├── src/
│   ├── controllers/       # Request handlers
│   │   ├── comment.controller.js
│   │   ├── dashboard.controller.js
│   │   ├── like.controller.js
│   │   ├── playlist.controller.js
│   │   ├── subscription.controller.js
│   │   ├── tweet.controller.js
│   │   ├── user.controller.js
│   │   └── video.controller.js
│   ├── db/
│   │   └── index.js       # Database connection
│   ├── middlewares/
│   │   ├── auth.middleware.js    # JWT verification
│   │   └── multer.middleware.js  # File upload handling
│   ├── models/            # Mongoose schemas
│   │   ├── comment.model.js
│   │   ├── like.model.js
│   │   ├── playlist.model.js
│   │   ├── subscription.model.js
│   │   ├── tweet.model.js
│   │   ├── user.model.js
│   │   └── video.model.js
│   ├── routes/            # API routes
│   │   ├── comment.routes.js
│   │   ├── dashboard.routes.js
│   │   ├── like.routes.js
│   │   ├── playlist.routes.js
│   │   ├── subscription.routes.js
│   │   ├── tweet.routes.js
│   │   ├── user.routes.js
│   │   └── video.routes.js
│   ├── utils/             # Utility functions
│   │   ├── ApiError.js
│   │   ├── ApiResponse.js
│   │   ├── asyncHandler.js
│   │   └── cloudinary.js
│   ├── app.js             # Express app configuration
│   ├── constants.js       # Application constants
│   └── index.js           # Entry point
├── .env                   # Environment variables
├── package.json
|-- postman_collection.json
└── README.md
```

## 🔌 API Endpoints

### Base URL

```
http://localhost:8000/api/v1
```

### Authentication & Users

| Method | Endpoint                   | Description              | Auth Required |
| ------ | -------------------------- | ------------------------ | ------------- |
| POST   | `/users/register`          | Register new user        | ❌            |
| POST   | `/users/login`             | User login               | ❌            |
| POST   | `/users/logout`            | User logout              | ✅            |
| POST   | `/users/refresh-token`     | Refresh access token     | ❌            |
| POST   | `/users/change-password`   | Change user password     | ✅            |
| GET    | `/users/current-user`      | Get current user details | ✅            |
| PATCH  | `/users/update-account`    | Update account details   | ✅            |
| PATCH  | `/users/avatar`            | Update user avatar       | ✅            |
| PATCH  | `/users/cover-image`       | Update cover image       | ✅            |
| GET    | `/users/channel/:username` | Get channel profile      | ✅            |
| GET    | `/users/watch-history`     | Get watch history        | ✅            |

### Videos

| Method | Endpoint      | Description     | Auth Required |
| ------ | ------------- | --------------- | ------------- |
| GET    | `/videos`     | Get all videos  | ❌            |
| POST   | `/videos`     | Upload video    | ✅            |
| GET    | `/videos/:id` | Get video by ID | ❌            |
| PATCH  | `/videos/:id` | Update video    | ✅            |
| DELETE | `/videos/:id` | Delete video    | ✅            |

### Subscriptions

| Method | Endpoint                            | Description             | Auth Required |
| ------ | ----------------------------------- | ----------------------- | ------------- |
| POST   | `/subscriptions/:channelId`         | Subscribe to channel    | ✅            |
| DELETE | `/subscriptions/:channelId`         | Unsubscribe             | ✅            |
| GET    | `/subscriptions/channel/:channelId` | Get channel subscribers | ✅            |
| GET    | `/subscriptions/user/:userId`       | Get user subscriptions  | ✅            |

### Likes

| Method | Endpoint                    | Description         | Auth Required |
| ------ | --------------------------- | ------------------- | ------------- |
| POST   | `/likes/video/:videoId`     | Toggle video like   | ✅            |
| POST   | `/likes/comment/:commentId` | Toggle comment like | ✅            |
| POST   | `/likes/tweet/:tweetId`     | Toggle tweet like   | ✅            |
| GET    | `/likes/videos`             | Get liked videos    | ✅            |

### Comments

| Method | Endpoint               | Description        | Auth Required |
| ------ | ---------------------- | ------------------ | ------------- |
| GET    | `/comments/:videoId`   | Get video comments | ❌            |
| POST   | `/comments/:videoId`   | Add comment        | ✅            |
| PATCH  | `/comments/:commentId` | Update comment     | ✅            |
| DELETE | `/comments/:commentId` | Delete comment     | ✅            |

### Tweets

| Method | Endpoint           | Description    | Auth Required |
| ------ | ------------------ | -------------- | ------------- |
| GET    | `/tweets`          | Get all tweets | ❌            |
| POST   | `/tweets`          | Create tweet   | ✅            |
| PATCH  | `/tweets/:tweetId` | Update tweet   | ✅            |
| DELETE | `/tweets/:tweetId` | Delete tweet   | ✅            |

### Playlists

| Method | Endpoint                                 | Description           | Auth Required |
| ------ | ---------------------------------------- | --------------------- | ------------- |
| GET    | `/playlists`                             | Get user playlists    | ✅            |
| POST   | `/playlists`                             | Create playlist       | ✅            |
| GET    | `/playlists/:playlistId`                 | Get playlist details  | ❌            |
| PATCH  | `/playlists/:playlistId`                 | Update playlist       | ✅            |
| DELETE | `/playlists/:playlistId`                 | Delete playlist       | ✅            |
| POST   | `/playlists/:playlistId/videos/:videoId` | Add video to playlist | ✅            |
| DELETE | `/playlists/:playlistId/videos/:videoId` | Remove video          | ✅            |

### Dashboard

| Method | Endpoint            | Description            | Auth Required |
| ------ | ------------------- | ---------------------- | ------------- |
| GET    | `/dashboard/stats`  | Get channel statistics | ✅            |
| GET    | `/dashboard/videos` | Get channel videos     | ✅            |

- The complete postman collection can be found in root directory of this project named as postman_collection.json.

## 🔐 Authentication Flow

1. **Registration**: User registers with email, username, password, and profile images
2. **Login**: User receives access token (short-lived) and refresh token (long-lived, httpOnly cookie)
3. **Protected Routes**: Access token sent in Authorization header: `Bearer <token>`
4. **Token Refresh**: When access token expires, use refresh token endpoint to get new tokens
5. **Logout**: Clears refresh token from database and cookies

## 📦 Dependencies

### Production Dependencies

- **express**: Web framework
- **mongoose**: MongoDB ODM
- **jsonwebtoken**: JWT authentication
- **bcrypt**: Password hashing
- **cloudinary**: Cloud media storage
- **multer**: File upload middleware
- **cookie-parser**: Parse cookies
- **cors**: Cross-origin resource sharing
- **dotenv**: Environment variable management
- **mongoose-aggregate-paginate-v2**: Pagination support

### Development Dependencies

- **nodemon**: Auto-restart on file changes
- **prettier**: Code formatting

## 🧪 API Response Format

### Success Response

```json
{
  "statusCode": 200,
  "data": {},
  "message": "Success message",
  "success": true
}
```

### Error Response

```json
{
  "statusCode": 400,
  "data": null,
  "message": "Error message",
  "success": false,
  "errors": []
}
```

## 🛡️ Security Features

- Password hashing with bcrypt (10 rounds)
- JWT-based authentication with separate access and refresh tokens
- httpOnly cookies for refresh tokens
- CORS configuration
- Input validation and sanitization
- Secure file upload handling
- Environment variable protection

## 🔧 Configuration

### Cloudinary Setup

1. Create account at [cloudinary.com](https://cloudinary.com/)
2. Get your Cloud Name, API Key, and API Secret from dashboard
3. Add credentials to `.env` file

### MongoDB Setup

**Local MongoDB:**

```bash
mongod --dbpath /path/to/data/directory
```

**MongoDB Atlas (Cloud):**

1. Create cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Get connection string
3. Replace in `.env` file

## 🚀 Deployment

### Environment Variables

Ensure all environment variables are set in your hosting platform.

### Recommended Platforms

- **Backend**: Render, Railway, Heroku, DigitalOcean
- **Database**: MongoDB Atlas
- **Media Storage**: Cloudinary

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 👤 Author

**Abdul Mateen**

- GitHub: [@AbdulMateen18](https://github.com/AbdulMateen18)

## 🙏 Acknowledgments

Special thanks to **[Hitesh Choudhary](https://www.youtube.com/@chaiaurcode)** and the **Chai aur Code** YouTube channel for the excellent tutorial series that served as the foundation for learning and building this project.

📺 **Tutorial Playlist**: [Backend Development with JavaScript](https://www.youtube.com/watch?v=EH3vGeqeIAo&list=PLu71SKxNbfoBGh_8p_NS-ZAh6v7HhYqHW)

Additional acknowledgments:

- Express.js community
- MongoDB documentation
- Cloudinary documentation
- All contributors and supporters

---

**Note**: This is a backend API server. You'll need to build a separate frontend application to consume these APIs. Make sure to keep your `.env` file secure and never commit it to version control.
