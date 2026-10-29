import React, { useState } from 'react';
import { useCanteen } from '../context/CanteenContext';
import type { MenuItem } from '../context/CanteenContext';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  DollarSign, 
  ShoppingBag, 
  CheckCircle, 
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Sliders,
  FileText
} from 'lucide-react';

export const AdminApp: React.FC = () => {
  const {
    menuItems,
    orders,
    payments,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    resetDatabase
  } = useCanteen();

  // Local Form states for Menu CRUD
  const [isEditing, setIsEditing] = useState<string | null>(null); // itemId if editing
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formCategory, setFormCategory] = useState('Snacks');
  const [formImage, setFormImage] = useState('');
  const [formIsVeg, setFormIsVeg] = useState(true);
  const [formDesc, setFormDesc] = useState('');

  // Active View Tab
  const [adminTab, setAdminTab] = useState<'analytics' | 'menu' | 'sales'>('analytics');

  // Math Statistics
  const totalRevenue = payments
    .filter(p => p.status === 'SUCCESS')
    .reduce((sum, p) => sum + p.amount, 0);

  const completedCount = orders.filter(o => o.orderStatus === 'Completed').length;
  const pendingCount = orders.filter(o => ['Pending', 'Received', 'Preparing', 'Ready'].includes(o.orderStatus)).length;
  const outOfStockCount = menuItems.filter(m => !m.availability).length;

  const popularItemName = () => {
    if (orders.length === 0) return 'None';
    const itemCounts: { [name: string]: number } = {};
    orders.forEach(o => {
      o.items.forEach(it => {
        itemCounts[it.menuItem.name] = (itemCounts[it.menuItem.name] || 0) + it.quantity;
      });
    });
    const sorted = Object.entries(itemCounts).sort((a, b) => b[1] - a[1]);
    return sorted.length > 0 ? `${sorted[0][0]} (${sorted[0][1]} sold)` : 'None';
  };

  // Submit Menu Form
  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formPrice) return;

    const priceNum = parseFloat(formPrice);
    if (isNaN(priceNum)) return;

    // Use default image if none specified
    const imageUrl = formImage || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80';

    if (isEditing) {
      const original = menuItems.find(m => m.id === isEditing);
      if (original) {
        updateMenuItem({
          ...original,
          name: formName,
          price: priceNum,
          category: formCategory,
          image: imageUrl,
          isVeg: formIsVeg,
          description: formDesc
        });
      }
      setIsEditing(null);
    } else {
      addMenuItem({
        name: formName,
        price: priceNum,
        category: formCategory,
        image: imageUrl,
        availability: true,
        isVeg: formIsVeg,
        description: formDesc
      });
    }

    // Reset Form
    setFormName('');
    setFormPrice('');
    setFormImage('');
    setFormIsVeg(true);
    setFormDesc('');
  };

  // Trigger editing fill
  const startEdit = (item: MenuItem) => {
    setIsEditing(item.id);
    setFormName(item.name);
    setFormPrice(item.price.toString());
    setFormCategory(item.category);
    setFormImage(item.image);
    setFormIsVeg(item.isVeg);
    setFormDesc(item.description);
    setAdminTab('menu'); // focus menu form
  };

  const cancelEdit = () => {
    setIsEditing(null);
    setFormName('');
    setFormPrice('');
    setFormImage('');
    setFormIsVeg(true);
    setFormDesc('');
  };

  return (
    <div className="admin-panel">
      
      {/* Admin header */}
      <div className="admin-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sliders size={20} color="var(--primary)" />
          <h2 style={{ fontSize: '16px', color: 'white' }}>QuickBite Admin Control</h2>
        </div>
        <button 
          className="control-btn" 
          onClick={resetDatabase}
          style={{ fontSize: '11px', padding: '6px 10px', background: '#334155', border: '1px solid #475569' }}
        >
          <RotateCcw size={12} /> Reset Database
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #334155', background: '#111827', padding: '4px 8px 0' }}>
        <button 
          onClick={() => setAdminTab('analytics')}
          style={{ 
            background: adminTab === 'analytics' ? '#1E293B' : 'transparent',
            color: adminTab === 'analytics' ? 'white' : '#94A3B8',
            border: 'none', borderBottom: adminTab === 'analytics' ? '2px solid var(--primary)' : 'none',
            padding: '8px 16px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', borderTopLeftRadius: '6px', borderTopRightRadius: '6px'
          }}
        >
          Dashboard
        </button>
        <button 
          onClick={() => setAdminTab('menu')}
          style={{ 
            background: adminTab === 'menu' ? '#1E293B' : 'transparent',
            color: adminTab === 'menu' ? 'white' : '#94A3B8',
            border: 'none', borderBottom: adminTab === 'menu' ? '2px solid var(--primary)' : 'none',
            padding: '8px 16px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', borderTopLeftRadius: '6px', borderTopRightRadius: '6px'
          }}
        >
          Manage Menu ({menuItems.length})
        </button>
        <button 
          onClick={() => setAdminTab('sales')}
          style={{ 
            background: adminTab === 'sales' ? '#1E293B' : 'transparent',
            color: adminTab === 'sales' ? 'white' : '#94A3B8',
            border: 'none', borderBottom: adminTab === 'sales' ? '2px solid var(--primary)' : 'none',
            padding: '8px 16px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', borderTopLeftRadius: '6px', borderTopRightRadius: '6px'
          }}
        >
          Sales Logs ({payments.length})
        </button>
      </div>

      <div className="admin-content">
        
        {/* VIEW 1: ANALYTICS DASHBOARD */}
        {adminTab === 'analytics' && (
          <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Stat Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              
              <div style={{ background: '#0F172A', border: '1px solid #334155', borderRadius: '12px', padding: '14px' }}>
                <span style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 600 }}>TOTAL REVENUE</span>
                <h3 style={{ fontSize: '20px', color: '#10B981', fontWeight: 800, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <DollarSign size={18} /> ₹{totalRevenue}
                </h3>
              </div>

              <div style={{ background: '#0F172A', border: '1px solid #334155', borderRadius: '12px', padding: '14px' }}>
                <span style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 600 }}>COMPLETED ORDERS</span>
                <h3 style={{ fontSize: '20px', color: 'white', fontWeight: 800, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle size={18} color="var(--success)" /> {completedCount}
                </h3>
              </div>

              <div style={{ background: '#0F172A', border: '1px solid #334155', borderRadius: '12px', padding: '14px' }}>
                <span style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 600 }}>ACTIVE COOKING QUEUE</span>
                <h3 style={{ fontSize: '20px', color: '#F59E0B', fontWeight: 800, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShoppingBag size={18} color="#F59E0B" /> {pendingCount}
                </h3>
              </div>

              <div style={{ background: '#0F172A', border: '1px solid #334155', borderRadius: '12px', padding: '14px' }}>
                <span style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 600 }}>OUT OF STOCK ITEMS</span>
                <h3 style={{ fontSize: '20px', color: outOfStockCount > 0 ? '#EF4444' : '#94A3B8', fontWeight: 800, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertTriangle size={18} color={outOfStockCount > 0 ? '#EF4444' : '#475569'} /> {outOfStockCount}
                </h3>
              </div>

            </div>

            {/* Popular and Insights */}
            <div style={{ background: '#111827', border: '1px solid #334155', borderRadius: '12px', padding: '14px' }}>
              <h4 style={{ fontSize: '12px', fontWeight: 800, color: 'white', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={14} color="var(--primary)" /> CANTEEN INSIGHTS
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8', borderBottom: '1px solid #1E293B', paddingBottom: '6px' }}>
                  <span>Best Selling Item:</span>
                  <strong style={{ color: 'white' }}>{popularItemName()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8', borderBottom: '1px solid #1E293B', paddingBottom: '6px' }}>
                  <span>Average Order Value:</span>
                  <strong style={{ color: 'white' }}>
                    ₹{orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8' }}>
                  <span>Total Customers Logged:</span>
                  <strong style={{ color: 'white' }}>Student Panel Active</strong>
                </div>
              </div>
            </div>

            {/* Simulated actions */}
            <div style={{ background: '#111827', border: '1px solid #334155', borderRadius: '12px', padding: '14px' }}>
              <h4 style={{ fontSize: '12px', fontWeight: 800, color: 'white', marginBottom: '8px' }}>Admin Quick Help</h4>
              <p style={{ fontSize: '11px', color: '#94A3B8', lineHeight: '14px' }}>
                Manage menu prices and inventory in the "Manage Menu" tab. Stock status toggles automatically sync with the student view. Refresh browser to clear cache if needed.
              </p>
            </div>
          </div>
        )}

        {/* VIEW 2: MANAGE MENU (CRUD) */}
        {adminTab === 'menu' && (
          <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* CRUD Form */}
            <form onSubmit={handleSaveItem} style={{ background: '#0F172A', border: '1px solid #334155', borderRadius: '12px', padding: '16px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 800, color: 'white', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Plus size={14} color="var(--primary)" /> {isEditing ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '9px' }}>Item Name</label>
                  <input type="text" className="form-input" placeholder="E.g., Onion Samosa" required value={formName} onChange={(e) => setFormName(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '9px' }}>Price (₹)</label>
                  <input type="number" className="form-input" placeholder="Price" required value={formPrice} onChange={(e) => setFormPrice(e.target.value)} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '9px' }}>Category</label>
                  <select className="form-input" style={{ appearance: 'none' }} value={formCategory} onChange={(e) => setFormCategory(e.target.value)}>
                    <option value="South Indian">South Indian</option>
                    <option value="North Indian">North Indian</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Chinese">Chinese</option>
                    <option value="Beverages">Beverages</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '9px' }}>Food Type</label>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#94A3B8', cursor: 'pointer' }}>
                      <input type="radio" checked={formIsVeg === true} onChange={() => setFormIsVeg(true)} /> Veg
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#94A3B8', cursor: 'pointer' }}>
                      <input type="radio" checked={formIsVeg === false} onChange={() => setFormIsVeg(false)} /> Non-Veg
                    </label>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '9px' }}>Image URL (Optional)</label>
                <input type="text" className="form-input" placeholder="Image URL (Unsplash/HTTP)" value={formImage} onChange={(e) => setFormImage(e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '9px' }}>Description</label>
                <textarea className="form-input" style={{ height: '48px', resize: 'none' }} placeholder="Brief detail about ingredients, serving..." value={formDesc} onChange={(e) => setFormDesc(e.target.value)} />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                {isEditing && (
                  <button type="button" className="btn btn-outline" onClick={cancelEdit} style={{ flex: 1, padding: '8px 0', fontSize: '11px', background: '#334155', color: 'white', border: 'none' }}>
                    Cancel
                  </button>
                )}
                <button type="submit" className="btn btn-orange" style={{ flex: 2, padding: '8px 0', fontSize: '11px' }}>
                  {isEditing ? 'Update Item' : 'Add Item to Menu'}
                </button>
              </div>
            </form>

            {/* Menu List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h4 style={{ fontSize: '12px', fontWeight: 800, color: 'white' }}>Current Menu Inventory</h4>
              {menuItems.map(item => (
                <div key={item.id} style={{ background: '#0F172A', border: '1px solid #334155', borderRadius: '10px', padding: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img src={item.image} alt={item.name} style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} />
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span className={item.isVeg ? 'veg-indicator' : 'non-veg-indicator'} style={{ transform: 'scale(0.8)' }}></span>
                      {item.name}
                    </div>
                    <span style={{ fontSize: '10px', color: '#94A3B8' }}>{item.category} • ₹{item.price}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {/* Availability Switch */}
                    <button 
                      onClick={() => updateMenuItem({ ...item, availability: !item.availability })}
                      style={{ 
                        border: 'none', 
                        background: item.availability ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: item.availability ? '#10B981' : '#EF4444',
                        padding: '4px 8px', borderRadius: '6px', fontSize: '9px', fontWeight: 700, cursor: 'pointer'
                      }}
                    >
                      {item.availability ? 'In Stock' : 'Out of Stock'}
                    </button>
                    
                    {/* Edit button */}
                    <button 
                      onClick={() => startEdit(item)}
                      style={{ border: 'none', background: 'transparent', color: '#94A3B8', cursor: 'pointer', padding: '4px' }}
                      title="Edit item"
                    >
                      <Edit2 size={13} />
                    </button>

                    {/* Delete button */}
                    <button 
                      onClick={() => deleteMenuItem(item.id)}
                      style={{ border: 'none', background: 'transparent', color: '#EF4444', cursor: 'pointer', padding: '4px' }}
                      title="Delete item"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* VIEW 3: SALES & TRANSACTIONS LOG */}
        {adminTab === 'sales' && (
          <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 800, color: 'white' }}>UPI Transaction Registry</h4>
            
            {payments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 10px', color: '#475569' }}>
                <FileText size={32} style={{ opacity: 0.3, marginBottom: '6px' }} />
                <p style={{ fontSize: '11px' }}>No payments logged yet.</p>
              </div>
            ) : (
              payments.map(pay => {
                const associatedOrder = orders.find(o => o.id === pay.orderId);
                return (
                  <div key={pay.id} style={{ background: '#0F172A', border: '1px solid #334155', borderRadius: '8px', padding: '10px', fontSize: '11px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <strong style={{ color: '#E2E8F0' }}>ID: {pay.upiTxnId}</strong>
                      <span style={{ color: '#10B981', fontWeight: 700 }}>{pay.status}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8', fontSize: '10px' }}>
                      <span>Token: {associatedOrder?.token || 'QB-xxx'} ({associatedOrder?.userName})</span>
                      <span>₹{pay.amount}</span>
                    </div>
                    <div style={{ fontSize: '9px', color: '#475569', marginTop: '4px', textAlign: 'right' }}>
                      {new Date(pay.timestamp).toLocaleString()}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

      </div>
    </div>
  );
};
export default AdminApp;
