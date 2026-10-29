import React, { useState } from 'react';
import { useCanteen } from '../context/CanteenContext';
import { 
  Inbox, 
  Flame, 
  CheckCircle, 
  Clock, 
  Scan,
  FileText,
  AlertCircle,
  CreditCard,
  Check
} from 'lucide-react';

export const VendorApp: React.FC = () => {
  const {
    orders,
    acceptOrder,
    updateOrderStatus,
    verifyPickup,
    cancelOrder,
    currentUser,
    loginUser
  } = useCanteen();

  // Active View
  const [activeScreen, setActiveScreen] = useState<'live' | 'completed'>('live');
  
  // Scanner simulator state
  const [scanningOrderId, setScanningOrderId] = useState<string | null>(null);
  const [scanSuccess, setScanSuccess] = useState(false);

  // Vendor Auth state
  const [vendorName, setVendorName] = useState('Chef Suresh');
  const vendorEmail = 'suresh.kitchen@college.edu';
  const [vendorPhone, setVendorPhone] = useState('9988776655');

  // Filter orders by lifecycle status
  // 1. Pending approval: student placed request, waiting for kitchen acceptance
  const pendingApprovalOrders = orders.filter(o => o.orderStatus === 'Pending');
  // 2. Accepted by kitchen, waiting for student UPI payment
  const awaitingPaymentOrders = orders.filter(o => o.orderStatus === 'Received' && o.paymentStatus === 'Pending');
  // 3. Paid & confirmed: ready for kitchen to start preparing
  const incomingOrders = orders.filter(o => o.orderStatus === 'Received' && o.paymentStatus === 'Completed');
  // 4. In kitchen cooking
  const preparingOrders = orders.filter(o => o.orderStatus === 'Preparing');
  // 5. Ready on counter waiting pickup
  const readyOrders = orders.filter(o => o.orderStatus === 'Ready');
  // 6. Archived completed/cancelled
  const completedOrders = orders.filter(o => o.orderStatus === 'Completed' || o.orderStatus === 'Cancelled');

  const totalActiveQueue = pendingApprovalOrders.length + awaitingPaymentOrders.length + incomingOrders.length + preparingOrders.length + readyOrders.length;

  // Trigger Mock QR Scan
  const handleOpenScanner = (orderId: string) => {
    setScanningOrderId(orderId);
    setScanSuccess(false);
  };

  const handleSimulateScan = () => {
    if (!scanningOrderId) return;
    
    // Simulate scan laser moving and reading
    setTimeout(() => {
      setScanSuccess(true);
      
      setTimeout(() => {
        // Complete pickup verification in context
        verifyPickup(scanningOrderId);
        setScanningOrderId(null);
        setScanSuccess(false);
      }, 1000);
    }, 1200);
  };

  // Helper: calculate time elapsed since order timestamp
  const getTimeElapsed = (timestamp: string) => {
    const elapsed = Date.now() - new Date(timestamp).getTime();
    const mins = Math.floor(elapsed / 60000);
    if (mins < 1) return 'Just now';
    return `${mins}m ago`;
  };

  // Auth Guard for Canteen Staff
  if (!currentUser || (currentUser.role !== 'vendor' && currentUser.role !== 'admin')) {
    return (
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', background: '#0F172A', color: 'white' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'rgba(255, 107, 0, 0.15)', border: '1px solid rgba(255, 107, 0, 0.3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <Flame size={32} color="var(--primary)" />
          </div>
          <h2 style={{ fontSize: '26px', color: '#F8FAFC', fontWeight: 800 }}>Canteen Kitchen POS</h2>
          <p style={{ color: '#94A3B8', fontSize: '14px', marginTop: '6px' }}>Kitchen staff terminal & order fulfillment</p>
        </div>

        <div className="form-group">
          <label className="form-label" style={{ color: '#94A3B8' }}>Staff Name</label>
          <input 
            type="text" 
            className="form-input" 
            value={vendorName} 
            onChange={(e) => setVendorName(e.target.value)}
          />
        </div>

        <div className="form-group" style={{ marginBottom: '28px' }}>
          <label className="form-label" style={{ color: '#94A3B8' }}>Canteen Station Phone</label>
          <input 
            type="text" 
            className="form-input" 
            value={vendorPhone} 
            onChange={(e) => setVendorPhone(e.target.value)}
          />
        </div>

        <button 
          className="btn btn-orange" 
          onClick={() => loginUser(vendorName, vendorEmail, vendorPhone, 'vendor')}
          style={{ width: '100%', padding: '14px' }}
        >
          Enter Kitchen Console
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      
      {/* Top Tablet Bar */}
      <div style={{ padding: '12px 20px', background: '#1E293B', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: 'rgba(255, 107, 0, 0.1)', padding: '6px', borderRadius: '8px', border: '1px solid rgba(255, 107, 0, 0.2)' }}>
            <Flame size={20} color="var(--primary)" />
          </div>
          <div>
            <h3 style={{ fontSize: '15px', color: 'white', fontWeight: 700 }}>Kitchen Console</h3>
            <span style={{ fontSize: '10px', color: '#94A3B8' }}>Staff: {currentUser.name} • Station A</span>
          </div>
        </div>

        {/* Console Tab switcher */}
        <div style={{ display: 'flex', background: '#0F172A', borderRadius: '8px', padding: '3px' }}>
          <button 
            onClick={() => setActiveScreen('live')}
            style={{ 
              background: activeScreen === 'live' ? '#334155' : 'transparent',
              color: activeScreen === 'live' ? 'white' : '#94A3B8',
              border: 'none', padding: '6px 12px', fontSize: '12px', fontWeight: 600, borderRadius: '6px', cursor: 'pointer'
            }}
          >
            Queues ({totalActiveQueue})
          </button>
          <button 
            onClick={() => setActiveScreen('completed')}
            style={{ 
              background: activeScreen === 'completed' ? '#334155' : 'transparent',
              color: activeScreen === 'completed' ? 'white' : '#94A3B8',
              border: 'none', padding: '6px 12px', fontSize: '12px', fontWeight: 600, borderRadius: '6px', cursor: 'pointer'
            }}
          >
            History ({completedOrders.length})
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        
        {activeScreen === 'live' ? (
          /* Kanban Board Columns */
          <div style={{ display: 'flex', flex: 1, overflowX: 'auto', background: '#0F172A' }}>
            
            {/* Column 1: Requests & Incoming */}
            <div style={{ flex: 1, minWidth: '220px', display: 'flex', flexDirection: 'column', borderRight: '1px solid #1E293B', padding: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Inbox size={14} /> REQUESTS & INCOMING
                </span>
                <span style={{ fontSize: '11px', background: '#1E293B', color: 'white', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                  {pendingApprovalOrders.length + awaitingPaymentOrders.length + incomingOrders.length}
                </span>
              </div>
              
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {pendingApprovalOrders.length === 0 && awaitingPaymentOrders.length === 0 && incomingOrders.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 10px', color: '#475569' }}>
                    <Inbox size={28} style={{ opacity: 0.3, marginBottom: '6px' }} />
                    <p style={{ fontSize: '11px' }}>No incoming requests</p>
                  </div>
                ) : (
                  <>
                    {/* SECTION 1: Pending Acceptance Orders (Student waiting for Kitchen to Accept) */}
                    {pendingApprovalOrders.map(order => (
                      <div 
                        key={order.id} 
                        style={{ 
                          background: '#1E293B', 
                          borderRadius: '10px', 
                          padding: '12px', 
                          marginBottom: '10px', 
                          border: '2px solid #F59E0B',
                          boxShadow: '0 0 12px rgba(245, 158, 11, 0.2)' 
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ fontSize: '9px', background: '#FEF3C7', color: '#92400E', padding: '2px 6px', borderRadius: '4px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            🔔 NEW REQUEST
                          </span>
                          <span style={{ fontSize: '10px', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={10} /> {getTimeElapsed(order.timestamp)}
                          </span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '15px', fontWeight: 800, color: 'white' }}>{order.token}</span>
                          <span style={{ fontSize: '11px', color: '#CBD5E1', fontWeight: 600 }}>{order.userName}</span>
                        </div>
                        
                        <div style={{ margin: '8px 0', borderTop: '1px solid #334155', borderBottom: '1px solid #334155', padding: '6px 0' }}>
                          {order.items.map(it => (
                            <div key={it.menuItem.id} style={{ fontSize: '12px', color: '#E2E8F0', display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                              <span>{it.menuItem.name} <strong>x {it.quantity}</strong></span>
                              <span style={{ color: '#94A3B8' }}>₹{it.menuItem.price * it.quantity}</span>
                            </div>
                          ))}
                          {order.cookingInstructions && (
                            <div style={{ marginTop: '6px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '4px 8px', borderRadius: '6px', fontSize: '10px', color: '#F59E0B' }}>
                              ✍️ {order.cookingInstructions}
                            </div>
                          )}
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', fontSize: '12px' }}>
                          <span style={{ color: '#94A3B8' }}>Total: <strong style={{ color: 'white' }}>₹{order.totalAmount}</strong></span>
                          <span style={{ fontSize: '10px', color: '#F59E0B' }}>🔒 Payment locked</span>
                        </div>

                        {/* Acceptance action buttons */}
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button 
                            onClick={() => cancelOrder(order.id)} 
                            style={{ 
                              flex: 1, border: 'none', background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', 
                              padding: '8px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontWeight: 700 
                            }}
                          >
                            Reject
                          </button>
                          <button 
                            onClick={() => acceptOrder(order.id)} 
                            style={{ 
                              flex: 2, border: 'none', background: '#10B981', color: 'white', 
                              padding: '8px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontWeight: 700,
                              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.4)'
                            }}
                          >
                            <Check size={14} /> Accept Order
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* SECTION 2: Awaiting Student Payment */}
                    {awaitingPaymentOrders.map(order => (
                      <div 
                        key={order.id} 
                        style={{ 
                          background: '#1E293B', 
                          borderRadius: '10px', 
                          padding: '10px', 
                          marginBottom: '10px', 
                          borderLeft: '3px solid #8B5CF6' 
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ fontSize: '9px', background: 'rgba(139, 92, 246, 0.15)', color: '#A78BFA', padding: '2px 6px', borderRadius: '4px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <CreditCard size={10} /> ACCEPTED • AWAITING UPI
                          </span>
                          <span style={{ fontSize: '10px', color: '#94A3B8' }}>{getTimeElapsed(order.timestamp)}</span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ fontSize: '14px', fontWeight: 800, color: 'white' }}>{order.token}</span>
                          <span style={{ fontSize: '11px', color: '#94A3B8' }}>{order.userName}</span>
                        </div>

                        <div style={{ fontSize: '10px', color: '#94A3B8', background: 'rgba(15, 23, 42, 0.5)', padding: '6px 8px', borderRadius: '6px', margin: '6px 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <AlertCircle size={11} color="#A78BFA" />
                          <span>Student notified to pay ₹{order.totalAmount}</span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                          <span style={{ fontSize: '11px', color: 'white', fontWeight: 700 }}>₹{order.totalAmount}</span>
                          <button 
                            onClick={() => cancelOrder(order.id)} 
                            style={{ border: 'none', background: 'transparent', color: '#EF4444', fontSize: '10px', cursor: 'pointer', padding: '2px 6px' }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* SECTION 3: Paid & Queued (Ready for Kitchen to Start Preparing) */}
                    {incomingOrders.map(order => (
                      <div 
                        key={order.id} 
                        style={{ 
                          background: '#1E293B', 
                          borderRadius: '10px', 
                          padding: '10px', 
                          marginBottom: '10px', 
                          borderLeft: '3px solid #3B82F6' 
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ fontSize: '9px', background: 'rgba(16, 185, 129, 0.2)', color: '#10B981', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                            PAID ✅
                          </span>
                          <span style={{ fontSize: '10px', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={10} /> {getTimeElapsed(order.timestamp)}
                          </span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ fontSize: '14px', fontWeight: 800, color: 'white' }}>{order.token}</span>
                          <span style={{ fontSize: '11px', color: '#CBD5E1' }}>{order.userName}</span>
                        </div>
                        
                        <div style={{ margin: '8px 0', borderTop: '1px solid #334155', borderBottom: '1px solid #334155', padding: '6px 0' }}>
                          {order.items.map(it => (
                            <div key={it.menuItem.id} style={{ fontSize: '12px', color: '#E2E8F0', display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                              <span>{it.menuItem.name} <strong>x {it.quantity}</strong></span>
                            </div>
                          ))}
                          {order.cookingInstructions && (
                            <div style={{ marginTop: '6px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '4px 8px', borderRadius: '6px', fontSize: '10px', color: '#F59E0B' }}>
                              ✍️ {order.cookingInstructions}
                            </div>
                          )}
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', fontSize: '12px' }}>
                          <span style={{ color: '#94A3B8' }}>₹{order.totalAmount}</span>
                          <button 
                            onClick={() => updateOrderStatus(order.id, 'Preparing')} 
                            style={{ 
                              border: 'none', background: '#3B82F6', color: 'white', 
                              padding: '6px 12px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontWeight: 700 
                            }}
                          >
                            Start Cooking 🍳
                          </button>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>

            {/* Column 2: Preparing */}
            <div style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', borderRight: '1px solid #1E293B', padding: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Flame size={14} color="#F59E0B" /> PREPARING
                </span>
                <span style={{ fontSize: '11px', background: '#1E293B', color: 'white', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                  {preparingOrders.length}
                </span>
              </div>
              
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {preparingOrders.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 10px', color: '#475569' }}>
                    <Flame size={28} style={{ opacity: 0.3, marginBottom: '6px' }} />
                    <p style={{ fontSize: '11px' }}>No active prep</p>
                  </div>
                ) : (
                  preparingOrders.map(order => (
                    <div key={order.id} style={{ background: '#1E293B', borderRadius: '10px', padding: '10px', marginBottom: '10px', borderLeft: '3px solid #F59E0B' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 800, color: 'white' }}>{order.token}</span>
                        <span style={{ fontSize: '10px', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={10} /> {getTimeElapsed(order.timestamp)}
                        </span>
                      </div>
                      
                      <div style={{ margin: '8px 0', borderTop: '1px solid #334155', borderBottom: '1px solid #334155', padding: '6px 0' }}>
                        {order.items.map(it => (
                          <div key={it.menuItem.id} style={{ fontSize: '12px', color: '#E2E8F0', display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                            <span>{it.menuItem.name} <strong>x {it.quantity}</strong></span>
                          </div>
                        ))}
                        {order.cookingInstructions && (
                          <div style={{ marginTop: '6px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '4px 8px', borderRadius: '6px', fontSize: '10px', color: '#F59E0B' }}>
                            ✍️ {order.cookingInstructions}
                          </div>
                        )}
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', fontSize: '12px' }}>
                        <span style={{ color: '#94A3B8' }}>{order.userName.split(' ')[0]}</span>
                        <button 
                          onClick={() => updateOrderStatus(order.id, 'Ready')} 
                          style={{ border: 'none', background: '#F59E0B', color: 'white', padding: '6px 12px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: 700, width: '100%', marginTop: '4px' }}
                        >
                          Mark as Ready 🔔
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Column 3: Ready for Pickup */}
            <div style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', padding: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle size={14} color="#10B981" /> READY & WAITING
                </span>
                <span style={{ fontSize: '11px', background: '#1E293B', color: 'white', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                  {readyOrders.length}
                </span>
              </div>
              
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {readyOrders.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 10px', color: '#475569' }}>
                    <CheckCircle size={28} style={{ opacity: 0.3, marginBottom: '6px' }} />
                    <p style={{ fontSize: '11px' }}>Waiting for pickups</p>
                  </div>
                ) : (
                  readyOrders.map(order => (
                    <div key={order.id} style={{ background: '#1E293B', borderRadius: '10px', padding: '10px', marginBottom: '10px', borderLeft: '3px solid #10B981', boxShadow: '0 0 10px rgba(16, 185, 129, 0.1)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 800, color: 'white' }}>{order.token}</span>
                        <span style={{ fontSize: '9px', color: '#94A3B8' }}>{order.userName.split(' ')[0]}</span>
                      </div>
                      
                      <div style={{ fontSize: '11px', color: '#CBD5E1', marginBottom: '10px' }}>
                        {order.items.map(it => (
                          <div key={it.menuItem.id}>{it.menuItem.name} (x{it.quantity})</div>
                        ))}
                      </div>
                      
                      <button 
                        onClick={() => handleOpenScanner(order.id)}
                        className="btn btn-orange"
                        style={{ width: '100%', padding: '6px 0', fontSize: '11px', gap: '4px', borderRadius: '6px' }}
                      >
                        <Scan size={12} /> Scan QR to Complete
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        ) : (
          /* Archive Logs */
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px', background: '#0F172A' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'white', marginBottom: '16px' }}>Order Archive (Today)</h4>
            
            {completedOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#475569' }}>
                <FileText size={36} style={{ marginBottom: '10px', opacity: 0.3 }} />
                <p>No archived orders for today.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {completedOrders.map(h => (
                  <div key={h.id} style={{ background: '#1E293B', borderRadius: '10px', padding: '12px', border: '1px solid #334155' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'white' }}>Token: {h.token} ({h.userName})</span>
                      <span className={`badge badge-${h.orderStatus.toLowerCase()}`} style={{ fontSize: '9px', padding: '2px 8px' }}>
                        {h.orderStatus}
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '6px' }}>
                      Items: {h.items.map(it => `${it.menuItem.name} (x${it.quantity})`).join(', ')}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#E2E8F0', borderTop: '1px solid #334155', paddingTop: '6px' }}>
                      <span>Received: {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{h.totalAmount}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mock QR Scanner Dialog overlay */}
      {scanningOrderId && (
        <div style={{ 
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(15, 23, 42, 0.9)', zIndex: 1000, 
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          color: 'white', padding: '20px'
        }}>
          
          <div style={{ 
            background: '#1E293B', borderRadius: '16px', border: '1px solid #334155', 
            padding: '24px', width: '100%', maxWidth: '320px', textAlign: 'center' 
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '8px' }}>QR Scanner Simulator</h3>
            <p style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '20px' }}>
              Verifying token pickup for order: <strong style={{ color: 'var(--primary)' }}>
                {orders.find(o => o.id === scanningOrderId)?.token}
              </strong>
            </p>

            {/* Simulated Camera Viewfinder */}
            <div style={{ 
              width: '180px', height: '180px', border: '2px solid #64748B', 
              borderRadius: '12px', margin: '0 auto 20px', position: 'relative',
              overflow: 'hidden', background: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              
              {/* Corner brackets */}
              <div style={{ position: 'absolute', top: '10px', left: '10px', width: '15px', height: '15px', borderTop: '3px solid var(--primary)', borderLeft: '3px solid var(--primary)' }}></div>
              <div style={{ position: 'absolute', top: '10px', right: '10px', width: '15px', height: '15px', borderTop: '3px solid var(--primary)', borderRight: '3px solid var(--primary)' }}></div>
              <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '15px', height: '15px', borderBottom: '3px solid var(--primary)', borderLeft: '3px solid var(--primary)' }}></div>
              <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '15px', height: '15px', borderBottom: '3px solid var(--primary)', borderRight: '3px solid var(--primary)' }}></div>
              
              {scanSuccess ? (
                /* Success visual */
                <div style={{ color: '#10B981', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={40} />
                  <span style={{ fontSize: '12px', fontWeight: 700 }}>Pickup Approved</span>
                </div>
              ) : (
                /* Active scanner HUD */
                <>
                  <Scan size={36} color="#475569" style={{ opacity: 0.6 }} />
                  {/* Laser beam line */}
                  <div style={{ 
                    position: 'absolute', left: 0, right: 0, height: '2px', 
                    background: '#10B981', boxShadow: '0 0 8px #10B981',
                    animation: 'scan-laser 1.8s linear infinite'
                  }}></div>
                </>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => setScanningOrderId(null)} 
                style={{ 
                  flex: 1, border: 'none', background: '#334155', color: 'white', 
                  padding: '10px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', fontWeight: 600
                }}
              >
                Cancel
              </button>
              
              {!scanSuccess && (
                <button 
                  onClick={handleSimulateScan} 
                  className="btn btn-orange"
                  style={{ flex: 1, padding: '10px', fontSize: '12px', borderRadius: '8px' }}
                >
                  Scan QR Code
                </button>
              )}
            </div>
          </div>
          
          <style>{`
            @keyframes scan-laser {
              0% { top: 10px; }
              50% { top: 170px; }
              100% { top: 10px; }
            }
          `}</style>
        </div>
      )}

      {/* Screen bottom indicator */}
      <div style={{ height: '10px', background: '#1E293B', flexShrink: 0 }}></div>
    </div>
  );
};
export default VendorApp;
