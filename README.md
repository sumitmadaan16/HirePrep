# HirePrep - Campus Placement Management System

A comprehensive microservices-based platform for managing campus placements, student profiles, and faculty mentorship.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Services](#services)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)

## 🎯 Overview

HirePrep is a full-stack application designed to streamline the campus placement process. It provides features for:

- Student profile management
- Faculty mentorship tracking
- Attendance monitoring
- Placement preparation resources

## 🏗️ Architecture

```
HirePrep (Microservices Architecture)
│
├── Frontend (React)
│   └── Port: 5173
│
└── Backend (Spring Boot Microservices)
    ├── Profile Service (Port: 8081)
    ├── Attendance Service (Port: 8082)
    └── [Other Services]
```

## 🔧 Prerequisites

### Backend Requirements
- **Java**: JDK 17 or higher
- **Maven**: 3.8+
- **PostgreSQL**: 14+ (or your preferred database)
- **IDE**: IntelliJ IDEA / Eclipse / VS Code

### Frontend Requirements
- **Node.js**: 16+ or 18+
- **npm**: 8+ or **yarn**: 1.22+

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/hireprep.git
cd hireprep
```

### 2. Backend Setup

#### Step 2.1: Configure Database

Create a PostgreSQL database:
```sql
CREATE DATABASE hireprep;
```

#### Step 2.2: Configure Each Microservice

For each service (profileservice, attendanceservice, etc.):

```bash
cd hireprep-backend/spring-boot-backend/profileservice

# Copy the sample configuration
cp src/main/resources/application-sample.properties src/main/resources/application.properties

# Edit application.properties with your credentials
nano src/main/resources/application.properties
```

Update the following values:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/hireprep
spring.datasource.username=YOUR_DB_USERNAME
spring.datasource.password=YOUR_DB_PASSWORD
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
```

**Repeat this for all microservices.**

#### Step 2.3: Build and Run Services

```bash
# For each service, navigate to its directory and run:
cd hireprep-backend/spring-boot-backend/profileservice
mvn clean install
mvn spring-boot:run

# In a new terminal, start the next service
cd hireprep-backend/spring-boot-backend/attendanceservice
mvn clean install
mvn spring-boot:run
```

### 3. Frontend Setup

```bash
cd hireprep-frontend

# Install dependencies
npm install
# or
yarn install

# Create environment file (if needed)
cp .env.example .env

# Edit .env with your backend URLs
nano .env
```

Example `.env` file:
```env
REACT_APP_API_BASE_URL=http://localhost:8081
REACT_APP_PROFILE_SERVICE_URL=http://localhost:8081/api/profile
REACT_APP_ATTENDANCE_SERVICE_URL=http://localhost:8082/api/attendance
```

#### Start the Frontend

```bash
npm start
# or
yarn start
```

The application will open at `http://localhost:5173`

## 📁 Project Structure

```
HirePrep/
├── hireprep-backend/
│   └── spring-boot-backend/
│       ├── profileservice/
│       │   ├── src/
│       │   ├── pom.xml
│       │   └── application-sample.properties
│       ├── attendanceservice/
│       │   ├── src/
│       │   ├── pom.xml
│       │   └── application-sample.properties
│       └── [other services]/
│
├── hireprep-frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── .env.example
│
├── .gitignore
└── README.md
```

## 🔌 Services

### Profile Service (Port: 8081)
Manages user profiles, student information, faculty details, and mentor-mentee relationships.

**Endpoints:**
- `POST /api/profile` - Create profile
- `GET /api/profile/{username}` - Get profile by username
- `PUT /api/profile/{username}` - Update profile
- `DELETE /api/profile/{username}` - Delete profile
- `GET /api/profile` - Get all profiles
- `GET /api/profile/faculty/{username}/mentees` - Get mentees of a faculty

### Attendance Service (Port: 8082)
*(Add description and endpoints once implemented)*

## ⚙️ Configuration

### Important: Never Commit Sensitive Data

The following files are **ignored by Git** and must be created locally:

**Backend:**
- `application.properties` (contains database credentials)

**Frontend:**
- `.env` (contains API URLs and keys)

**Templates provided:**
- `application-sample.properties` (backend template)
- `.env.example` (frontend template)

### Database Configuration

Each microservice can use:
- **Same database, different schemas** (recommended for development)
- **Separate databases** (recommended for production)

Update `spring.datasource.url` accordingly in each service's `application.properties`.

## 🏃 Running the Application

### Development Mode

**Terminal 1 - Profile Service:**
```bash
cd hireprep-backend/spring-boot-backend/profileservice
mvn spring-boot:run
```

**Terminal 2 - Attendance Service:**
```bash
cd hireprep-backend/spring-boot-backend/attendanceservice
mvn spring-boot:run
```

**Terminal 3 - Frontend:**
```bash
cd hireprep-frontend
npm start
```

### Production Build

**Backend:**
```bash
cd hireprep-backend/spring-boot-backend/profileservice
mvn clean package
java -jar target/profileservice-0.0.1-SNAPSHOT.jar
```

**Frontend:**
```bash
cd hireprep-frontend
npm run build
# Serve the build folder using nginx or any static server
```

## 📚 API Documentation

### Profile Service API

Base URL: `http://localhost:8081/api/profile`

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| POST | `/` | Create new profile | ProfileRequestDTO |
| GET | `/{username}` | Get profile | - |
| PUT | `/{username}` | Update profile | ProfileRequestDTO |
| DELETE | `/{username}` | Delete profile | - |
| GET | `/` | Get all profiles | - |
| GET | `/faculty/{username}/mentees` | Get mentees | - |

**Example Request - Create Profile:**
```json
{
  "username": "john.doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "9876543210",
  "role": "STUDENT",
  "gender": "Male",
  "presentAddress": {
    "addressLine1": "123 Main St",
    "addressLine2": "Apt 4B",
    "state": "California",
    "pincode": 90001
  },
  "mentorUsername": "prof.smith"
}
```

## 🛠️ Troubleshooting

### Backend Issues

**Port already in use:**
```bash
# Change port in application.properties
server.port=8082
```

**Database connection failed:**
- Verify PostgreSQL is running
- Check credentials in `application.properties`
- Ensure database exists

**Maven build fails:**
```bash
# Clear Maven cache
mvn clean
rm -rf ~/.m2/repository
mvn install
```

### Frontend Issues

**Module not found:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**API calls failing:**
- Check if backend services are running
- Verify URLs in `.env` file
- Check browser console for CORS errors

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Never commit `application.properties` or `.env` files
- Use `application-sample.properties` as template
- Follow existing code structure and naming conventions
- Write meaningful commit messages
- Test thoroughly before submitting PR

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Developer**: Sumit Madaan
- **GitHub**: [@sumitmadaan16](https://github.com/sumitmadaan16)

## 📧 Contact

For any queries, reach out at: sumitmadaan16@gmail.com

---

**⚠️ Security Note**: This repository does not contain sensitive configuration files. You must create them locally using the provided templates.
