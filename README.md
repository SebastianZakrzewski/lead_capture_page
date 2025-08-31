# Lead Capture Page

A modern, responsive lead capture page built with Next.js, TypeScript, and Tailwind CSS. Features a sleek black and red theme with glassmorphism effects and smooth animations. Uses Supabase as the backend database.

## ✨ Features

- **Modern Design**: Clean, professional interface with black and red color scheme
- **Responsive Layout**: Optimized for all device sizes
- **Form Validation**: Client-side validation with error handling
- **Interactive Elements**: Hover effects, focus states, and smooth transitions
- **Glassmorphism**: Modern backdrop blur and transparency effects
- **TypeScript**: Full type safety and better development experience
- **Tailwind CSS**: Utility-first CSS framework for rapid development
- **Supabase Backend**: Real-time database with PostgreSQL
- **Lead Management**: Complete CRUD operations for leads

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd lead_capture_page
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Configure environment variables:
   - Copy `env.example` to `.env.local`
   - Add your Supabase credentials:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🛠️ Built With

- **[Next.js 15](https://nextjs.org/)** - React framework
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS
- **[Lucide React](https://lucide.dev/)** - Beautiful icons
- **[Supabase](https://supabase.com/)** - Backend as a Service
- **[React Hook Form](https://react-hook-form.com/)** - Form handling

## 📱 Form Fields

The lead capture form includes:

- **Personal Information**: First Name
- **Contact Details**: Email Address, Phone Number
- **Company Info**: Company Name, Job Title
- **Business Context**: Industry selection
- **Completeness**: Service completeness level

## 🎨 Customization

### Colors
The theme uses a black and red color palette:
- Primary: Red (#dc2626, #b91c1c)
- Background: Black to dark gray gradients
- Accents: Red highlights and borders

### Styling
- Glassmorphism effects with backdrop blur
- Smooth hover animations
- Focus states with red rings
- Custom scrollbar styling

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── leads/          # Lead API endpoints
│   │   └── test-db/        # Database test endpoint
│   ├── globals.css         # Global styles and theme
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Main page component
├── backend/
│   ├── database.ts         # Supabase client configuration
│   ├── models/
│   │   └── Lead.ts         # Lead data model
│   └── services/
│       └── LeadService.ts  # Business logic for leads
├── components/
│   └── LeadCaptureForm.tsx # Form component
├── types/
│   └── lead.ts             # TypeScript interfaces
└── utils/
    └── constants.ts        # Configuration constants
```

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode

### Code Style

- TypeScript for type safety
- Tailwind CSS for styling
- Component-based architecture
- Responsive design principles
- Supabase for database operations

### Database Schema

The `lead` table in Supabase contains:
- `id` (text, Primary Key)
- `createdAt` (timestamp, Default: CURRENT_TIMESTAMP)
- `updatedAt` (timestamp)
- `firstName` (text)
- `phone` (text)
- `email` (text)
- `company` (text)
- `jobTitle` (text)
- `industry` (text)
- `completeness` (text)

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📞 Support

For support and questions, please open an issue in the repository.
