# Time Tracker Web Application

A modern time tracking web application built with React, TypeScript, Express.js, and PostgreSQL. This application allows users to track their work hours, manage payroll periods, and view detailed time analytics.

## Features

- ⏰ Real-time time tracking
- 📊 Time analytics and reports
- 💰 Payroll period management
- 👤 User authentication
- 📱 Responsive design
- 🎨 Modern UI with Tailwind CSS

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Backend**: Express.js, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with local strategy
- **UI Components**: Radix UI
- **Charts**: Recharts

## Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Docker** and **Docker Compose** (for local database)
- **Git**

## Quick Start

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd time-tracker-web-project
```

### 2. Set Up Environment Variables

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database Configuration
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/time_tracker_db

# Session Configuration
SESSION_SECRET=your-super-secret-session-key-change-this-in-production

# Server Configuration
PORT=5000
NODE_ENV=development
```

### 3. Start the Database

Using Docker Compose (recommended):

```bash
docker-compose up -d postgres
```

Or manually install PostgreSQL and create a database named `time_tracker_db`.

### 4. Install Dependencies

```bash
npm install
```

### 5. Set Up the Database Schema

```bash
npm run db:push
```

### 6. Start the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - Type check the codebase
- `npm run db:push` - Push database schema changes

### Project Structure

```
time-tracker-web-project/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utility functions
├── server/                # Express.js backend
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Database operations
│   └── vite.ts           # Vite development setup
├── shared/               # Shared types and schemas
│   └── schema.ts         # Database schema
├── migrations/           # Database migrations
└── docker-compose.yml    # Local database setup
```

### Database Management

#### Using Docker (Recommended)

Start the database:
```bash
docker-compose up -d postgres
```

Access pgAdmin (optional):
```bash
docker-compose up -d pgadmin
# Access at http://localhost:5050
# Email: admin@example.com
# Password: admin
```

Stop the database:
```bash
docker-compose down
```

#### Manual PostgreSQL Setup

1. Install PostgreSQL
2. Create a database: `createdb time_tracker_db`
3. Update your `.env` file with the correct connection string

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `SESSION_SECRET` | Secret for session encryption | Required |
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment mode | development |
| `HOST` | Server host | 0.0.0.0 |

## Production Deployment

### Build the Application

```bash
npm run build
```

### Set Production Environment Variables

```env
NODE_ENV=production
DATABASE_URL=your-production-database-url
SESSION_SECRET=your-production-session-secret
PORT=5000
```

### Start Production Server

```bash
npm run start
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Run tests: `npm run check`
5. Commit your changes: `git commit -am 'Add feature'`
6. Push to the branch: `git push origin feature-name`
7. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

If you encounter any issues or have questions, please:

1. Check the [Issues](../../issues) page
2. Create a new issue with detailed information
3. Include your environment details and error messages

## Troubleshooting

### Common Issues

**Database Connection Error**
- Ensure PostgreSQL is running
- Check your `DATABASE_URL` in `.env`
- Verify database exists: `time_tracker_db`

**Port Already in Use**
- Change the `PORT` in your `.env` file
- Or kill the process using the port

**Build Errors**
- Clear node_modules: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npm run check`

**Docker Issues**
- Ensure Docker is running
- Check Docker Compose version: `docker-compose --version`
- Restart Docker if needed 