import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db, collection, query, orderBy, onSnapshot, doc, deleteDoc } from '../utils/firebase';
import { Search, Plus, Trash2, Package, Tag, MoreVertical } from 'lucide-react';

const Products = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'users', user.uid, 'products'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user.uid]);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.id.includes(searchTerm)
  );

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'products', id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Products</h2>
          <p className="text-gray-500 text-sm font-body">{products.length} items in inventory</p>
        </div>
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
           <Package className="w-5 h-5" />
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input 
          type="text" 
          placeholder="Search product or scan barcode..."
          className="w-full bg-white border-none shadow-sm rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-1 ring-primary/20 transition-all font-body text-gray-800"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-3">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="h-24 skeleton rounded-2xl w-full"></div>)
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
             <Tag className="w-12 h-12 mx-auto mb-4 opacity-20" />
             <p className="font-body">No products found</p>
          </div>
        ) : (
          filteredProducts.map(product => (
            <div key={product.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                    <Package className="w-6 h-6" />
                 </div>
                 <div>
                    <h4 className="font-bold text-gray-800 leading-tight">{product.name}</h4>
                    <p className="text-[10px] text-gray-400 font-mono mt-0.5 uppercase tracking-wider">{product.id}</p>
                 </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="font-bold text-gray-900 leading-tight">₹{product.price}</div>
                  <div className="text-[10px] text-primary font-bold">{product.taxPct}% GST</div>
                </div>
                <button onClick={() => handleDelete(product.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                   <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Products;
