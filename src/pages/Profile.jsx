import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Building2, Receipt, LogOut, ChevronRight, HelpCircle, ShieldCheck, CreditCard } from 'lucide-react';

const Profile = () => {
  const { user, profile, logout } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center py-6">
         <div className="w-24 h-24 bg-primary text-white text-3xl font-bold flex items-center justify-center rounded-3xl shadow-xl mb-4">
            {profile?.shopName?.charAt(0).toUpperCase()}
         </div>
         <h2 className="text-2xl font-bold text-gray-800">{profile?.shopName}</h2>
         <p className="text-gray-400 font-body text-sm lowercase">{user?.email}</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
         <ProfileItem 
            icon={Building2} 
            label="Shop Details" 
            value={profile?.shopName} 
         />
         <ProfileItem 
            icon={Receipt} 
            label="GST Number" 
            value={profile?.gstNumber || 'Not Provided'} 
         />
         <ProfileItem 
            icon={CreditCard} 
            label="Plan" 
            value="Free Lifetime" 
            isTail
         />
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
         <div className="p-5 flex items-center gap-4 border-b border-gray-50 active:bg-gray-50 transition-colors">
            <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
               <HelpCircle className="w-5 h-5" />
            </div>
            <div className="flex-1">
               <div className="font-bold text-gray-800">Support</div>
               <div className="text-xs text-gray-400">Need help? Chat with us</div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300" />
         </div>
         <div className="p-5 flex items-center gap-4 active:bg-gray-50 transition-colors">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center">
               <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex-1">
               <div className="font-bold text-gray-800">Privacy & Security</div>
               <div className="text-xs text-gray-400">Manage your data</div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300" />
         </div>
      </div>

      <button 
        onClick={logout}
        className="w-full bg-red-50 text-red-500 p-5 rounded-3xl font-bold flex items-center justify-center gap-3 active:scale-95 transition-all"
      >
        <LogOut className="w-5 h-5" />
        Sign Out
      </button>

      <div className="text-center pt-8 pb-4">
         <p className="text-[10px] text-gray-300 uppercase font-bold tracking-[0.2em]">LekkaFlow v1.0.0</p>
         <p className="text-[10px] text-gray-300 mt-1">Made with ❤️ for Indian Retailers</p>
      </div>
    </div>
  );
};

const ProfileItem = ({ icon: Icon, label, value, isTail }) => (
  <div className={`p-5 flex items-center gap-4 ${!isTail ? 'border-b border-gray-50' : ''}`}>
    <div className="w-10 h-10 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center">
       <Icon className="w-5 h-5" />
    </div>
    <div className="flex-1">
       <div className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">{label}</div>
       <div className="font-bold text-gray-800">{value}</div>
    </div>
  </div>
);

export default Profile;
