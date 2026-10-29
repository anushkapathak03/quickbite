import React, { createContext, useContext, useState, useEffect } from 'react';

// Interfaces
export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  availability: boolean;
  isVeg: boolean;
  description: string;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  items: CartItem[];
  totalAmount: number;
  paymentStatus: 'Pending' | 'Completed' | 'Failed';
  orderStatus: 'Pending' | 'Received' | 'Preparing' | 'Ready' | 'Completed' | 'Cancelled';
  timestamp: string;
  token: string;
  cookingInstructions?: string;
}

export interface Payment {
  id: string;
  orderId: string;
  upiTxnId: string;
  amount: number;
  status: 'SUCCESS' | 'FAILED';
  timestamp: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  role: 'student' | 'vendor' | 'admin' | 'all';
  timestamp: string;
  read: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'student' | 'vendor' | 'admin';
}

interface CanteenContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  menuItems: MenuItem[];
  orders: Order[];
  payments: Payment[];
  notifications: Notification[];
  cart: { [itemId: string]: number };
  activeTab: 'menu' | 'orders' | 'history';
  setActiveTab: (tab: 'menu' | 'orders' | 'history') => void;
  
  // Functions
  loginUser: (name: string, email: string, phone: string, role: 'student' | 'vendor' | 'admin') => void;
  logoutUser: () => void;
  
  // Cart Actions
  addToCart: (itemId: string) => void;
  removeFromCart: (itemId: string) => void;
  updateCartQty: (itemId: string, qty: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  
  // Order Actions
  createOrder: (cookingInstructions?: string) => Order;
  completePayment: (orderId: string, upiTxnId: string) => void;
  updateOrderStatus: (orderId: string, status: Order['orderStatus']) => void;
  cancelOrder: (orderId: string) => void;
  verifyPickup: (orderId: string) => boolean;
  acceptOrder: (orderId: string) => void;
  
  // Admin menu actions
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  updateMenuItem: (item: MenuItem) => void;
  deleteMenuItem: (id: string) => void;
  
  // System actions
  resetDatabase: () => void;
  clearNotifications: () => void;
}

const CanteenContext = createContext<CanteenContextType | undefined>(undefined);

// Initial Data Setup
const DEFAULT_MENU: MenuItem[] = [
  {
    id: 'm1',
    name: 'Masala Dosa',
    price: 80,
    category: 'South Indian',
    image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=400&q=80',
    availability: true,
    isVeg: true,
    description: 'Crispy rice crepe filled with savory spiced potato mash, served with fresh coconut chutney and hot sambar.'
  },
  {
    id: 'm2',
    name: 'Samosa (2 pcs)',
    price: 30,
    category: 'Snacks',
    image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=400&q=80',
    availability: true,
    isVeg: true,
    description: 'Golden-fried pastry pockets stuffed with a delicious savory filling of spiced potatoes and peas.'
  },
  {
    id: 'm3',
    name: 'Butter Chicken & Roti',
    price: 150,
    category: 'North Indian',
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&q=80',
    availability: true,
    isVeg: false,
    description: 'Creamy, mildly sweet tomato-butter gravy with tender chicken chunks, accompanied by two tandoori rotis.'
  },
  {
    id: 'm4',
    name: 'Veg Hakka Noodles',
    price: 90,
    category: 'Chinese',
    image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&q=80',
    availability: true,
    isVeg: true,
    description: 'Stir-fried noodles tossed with fresh shredded cabbage, carrots, bell peppers, and savory soy seasoning.'
  },
  {
    id: 'm5',
    name: 'Chole Bhature (2 pcs)',
    price: 110,
    category: 'North Indian',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&q=80',
    availability: true,
    isVeg: true,
    description: 'Puffy deep-fried leavened bread served with rich, spicy chickpea curry, sliced onions, and lemon.'
  },
  {
    id: 'm6',
    name: 'Cold Coffee',
    price: 50,
    category: 'Beverages',
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400&q=80',
    availability: true,
    isVeg: true,
    description: 'Refreshing blended iced cold milk and coffee, topped with premium chocolate syrup.'
  },
  {
    id: 'm7',
    name: 'Paneer Tikka Roll',
    price: 100,
    category: 'Snacks',
    image: 'https://images.unsplash.com/photo-1628186109595-41a1c93a560c?w=400&q=80',
    availability: true,
    isVeg: true,
    description: 'Soft flatbread wrap stuffed with grilled marinated cottage cheese cubes, crisp onions, and mint chutney.'
  }
];

// Synth Chime Notification sound generator (No dependencies)
const playNotificationSound = (type: 'student' | 'vendor') => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    if (type === 'student') {
      // High sweet double beep
      const osc1 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc1.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.15);
      
      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        gain2.gain.setValueAtTime(0.1, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc2.start();
        osc2.stop(ctx.currentTime + 0.25);
      }, 150);
    } else {
      // Bell chime for kitchen (G4 -> C5)
      const osc1 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(392.00, ctx.currentTime); // G4
      osc1.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.25);
      
      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        gain2.gain.setValueAtTime(0.15, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc2.start();
        osc2.stop(ctx.currentTime + 0.5);
      }, 200);
    }
  } catch (e) {
    console.error('Audio synthesis failed', e);
  }
};

