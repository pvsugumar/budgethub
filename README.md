# Budget Planner - Full-Stack Application

A modern, scalable budget planning web application built with Next.js, TypeScript, and PostgreSQL. Inspired by Rocket Money and Mint.

## 🚀 Features

- **Transaction Tracking**: Log and categorize income and expenses
- **Smart Budgets**: Set spending limits by category with real-time tracking
- **Analytics Dashboard**: Visualize spending patterns with interactive charts
- **Bill Reminders**: Automated reminders for recurring bills
- **Savings Goals**: Track progress towards financial goals
- **Secure Authentication**: Email/password and OAuth support
- **Real-time Updates**: Live balance and budget tracking
- **Mobile Responsive**: Fully responsive design for all devices

## 🛠 Tech Stack

- **Frontend**: React 18, Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with JWT
- **Visualization**: Recharts
- **Validation**: Zod
- **Styling**: Tailwind CSS

## 📋 Prerequisites

- Node.js 18+ (download from https://nodejs.org/)
- PostgreSQL 14+ (download from https://www.postgresql.org/)
- npm or yarn package manager

## 🔧 Installation & Setup

### 1. Install Node.js

Download and install Node.js 18 or higher from [nodejs.org](https://nodejs.org/).

Verify installation:
```bash
node --version
npm --version
```

### 2. Setup PostgreSQL Database

1. Install PostgreSQL from [postgresql.org](https://www.postgresql.org/download/)
2. Create a new database:
```bash
createdb budget_db
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Copy the example environment file and update with your values:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```
DATABASE_URL="postgresql://username:password@localhost:5432/budget_db"
NEXTAUTH_SECRET="your-secret-key-generate-with: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 5. Setup Database Schema

Run Prisma migrations:

```bash
npx prisma migrate dev --name init
```

This will:
- Create all database tables
- Generate Prisma client
- Run initial migrations

### 6. Generate Prisma Client

```bash
npm run db:generate
```

### 7. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
src/
├── app/
│   ├── api/              # API routes
│   │   └── auth/         # Authentication endpoints
│   ├── auth/             # Authentication pages (login, signup)
│   ├── dashboard/        # Dashboard pages
│   ├── transactions/     # Transaction management
│   ├── budgets/          # Budget management
│   ├── goals/            # Savings goals
│   ├── bills/            # Bill tracking
│   ├── settings/         # User settings
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page
│   └── globals.css       # Global styles
├── components/           # Reusable React components
│   ├── Navigation.tsx
│   └── ...
├── lib/
│   ├── db.ts            # Prisma client singleton
│   └── ...
└── types/               # TypeScript type definitions
    └── index.ts
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Transactions
- `GET /api/transactions` - Get user's transactions
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Budgets
- `GET /api/budgets` - Get user's budgets
- `POST /api/budgets` - Create budget
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget

### Savings Goals
- `GET /api/goals` - Get user's goals
- `POST /api/goals` - Create goal
- `PUT /api/goals/:id` - Update goal
- `DELETE /api/goals/:id` - Delete goal

### Bills
- `GET /api/bills` - Get user's bills
- `POST /api/bills` - Create bill
- `PUT /api/bills/:id` - Update bill
- `DELETE /api/bills/:id` - Delete bill

## 📊 Database Schema

### Users
- id, email, password, name, image, provider

### Transactions
- id, userId, amount, type, category, description, date

### Budgets
- id, userId, category, limit, spent, month, year

### SavingsGoals
- id, userId, name, targetAmount, currentAmount, targetDate

### Bills
- id, userId, name, amount, dueDate, frequency, paid, nextDue

## 🔐 Security Features

- Password hashing with bcryptjs
- JWT-based authentication
- Secure session management
- CORS protection
- Input validation with Zod
- SQL injection prevention with Prisma
- Environment variable protection

## 📦 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npm run db:setup    # Setup database (migrations + generate)
npm run db:generate # Generate Prisma client
npm run db:studio   # Open Prisma Studio UI
```

## 🚀 Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

```bash
vercel
```

### Deploy to AWS

1. Create RDS PostgreSQL instance
2. Deploy Node.js app to EC2 or Elastic Beanstalk
3. Configure environment variables
4. Run migrations on deployed instance

### Deploy to Docker

```bash
docker build -t budget-planner .
docker run -p 3000:3000 -e DATABASE_URL=... budget-planner
```

## 📚 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma ORM Guide](https://www.prisma.io/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 💬 Support

For issues and questions, please open an issue on GitHub.

## 🗺 Roadmap

- [ ] Complete authentication with Google OAuth
- [ ] Implement transaction categorization AI
- [ ] Add spending analytics and reports
- [ ] Mobile app with React Native
- [ ] Multi-currency support
- [ ] Budget sharing with family members
- [ ] Automated transaction imports from banks
- [ ] Advanced forecasting and predictions

---

**Built with ❤️ for better financial management**
