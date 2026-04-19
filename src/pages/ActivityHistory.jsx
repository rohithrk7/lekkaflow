import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { subscribeToActivities } from '../utils/activity';
import { db, doc, getDoc } from '../utils/firebase';
import { History, ShoppingBag, UserPlus, Info, Calendar, X, ExternalLink, User, ShoppingCart } from 'lucide-react';
import { cn } from '../components/Layout';

const ActivityHistory = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [profile, setProfile] = useState({ shopName: 'LekkaFlow Terminal', address: '' });

  useEffect(() => {
    if (!user) return;
    
    // Fetch profile for shop name
    const fetchProfile = async () => {
       const profileRef = doc(db, 'users', user.uid, 'profile', 'data');
       const profileSnap = await getDoc(profileRef);
       if (profileSnap.exists()) setProfile(profileSnap.data());
    };
    fetchProfile();

    const unsubscribe = subscribeToActivities(user.uid, (data) => {
      setActivities(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const handleDownload = () => {
    if (!selectedActivity || !selectedActivity.metadata) return;
    const { metadata } = selectedActivity;
    
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    
    const itemsHtml = (metadata.items || []).map(item => `
      <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
        <div style="display: flex; gap: 12px; align-items: center;">
          <div style="background: #f9fafb; padding: 4px 8px; border-radius: 6px; font-weight: bold; font-size: 12px;">${item.qty}x</div>
          <div>
            <div style="font-weight: bold; color: #1f2937;">${item.name}</div>
            <div style="font-size: 10px; color: #9ca3af; font-family: monospace;">BARCODE: ${item.id}</div>
          </div>
        </div>
        <div style="font-weight: 800; color: #111827;">₹${(item.price * item.qty).toFixed(2)}</div>
      </div>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice ${metadata.billNumber}</title>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap" rel="stylesheet">
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #374151; }
            @page { margin: 0; }
            * { box-sizing: border-box; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div style="max-width: 600px; margin: auto; padding: 40px; border: 1px solid #f3f4f6; border-radius: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px;">
              <div>
                <div style="font-weight: 900; font-size: 24px; color: #111827; letter-spacing: -0.025em; margin-bottom: 4px;">RETAIL RECEIPT</div>
                <div style="font-weight: bold; color: #10B981; font-size: 14px;">${profile.shopName.toUpperCase()}</div>
              </div>
              <div style="text-align: right;">
                <div style="color: #9ca3af; font-weight: bold; font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px;">Invoice Number</div>
                <div style="font-weight: 900; font-size: 18px; color: #111827;">#${metadata.billNumber}</div>
              </div>
            </div>

            <div style="background: #f9fafb; padding: 24px; border-radius: 16px; margin-bottom: 40px; display: flex; justify-content: space-between;">
              <div>
                <div style="font-size: 10px; font-weight: bold; color: #9ca3af; text-transform: uppercase; margin-bottom: 4px;">CUSTOMER</div>
                <div style="font-weight: bold; color: #1f2937;">${metadata.customerName || 'Walk-in Customer'}</div>
              </div>
              <div style="text-align: right;">
                <div style="font-size: 10px; font-weight: bold; color: #9ca3af; text-transform: uppercase; margin-bottom: 4px;">DATE</div>
                <div style="font-weight: bold; color: #1f2937;">${selectedActivity.timestamp?.toDate().toLocaleDateString('en-IN')}</div>
              </div>
            </div>

            <div style="margin-bottom: 40px;">
              <div style="font-size: 10px; font-weight: bold; color: #9ca3af; text-transform: uppercase; margin-bottom: 12px; border-bottom: 2px solid #f3f4f6; padding-bottom: 8px;">ITEMS PURCHASED</div>
              ${itemsHtml}
            </div>

            <div style="background: #111827; color: white; padding: 24px; border-radius: 16px; display: flex; justify-content: space-between; align-items: center;">
              <div style="font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; font-size: 12px;">TOTAL AMOUNT PAID</div>
              <div style="font-weight: 900; font-size: 24px;">₹${metadata.total?.toFixed(2)}</div>
            </div>
            
            <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #f3f4f6;">
              <div style="color: #9ca3af; font-size: 12px; font-weight: 500;">Thank you for shopping at ${profile.shopName}!</div>
              <div style="color: #d1d5db; font-size: 10px; font-weight: bold; margin-top: 8px; letter-spacing: 0.2em; text-transform: uppercase;">Generated by LekkaFlow</div>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const getIcon = (type) => {
    switch (type) {
      case 'INVOICE_CREATED': return ShoppingBag;
      case 'LOGIN': return UserPlus;
      case 'PRODUCT_ADDED': return History;
      default: return Info;
    }
  };

  const getBgColor = (type) => {
    switch (type) {
      case 'INVOICE_CREATED': return 'bg-emerald-50 text-emerald-600';
      case 'LOGIN': return 'bg-blue-50 text-blue-600';
      case 'PRODUCT_ADDED': return 'bg-amber-50 text-amber-600';
      default: return 'bg-gray-50 text-gray-600';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in relative min-h-screen pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Activity Log</h2>
          <p className="text-gray-500 font-medium">Tracking all actions in your terminal</p>
        </div>
        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
           <History className="w-6 h-6" />
        </div>
      </div>

      <div className="bg-white rounded-[32px] shadow-premium border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 space-y-4">
            {[1,2,3,4].map(i => <div key={i} className="h-16 skeleton rounded-2xl w-full"></div>)}
          </div>
        ) : activities.length === 0 ? (
          <div className="p-20 text-center">
             <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                <Calendar className="w-10 h-10" />
             </div>
             <p className="text-gray-400 font-bold">No recent activity found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {activities.map((activity) => {
              const Icon = getIcon(activity.type);
              return (
                <div 
                  key={activity.id} 
                  onClick={() => setSelectedActivity(activity)}
                  className="p-6 flex items-start gap-5 hover:bg-gray-50/50 transition-all group cursor-pointer active:scale-[0.99]"
                >
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110", getBgColor(activity.type))}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                       <span className="font-bold text-gray-800 text-lg group-hover:text-primary transition-colors">{activity.description}</span>
                       <span className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-4 shrink-0">
                          {activity.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </span>
                    </div>
                    <div className="flex items-center justify-between">
                       <div className="text-sm text-gray-500">
                          {activity.timestamp?.toDate().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
                       </div>
                       {activity.metadata?.total && (
                         <div className="text-sm font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full animate-pulse-slow">
                            ₹{activity.metadata.total.toFixed(2)}
                         </div>
                       )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Activity Detail Modal */}
      {selectedActivity && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => setSelectedActivity(null)}></div>
           <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl relative z-10 overflow-hidden transform transition-all animate-scale-in">
              <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                 <div className="flex items-center gap-4">
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", getBgColor(selectedActivity.type))}>
                       {React.createElement(getIcon(selectedActivity.type), { className: "w-6 h-6" })}
                    </div>
                    <div>
                       <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Activity Detail</div>
                       <div className="font-black text-gray-800 text-xl tracking-tight">{selectedActivity.type.replace('_', ' ')}</div>
                    </div>
                 </div>
                 <button onClick={() => setSelectedActivity(null)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                    <X className="w-6 h-6 text-gray-400" />
                 </button>
              </div>

              <div className="p-8 space-y-8">
                 {/* Metadata Section */}
                 {selectedActivity.metadata && (
                   <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                         <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100">
                            <div className="flex items-center gap-2 mb-2 text-gray-400">
                               <User className="w-3 h-3" />
                               <span className="text-[10px] font-bold uppercase tracking-widest">Customer</span>
                            </div>
                            <div className="font-bold text-gray-800">{selectedActivity.metadata.customerName || 'Guest'}</div>
                         </div>
                         <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100">
                            <div className="flex items-center gap-2 mb-2 text-gray-400">
                               <History className="w-3 h-3" />
                               <span className="text-[10px] font-bold uppercase tracking-widest">Bill #</span>
                            </div>
                            <div className="font-bold text-primary font-mono">{selectedActivity.metadata.billNumber || 'N/A'}</div>
                         </div>
                      </div>

                      {selectedActivity.metadata.items && (
                        <div className="space-y-4">
                           <div className="flex items-center gap-2 text-gray-400 px-1">
                              <ShoppingCart className="w-4 h-4" />
                              <span className="text-xs font-bold uppercase tracking-widest">Purchased Items</span>
                           </div>
                           <div className="bg-gray-50 rounded-[32px] p-2 space-y-1">
                              {selectedActivity.metadata.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm">
                                   <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 text-xs font-bold">
                                         {item.qty}x
                                      </div>
                                      <span className="font-bold text-gray-800">{item.name}</span>
                                   </div>
                                   <span className="font-bold text-gray-900">₹{item.price * item.qty}</span>
                                </div>
                              ))}
                           </div>
                        </div>
                      )}

                      <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                         <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">Total Transaction</div>
                         <div className="text-3xl font-black text-gray-900 tracking-tight">₹{selectedActivity.metadata.total?.toFixed(2)}</div>
                      </div>
                   </div>
                 )}
              </div>

              <div className="p-8 bg-gray-50/50 flex gap-3">
                 <button 
                   onClick={handleDownload}
                   className="flex-1 bg-gray-800 text-white py-4 rounded-3xl font-bold flex items-center justify-center gap-2 hover:bg-gray-900 transition-all active:scale-95 shadow-xl shadow-gray-200"
                 >
                    <ExternalLink className="w-5 h-5" />
                    Open Invoice
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ActivityHistory;
