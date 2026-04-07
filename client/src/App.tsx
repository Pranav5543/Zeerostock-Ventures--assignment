import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  Search, 
  Package, 
  Truck, 
  LayoutDashboard, 
  ChevronRight, 
  Filter, 
  MapPin, 
  AlertCircle,
  X,
  Plus,
  ArrowLeft,
  Settings,
  ShieldCheck,
  Zap,
  CheckCircle
} from 'lucide-react';

const API_BASE = '/api';

type InventoryItem = {
  id: number;
  supplier_id: number;
  product_name: string;
  category: string;
  quantity: number;
  price: number;
};

type SupplierGroup = {
  supplier_id: number;
  supplier_name: string;
  supplier_city: string;
  products: string[];
  total_inventory_value: number;
};

const getImageForProduct = (productName: string) => {
  const map: Record<string, string> = {
    'Wind Turbine Blade VX-1': 'wind Turbine Blade.png',
    'Solar Panel High-Efficiency': 'solar panel high-Efficiency.png',
    'Heavy-Duty Gas Turbine': 'Heavy-Duty Gas Turbine.png',
    'Turbine Bearing Set': 'Turbine Bearing set.png',
    'Control Panel V4': 'Control Panel.png',
    'Backup Generator 50kW': 'Back generator.png',
    'Hydro-Pump Assembly': 'hydro pump assemble.png',
    'Inverter Pro 5000': 'inventor pro 5000.png',
    'Emergency Stop Switch': 'emergency stop.png',
    'Voltage Regulator Auto': 'volatage gegulator.png',
    'Transmission Gearbox Z2': 'Transmission Gearbox Z2.png'
  };
  return `/${map[productName] || 'futuristic-time-machine.jpg'}`;
};

