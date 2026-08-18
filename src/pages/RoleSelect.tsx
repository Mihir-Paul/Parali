import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Sprout, Briefcase, Cpu, Phone, Mail } from 'lucide-react';

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
    <div className="min-h-[85vh] flex flex-col justify-center items-center px-6 py-12 bg-cream-50">
      <div className="max-w-4xl w-full text-center mb-12">
        <h2 className="text-3xl lg:text-5xl font-black text-forest-950 tracking-tight">
          Access the Parali Ecosystem
        </h2>
        <p className="text-sm lg:text-base text-forest-800 mt-3 max-w-xl mx-auto">
          Select your portal to interact with the stubble marketplace, logistics planning, or regional air quality tracking.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-5xl w-full">
        {/* Farmer Portal Card */}
        <div className="group bg-white border border-forest-100 rounded-3xl p-8 flex flex-col justify-between shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-forest-300">
          <div>
            <div className="w-14 h-14 rounded-2xl bg-forest-100 text-forest-700 flex items-center justify-center mb-6 group-hover:bg-forest-600 group-hover:text-white transition-all">
              <Sprout className="h-7 w-7" />
            </div>
            <h3 className="text-2xl font-bold text-forest-950">Farmer Portal</h3>
            <p className="text-xs text-forest-700 mt-2 leading-relaxed">
              Sell wheat, paddy, or sugarcane residue. Request free on-field baling, get instant AI valuations, and receive direct payments.
            </p>
          </div>

          <div className="mt-8">
            {showFarmerLogin ? (
              <form onSubmit={handleFarmerLoginSubmit} className="flex flex-col gap-2">
                <input 
                  type="text" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter Phone Number"
                  className="w-full text-xs p-3 rounded-lg border border-forest-200 focus:outline-none focus:ring-2 focus:ring-forest-500 font-semibold"
                />
                <button type="submit" className="w-full bg-forest-600 hover:bg-forest-700 text-white text-xs font-bold py-2.5 rounded-lg transition-all">
                  Proceed to Dashboard
                </button>
              </form>
            ) : (
              <button 
                onClick={() => setShowFarmerLogin(true)}
                className="w-full bg-forest-50 hover:bg-forest-100 text-forest-800 text-xs font-bold py-3 rounded-xl border border-forest-200 transition-all"
              >
                I'm a Farmer
              </button>
            )}
          </div>
        </div>

        {/* Buyer Portal Card */}
        <div className="group bg-white border border-forest-100 rounded-3xl p-8 flex flex-col justify-between shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-forest-300">
          <div>
            <div className="w-14 h-14 rounded-2xl bg-clay-100 text-clay-700 flex items-center justify-center mb-6 group-hover:bg-clay-600 group-hover:text-white transition-all">
              <Briefcase className="h-7 w-7" />
            </div>
            <h3 className="text-2xl font-bold text-forest-950">Buyer Portal</h3>
            <p className="text-xs text-forest-700 mt-2 leading-relaxed">
              Source bulk agricultural biomass. Post volume requirements, accept matches, and track scheduled regional shipments.
            </p>
          </div>

          <div className="mt-8">
            {showBuyerLogin ? (
              <form onSubmit={handleBuyerLoginSubmit} className="flex flex-col gap-2">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter Email Address"
                  className="w-full text-xs p-3 rounded-lg border border-forest-200 focus:outline-none focus:ring-2 focus:ring-forest-500 font-semibold"
                />
                <button type="submit" className="w-full bg-clay-600 hover:bg-clay-700 text-white text-xs font-bold py-2.5 rounded-lg transition-all">
                  Proceed to Dashboard
                </button>
              </form>
            ) : (
              <button 
                onClick={() => setShowBuyerLogin(true)}
                className="w-full bg-clay-50 hover:bg-clay-100 text-clay-800 text-xs font-bold py-3 rounded-xl border border-clay-200 transition-all"
              >
                I'm a Buyer
              </button>
            )}
          </div>
        </div>

        {/* Admin Operations Card */}
        <div className="group bg-white border border-forest-100 rounded-3xl p-8 flex flex-col justify-between shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-forest-300">
          <div>
            <div className="w-14 h-14 rounded-2xl bg-earth-100 text-earth-700 flex items-center justify-center mb-6 group-hover:bg-earth-600 group-hover:text-white transition-all">
              <Cpu className="h-7 w-7" />
            </div>
            <h3 className="text-2xl font-bold text-forest-950">Operations</h3>
            <p className="text-xs text-forest-700 mt-2 leading-relaxed">
              Run routing optimizations, view stubble burning satellite heatmaps, monitor payments, and export environmental impact metrics.
            </p>
          </div>

          <div className="mt-8">
            <button 
              onClick={() => setRole('Admin')}
              className="w-full bg-earth-600 hover:bg-earth-700 text-white text-xs font-bold py-3 rounded-xl transition-all"
            >
              Enter Control Center
            </button>
          </div>
        </div>
      </div>
      
      {/* Quick Demo Helper Hint */}
      <div className="mt-12 bg-white/70 border border-forest-100 px-4 py-3 rounded-xl max-w-md text-center text-xs text-slate-500 font-medium">
        💡 <strong className="text-slate-700">SIH Judge Tip:</strong> You can click the steps in the floating controller at the bottom right to trigger screens and simulate actions automatically.
      </div>
    </div>
  );
};
