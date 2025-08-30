import Image from 'next/image';
import LeadCaptureForm from '@/components/LeadCaptureForm';

export default function Home() {
  return (
    <div className="min-h-screen bg-black">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(220,38,38,0.03)_1px,transparent_0)] bg-[length:20px_20px] opacity-50"></div>
      
      {/* Header */}
      <header className="relative z-10 pt-8 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <Image
                src="/evapremium.png"
                alt="Eva Premium Logo"
                width={400}
                height={160}
                className="h-40 w-auto object-contain"
                priority
              />
            </div>
            
            {/* Tytuł */}
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Dobierz dywaniki <span className="text-red-500">EVAPREMIUM</span> do swojego auta i odbierz -30% rabatu
            </h1>
            
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-6">
              Wpisz dane swojego auta – przygotujemy indywidualną wycenę z rabatem ważnym tylko dziś.
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LeadCaptureForm />
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-800 bg-black/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-400">
            <p>&copy; 2024 Lead Capture Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
