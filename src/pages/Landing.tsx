import { useNavigate } from 'react-router-dom';
import { Calendar, Sparkles, Users } from 'lucide-react';

export function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-white/10">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/brand/logo.png"
              alt="KNK-AI"
              className="h-10 w-auto"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <span className="text-xl font-semibold">Cleanflow</span>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2 bg-white text-black hover:bg-white/90 transition-colors font-medium"
          >
            Login
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4">
        <section className="py-24 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Streamline Your Short-Term Rental Cleaning
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto mb-12">
            Manage apartments, coordinate cleaners, and schedule tasks with precision.
            Built for hosts who demand efficiency.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="px-8 py-4 bg-white text-black hover:bg-white/90 transition-colors text-lg font-semibold"
          >
            Get Started
          </button>
        </section>

        <section className="py-24 grid md:grid-cols-3 gap-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">Smart Scheduling</h3>
            <p className="text-white/70">
              Coordinate cleaning tasks with real-time availability tracking and automatic assignment.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center mx-auto mb-6">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">Team Management</h3>
            <p className="text-white/70">
              Manage your cleaning team, track performance, and ensure quality across all properties.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">Seamless Experience</h3>
            <p className="text-white/70">
              Intuitive interface designed for busy hosts and efficient cleaners.
            </p>
          </div>
        </section>

        <section className="py-24 border-t border-white/10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">Ready to optimize your operations?</h2>
            <p className="text-xl text-white/70 mb-8">
              Join hosts who trust KNK-AI to keep their properties pristine.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-4 bg-white text-black hover:bg-white/90 transition-colors text-lg font-semibold"
            >
              Start Now
            </button>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 py-8">
        <div className="container mx-auto px-4 text-center text-white/50">
          <p>&copy; 2025 KNK-AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