export const CanteenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Current session User
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('qb_user');
    return saved ? JSON.parse(saved) : {
      id: 'stud-1',
      name: 'Rohan Sharma',
      email: 'rohan.sharma@college.edu',
      phone: '9876543210',
      role: 'student'
    };
  });

  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('qb_menu');
    return saved ? JSON.parse(saved) : DEFAULT_MENU;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('qb_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [payments, setPayments] = useState<Payment[]>(() => {
    const saved = localStorage.getItem('qb_payments');
    return saved ? JSON.parse(saved) : [];
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('qb_notifications');
    return saved ? JSON.parse(saved) : [
      {
        id: 'n-init',
        title: 'Welcome to QuickBite!',
        message: 'Pre-order food, pay securely via mock UPI, and collect with a QR code.',
        role: 'all',
        timestamp: new Date().toISOString(),
        read: false
      }
    ];
  });

  const [cart, setCart] = useState<{ [itemId: string]: number }>({});
  const [activeTab, setActiveTab] = useState<'menu' | 'orders' | 'history'>('menu');

  // Persistence
  useEffect(() => {
    localStorage.setItem('qb_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('qb_menu', JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    localStorage.setItem('qb_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('qb_payments', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem('qb_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Auth Operations
  const loginUser = (name: string, email: string, phone: string, role: 'student' | 'vendor' | 'admin') => {
    const user: User = {
      id: `${role}-${Date.now().toString().slice(-4)}`,
      name,
      email,
      phone,
      role
    };
    setCurrentUser(user);
    setCart({}); // clear cart on login
  };

  const logoutUser = () => {
    setCurrentUser(null);
    setCart({});
  };

  // Cart Operations
  const addToCart = (itemId: string) => {
    setCart(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1
    }));
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => {
      const current = prev[itemId] || 0;
      if (current <= 1) {
        const next = { ...prev };
        delete next[itemId];
        return next;
      }
      return {
        ...prev,
        [itemId]: current - 1
      };
    });
  };

  const updateCartQty = (itemId: string, qty: number) => {
    if (qty <= 0) {
      setCart(prev => {
        const next = { ...prev };
        delete next[itemId];
        return next;
      });
    } else {
      setCart(prev => ({
        ...prev,
        [itemId]: qty
      }));
    }
  };

  const clearCart = () => setCart({});

  const getCartTotal = () => {
    return Object.keys(cart).reduce((total, id) => {
      const item = menuItems.find(m => m.id === id);
      return total + (item ? item.price * cart[id] : 0);
    }, 0);
  };

  const getCartCount = () => {
    return Object.values(cart).reduce((a, b) => a + b, 0);
  };

  // Notification Trigger Helper
  const triggerNotification = (title: string, message: string, role: Notification['role'] = 'all') => {
    const newNotif: Notification = {
      id: `n-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title,
      message,
      role,
      timestamp: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);

    // Audio Playback
    if (role === 'student' || role === 'all') {
      playNotificationSound('student');
    }
    if (role === 'vendor' || role === 'all') {
      playNotificationSound('vendor');
    }
  };

  // Order Operations
  const createOrder = (cookingInstructions?: string): Order => {
    if (!currentUser) throw new Error('User not logged in');
    
    // Compile items
    const itemsList: CartItem[] = Object.keys(cart).map(id => {
      const item = menuItems.find(m => m.id === id);
      if (!item) throw new Error(`Menu item not found: ${id}`);
      return {
        menuItem: item,
        quantity: cart[id]
      };
    });

    const tokenNum = orders.filter(o => {
      const today = new Date().toDateString();
      const orderDate = new Date(o.timestamp).toDateString();
      return today === orderDate;
    }).length + 101;

    const newOrder: Order = {
      id: `order-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userPhone: currentUser.phone,
      items: itemsList,
      totalAmount: getCartTotal(),
      paymentStatus: 'Pending',
      orderStatus: 'Pending', // Waiting for kitchen to accept before payment is allowed
      timestamp: new Date().toISOString(),
      token: `QB-${tokenNum}`,
      cookingInstructions
    };

    setOrders(prev => [newOrder, ...prev]);
    clearCart();

    // Notify vendor of new incoming order request
    triggerNotification(
      'New Order Request! 🛎️',
      `Token ${newOrder.token} from ${currentUser.name} — ₹${newOrder.totalAmount}. Please accept to unlock payment.`,
      'vendor'
    );

    // Notify student their order is placed and waiting
    triggerNotification(
      'Order Placed! ⏳',
      `Token ${newOrder.token} sent to kitchen. Waiting for kitchen to accept before you can pay.`,
      'student'
    );

    return newOrder;
  };

  const completePayment = (orderId: string, upiTxnId: string) => {
    // 1. Update Order status
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          paymentStatus: 'Completed',
          orderStatus: 'Received'
        };
      }
      return o;
    }));

    // Find the order
    const order = orders.find(o => o.id === orderId);
    const amount = order ? order.totalAmount : 0;

    // 2. Create Payment Record
    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      orderId,
      upiTxnId,
      amount,
      status: 'SUCCESS',
      timestamp: new Date().toISOString()
    };
    setPayments(prev => [newPayment, ...prev]);
    
    // Clear student cart
    clearCart();

    // 3. Trigger Notification
    triggerNotification(
      'Payment Received! 💰',
      `Token ${order?.token || 'QB-xxx'} payment of ₹${amount} confirmed. Start preparing!`,
      'vendor'
    );
    
    triggerNotification(
      'Payment Successful! 🎉',
      `₹${amount} paid. Token: ${order?.token || 'QB-xxx'}. Kitchen is now preparing your order.`,
      'student'
    );
  };

  const acceptOrder = (orderId: string) => {
    let orderToken = '';
    let orderAmount = 0;
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        orderToken = o.token;
        orderAmount = o.totalAmount;
        return { ...o, orderStatus: 'Received' };
      }
      return o;
    }));
    // Notify student that kitchen accepted — payment is now unlocked
    triggerNotification(
      'Kitchen Accepted! 💳 Pay Now',
      `Token ${orderToken} accepted! Please complete UPI payment of ₹${orderAmount} to confirm your order.`,
      'student'
    );
  };

  const updateOrderStatus = (orderId: string, status: Order['orderStatus']) => {
    let orderToken = '';
    
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        orderToken = o.token;
        return { ...o, orderStatus: status };
      }
      return o;
    }));

    // Notifications depending on state
    if (status === 'Preparing') {
      triggerNotification(
        'Chef is cooking! 🍜',
        `Your order ${orderToken} is now being prepared in the kitchen.`,
        'student'
      );
    } else if (status === 'Ready') {
      triggerNotification(
        'Order Ready for Pickup! 🔔',
        `Grab your food at the counter! Show QR code for Token ${orderToken}.`,
        'student'
      );
    } else if (status === 'Completed') {
      triggerNotification(
        'Order Completed! 😋',
        `Enjoy your food! Thank you for ordering on QuickBite.`,
        'student'
      );
    }
  };

  const cancelOrder = (orderId: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return { ...o, orderStatus: 'Cancelled' };
      }
      return o;
    }));
    
    const order = orders.find(o => o.id === orderId);
    triggerNotification(
      'Cart Order Rejected ❌',
      `Your order ${order?.token || ''} was rejected by the canteen kitchen. Returning to menu.`,
      'student'
    );
  };

  // Vendor scans Student QR
  const verifyPickup = (orderId: string): boolean => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return false;
    if (order.orderStatus !== 'Ready') {
      return false; // Can only pickup ready orders
    }

    updateOrderStatus(orderId, 'Completed');
    triggerNotification(
      'Pickup Verified! ✅',
      `Token ${order.token} picked up and marked as completed.`,
      'vendor'
    );
    return true;
  };

  // Admin CRUD for Menu
  const addMenuItem = (item: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = {
      ...item,
      id: `m-${Date.now()}`
    };
    setMenuItems(prev => [...prev, newItem]);
    triggerNotification(
      'Menu Updated 🍛',
      `New item "${newItem.name}" has been added to the canteen menu!`,
      'student'
    );
  };

  const updateMenuItem = (updatedItem: MenuItem) => {
    setMenuItems(prev => prev.map(m => m.id === updatedItem.id ? updatedItem : m));
  };

  const deleteMenuItem = (id: string) => {
    const item = menuItems.find(m => m.id === id);
    setMenuItems(prev => prev.filter(m => m.id !== id));
    if (item) {
      // Remove from active carts
      setCart(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  // Reset System State
  const resetDatabase = () => {
    setMenuItems(DEFAULT_MENU);
    setOrders([]);
    setPayments([]);
    setNotifications([
      {
        id: `n-${Date.now()}`,
        title: 'Simulator Reset Successfully',
        message: 'Mock database has been restored to default settings.',
        role: 'all',
        timestamp: new Date().toISOString(),
        read: false
      }
    ]);
    setCart({});
    localStorage.removeItem('qb_menu');
    localStorage.removeItem('qb_orders');
    localStorage.removeItem('qb_payments');
    localStorage.removeItem('qb_notifications');
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <CanteenContext.Provider value={{
      currentUser,
      setCurrentUser,
      menuItems,
      orders,
      payments,
      notifications,
      cart,
      activeTab,
      setActiveTab,
      loginUser,
      logoutUser,
      addToCart,
      removeFromCart,
      updateCartQty,
      clearCart,
      getCartTotal,
      getCartCount,
      createOrder,
      completePayment,
      acceptOrder,
      updateOrderStatus,
      cancelOrder,
      verifyPickup,
      addMenuItem,
      updateMenuItem,
      deleteMenuItem,
      resetDatabase,
      clearNotifications
    }}>
      {children}
    </CanteenContext.Provider>
  );
};

export const useCanteen = () => {
  const context = useContext(CanteenContext);
  if (context === undefined) {
    throw new Error('useCanteen must be used within a CanteenProvider');
  }
  return context;
};
