# Budget Assistant

A comprehensive personal finance management application with AI-powered assistance, built using modern web technologies.

## 🌟 Key Features

### Financial Management
- Transaction tracking and categorization
- Monthly budget planning and monitoring
- Expense summaries and analytics
- Income tracking
- Lending management with automated reminders

### AI Assistant (Jarvis)
- Voice-activated commands
- Natural language processing
- Quick action shortcuts
- Voice transcription
- Context-aware responses

### Smart Notifications
- Lending reminders via email
- Payment due alerts
- Budget threshold notifications
- Periodic summary updates

## 🛠️ Technology Stack

### Frontend
- React 18 with TypeScript
- Material-UI for components
- Redux for state management
- React Speech Recognition
- PWA support
- Vite for build tooling

### Backend
- Supabase for database and authentication
- Netlify Functions for serverless operations
- Node.js email service

### Authentication
- Email/Password login
- Google OAuth integration
- Secure session management

## 🚀 Getting Started

1. Clone and Install
```bash
git clone https://github.com/AniketShrirao/budget-app.git
cd budget-app
npm install
```

2. Set up environment variables
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
VITE_SUPABASE_REDIRECT_URI=your_redirect_uri

3. Run the development server
```bash
npx netlify dev
```

 4. Open the app in your browser at https://transcendent-boba-0333d8.netlify.app/

##  PWA Features
- Offline capability
- Install prompt
- Auto-updates
- Push notifications
## 🔒 Security Features
- JWT authentication
- Secure email notifications
- Protected API routes
- Environment variable protection
## 📧 Email Features
- Lending reminder notifications
- Payment due alerts
- Account activity summaries
- Customizable notification frequency
## 🤖 Voice Commands
Common commands include:

- "Hey Jarvis" - Activate assistant
- "Add transaction" - Record new transaction
- "Show balance" - View current balance
- "Show summary" - View monthly summary
- "Help" - List available commands
## 📦 Project Structure
```plaintext
budget-app/
├── src/               # Application source code
├── public/           # Static assets
├── netlify/          # Serverless functions
└── scripts/         # Build and utility scripts
 ```
```

## 📄 License
MIT License

## 🤝 Contributing
Contributions are welcome! Please read our contributing guidelines before submitting PRs.
