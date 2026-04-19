import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db, doc, setDoc, serverTimestamp } from '../utils/firebase';
import { useNavigate } from 'react-router-dom';
import { Building2, Receipt, ArrowRight, Loader2 } from 'lucide-react';

const Onboarding = () => {
  const { user, setProfile } = useAuth();
  const [shopName, setShopName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const gstRegex = /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}Z[A-Z\d]{1}$/;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!shopName.trim()) return setError('Shop name is required');
    if (gstNumber && !gstRegex.test(gstNumber.toUpperCase())) {
      return setError('Invalid GST format (Example: 22AAAAA0000A1Z5)');
    }

    setLoading(true);
    try {
      const profileData = {
        shopName: shopName.trim(),
        gstNumber: gstNumber ? gstNumber.toUpperCase() : 'NOT PROVIDED',
        createdAt: serverTimestamp(),
        email: user.email,
        uid: user.uid
      };

      await setDoc(doc(db, 'users', user.uid, 'profile', 'data'), profileData);
      setProfile(profileData);
      navigate('/');
    } catch (err) {
      console.error(err);
      setError('Failed to save profile. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6 pt-16">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Setup your Shop</h1>
          <p className="text-gray-500 mt-2 font-body">Almost there! We just need a few details.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="relative group">
              <label className="text-sm font-semibold text-gray-700 mb-1 block px-1">Shop Name</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  placeholder="e.g. Sharma Kirana Store"
                  className="w-full bg-white border-2 border-gray-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-primary/30 transition-all font-body text-gray-800"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                />
              </div>
            </div>

            <div className="relative group">
              <label className="text-sm font-semibold text-gray-700 mb-1 block px-1 flex justify-between">
                GST Number <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <Receipt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  placeholder="e.g. 29AAAAA0000A1Z5"
                  className="w-full bg-white border-2 border-gray-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-primary/30 transition-all font-body text-gray-800 uppercase"
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value)}
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-100 border-2 border-red-200 rounded-[20px] text-red-700 text-sm font-bold flex items-center gap-3 animate-shake">
              <div className="w-1.5 h-6 bg-red-500 rounded-full"></div>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark text-white p-4 rounded-2xl font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin" /> : (
              <>
                Let's Start Billing
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;
