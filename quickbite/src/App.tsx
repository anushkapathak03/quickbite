import React, { useState, useEffect } from 'react';
import { CanteenProvider, useCanteen } from './context/CanteenContext';
import { StudentApp } from './components/StudentApp';
import { VendorApp } from './components/VendorApp';
import { AdminApp } from './components/AdminApp';
import { 
  ShoppingBag, 
  Flame, 
  Sliders, 
  Smartphone, 
  Monitor, 
  RefreshCw, 
  Sparkles,
  Volume2,
  VolumeX,
  Plus
} from 'lucide-react';

const SimulatorContent: React.FC = () => {
  const { 
    notifications, 
    resetDatabase,
    createOrder,
    acceptOrder,
    completePayment,
    addToCart,
    loginUser,
    clearCart
  } = useCanteen();
  
  // Simulator View Mode: 'split' | 'student' | 'vendor' | 'admin'
  const [viewMode, setViewMode] = useState<'split' | 'student' | 'vendor' | 'admin'>(() => {
    return typeof window !== 'undefined' && window.innerWidth < 768 ? 'student' : 'split';
  });
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeToast, setActiveToast] = useState<{ id: string; title: string; message: string } | null>(null);

  // Monitor latest notifications to trigger a beautiful global toast
  useEffect(() => {
    if (notifications.length > 0) {
      const latest = notifications[0];
      // Skip the initial welcome notification if it's too old
      const timeDiff = Date.now() - new Date(latest.timestamp).getTime();
      if (timeDiff < 2000) {
        setActiveToast({
          id: latest.id,
          title: latest.title,
          message: latest.message
        });

        // Auto dismiss after 4 seconds
        const timer = setTimeout(() => {
          setActiveToast(null);
        }, 4000);

        return () => clearTimeout(timer);
      }
    }
  }, [notifications]);

  // Helper: Trigger a mock student order immediately to test flows
  const handleQuickDemoOrder = () => {
    // 1. Ensure a student is logged in
    loginUser('Demo Student', 'demo@college.edu', '9998887770', 'student');
    
    // 2. Select Samosa and Cold Coffee
    clearCart();
    // Use timeout to let state clear
    setTimeout(() => {
      // Add items
      addToCart('m2'); // Samosa
      addToCart('m6'); // Cold Coffee
      
      setTimeout(() => {
        // Create order (Pending state)
        const order = createOrder('Quick demo order: Mild spicy, extra straw.');
        
        setTimeout(() => {
          // 1. Kitchen accepts order -> unlocks payment
          acceptOrder(order.id);

          setTimeout(() => {
            // 2. Student completes UPI payment
            completePayment(order.id, `UPI_DEMO_${Date.now().toString().slice(-4)}`);
          }, 1200);
        }, 1000);
      }, 500);
    }, 200);
  };

  return (
    <div className="simulator-shell">
      
      {/* Global Toast Notification Banner */}
      {activeToast && (
        <div className="notification-toast">
          <div style={{ background: 'var(--primary-light)', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center' }}>
            <Sparkles size={16} color="var(--primary)" fill="var(--primary)" />
          </div>
          <div className="notification-toast-content">
            <div className="notification-toast-title">{activeToast.title}</div>
            <div className="notification-toast-desc">{activeToast.message}</div>
          </div>
          <button className="notification-toast-close" onClick={() => setActiveToast(null)}>✕</button>
        </div>
      )}

      {/* Simulator Control Header */}
      <header className="simulator-header">
        <div className="simulator-logo">
          <h1>
            <ShoppingBag size={24} color="var(--primary)" /> QuickBite
          </h1>
          <span>Smart Canteen Prototype</span>
        </div>

        {/* View toggles */}
        <div className="simulator-controls">
          
          {/* Quick Demo placing button */}
          <button 
            className="control-btn btn-primary" 
            onClick={handleQuickDemoOrder}
            title="Automatically login a demo student, add items to cart, and checkout with UPI."
          >
            <Plus size={14} /> Quick Demo Order
          </button>

          <div style={{ width: '1px', height: '24px', background: '#334155' }}></div>

          <button 
            className={`control-btn ${viewMode === 'split' ? 'btn-primary' : ''}`}
            onClick={() => setViewMode('split')}
          >
            <Monitor size={14} /> Split Console
          </button>
          
          <button 
            className={`control-btn ${viewMode === 'student' ? 'btn-primary' : ''}`}
            onClick={() => setViewMode('student')}
          >
            <Smartphone size={14} /> Student View
          </button>
          
          <button 
            className={`control-btn ${viewMode === 'vendor' ? 'btn-primary' : ''}`}
            onClick={() => setViewMode('vendor')}
          >
            <Flame size={14} /> Kitchen POS
          </button>
          
          <button 
            className={`control-btn ${viewMode === 'admin' ? 'btn-primary' : ''}`}
            onClick={() => setViewMode('admin')}
          >
            <Sliders size={14} /> Admin panel
          </button>

          <div style={{ width: '1px', height: '24px', background: '#334155' }}></div>

          {/* Sound Toggle */}
          <button 
            className="control-btn"
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? "Mute notification tones" : "Unmute notification tones"}
            style={{ padding: '8px' }}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} color="var(--danger)" />}
          </button>

          {/* Clear DB */}
          <button 
            className="control-btn" 
            onClick={resetDatabase}
            title="Reset menu & delete orders history"
            style={{ padding: '8px' }}
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </header>

      {/* Simulator Device Desktop Body */}
      <main className="simulator-body" style={{ display: 'flex', flex: 1, padding: '10px', gap: '10px', height: 'calc(100vh - 60px)', overflow: 'hidden' }}>
        
        {/* VIEW 1: STUDENT VIEW (Mock Mobile) */}
        {(viewMode === 'split' || viewMode === 'student') && (
          <div className="device-col" style={{ 
            flex: viewMode === 'split' ? '1' : '1', 
            minWidth: viewMode === 'split' ? '390px' : 'auto', 
            maxWidth: viewMode === 'split' ? '440px' : 'none' 
          }}>
            <div className="col-header">
              <span className="col-tag active">📱 STUDENT APP</span>
            </div>
            
            {/* Phone device Frame */}
            <div className="phone-frame animate-slide-up">
              <div className="phone-screen">
                
                {/* Simulated Phone Status Bar */}
                <div className="phone-status-bar">
                  <span>14:05</span>
                  <div className="phone-status-icons">
                    <span>5G</span>
                    <span style={{ fontSize: '14px' }}>⚡</span>
                    <span>100%</span>
                  </div>
                </div>
                
                <StudentApp />
                
                {/* Simulated Home Indicator bar */}
                <div className="phone-home-indicator"></div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: VENDOR VIEW (Mock POS Tablet) */}
        {(viewMode === 'split' || viewMode === 'vendor') && (
          <div className="device-col" style={{ 
            flex: viewMode === 'split' ? '1.3' : '1',
            minWidth: viewMode === 'split' ? '540px' : 'auto',
            maxWidth: viewMode === 'split' ? '680px' : 'none'
          }}>
            <div className="col-header">
              <span className="col-tag active" style={{ color: '#F59E0B', borderColor: 'rgba(245, 158, 11, 0.4)' }}>👨‍🍳 CANTEEN KITCHEN POS</span>
            </div>
            
            {/* Tablet POS device Frame */}
            <div className="tablet-frame animate-slide-up">
              <div className="tablet-screen">
                
                {/* Simulated Tablet status bar */}
                <div className="tablet-status-bar">
                  <span>SmartPOS v1.2</span>
                  <span className="status-badge" style={{ color: 'var(--success)' }}>
                    ● Kitchen Server Online
                  </span>
                  <span>14:05</span>
                </div>
                
                <VendorApp />
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: ADMIN VIEW (Management Panel) */}
        {(viewMode === 'split' || viewMode === 'admin') && (
          <div className="device-col" style={{ 
            flex: viewMode === 'split' ? '1.1' : '1',
            minWidth: viewMode === 'split' ? '360px' : 'auto'
          }}>
            <div className="col-header">
              <span className="col-tag active" style={{ color: 'var(--success)', borderColor: 'rgba(16, 185, 129, 0.4)' }}>📊 ADMIN CONTROL</span>
            </div>
            
            <div style={{ width: '100%', height: '760px', display: 'flex', flexDirection: 'column' }} className="animate-slide-up">
              <AdminApp />
            </div>
          </div>
        )}

      </main>

    </div>
  );
};

function App() {
  return (
    <CanteenProvider>
      <SimulatorContent />
    </CanteenProvider>
  );
}

export default App;
