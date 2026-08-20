import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Sprout, Briefcase, Cpu } from 'lucide-react';

export const RoleSelect: React.FC = () => {
  const { setRole, loginAsFarmer, loginAsBuyer } = useAppStore();
  const [phone, setPhone] = useState('9999999999');
  const [email, setEmail] = useState('buyer@parali.demo');
  const [showFarmerLogin, setShowFarmerLogin] = useState(false);
  const [showBuyerLogin, setShowBuyerLogin] = useState(false);

  const handleFarmerLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginAsFarmer(phone);
  };

  const handleBuyerLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginAsBuyer(email);
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center px-4 md:px-6 py-12 bg-paper-50 font-sans">
      <div className="max-w-4xl w-full text-center mb-10">
        <h2 className="text-2xl md:text-4xl font-display font-bold text-ink-900 tracking-tight">
          Access the Parali ecosystem
        </h2>
        <p className="text-xs md:text-sm text-ink-500 mt-2 max-w-xl mx-auto">
          Select your portal to interact with the stubble marketplace, logistics planning, or regional air quality tracking.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl w-full">
        {/* Farmer Portal Card */}
        <div className="group bg-surface-0 border border-line-200 rounded-card p-6 flex flex-col justify-between shadow-card hover:shadow-card-hover transition-shadow">
          <div>
            <div className="w-12 h-12 rounded-card bg-pine-100 text-pine-700 flex items-center justify-center mb-5 group-hover:bg-pine-900 group-hover:text-white transition-colors">
              <Sprout className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-display font-bold text-ink-900">Farmer portal</h3>
            <p className="text-xs text-ink-500 mt-2 leading-relaxed">
              Sell wheat, paddy, or sugarcane residue. Request free on-field baling, get instant AI valuations, and receive direct payments.
            </p>
          </div>

          <div className="mt-6">
            {showFarmerLogin ? (
              <form onSubmit={handleFarmerLoginSubmit} className="flex flex-col gap-2">
                <input 
                  type="text" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter phone number"
                  className="w-full text-xs p-2.5 rounded-card border border-line-200 focus:outline-none focus:ring-1 focus:ring-pine-700 font-mono text-ink-900"
                />
                <button type="submit" className="w-full bg-pine-900 hover:bg-pine-700 text-white text-xs font-semibold py-2 rounded-card transition-all">
                  Proceed to dashboard
                </button>
              </form>
            ) : (
              <button 
                onClick={() => setShowFarmerLogin(true)}
                className="w-full bg-pine-100 text-pine-700 hover:bg-pine-900 hover:text-white text-xs font-semibold py-2.5 rounded-card transition-all"
              >
                I'm a farmer
              </button>
            )}
          </div>
        </div>

        {/* Buyer Portal Card */}
        <div className="group bg-surface-0 border border-line-200 rounded-card p-6 flex flex-col justify-between shadow-card hover:shadow-card-hover transition-shadow">
          <div>
            <div className="w-12 h-12 rounded-card bg-soil-100 text-soil-700 flex items-center justify-center mb-5 group-hover:bg-soil-700 group-hover:text-white transition-colors">
              <Briefcase className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-display font-bold text-ink-900">Buyer portal</h3>
            <p className="text-xs text-ink-500 mt-2 leading-relaxed">
              Source bulk agricultural biomass. Post volume requirements, accept matches, and track scheduled regional shipments.
            </p>
          </div>

          <div className="mt-6">
            {showBuyerLogin ? (
              <form onSubmit={handleBuyerLoginSubmit} className="flex flex-col gap-2">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="w-full text-xs p-2.5 rounded-card border border-line-200 focus:outline-none focus:ring-1 focus:ring-pine-700 font-medium text-ink-900"
                />
                <button type="submit" className="w-full bg-soil-700 hover:bg-soil-700/90 text-white text-xs font-semibold py-2 rounded-card transition-all">
                  Proceed to dashboard
                </button>
              </form>
            ) : (
              <button 
                onClick={() => setShowBuyerLogin(true)}
                className="w-full bg-soil-100 text-soil-700 hover:bg-soil-700 hover:text-white text-xs font-semibold py-2.5 rounded-card transition-all"
              >
                I'm a biomass buyer
              </button>
            )}
          </div>
        </div>

        {/* Admin / Operations Portal Card */}
        <div className="group bg-surface-0 border border-line-200 rounded-card p-6 flex flex-col justify-between shadow-card hover:shadow-card-hover transition-shadow">
          <div>
            <div className="w-12 h-12 rounded-card bg-paper-50 border border-line-200 text-ink-500 flex items-center justify-center mb-5 group-hover:bg-pine-900 group-hover:text-white transition-colors">
              <Cpu className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-display font-bold text-ink-900">Operations center</h3>
            <p className="text-xs text-ink-500 mt-2 leading-relaxed">
              Access NASA FIRMS burn intelligence, trigger OR-Tools vehicle routing, and monitor MRV carbon offset data.
            </p>
          </div>

          <div className="mt-6">
            <button 
              onClick={() => setRole('Admin')}
              className="w-full bg-paper-50 hover:bg-pine-900 hover:text-white text-ink-900 border border-line-200 text-xs font-semibold py-2.5 rounded-card transition-all"
            >
              Open operations dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
