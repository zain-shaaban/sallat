# Sallat Backend

A robust NestJS-based backend application for managing trips, customers, vendors, and notifications.

## 🚀 Features

- **Authentication & Authorization**: Secure user authentication and role-based access control
- **Trip Management**: Comprehensive trip tracking and management system
- **Customer Management**: Customer profile and interaction management
- **Vendor Management**: Vendor profile and service management
- **Real-time Notifications**: WebSocket-based real-time notifications
- **Firebase Integration**: Firebase services integration
- **Category Management**: Service category organization
- **Socket.IO Integration**: Real-time communication capabilities

## 🛠️ Tech Stack

- **Framework**: NestJS v10
- **Language**: TypeScript
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Socket.IO
- **API Documentation**: Swagger/OpenAPI
- **Firebase**: Firebase Admin SDK
- **Geolocation**: Mapbox Polyline, Geolib
- **Security**: Helmet, bcryptjs

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL
- Firebase project credentials
- npm or yarn package manager

## 🔧 Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd sallat
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=your_username
DATABASE_PASSWORD=your_password
DATABASE_NAME=sallat

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=24h

# Firebase
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
```

4. Build the application:
```bash
npm run build
```

## 🚀 Running the Application

### Development
```bash
npm run start:dev
```

### Production
```bash
npm run start:prod
```

### Debug Mode
```bash
npm run start:debug
```

## 📚 API Documentation

Once the application is running, you can access the Swagger API documentation at:
```
http://localhost:3000/api
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# e2e tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📁 Project Structure

```
src/
├── account/         # Account management
├── auth/           # Authentication and authorization
├── category/       # Category management
├── common/         # Shared utilities and constants
├── config/         # Configuration files
├── customer/       # Customer management
├── firebase/       # Firebase integration
├── notification/   # Notification system
├── sockets/        # WebSocket handlers
├── trip/          # Trip management
├── vendor/        # Vendor management
├── app.module.ts  # Root application module
└── main.ts        # Application entry point
```

## 🔐 Security

- JWT-based authentication
- Password hashing with bcrypt
- Helmet for HTTP security headers
- Input validation using class-validator
- TypeORM for SQL injection prevention

## 📝 Code Style

The project uses ESLint and Prettier for code formatting. To format your code:

```bash
npm run format
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the UNLICENSED License.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- NestJS team for the amazing framework
- All contributors who have helped shape this project
