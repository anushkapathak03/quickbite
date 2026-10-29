import React, { useState, useEffect } from 'react';
import { useCanteen } from '../context/CanteenContext';
import { 
  Search, 
  ShoppingBag, 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Check, 
  QrCode, 
  FileText, 
  Bell, 
  LogOut, 
  ChevronRight,
  Sparkles,
  CreditCard,
  AlertCircle,
  Lock,
  XCircle
} from 'lucide-react';

export const StudentApp: React.FC = () => {
  const {
    currentUser,
    loginUser,
    logoutUser,
    menuItems,
    cart,
    addToCart,
    removeFromCart,
    getCartTotal,
    getCartCount,
    createOrder,
    acceptOrder,
    cancelOrder,
    completePayment,
    orders,
    notifications,
    activeTab,
    setActiveTab
  } = useCanteen();

  // Local UI States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cookingInstructions, setCookingInstructions] = useState('');
  const [paymentStep, setPaymentStep] = useState<'none' | 'select' | 'processing' | 'success'>('none');
  const [selectedUPI, setSelectedUPI] = useState<'gpay' | 'phonepe' | 'paytm' | 'upi'>('gpay');
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  
  // Rejection notice state
  const [rejectionNotice, setRejectionNotice] = useState<string | null>(null);
  
  // Auth Form State
  const [loginName, setLoginName] = useState('Rohan Sharma');
  const [loginPhone, setLoginPhone] = useState('9876543210');
  const [loginEmail, setLoginEmail] = useState('rohan.sharma@college.edu');

  // Categories
  const categories = ['All', 'South Indian', 'North Indian', 'Snacks', 'Chinese', 'Beverages'];

  // Filter menu
  const filteredMenu = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return item.availability && matchesSearch && matchesCategory;
  });

  // Get current active order (most recent non-completed/non-cancelled order)
  const activeOrder = orders.find(o => 
    o.userId === currentUser?.id && 
    o.orderStatus !== 'Completed' && 
    o.orderStatus !== 'Cancelled'
  );

  const studentHistory = orders.filter(o => 
    o.userId === currentUser?.id && 
    (o.orderStatus === 'Completed' || o.orderStatus === 'Cancelled')
  );

  // Auto-detect when active order gets cancelled / rejected by kitchen
  useEffect(() => {
    if (activeOrderId) {
      const order = orders.find(o => o.id === activeOrderId);
      if (order && order.orderStatus === 'Cancelled') {
        // Kitchen rejected the cart order!
        setRejectionNotice(`Your cart order (${order.token}) was rejected by the kitchen. Taking you back to browse menu.`);
        setActiveOrderId(null);
        setActiveTab('menu');

        const timer = setTimeout(() => {
          setRejectionNotice(null);
        }, 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [orders, activeOrderId, setActiveTab]);

  // Handle Order Submit — sends confirmed cart to kitchen, locks payment
  const handleCheckout = () => {
    if (getCartCount() === 0) return;
    const newOrder = createOrder(cookingInstructions);
    setActiveOrderId(newOrder.id);
    setIsCartOpen(false);
    setCookingInstructions('');
    setActiveTab('orders'); // Go to tracking screen where payment is LOCKED
  };

  // Open payment — strictly allowed only when kitchen accepts (orderStatus === 'Received')
  const handleOpenPayment = () => {
    if (!activeOrder || activeOrder.orderStatus !== 'Received') return;
    setPaymentStep('select');
  };

  // Confirm Mock Payment
  const handlePaymentConfirm = () => {
    const targetOrderId = activeOrder?.id || activeOrderId;
    if (!targetOrderId) return;
    
    setPaymentStep('processing');
    
    // Simulate payment gateway loading
    setTimeout(() => {
      setPaymentStep('success');
      
      // Simulate completion checkmark display
      setTimeout(() => {
        const mockUpiId = `TXN${Date.now().toString().slice(-8)}`;
        completePayment(targetOrderId, mockUpiId);
        setPaymentStep('none');
        setActiveTab('orders'); // Stay on tracking screen
      }, 1500);
    }, 2000);
  };

  // Helper to render decorative QR code SVG
  const renderQRCodeSVG = (_orderToken: string) => {
    return (
      <svg width="180" height="180" viewBox="0 0 25 25" style={{ background: 'white', padding: '10px', borderRadius: '12px' }}>
        {/* Outer boundaries */}
        <rect x="0" y="0" width="7" height="7" fill="black" />
        <rect x="1" y="1" width="5" height="5" fill="white" />
        <rect x="2" y="2" width="3" height="3" fill="black" />

        <rect x="18" y="0" width="7" height="7" fill="black" />
        <rect x="19" y="1" width="5" height="5" fill="white" />
        <rect x="20" y="2" width="3" height="3" fill="black" />

        <rect x="0" y="18" width="7" height="7" fill="black" />
        <rect x="1" y="19" width="5" height="5" fill="white" />
        <rect x="2" y="20" width="3" height="3" fill="black" />

        {/* Dynamic pixel mock pattern */}
        <rect x="9" y="2" width="2" height="2" fill="black" />
        <rect x="13" y="1" width="1" height="3" fill="black" />
        <rect x="15" y="4" width="2" height="1" fill="black" />
        
        <rect x="2" y="9" width="3" height="2" fill="black" />
        <rect x="8" y="8" width="4" height="4" fill="black" />
        <rect x="14" y="9" width="2" height="2" fill="black" />
        <rect x="9" y="14" width="3" height="2" fill="black" />
        
        <rect x="18" y="9" width="3" height="2" fill="black" />
        <rect x="22" y="11" width="2" height="3" fill="black" />
        
        <rect x="9" y="19" width="3" height="3" fill="black" />
        <rect x="14" y="18" width="2" height="4" fill="black" />
        <rect x="20" y="19" width="3" height="2" fill="black" />
        
        <rect x="11" y="11" width="3" height="3" fill="#FF6B00" />
      </svg>
    );
  };

  // If not logged in as student
  if (!currentUser || currentUser.role !== 'student') {
    return (
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', background: '#FFFFFF' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'var(--primary-light)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <ShoppingBag size={32} color="var(--primary)" />
          </div>
          <h2 style={{ fontSize: '26px', color: '#1E293B', fontWeight: 800 }}>QuickBite Student</h2>
          <p style={{ color: '#64748B', fontSize: '14px', marginTop: '6px' }}>Canteen queue-free ordering app</p>
        </div>

        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input 
            type="text" 
            className="form-input" 
            value={loginName} 
            onChange={(e) => setLoginName(e.target.value)} 
            placeholder="E.g. Rohan Sharma"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Phone Number (UPI Linked)</label>
          <input 
            type="text" 
            className="form-input" 
            value={loginPhone} 
            onChange={(e) => setLoginPhone(e.target.value)} 
            placeholder="10-digit number"
          />
        </div>

        <div className="form-group" style={{ marginBottom: '28px' }}>
          <label className="form-label">College Email</label>
          <input 
            type="email" 
            className="form-input" 
            value={loginEmail} 
            onChange={(e) => setLoginEmail(e.target.value)} 
            placeholder="rohan@college.edu"
          />
        </div>

        <button 
          className="btn btn-orange" 
          onClick={() => loginUser(loginName, loginEmail, loginPhone, 'student')}
          style={{ width: '100%', padding: '14px' }}
        >
          Enter QuickBite App
        </button>
        
        <p style={{ fontSize: '11px', textAlign: 'center', color: '#94A3B8', marginTop: '16px' }}>
          By continuing, you agree to receive mock SMS receipt and UPI status simulation.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      
      {/* Rejection Notification Banner */}
      {rejectionNotice && (
        <div style={{
          position: 'absolute',
          top: '56px',
          left: '12px',
          right: '12px',
          zIndex: 999,
          background: '#FEF2F2',
          border: '1.5px solid #F87171',
          borderRadius: '12px',
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px',
          boxShadow: '0 8px 20px rgba(239, 68, 68, 0.25)',
          animation: 'slide-up 0.3s ease'
        }}>
          <XCircle size={20} color="#EF4444" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ flex: 1 }}>
            <h5 style={{ fontSize: '13px', fontWeight: 800, color: '#991B1B', margin: 0 }}>Cart Request Rejected</h5>
            <p style={{ fontSize: '11px', color: '#B91C1C', marginTop: '3px', margin: 0, lineHeight: '1.4' }}>
              {rejectionNotice}
            </p>
          </div>
          <button 
            onClick={() => setRejectionNotice(null)}
            style={{ background: 'none', border: 'none', color: '#EF4444', fontWeight: 700, cursor: 'pointer', fontSize: '14px' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Student App Bar */}
      <div style={{ padding: '12px 16px 8px', background: 'white', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ background: 'var(--primary-light)', padding: '6px', borderRadius: '8px' }}>
            <ShoppingBag size={18} color="var(--primary)" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#1E293B' }}>Canteen Hub</span>
              <Sparkles size={11} color="var(--primary)" fill="var(--primary)" />
            </div>
            <span style={{ fontSize: '10px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '2px' }}>
              <MapPin size={9} /> College Block A
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ position: 'relative', cursor: 'pointer' }}>
            <Bell size={18} color="#475569" />
            {notifications.filter(n => !n.read && (n.role === 'student' || n.role === 'all')).length > 0 && (
              <span style={{ position: 'absolute', top: '-4px', right: '-4px', width: '8px', height: '8px', background: 'var(--danger)', borderRadius: '50%' }}></span>
            )}
          </div>
          <button onClick={logoutUser} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Logout">
            <LogOut size={16} color="#EF4444" />
          </button>
        </div>
      </div>

      {/* Main Scroll Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px 80px' }}>
        
        {/* Menu Tab */}
        {activeTab === 'menu' && (
          <div className="animate-slide-up">
            
            {/* Search Bar */}
            <div style={{ display: 'flex', alignItems: 'center', background: '#F1F5F9', borderRadius: '12px', padding: '8px 12px', marginBottom: '16px' }}>
              <Search size={16} color="#94A3B8" style={{ marginRight: '8px' }} />
              <input 
                type="text" 
                placeholder="Search food items (Samosa, Dosa...)" 
                style={{ border: 'none', background: 'transparent', width: '100%', fontSize: '13px', outline: 'none', color: '#334155' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} style={{ border: 'none', background: 'transparent', color: '#94A3B8', fontSize: '12px', cursor: 'pointer' }}>Clear</button>
              )}
            </div>

            {/* Banner Promo */}
            <div style={{ background: 'linear-gradient(135deg, #FF6B00 0%, #FF9E53 100%)', borderRadius: '16px', padding: '16px', color: 'white', marginBottom: '20px', position: 'relative', overflow: 'hidden', boxShadow: '0 4px 12px rgba(255, 107, 0, 0.2)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Skip Canteen Queues!</h3>
              <p style={{ fontSize: '11px', opacity: 0.9, marginTop: '4px', maxWidth: '75%' }}>Confirm your cart, kitchen accepts, then pay via UPI & pickup!</p>
              <div style={{ position: 'absolute', right: '-10px', bottom: '-10px', opacity: 0.15 }}>
                <ShoppingBag size={100} />
              </div>
            </div>

            {/* Categories */}
            <div className="categories-slider">
              {categories.map(cat => (
                <span 
                  key={cat} 
                  className={`category-chip ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </span>
              ))}
            </div>

            {/* Menu Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '8px 0 12px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#1E293B' }}>Popular Dishes</h4>
              <span style={{ fontSize: '11px', color: '#64748B' }}>{filteredMenu.length} items</span>
            </div>

            {/* Menu List */}
            {filteredMenu.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94A3B8' }}>
                <ShoppingBag size={36} style={{ marginBottom: '10px', opacity: 0.5 }} />
                <p style={{ fontSize: '13px' }}>No items found matching filter.</p>
              </div>
            ) : (
              filteredMenu.map(item => {
                const qty = cart[item.id] || 0;
                return (
                  <div className="food-card" key={item.id}>
                    <div className="food-info">
                      <div>
                        <div className="food-title-row">
                          <span className={item.isVeg ? 'veg-indicator' : 'non-veg-indicator'} style={{ marginTop: '2px' }}></span>
                          <span className="food-title" style={{ flex: 1, marginLeft: '6px' }}>{item.name}</span>
                        </div>
                        <div className="food-price">₹{item.price}</div>
                        <p className="food-desc">{item.description}</p>
                      </div>
                    </div>
                    
                    <div className="food-image-container">
                      <img src={item.image} alt={item.name} className="food-image" />
                      <div className="add-item-btn-container">
                        {qty === 0 ? (
                          <button className="add-item-btn" onClick={() => addToCart(item.id)}>
                            ADD
                          </button>
                        ) : (
                          <div className="qty-counter">
                            <button className="qty-btn" onClick={() => removeFromCart(item.id)}>-</button>
                            <span className="qty-text">{qty}</span>
                            <button className="qty-btn" onClick={() => addToCart(item.id)}>+</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tracking Tab */}
        {activeTab === 'orders' && (
          <div className="animate-slide-up">
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1E293B', marginBottom: '16px' }}>Live Order Status</h3>
            
            {activeOrder ? (
              <div style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--border-light)', padding: '16px', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px', marginBottom: '16px' }}>
                  <div>
                    <span style={{ fontSize: '10px', color: '#64748B', fontWeight: 600 }}>TOKEN NUMBER</span>
                    <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary)' }}>{activeOrder.token}</h2>
                  </div>
                  <span className={`badge badge-${activeOrder.orderStatus.toLowerCase()}`}>
                    {activeOrder.orderStatus === 'Pending' ? '⏳ Awaiting Kitchen' : activeOrder.orderStatus}
                  </span>
                </div>

                {/* Items Summary */}
                <div style={{ marginBottom: '16px' }}>
                  <h4 style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>Items Ordered</h4>
                  {activeOrder.items.map(item => (
                    <div key={item.menuItem.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#334155', marginBottom: '4px' }}>
                      <span>{item.menuItem.name} <strong>x {item.quantity}</strong></span>
                      <span style={{ marginLeft: 'auto' }}>₹{item.menuItem.price * item.quantity}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', borderTop: '1px dashed var(--border-light)', marginTop: '8px', paddingTop: '8px', fontSize: '13px', fontWeight: 700, color: '#1E293B' }}>
                    <span>Total Amount</span>
                    <span style={{ marginLeft: 'auto' }}>₹{activeOrder.totalAmount}</span>
                  </div>
                </div>

                {/* ── 1. PENDING: Cart confirmed, waiting for kitchen acceptance ── */}
                {activeOrder.orderStatus === 'Pending' && (
                  <div style={{ background: '#FFFBEB', border: '1.5px solid #FDE68A', borderRadius: '14px', padding: '16px', textAlign: 'center', margin: '16px 0' }}>
                    <div style={{ fontSize: '32px', marginBottom: '6px' }}>🍳</div>
                    <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#92400E' }}>Cart Sent to Kitchen for Review</h4>
                    <p style={{ fontSize: '11px', color: '#B45309', marginTop: '4px', lineHeight: '1.5' }}>
                      Your order request has reached the kitchen counter.<br/>
                      <strong>Payment is currently locked</strong> until canteen staff accepts.
                    </p>
                    
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', margin: '12px 0 16px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B', animation: 'pulse-glow 1s infinite' }}></div>
                      <span style={{ fontSize: '11px', color: '#92400E', fontWeight: 700 }}>Kitchen reviewing your order...</span>
                    </div>

                    {/* LOCKED PAYMENT BUTTON */}
                    <button
                      disabled
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: '#F1F5F9',
                        border: '1.5px dashed #CBD5E1',
                        borderRadius: '12px',
                        color: '#64748B',
                        fontWeight: 700,
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        cursor: 'not-allowed'
                      }}
                    >
                      <Lock size={15} color="#94A3B8" /> Payment Locked (Unlocks When Kitchen Accepts)
                    </button>

                    {/* Helper buttons for quick demo testing */}
                    <div style={{ marginTop: '14px', padding: '10px', background: '#FEF3C7', borderRadius: '10px', border: '1px solid #FDE68A' }}>
                      <span style={{ fontSize: '10px', color: '#92400E', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                        ⚡ Quick Solo Test (Kitchen Response):
                      </span>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => acceptOrder(activeOrder.id)}
                          style={{
                            flex: 1,
                            padding: '8px 10px',
                            background: '#10B981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px'
                          }}
                        >
                          <Check size={13} /> Accept Cart
                        </button>
                        <button
                          onClick={() => cancelOrder(activeOrder.id)}
                          style={{
                            flex: 1,
                            padding: '8px 10px',
                            background: '#EF4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px'
                          }}
                        >
                          ✕ Reject Cart
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── 2. RECEIVED: Kitchen accepted, payment UNLOCKED! ── */}
                {activeOrder.orderStatus === 'Received' && activeOrder.paymentStatus === 'Pending' && (
                  <div style={{ background: '#F0FDF4', border: '2px solid #86EFAC', borderRadius: '14px', padding: '16px', margin: '16px 0', boxShadow: '0 4px 14px rgba(34, 197, 94, 0.15)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(34, 197, 94, 0.4)' }}>
                        <Check size={20} color="white" />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#15803D' }}>Kitchen Accepted Your Order! 🎉</h4>
                        <p style={{ fontSize: '11px', color: '#16A34A', margin: 0 }}>Payment option is now unlocked. Complete UPI to start prep.</p>
                      </div>
                    </div>
                    
                    <button 
                      className="btn btn-orange"
                      onClick={handleOpenPayment}
                      style={{ width: '100%', padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '8px', fontSize: '13px', fontWeight: 800 }}
                    >
                      <CreditCard size={18} />
                      Pay ₹{activeOrder.totalAmount} via UPI Now →
                    </button>
                  </div>
                )}

                {/* ── 3. TIMELINE: Shown once payment is confirmed ── */}
                {['Preparing', 'Ready', 'Completed'].includes(activeOrder.orderStatus) && (
                  <div style={{ position: 'relative', paddingLeft: '24px', margin: '20px 0' }}>
                    <div style={{ position: 'absolute', top: '8px', bottom: '8px', left: '6px', width: '2px', background: '#E2E8F0' }}></div>

                    {/* Step 1: Paid */}
                    <div style={{ position: 'relative', marginBottom: '20px' }}>
                      <div style={{ 
                        position: 'absolute', left: '-24px', top: '2px', width: '14px', height: '14px', borderRadius: '50%',
                        background: 'var(--success)',
                        border: '3px solid white', boxShadow: '0 0 0 1px #CBD5E1'
                      }}></div>
                      <h5 style={{ fontSize: '12px', fontWeight: 700, color: '#1E293B' }}>Payment Confirmed</h5>
                      <p style={{ fontSize: '10px', color: '#64748B' }}>Kitchen received your payment and started cooking.</p>
                    </div>

                    {/* Step 2: Preparing */}
                    <div style={{ position: 'relative', marginBottom: '20px' }}>
                      <div style={{ 
                        position: 'absolute', left: '-24px', top: '2px', width: '14px', height: '14px', borderRadius: '50%',
                        background: ['Preparing', 'Ready', 'Completed'].includes(activeOrder.orderStatus) ? 'var(--success)' : '#E2E8F0',
                        border: '3px solid white', boxShadow: '0 0 0 1px #CBD5E1'
                      }}></div>
                      <h5 style={{ fontSize: '12px', fontWeight: 700, color: '#1E293B' }}>Preparing Food</h5>
                      <p style={{ fontSize: '10px', color: '#64748B' }}>The chef is currently preparing your meal.</p>
                    </div>

                    {/* Step 3: Ready */}
                    <div style={{ position: 'relative' }}>
                      <div style={{ 
                        position: 'absolute', left: '-24px', top: '2px', width: '14px', height: '14px', borderRadius: '50%',
                        background: ['Ready', 'Completed'].includes(activeOrder.orderStatus) ? 'var(--primary)' : '#E2E8F0',
                        border: '3px solid white', boxShadow: '0 0 0 1px #CBD5E1',
                        animation: activeOrder.orderStatus === 'Ready' ? 'pulse-glow 1.5s infinite' : 'none'
                      }}></div>
                      <h5 style={{ fontSize: '12px', fontWeight: 700, color: '#1E293B' }}>Ready for Pickup</h5>
                      <p style={{ fontSize: '10px', color: '#64748B' }}>Collect from counter using the QR Code below.</p>
                    </div>
                  </div>
                )}

                {/* QR Code — only shown after payment is completed */}
                {['Ready', 'Preparing'].includes(activeOrder.orderStatus) && activeOrder.paymentStatus === 'Completed' && (
                  <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid var(--border-light)', marginTop: '20px' }}>
                    {renderQRCodeSVG(activeOrder.id)}
                    <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, marginTop: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <QrCode size={12} /> Scan QR at Pickup Counter
                    </span>
                    <p style={{ fontSize: '10px', color: '#94A3B8', textAlign: 'center', marginTop: '4px' }}>
                      Show this QR code at the counter to verify your pickup.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
                <Clock size={40} color="#94A3B8" style={{ marginBottom: '12px', opacity: 0.5 }} />
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#1E293B' }}>No Active Orders</h4>
                <p style={{ fontSize: '11px', color: '#64748B', marginTop: '4px', padding: '0 20px' }}>Orders you place will appear here with real-time status updates.</p>
                <button className="btn btn-orange" onClick={() => setActiveTab('menu')} style={{ marginTop: '16px', padding: '8px 16px', fontSize: '12px' }}>
                  Browse Food Menu
                </button>
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="animate-slide-up">
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1E293B', marginBottom: '16px' }}>Past Orders</h3>
            
            {studentHistory.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
                <FileText size={40} color="#94A3B8" style={{ marginBottom: '12px', opacity: 0.5 }} />
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#1E293B' }}>No Order History</h4>
                <p style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>Your completed and cancelled orders will be archived here.</p>
              </div>
            ) : (
              studentHistory.map(h => (
                <div key={h.id} style={{ background: 'white', borderRadius: '12px', padding: '12px 14px', border: '1px solid var(--border-light)', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#1E293B' }}>Token: {h.token}</span>
                      <div style={{ fontSize: '9px', color: '#94A3B8' }}>{new Date(h.timestamp).toLocaleDateString()} at {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                    <span className={`badge badge-${h.orderStatus.toLowerCase()}`} style={{ fontSize: '9px', padding: '2px 8px' }}>
                      {h.orderStatus}
                    </span>
                  </div>
                  
                  <div style={{ fontSize: '11px', color: '#64748B', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {h.items.map(it => (
                      <span key={it.menuItem.id} style={{ background: '#F1F5F9', padding: '2px 6px', borderRadius: '4px' }}>
                        {it.menuItem.name} x{it.quantity}
                      </span>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #F1F5F9', marginTop: '8px', paddingTop: '8px', fontSize: '11px', fontWeight: 700, color: '#1E293B' }}>
                    <span>Amount</span>
                    <span>₹{h.totalAmount}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Floating Cart Button (Sticky bottom over menu) */}
      {activeTab === 'menu' && getCartCount() > 0 && (
        <div style={{ position: 'absolute', bottom: '68px', left: '12px', right: '12px', zIndex: 90 }}>
          <button 
            className="btn btn-orange" 
            onClick={() => setIsCartOpen(true)}
            style={{ width: '100%', display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '14px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShoppingBag size={18} />
              <span style={{ fontSize: '13px' }}>{getCartCount()} items in Cart</span>
            </div>
            <span style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Confirm Cart <ChevronRight size={14} />
            </span>
          </button>
        </div>
      )}

      {/* Tab Navigation Bar */}
      <div className="tab-bar">
        <button className={`tab-item ${activeTab === 'menu' ? 'active' : ''}`} onClick={() => setActiveTab('menu')}>
          <ShoppingBag size={20} />
          <span>Menu</span>
        </button>
        <button className={`tab-item ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
          <div style={{ position: 'relative' }}>
            <Clock size={20} />
            {activeOrder && (
              <span style={{ position: 'absolute', top: '-2px', right: '-2px', width: '6px', height: '6px', background: 'var(--primary)', borderRadius: '50%' }}></span>
            )}
          </div>
          <span>Track</span>
        </button>
        <button className={`tab-item ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
          <FileText size={20} />
          <span>History</span>
        </button>
      </div>

      {/* Cart Drawer Modal */}
      {isCartOpen && (
        <div className="modal-overlay" onClick={() => setIsCartOpen(false)}>
          <div className="modal-content animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Confirm Your Cart</h3>
              <button className="close-btn" onClick={() => setIsCartOpen(false)}>✕</button>
            </div>

            {/* Cart Items */}
            <div style={{ margin: '12px 0 20px', maxHeight: '200px', overflowY: 'auto' }}>
              {Object.keys(cart).map(id => {
                const item = menuItems.find(m => m.id === id);
                if (!item) return null;
                const qty = cart[id];
                return (
                  <div key={id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F1F5F9' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#1E293B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className={item.isVeg ? 'veg-indicator' : 'non-veg-indicator'}></span>
                        {item.name}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 600, marginTop: '2px' }}>₹{item.price}</div>
                    </div>

                    <div style={{ width: '80px', marginRight: '16px' }}>
                      <div className="qty-counter" style={{ padding: '2px 0' }}>
                        <button className="qty-btn" style={{ width: '20px', height: '20px' }} onClick={() => removeFromCart(id)}>-</button>
                        <span className="qty-text" style={{ fontSize: '11px' }}>{qty}</span>
                        <button className="qty-btn" style={{ width: '20px', height: '20px' }} onClick={() => addToCart(id)}>+</button>
                      </div>
                    </div>

                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#1E293B', minWidth: '45px', textAlign: 'right' }}>
                      ₹{item.price * qty}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Cooking Instructions */}
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '10px' }}>Cooking Notes (Optional)</label>
              <textarea 
                placeholder="E.g., Less spicy, no onions, extra spoon..." 
                className="form-input"
                style={{ width: '100%', height: '54px', resize: 'none', fontSize: '12px', fontFamily: 'inherit' }}
                value={cookingInstructions}
                onChange={(e) => setCookingInstructions(e.target.value)}
              />
            </div>

            {/* Billing details */}
            <div style={{ padding: '12px 0', borderTop: '1px dashed var(--border-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748B', marginBottom: '6px' }}>
                <span>Subtotal</span>
                <span style={{ marginLeft: 'auto' }}>₹{getCartTotal()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748B', marginBottom: '8px' }}>
                <span>Taxes & Canteen charges</span>
                <span style={{ marginLeft: 'auto', color: 'var(--success)' }}>FREE</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 800, color: '#1E293B', borderTop: '1px solid #F1F5F9', paddingTop: '8px' }}>
                <span>Total to Pay</span>
                <span style={{ marginLeft: 'auto', color: 'var(--primary)' }}>₹{getCartTotal()}</span>
              </div>
            </div>

            {/* Flow Info Callout */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: '10px', padding: '10px 12px', margin: '10px 0' }}>
              <AlertCircle size={15} color="#EA580C" style={{ flexShrink: 0, marginTop: '1px' }} />
              <p style={{ fontSize: '10px', color: '#C2410C', margin: 0, lineHeight: '1.4' }}>
                <strong>How it works:</strong> Your cart goes to the canteen kitchen first. Payment option unlocks only <em>after</em> the kitchen accepts your order!
              </p>
            </div>

            <button 
              className="btn btn-orange" 
              onClick={handleCheckout}
              style={{ width: '100%', padding: '13px', marginTop: '4px', fontWeight: 800 }}
            >
              Confirm Cart & Send to Kitchen 🍳
            </button>
          </div>
        </div>
      )}

      {/* UPI Payment Simulator Portal */}
      {paymentStep !== 'none' && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'white', zIndex: 1000, display: 'flex', flexDirection: 'column', color: '#1F2937' }} className="animate-slide-up">
          
          {/* Header */}
          <div style={{ padding: '14px 16px', background: '#F9FAFB', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '12px' }}>
            {paymentStep === 'select' && (
              <button onClick={() => setPaymentStep('none')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><ArrowLeft size={20} /></button>
            )}
            <span style={{ fontWeight: 700, fontSize: '15px' }}>UPI Secure Checkout</span>
          </div>

          {/* Body */}
          {paymentStep === 'select' && (
            <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ background: 'var(--primary-light)', padding: '16px', borderRadius: '12px', textAlign: 'center', marginBottom: '24px' }}>
                <span style={{ fontSize: '11px', color: '#4B5563', fontWeight: 600 }}>PAYING CANTEEN VENDOR</span>
                <h2 style={{ fontSize: '28px', color: '#111827', fontWeight: 800, marginTop: '4px' }}>
                  ₹{activeOrder?.totalAmount || 0}
                </h2>
                <p style={{ fontSize: '10px', color: '#9CA3AF', marginTop: '2px' }}>Transaction ID: TXN_MOCK_{Date.now().toString().slice(-6)}</p>
              </div>

              <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#4B5563', marginBottom: '10px', textTransform: 'uppercase' }}>Select Payment App</h4>
              
              {/* GPay */}
              <div 
                style={{ display: 'flex', alignItems: 'center', padding: '14px', borderRadius: '12px', border: `2px solid ${selectedUPI === 'gpay' ? 'var(--primary)' : '#E5E7EB'}`, background: selectedUPI === 'gpay' ? 'var(--primary-light)' : 'white', cursor: 'pointer', marginBottom: '10px' }}
                onClick={() => setSelectedUPI('gpay')}
              >
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#4285F4', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px' }}>G</div>
                <div style={{ marginLeft: '12px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700 }}>Google Pay</div>
                  <div style={{ fontSize: '10px', color: '#6B7280' }}>Pay directly via Google Pay UPI</div>
                </div>
              </div>

              {/* PhonePe */}
              <div 
                style={{ display: 'flex', alignItems: 'center', padding: '14px', borderRadius: '12px', border: `2px solid ${selectedUPI === 'phonepe' ? 'var(--primary)' : '#E5E7EB'}`, background: selectedUPI === 'phonepe' ? 'var(--primary-light)' : 'white', cursor: 'pointer', marginBottom: '10px' }}
                onClick={() => setSelectedUPI('phonepe')}
              >
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#5F259F', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px' }}>P</div>
                <div style={{ marginLeft: '12px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700 }}>PhonePe</div>
                  <div style={{ fontSize: '10px', color: '#6B7280' }}>Pay directly via PhonePe UPI</div>
                </div>
              </div>

              {/* Paytm */}
              <div 
                style={{ display: 'flex', alignItems: 'center', padding: '14px', borderRadius: '12px', border: `2px solid ${selectedUPI === 'paytm' ? 'var(--primary)' : '#E5E7EB'}`, background: selectedUPI === 'paytm' ? 'var(--primary-light)' : 'white', cursor: 'pointer', marginBottom: '10px' }}
                onClick={() => setSelectedUPI('paytm')}
              >
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#00B9F5', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px' }}>Py</div>
                <div style={{ marginLeft: '12px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700 }}>Paytm UPI</div>
                  <div style={{ fontSize: '10px', color: '#6B7280' }}>Pay using Paytm Bank/Wallet UPI</div>
                </div>
              </div>

              <div style={{ marginTop: 'auto' }}>
                <button className="btn btn-orange" onClick={handlePaymentConfirm} style={{ width: '100%', padding: '14px' }}>
                  PAY ₹{activeOrder?.totalAmount || 0} NOW
                </button>
              </div>
            </div>
          )}

          {paymentStep === 'processing' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', border: '4px solid #E5E7EB', borderTopColor: 'var(--primary)', animation: 'spin 1s linear infinite', marginBottom: '20px' }}></div>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Authenticating UPI Pin...</h3>
              <p style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px', textAlign: 'center' }}>Please do not close this screen or press back button.</p>
              
              <style>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          )}

          {paymentStep === 'success' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', background: '#ECFDF5' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', marginBottom: '20px', boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)' }}>
                <Check size={36} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#065F46' }}>UPI Transaction Successful</h3>
              <p style={{ fontSize: '12px', color: '#047857', marginTop: '4px' }}>Payment credited to QuickBite Canteen</p>
              
              <div style={{ background: 'white', padding: '12px 20px', borderRadius: '12px', width: '100%', maxWidth: '250px', border: '1px solid #D1FAE5', marginTop: '24px', fontSize: '11px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: '#6B7280' }}>Ref No:</span>
                  <span style={{ fontWeight: 600 }}>UPI883492834</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6B7280' }}>Paid To:</span>
                  <span style={{ fontWeight: 600 }}>College Kitchen Ltd.</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Screen Notch overlays */}
      <div className="phone-notch">
        <div className="phone-speaker"></div>
      </div>
    </div>
  );
};
export default StudentApp;
