import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db, collection, query, where, getDocs, orderBy, limit } from '../utils/firebase';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { TrendingUp, ShoppingBag, CreditCard, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '../components/Layout';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const Analytics = () => {
  const { user } = useAuth();
  const [filter, setFilter] = useState('week');
  const [data, setData] = useState({
    totalRevenue: 0,
    billsCount: 0,
    avgBill: 0,
    dailyRevenue: [],
    topProducts: [],
    recentBills: [],
    loading: true
  });

  useEffect(() => {
    fetchData();
  }, [filter, user.uid]);

  const fetchData = async () => {
    setData(prev => ({ ...prev, loading: true }));
    const now = new Date();
    let startDate = new Date();
    
    if (filter === 'today') startDate.setHours(0,0,0,0);
    else if (filter === 'week') startDate.setDate(now.getDate() - 7);
    else if (filter === 'month') startDate.setDate(now.getDate() - 30);

    try {
      const q = query(
        collection(db, 'users', user.uid, 'bills'),
        where('createdAt', '>=', startDate),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const bills = snapshot.docs.map(doc => doc.data());

      const totalRevenue = bills.reduce((acc, b) => acc + b.grandTotal, 0);
      const billsCount = bills.length;
      const avgBill = billsCount > 0 ? totalRevenue / billsCount : 0;

      const dayMap = {};
      for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        dayMap[d.toISOString().slice(0, 10)] = 0;
      }

      bills.forEach(b => {
        const date = b.createdAt.toDate().toISOString().slice(0, 10);
        if (dayMap[date] !== undefined) dayMap[date] += b.grandTotal;
      });

      const dailyRevenue = Object.entries(dayMap).sort().map(([date, val]) => ({
        label: new Date(date).toLocaleDateString('en-IN', { weekday: 'short' }),
        value: val
      }));

      const prodMap = {};
      bills.forEach(b => {
        b.items.forEach(item => {
          prodMap[item.name] = (prodMap[item.name] || 0) + item.qty;
        });
      });

      const topProducts = Object.entries(prodMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, qty]) => ({ name, qty }));

      const recentBills = bills.slice(0, 5);

      setData({ totalRevenue, billsCount, avgBill, dailyRevenue, topProducts, recentBills, loading: false });
    } catch (err) {
      console.error(err);
      setData(prev => ({ ...prev, loading: false }));
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { borderDash: [5, 5] }, ticks: { precision: 0 } }
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
         <div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Sales Analytics</h2>
            <p className="text-gray-500 font-body">Real-time performance metrics for your shop</p>
         </div>
         <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 ring-1 ring-gray-950/5">
            {['today', 'week', 'month'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-6 py-2.5 rounded-xl text-sm font-bold capitalize transition-all",
                  filter === f ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-gray-400 hover:text-gray-600"
                )}
              >
                {f}
              </button>
            ))}
         </div>
      </div>

      {/* Hero Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          icon={TrendingUp} 
          label="Total Revenue" 
          value={`₹${data.totalRevenue.toLocaleString('en-IN')}`} 
          color="bg-emerald-500" 
          loading={data.loading}
          trend="+12.5%"
        />
        <MetricCard 
          icon={ShoppingBag} 
          label="Total Bills" 
          value={data.billsCount} 
          color="bg-blue-500" 
          loading={data.loading}
          trend="+5 new"
        />
        <MetricCard 
          icon={CreditCard} 
          label="Avg. Ticket Size" 
          value={`₹${Math.round(data.avgBill)}`} 
          color="bg-amber-500" 
          loading={data.loading}
          trend="-2%"
        />
        <MetricCard 
          icon={Calendar} 
          label="Report Window" 
          value={filter === 'week' ? 'Last 7 Days' : filter === 'month' ? 'Last 30 Days' : 'Today Only'} 
          color="bg-purple-500" 
          loading={data.loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-8 bg-white p-8 rounded-[32px] shadow-premium border border-gray-100">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold text-gray-800 tracking-tight">Revenue Timeline (₹)</h3>
           </div>
           <div className="h-80">
              {data.loading ? <div className="h-full skeleton rounded-2xl"></div> : (
                <Bar 
                  options={chartOptions} 
                  data={{
                    labels: data.dailyRevenue.map(d => d.label),
                    datasets: [{
                      label: 'Revenue',
                      data: data.dailyRevenue.map(d => d.value),
                      backgroundColor: '#10B981',
                      borderRadius: 12,
                      hoverBackgroundColor: '#059669',
                      barThickness: 32,
                    }]
                  }} 
                />
              )}
           </div>
        </div>

        {/* Top Products */}
        <div className="lg:col-span-4 bg-white p-8 rounded-[32px] shadow-premium border border-gray-100">
           <h3 className="text-lg font-bold text-gray-800 tracking-tight mb-8">Inventory Insights</h3>
           <div className="space-y-6">
              <div className="h-48 relative">
                 {data.loading ? <div className="w-40 h-40 mx-auto skeleton rounded-full"></div> : (
                   <Doughnut 
                     data={{
                       labels: data.topProducts.map(p => p.name),
                       datasets: [{
                         data: data.topProducts.map(p => p.qty),
                         backgroundColor: ['#10B981', '#F59E0B', '#3B82F6', '#EC4899', '#8B5CF6'],
                         borderWidth: 0,
                         cutout: '75%',
                       }]
                     }} 
                     options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} 
                   />
                 )}
                 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-black text-gray-800">{data.topProducts.reduce((a,b) => a+b.qty, 0)}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Units Sold</span>
                 </div>
              </div>
              <div className="space-y-4 pt-4 border-t border-gray-50">
                 {data.topProducts.map((p, i) => (
                   <div key={p.name} className="flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                         <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ['#10B981', '#F59E0B', '#3B82F6', '#EC4899', '#8B5CF6'][i] }}></div>
                         <span className="text-sm font-bold text-gray-600 truncate max-w-[120px]">{p.name}</span>
                      </div>
                      <span className="text-sm font-black text-gray-800 bg-gray-50 px-3 py-1 rounded-lg">{p.qty} items</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-white rounded-[32px] shadow-premium border border-gray-100 overflow-hidden">
         <div className="p-8 border-b border-gray-50 flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-800 tracking-tight">Recent Transactions</h3>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">{data.billsCount} Total Invoices</div>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead className="bg-gray-50/50">
                  <tr>
                     <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Bill #</th>
                     <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Customer</th>
                     <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</th>
                     <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Amount</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                  {data.loading ? (
                    [1,2,3].map(i => (
                      <tr key={i}><td colSpan="4" className="px-8 py-4"><div className="h-6 skeleton rounded-lg w-full"></div></td></tr>
                    ))
                  ) : data.billsCount === 0 ? (
                    <tr><td colSpan="4" className="px-8 py-12 text-center text-gray-400 font-medium">No transactions yet</td></tr>
                  ) : (
                    data.recentBills.map((bill, i) => (
                      <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-8 py-5 font-mono text-xs font-bold text-primary">{bill.billNumber}</td>
                        <td className="px-8 py-5 font-bold text-gray-800">{bill.customerName || 'Walk-in Customer'}</td>
                        <td className="px-8 py-5 text-sm text-gray-500">{bill.createdAt?.toDate().toLocaleDateString('en-IN')}</td>
                        <td className="px-8 py-5 text-right font-black text-gray-900">₹{bill.grandTotal.toFixed(2)}</td>
                      </tr>
                    ))
                  )}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

const MetricCard = ({ icon: Icon, label, value, color, loading, trend }) => (
  <div className="bg-white p-6 rounded-[32px] shadow-premium border border-gray-100 relative group overflow-hidden hover:scale-[1.02] transition-all duration-300">
    <div className={cn("absolute -right-4 -top-4 w-24 h-24 opacity-[0.03] rounded-full transition-transform group-hover:scale-125", color)}></div>
    <div className="flex justify-between items-start mb-4">
       <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg", color)}>
          <Icon className="w-6 h-6" />
       </div>
       {trend && (
         <div className={cn(
           "flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black",
           trend.startsWith('+') ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
         )}>
           {trend.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
           {trend}
         </div>
       )}
    </div>
    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1">{label}</div>
    {loading ? <div className="h-8 w-24 skeleton rounded-lg"></div> : <div className="text-2xl font-black text-gray-900 tracking-tight">{value}</div>}
  </div>
);

export default Analytics;