function App() {
  const [activeTab, setActiveTab] = useState<'search' | 'suppliers' | 'dashboard'>('search');
  const [selectedProduct, setSelectedProduct] = useState<InventoryItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [results, setResults] = useState<InventoryItem[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New Entry Modal State
  const [showModal, setShowModal] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [newEntry, setNewEntry] = useState({
    supplier_id: 1,
    product_name: '',
    category: 'Turbines',
    quantity: 1,
    price: 100
  });

  const handleAddEntry = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/inventory`, newEntry);
      setShowModal(false);
      setNewEntry({ supplier_id: 1, product_name: '', category: 'Turbines', quantity: 1, price: 100 });
      fetchSearchResults();
      if (activeTab === 'suppliers') fetchSuppliers();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add entry');
    } finally {
      setLoading(false);
    }
  };

  // Assignment A: Fetch Search Results
  const fetchSearchResults = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE}/search`, {
        params: {
          q: searchQuery,
          category: category,
          minPrice: minPrice || undefined,
          maxPrice: maxPrice || undefined
        }
      });
      setResults(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch results');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, category, minPrice, maxPrice]);

  // Assignment B: Fetch Grouped Suppliers
  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/inventory`);
      setSuppliers(response.data);
    } catch (err: any) {
      setError('Failed to fetch supplier distribution');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'search') fetchSearchResults();
    if (activeTab === 'suppliers') fetchSuppliers();
  }, [activeTab, fetchSearchResults, fetchSuppliers]);

  // Handle Tab Switch
  const handleTabChange = (tab: any) => {
    setActiveTab(tab);
    setSelectedProduct(null); // Reset detail view on tab change
  };

  return (
    <div className="layout-wrapper">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-icon">Z</div>
          <span className="logo-text">ZEEROSTOCK</span>
        </div>
        
        <nav className="nav-list">
          {[
            { id: 'search', icon: Search, label: 'Inventory Search' },
            { id: 'suppliers', icon: Truck, label: 'Supplier Distribution' },
            { id: 'dashboard', icon: LayoutDashboard, label: 'Overview' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>


      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Topbar */}
        <header className="top-header">
          <div className="breadcrumb">
            Pages / <span>{activeTab}</span> {selectedProduct && `/ ${selectedProduct.product_name}`}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ position: 'relative' }}>
              <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={16} />
              <input 
                type="text" 
                placeholder="Global Search..." 
                className="styled-input"
                style={{ borderRadius: '20px', paddingLeft: '36px', width: '220px' }}
              />
            </div>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(45deg, #fbbf24, #d97706)' }}></div>
          </div>
        </header>

        {/* Dynamic Content View */}
        <div className="scroll-area">
          {activeTab === 'search' && !selectedProduct && (
            <div className="animate-fade">
              <div className="view-header">
                <div>
                  <h1 className="view-title">Inventory Search</h1>
                  <p className="view-subtitle">Find surplus stock across all global suppliers.</p>
                </div>
                <button className="btn-primary" onClick={() => setShowModal(true)}>
                  <Plus size={18} /> New Entry
                </button>
              </div>

              {/* Filters */}
              <div className="glass-panel filters-grid">
                <div className="input-group">
                  <label className="input-label">Product Name</label>
                  <input 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="E.g. Turbine, Inverter..." 
                    className="styled-input"
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Category</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="styled-select"
                  >
                    <option value="">All Categories</option>
                    <option value="Turbines">Turbines</option>
                    <option value="Solar">Solar</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Electronics">Electronics</option>
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Min Price</label>
                  <input 
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="styled-input"
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Max Price</label>
                  <input 
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="styled-input"
                  />
                </div>
                <button 
                  onClick={() => {
                    setSearchQuery('');
                    setCategory('');
                    setMinPrice('');
                    setMaxPrice('');
                  }}
                  className="icon-button"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Status Display */}
              {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#f87171', background: 'rgba(248, 113, 113, 0.1)', padding: '16px', borderRadius: '12px', marginBottom: '32px' }}>
                  <AlertCircle size={20} /> {error}
                </div>
              )}

              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
                  <div style={{ width: '40px', height: '40px', border: '3px solid var(--accent-primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
              ) : results.length > 0 ? (
                <div className="inventory-grid">
                  {results.map((item) => (
                    <div key={item.id} className="glass-panel card">
                      <div className="card-top">
                        <div className="card-price">${item.price.toLocaleString()}</div>
                      </div>

                      {/* Image Asset injected here */}
                      <div style={{ height: '180px', marginBottom: '16px', borderRadius: '8px', overflow: 'hidden' }}>
                        <img src={getImageForProduct(item.product_name)} alt={item.product_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>

                      <h3 className="card-title">{item.product_name}</h3>
                      <p className="card-category">{item.category}</p>
                      
                      <div className="card-footer">
                        <div className="stock-info">Available: <span className="stock-value">{item.quantity} Unit</span></div>
                        <button className="btn-link" onClick={() => {
                            setSelectedProduct(item);
                            setOrderQuantity(Math.min(1, item.quantity));
                        }}>
                          Details <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '100px 0', border: '1px dashed var(--border-color)', borderRadius: '24px' }}>
                  <Package size={64} style={{ color: 'var(--text-muted)', marginBottom: '20px' }} />
                  <h3 style={{ fontSize: '20px', fontWeight: '600' }}>Results set to zero</h3>
                  <p style={{ color: 'var(--text-muted)' }}>No matches found for the current filter criteria.</p>
                </div>
              )}
            </div>
          )}

          {/* Assignment B: Supplier Distribution Tab */}
          {activeTab === 'suppliers' && (
            <div className="animate-fade">
              <div className="view-header">
                <div>
                  <h1 className="view-title">Supplier Distribution</h1>
                  <p className="view-subtitle">Grouped inventory valuation and performance.</p>
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {suppliers.map((supplier) => (
                  <div key={supplier.supplier_id} className="glass-panel" style={{ overflow: 'hidden' }}>
                    <div style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ width: '56px', height: '56px', backgroundColor: 'rgba(251, 191, 36, 0.1)', color: 'var(--accent-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Truck size={28} />
                        </div>
                        <div>
                          <h3 style={{ fontSize: '20px', fontWeight: '700' }}>{supplier.supplier_name}</h3>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--text-muted)' }}>
                            <MapPin size={12} /> {supplier.supplier_city}
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '1px', marginBottom: '4px' }}>Net Portfolio Value</div>
                        <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--accent-primary)' }}>${supplier.total_inventory_value.toLocaleString()}</div>
                      </div>
                    </div>
                    <div style={{ padding: '24px', borderTop: '1px solid var(--border-color)' }}>
                      <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '1px', marginBottom: '12px' }}>Inventory Items</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {supplier.products.map((p, idx) => (
                          <span key={idx} style={{ padding: '6px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '20px', fontSize: '12px', fontWeight: '500' }}>
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Product Detail View (Stitch Inspired) */}
          {selectedProduct && activeTab === 'search' && (
            <div className="animate-fade">
              <button 
                onClick={() => setSelectedProduct(null)}
                className="btn-link" 
                style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <ArrowLeft size={18} /> Back to Results
              </button>

              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '40px' }}>
                {/* Image Stage */}
                <div className="glass-panel" style={{ height: '600px', padding: 0, overflow: 'hidden', display: 'flex' }}>
                    <img src={getImageForProduct(selectedProduct.product_name)} alt={selectedProduct.product_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>

                {/* Specs and Logic */}
                <div className="animate-fade" style={{ animationDelay: '0.1s' }}>
                    <div className="id-badge" style={{ marginBottom: '16px', display: 'inline-block' }}>{selectedProduct.category.toUpperCase()} // REF-{selectedProduct.id}</div>
                    <h1 className="view-title" style={{ fontSize: '48px', lineHeight: 1.1, marginBottom: '24px' }}>{selectedProduct.product_name}</h1>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '32px', marginBottom: '40px' }}>
                        <div style={{ fontSize: '36px', fontWeight: '800', color: 'var(--accent-primary)' }}>${selectedProduct.price.toLocaleString()}</div>
                        <div style={{ height: '40px', width: '1px', backgroundColor: 'var(--border-color)' }}></div>
                        <div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>In Stock</div>
                            <div style={{ fontSize: '20px', fontWeight: '700' }}>{selectedProduct.quantity} Units</div>
                        </div>
                    </div>

                    <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <div style={{ color: 'var(--accent-primary)' }}><Settings size={24} /></div>
                            <div>
                                <h4 style={{ fontWeight: '600' }}>Technical Specification</h4>
                                <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>High-fidelity {selectedProduct.category.toLowerCase()} component optimized for heavy-load industrial surplus usage.</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <div style={{ color: 'var(--accent-primary)' }}><ShieldCheck size={24} /></div>
                            <div>
                                <h4 style={{ fontWeight: '600' }}>Verified Supplier</h4>
                                <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Sourced from premium surplus partners with verified maintenance logs.</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <div style={{ color: 'var(--accent-primary)' }}><Zap size={24} /></div>
                            <div>
                                <h4 style={{ fontWeight: '600' }}>Ready for Dispatch</h4>
                                <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Immediate availability for cross-supplier distribution and assembly.</p>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '40px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid var(--border-color)', padding: '4px' }}>
                            <button onClick={() => setOrderQuantity(Math.max(1, orderQuantity - 1))} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', width: '40px', height: '40px', cursor: 'pointer', fontSize: '20px' }}>-</button>
                            <input type="number" value={orderQuantity} readOnly style={{ width: '50px', background: 'transparent', border: 'none', color: 'var(--text-primary)', textAlign: 'center', fontSize: '18px', fontWeight: '700' }} />
                            <button onClick={() => setOrderQuantity(Math.min(selectedProduct.quantity, orderQuantity + 1))} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', width: '40px', height: '40px', cursor: 'pointer', fontSize: '20px' }}>+</button>
                        </div>
                        <button onClick={() => {
                            setOrderSuccess(true);
                            setTimeout(() => setOrderSuccess(false), 3000);
                        }} className="btn-primary" style={{ flex: 1, padding: '18px', justifyContent: 'center' }}>
                            Place Order for {orderQuantity} Unit{orderQuantity !== 1 ? 's' : ''}
                        </button>
                    </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div className="animate-fade">
              <div className="view-header">
                <div>
                  <h1 className="view-title">System Overview</h1>
                  <p className="view-subtitle">Real-time metrics for your entire inventory portfolio.</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '40px' }}>
                <div className="glass-panel" style={{ padding: '32px' }}>
                  <div className="id-badge" style={{ marginBottom: '16px', display: 'inline-block' }}>TOTAL SUPPLIERS</div>
                  <div style={{ fontSize: '48px', fontWeight: '800', color: 'var(--text-primary)' }}>
                    {suppliers.length}
                  </div>
                </div>
                <div className="glass-panel" style={{ padding: '32px' }}>
                  <div className="id-badge" style={{ marginBottom: '16px', display: 'inline-block' }}>NET PORTFOLIO VALUE</div>
                  <div style={{ fontSize: '48px', fontWeight: '800', color: 'var(--accent-primary)' }}>
                    ${suppliers.reduce((acc, s) => acc + s.total_inventory_value, 0).toLocaleString()}
                  </div>
                </div>
                <div className="glass-panel" style={{ padding: '32px' }}>
                  <div className="id-badge" style={{ marginBottom: '16px', display: 'inline-block' }}>UNIQUE ASSETS</div>
                  <div style={{ fontSize: '48px', fontWeight: '800', color: 'var(--text-primary)' }}>
                    {suppliers.reduce((acc, s) => acc + s.products.length, 0)}
                  </div>
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '32px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px' }}>Top Performing Supplier</h3>
                  {suppliers.length > 0 ? (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                      <div>
                        <div style={{ fontSize: '24px', fontWeight: '800' }}>{suppliers[0].supplier_name}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Holding {suppliers[0].products.length} distinct product lines in {suppliers[0].supplier_city}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '32px', color: 'var(--accent-primary)', fontWeight: '800' }}>${suppliers[0].total_inventory_value.toLocaleString()}</div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ color: 'var(--text-muted)' }}>No supplier data available.</div>
                  )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* New Entry Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }}>
          <div className="glass-panel animate-fade" style={{ width: '500px', padding: '40px', position: 'relative', border: '1px solid var(--accent-primary)' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', right: '24px', top: '24px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={24} /></button>
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>Add New Asset</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Insert a new item directly into the active database.</p>
            
            <form onSubmit={handleAddEntry} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="input-group">
                <label className="input-label">Product Name</label>
                <input required value={newEntry.product_name} onChange={e => setNewEntry({...newEntry, product_name: e.target.value})} className="styled-input" placeholder="e.g. Servo Motor v2" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="input-group">
                  <label className="input-label">Category</label>
                  <select value={newEntry.category} onChange={e => setNewEntry({...newEntry, category: e.target.value})} className="styled-select">
                    <option style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Turbines</option>
                    <option style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Solar</option>
                    <option style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Maintenance</option>
                    <option style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Electronics</option>
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Supplier ID</label>
                  <input type="number" min="1" required value={newEntry.supplier_id} onChange={e => setNewEntry({...newEntry, supplier_id: Number(e.target.value)})} className="styled-input" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="input-group">
                  <label className="input-label">Quantity</label>
                  <input type="number" min="0" required value={newEntry.quantity} onChange={e => setNewEntry({...newEntry, quantity: Number(e.target.value)})} className="styled-input" />
                </div>
                <div className="input-group">
                  <label className="input-label">Base Price ($)</label>
                  <input type="number" min="1" required value={newEntry.price} onChange={e => setNewEntry({...newEntry, price: Number(e.target.value)})} className="styled-input" />
                </div>
              </div>
              <button type="submit" className="btn-primary" style={{ marginTop: '16px', justifyContent: 'center' }}>
                Commit to Database <Plus size={18} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {orderSuccess && (
        <div className="animate-fade" style={{ position: 'fixed', bottom: '32px', right: '32px', backgroundColor: 'var(--accent-primary)', color: '#000', padding: '16px 24px', borderRadius: '8px', zIndex: 10000, display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '600', boxShadow: '0 10px 25px rgba(251, 191, 36, 0.3)' }}>
          <CheckCircle size={20} />
          {selectedProduct && `Order placed for ${orderQuantity} units of ${selectedProduct.product_name}!`}
        </div>
      )}
    </div>
  );
}

export default App;
