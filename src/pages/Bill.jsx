import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { db, doc, getDoc, setDoc, addDoc, collection, serverTimestamp, query, orderBy, limit, getDocs, onSnapshot } from '../utils/firebase';
import { logActivity } from '../utils/activity';
import { Scan, Plus, Minus, Trash2, Send, FileText, X, User, Phone, CheckCircle2, Search, Download, Printer, Calculator, Package } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { cn } from '../components/Layout';
import { createPortal } from 'react-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const Bill = () => {
  const { user, profile } = useAuth();
  const [items, setItems] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  const scannerRef = useRef(null);

  // Totals Calculation
  const subtotal = items.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const totalGst = items.reduce((acc, item) => {
    const itemGst = (item.price * item.qty * (item.taxPct / 100));
    return acc + itemGst;
  }, 0);
  const grandTotal = subtotal + totalGst;
  const cgst = totalGst / 2;
  const sgst = totalGst / 2;

  useEffect(() => {
    const q = query(collection(db, 'users', user.uid, 'products'), orderBy('name', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAllProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, [user.uid]);

  useEffect(() => {
    if (isScanning) {
      const scanner = new Html5QrcodeScanner("reader", { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true
      });
      scanner.render(onScanSuccess, onScanFailure);
      scannerRef.current = scanner;
      return () => { if (scannerRef.current) scannerRef.current.clear().catch(e => {}); };
    }
  }, [isScanning]);

  const onScanSuccess = async (decodedText) => {
    if (scannerRef.current) { await scannerRef.current.clear(); setIsScanning(false); }
    document.body.classList.add('scan-success');
    setTimeout(() => document.body.classList.remove('scan-success'), 300);
    setLoading(true);
    try {
      const productDoc = await getDoc(doc(db, 'users', user.uid, 'products', decodedText));
      if (productDoc.exists()) addItem(productDoc.data(), decodedText);
      else { setScannedBarcode(decodedText); setShowProductForm(true); }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const onScanFailure = (error) => {};

  const addItem = (product, barcode) => {
    setItems(prev => {
      const existing = prev.find(i => i.barcode === barcode);
      if (existing) return prev.map(i => i.barcode === barcode ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, barcode, qty: 1 }];
    });
    setSearchTerm('');
    setShowSearchResults(false);
  };

  const updateQty = (barcode, delta) => {
    setItems(prev => prev.map(item => item.barcode === barcode ? { ...item, qty: Math.max(1, item.qty + delta) } : item ));
  };

  const removeItem = (barcode) => setItems(prev => prev.filter(i => i.barcode !== barcode));

  const saveBill = async () => {
    if (items.length === 0) return;
    setLoading(true);
    try {
      const date = new Date();
      const profileRef = doc(db, 'users', user.uid, 'profile', 'data');
      const profileSnap = await getDoc(profileRef);
      const currentCount = (profileSnap.exists() ? profileSnap.data().billCount : 0) || 0;
      const nextCount = currentCount + 1;
      
      const billNumber = `BS-${nextCount.toString().padStart(5, '0')}`;

      const billData = { 
        billNumber, 
        customerName, 
        customerPhone, 
        items, 
        subtotal, 
        cgst, 
        sgst, 
        grandTotal, 
        createdAt: serverTimestamp() 
      };
      
      await addDoc(collection(db, 'users', user.uid, 'bills'), billData);
      await setDoc(profileRef, { billCount: nextCount }, { merge: true });
      
      // Log the activity to the user's history
      await logActivity(user.uid, 'INVOICE_CREATED', `Created Invoice #${billNumber} for ${customerName || 'Walk-in'}`, { 
        billNumber, 
        total: grandTotal,
        customerName,
        items
      });
      const cleanPhone = customerPhone.replace(/\D/g, ''); // Extract only digits
      const sanitizedPhone = cleanPhone.length > 10 ? cleanPhone.slice(-10) : cleanPhone;
      
      const message = `*${profile.shopName}*\nBill: ${billNumber}\nTotal: ₹${grandTotal.toFixed(2)}`;
      
      if (sanitizedPhone.length === 10) {
        window.open(`https://wa.me/91${sanitizedPhone}?text=${encodeURIComponent(message)}`, '_blank');
      } else {
        navigator.clipboard.writeText(message);
      }

      setSuccess(true);
      setTimeout(() => { setSuccess(false); setItems([]); setCustomerName(''); setCustomerPhone(''); }, 2000);
    } catch (err) { 
      console.error("🔥 Firestore Save Error:", err);
      if (err.code === 'permission-denied') {
        alert('Firebase Permission Denied! Please make sure you enabled Firestore in "Test Mode".');
      } else {
        alert('Error saving bill: ' + err.message); 
      }
    } finally { setLoading(false); }
  };

  const downloadPDF = async () => {
    const element = document.getElementById('bill-pdf-content');
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    
    const styles = Array.from(document.styleSheets)
      .map(sheet => {
        try { return Array.from(sheet.cssRules).map(rule => rule.cssText).join(''); }
        catch (e) { return ''; }
      }).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${profile?.shopName}</title>
          <style>${styles}</style>
          <style>
            @page { size: auto; margin: 0mm; }
            @media print {
              body { margin: 0; padding: 0; background: white; }
              #bill-pdf-content { 
                display: block !important; 
                position: static !important; 
                width: 100% !important; 
                padding: 40px !important;
                box-sizing: border-box !important;
                page-break-after: avoid;
              }
            }
            #bill-pdf-content { display: block !important; position: static !important; }
          </style>
        </head>
        <body style="background: white; margin: 0;">
          <div id="bill-pdf-content">
            ${element.innerHTML}
          </div>
          <script>
            window.onload = () => {
              window.print();
              setTimeout(() => window.close(), 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Billing Center</h2>
          <p className="text-gray-500 font-body">Create invoices and manage customer bills</p>
        </div>
        <button onClick={() => setIsScanning(true)} className="flex items-center gap-3 bg-primary text-white px-6 py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all active:scale-95">
          <Scan className="w-5 h-5" />
          <span>Launch Scanner</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Items Selection */}
        <div className="lg:col-span-7 space-y-6">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
            <input 
              type="text"
              placeholder="Start typing product name to add..."
              className="w-full bg-white border-2 border-transparent shadow-premium rounded-2xl py-5 pl-12 pr-4 outline-none focus:border-primary/20 transition-all font-body text-lg"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setShowSearchResults(true); }}
              onFocus={() => searchTerm && setShowSearchResults(true)}
            />
            {showSearchResults && searchTerm && (
              <div className="absolute top-20 left-0 right-0 bg-white rounded-3xl shadow-2xl border border-gray-100 z-50 overflow-hidden divide-y divide-gray-50 animate-slide-up">
                {allProducts.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 6).map(p => (
                  <button key={p.id} onClick={() => addItem(p, p.id)} className="w-full p-5 text-left hover:bg-gray-50 flex justify-between items-center group">
                    <div>
                      <div className="font-bold text-gray-800 transition-colors group-hover:text-primary">{p.name}</div>
                      <div className="text-xs text-gray-400 font-mono mt-0.5">{p.id}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">₹{p.price}</div>
                      <div className="text-[10px] text-gray-400">{p.taxPct}% GST</div>
                    </div>
                  </button>
                ))}
                <button onClick={() => { setShowProductForm(true); setScannedBarcode(searchTerm); }} className="w-full p-4 bg-gray-50/50 text-center text-primary font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                   <Plus className="w-4 h-4" /> Add "{searchTerm}" as new product
                </button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl shadow-premium border border-gray-100 overflow-hidden min-h-[400px]">
             <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                   <Package className="w-5 h-5 text-primary" />
                   Active Bill Items ({items.length})
                </h3>
             </div>
             <div className="divide-y divide-gray-50">
               {items.length === 0 ? (
                 <div className="p-20 text-center text-gray-300">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                       <Plus className="w-8 h-8" />
                    </div>
                    <p className="font-body text-gray-400">Your bill is empty. Search above or scan to add items.</p>
                 </div>
               ) : items.map((item) => (
                 <div key={item.barcode} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                    <div className="flex-1">
                       <h4 className="font-bold text-gray-800 text-lg leading-tight">{item.name}</h4>
                       <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-sm font-bold text-primary">₹{item.price}</span>
                          <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-500">{item.taxPct}% GST</span>
                       </div>
                    </div>
                    <div className="flex items-center gap-6">
                       <div className="flex items-center gap-3 bg-white shadow-sm border border-gray-100 rounded-xl p-1.5 transition-all group-hover:border-primary/20">
                          <button onClick={() => updateQty(item.barcode, -1)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-primary hover:bg-primary/5 transition-all"><Minus className="w-4 h-4" /></button>
                          <span className="font-bold text-gray-700 w-6 text-center">{item.qty}</span>
                          <button onClick={() => updateQty(item.barcode, 1)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-primary hover:bg-primary/5 transition-all"><Plus className="w-4 h-4" /></button>
                       </div>
                       <button onClick={() => removeItem(item.barcode)} className="p-2 text-gray-900 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 className="w-5 h-5" /></button>
                    </div>
                 </div>
               ))}
             </div>
          </div>
        </div>

        {/* Right Column: Customer & Summary */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-4 max-h-fit lg:max-h-[calc(100vh-120px)] overflow-y-auto pr-2 custom-scrollbar">
           <div className="bg-white p-5 rounded-3xl shadow-premium border border-gray-100 space-y-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                 <User className="w-5 h-5 text-primary" />
                 Customer Information
              </h3>
              <div className="space-y-4">
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Full Name</label>
                    <input type="text" placeholder="John Doe" className="w-full bg-gray-50 border-none rounded-2xl py-4 px-5 text-sm font-medium focus:ring-2 ring-primary/20 transition-all" value={customerName} onChange={e => setCustomerName(e.target.value)} />
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">WhatsApp Number</label>
                    <div className="relative">
                       <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">+91</span>
                       <input type="tel" maxLength="10" placeholder="9876543210" className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-14 pr-5 text-sm font-medium focus:ring-2 ring-primary/20 transition-all" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} />
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-emerald-900 rounded-[32px] p-6 text-white shadow-2xl shadow-emerald-900/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                 <Calculator className="w-40 h-40" />
              </div>
              <div className="space-y-4 relative z-10">
                 <div className="flex justify-between items-center text-emerald-300 font-medium">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between items-center text-emerald-300 font-medium">
                    <span>GST (CGST + SGST)</span>
                    <span>₹{totalGst.toFixed(2)}</span>
                 </div>
                 <div className="h-px bg-emerald-800/50 my-2"></div>
                 <div className="flex justify-between items-end">
                    <div>
                       <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.2em] mb-1">Payable Amount</div>
                       <div className="text-4xl font-black">₹{grandTotal.toFixed(2)}</div>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-3 pt-2">
                    <button onClick={downloadPDF} disabled={items.length === 0} className="bg-white/10 hover:bg-white/20 text-white rounded-2xl p-4 font-bold flex items-center justify-center gap-2 border border-white/10 transition-all active:scale-95 disabled:opacity-30">
                       <Printer className="w-5 h-5" />
                       PDF
                    </button>
                    <button onClick={saveBill} disabled={items.length === 0 || loading} className="bg-accent hover:bg-accent-dark text-white rounded-2xl p-4 font-black flex items-center justify-center gap-2 shadow-xl shadow-accent/20 transition-all active:scale-95 disabled:opacity-30">
                       {loading ? 'WAIT...' : (
                         <>
                           <Send className="w-5 h-5" />
                           SAVE & SEND
                         </>
                       )}
                    </button>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Modals & Portal Overlays */}
      {isScanning && createPortal(
         <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6">
           <button onClick={() => setIsScanning(false)} className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors bg-white/10 p-4 rounded-full"><X className="w-8 h-8" /></button>
           <div className="w-full max-w-lg aspect-square rounded-3xl overflow-hidden border-4 border-primary/50 relative shadow-2xl shadow-primary/20">
              <div id="reader" className="w-full h-full"></div>
              <div className="absolute inset-x-0 bottom-0 py-6 bg-black/50 text-white text-center text-sm font-medium backdrop-blur-sm">Align Barcode within Frame</div>
           </div>
         </div>, document.body )}

      {showProductForm && createPortal(
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6">
           <div className="bg-white p-10 rounded-[40px] shadow-2xl w-full max-w-lg animate-slide-up">
              <div className="flex justify-between items-start mb-8">
                 <div>
                    <h3 className="text-2xl font-bold text-gray-900">New Product Detected</h3>
                    <p className="text-gray-400 font-mono text-sm mt-1">Barcode: {scannedBarcode}</p>
                 </div>
                 <button onClick={() => setShowProductForm(false)} className="p-2 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors"><X className="w-6 h-6 text-gray-400" /></button>
              </div>
              <ProductForm barcode={scannedBarcode} onSuccess={(p) => { addItem(p, scannedBarcode); setShowProductForm(false); }} onCancel={() => setShowProductForm(false)} />
           </div>
        </div>, document.body )}

      {success && createPortal(
         <div className="fixed inset-0 z-[200] bg-primary flex flex-col items-center justify-center text-white p-12 text-center animate-fade-in">
            <div className="bg-white/20 p-8 rounded-[40px] mb-8 animate-bounce">
               <CheckCircle2 className="w-24 h-24" />
            </div>
            <h2 className="text-4xl font-black mb-2 tracking-tight">BILL COMPLETED!</h2>
            <p className="text-lg opacity-80 font-medium">Invoice saved and shared with {customerName || 'customer'}</p>
         </div>, document.body )}

      <div id="bill-pdf-content" style={{ display: 'none', backgroundColor: '#ffffff', color: '#111827' }} className="fixed -left-[9999px] top-0 p-16 w-[210mm] font-body">
         {/* PDF Template stays similar but wider */}
          <div style={{ borderBottom: '4px solid #10B981' }} className="flex justify-between items-start pb-10 mb-10">
             <div>
                <h1 style={{ color: '#111827' }} className="text-3xl font-black tracking-tighter">{profile?.shopName}</h1>
                <p style={{ color: '#6B7280' }} className="mt-2 text-sm font-medium tracking-wide">GSTIN: {profile?.gstNumber || 'NOT PROVIDED'}</p>
             </div>
             <div className="text-right">
                <div style={{ backgroundColor: '#111827', color: '#ffffff' }} className="px-5 py-2 rounded-xl font-bold text-xs uppercase tracking-widest inline-block mb-3 italic">TAX INVOICE</div>
                <div style={{ color: '#6B7280' }} className="text-sm font-bold">DATE: {new Date().toLocaleDateString('en-IN')}</div>
                <div style={{ color: '#10B981' }} className="font-black text-lg mt-1"><span className="text-[10px] text-gray-400 font-medium">BILL NO.</span> {items.length > 0 ? `#${(profile?.billCount || 0) + 1}` : 'PROFORMA'}</div>
             </div>
          </div>
          <div className="grid grid-cols-2 mb-16 gap-20">
             <div>
                <p style={{ color: '#9CA3AF' }} className="font-black uppercase text-xs tracking-[0.2em] mb-3">BILL TO</p>
                <div style={{ color: '#111827' }} className="text-3xl font-bold">{customerName || 'Walk-in Customer'}</div>
                <div style={{ color: '#6B7280' }} className="text-xl mt-1">{customerPhone || 'Direct Sale'}</div>
             </div>
          </div>
          <table className="w-full mb-16">
             <thead style={{ backgroundColor: '#F9FAFB' }}>
                <tr className="text-left">
                   <th style={{ color: '#9CA3AF' }} className="p-5 uppercase text-xs tracking-widest font-black">Item Description</th>
                   <th style={{ color: '#9CA3AF' }} className="p-5 uppercase text-xs tracking-widest font-black">Qty</th>
                   <th style={{ color: '#9CA3AF' }} className="p-5 uppercase text-xs tracking-widest font-black">Price</th>
                   <th style={{ color: '#9CA3AF' }} className="p-5 uppercase text-xs tracking-widest font-black text-right">Total</th>
                </tr>
             </thead>
             <tbody style={{ borderTop: '1px solid #F3F4F6' }} className="italic">
                {items.map(item => (
                  <tr key={item.barcode} style={{ borderBottom: '1px solid #F3F4F6' }}>
                     <td style={{ color: '#111827' }} className="p-5 font-bold">{item.name}</td>
                     <td className="p-5 font-bold">{item.qty}</td>
                     <td className="p-5 font-medium">₹{item.price.toFixed(2)}</td>
                     <td style={{ color: '#111827' }} className="p-5 font-black text-right">₹{(item.price * item.qty).toFixed(2)}</td>
                  </tr>
                ))}
             </tbody>
          </table>
          <div className="w-full max-w-xs ml-auto space-y-4">
             <div style={{ color: '#6B7280' }} className="flex justify-between font-medium">
                <span>Sub-Total</span>
                <span>₹{subtotal.toFixed(2)}</span>
             </div>
             <div style={{ color: '#6B7280', borderBottom: '1px solid #F3F4F6' }} className="flex justify-between font-medium pb-4">
                <span>Total GST</span>
                <span>₹{totalGst.toFixed(2)}</span>
             </div>
             <div style={{ color: '#111827' }} className="flex justify-between text-3xl font-black pt-2">
                <span>GRAND TOTAL</span>
                <span>₹{grandTotal.toFixed(2)}</span>
             </div>
          </div>
          <div style={{ marginTop: '160px', paddingTop: '40px', borderTop: '1px solid #F3F4F6' }} className="text-center">
             <p style={{ color: '#9CA3AF' }} className="font-medium tracking-wide">Thank you for your business! Visit us again soon.</p>
             <p style={{ color: '#D1D5DB' }} className="text-[10px] uppercase font-black tracking-[0.3em] mt-4 italic">Digitally Generated by LekkaFlow Terminal</p>
          </div>
      </div>
    </div>
  );
};

const ProductForm = ({ barcode, onSuccess, onCancel }) => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [taxPct, setTaxPct] = useState('18');
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    if (barcode) {
      fetchGlobalDetails();
    }
  }, [barcode]);

  const fetchGlobalDetails = async () => {
    setIsFetching(true);
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      const data = await response.json();
      if (data.status === 1 && data.product) {
        setName(data.product.product_name || data.product.product_name_en || '');
      }
    } catch (err) {
      console.warn('Global lookup failed:', err);
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const product = { name, price: parseFloat(price), taxPct: parseInt(taxPct), createdAt: serverTimestamp() };
      await setDoc(doc(db, 'users', user.uid, 'products', barcode), product);
      onSuccess(product);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] pl-1 flex justify-between items-center">
          Product Details
          {isFetching && <span className="text-primary animate-pulse normal-case font-bold">Searching Global Database...</span>}
        </label>
        <div className="relative">
          <input 
            autoFocus 
            required 
            placeholder={isFetching ? "Searching..." : "Product Title"} 
            className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-5 px-6 outline-none focus:border-primary transition-all font-bold text-lg shadow-sm" 
            value={name} 
            onChange={e => setName(e.target.value)} 
          />
          {name && !isFetching && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-[10px] font-black uppercase">
              Found
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] pl-1">Unit Price (₹)</label>
          <input type="number" step="0.01" required placeholder="0.00" className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-5 px-6 outline-none focus:border-primary transition-all font-bold text-lg shadow-sm" value={price} onChange={e => setPrice(e.target.value)} />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] pl-1">GST Segment (%)</label>
          <select className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-5 px-6 outline-none focus:border-primary transition-all font-bold text-lg shadow-sm appearance-none" value={taxPct} onChange={e => setTaxPct(e.target.value)}>
            {[0, 5, 12, 18, 28].map(v => <option key={v} value={v}>{v}% GST</option>)}
          </select>
        </div>
      </div>
      <div className="flex gap-4 pt-6">
        <button type="button" onClick={onCancel} className="flex-1 py-5 font-bold text-gray-400 hover:text-gray-600 transition-colors">Discard</button>
        <button type="submit" disabled={loading || isFetching} className="flex-[2] bg-primary text-white py-5 rounded-2xl font-black shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all active:scale-95 disabled:opacity-50">
          {loading ? 'STORING...' : 'REGISTER PRODUCT'}
        </button>
      </div>
    </form>
  )
}

export default Bill;
