import { createContext, useContext, useEffect, useRef, type ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';

interface SocketContextType {
  socket: Socket | null;
  joinProduct: (productId: string) => void;
  leaveProduct: (productId: string) => void;
  joinAdmin: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export function SocketProvider({ children }: { children: ReactNode }) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    // Listen for product updates (price/stock changes from admin)
    socket.on('productUpdated', (_data) => {
      toast.info('Product updated', {
        description: 'Price or availability has changed.',
      });
    });

    // Listen for new orders (admin dashboard)
    socket.on('newOrder', (data) => {
      toast.success('New order received!', {
        description: `Order #${data.orderNumber} — ₹${data.total?.toFixed(0)}`,
      });
    });

    // Listen for order status updates (customer)
    socket.on('orderStatusUpdated', (data) => {
      toast.info('Order status updated', {
        description: `Status: ${data.status}`,
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const joinProduct = (productId: string) => {
    socketRef.current?.emit('joinProduct', productId);
  };

  const leaveProduct = (productId: string) => {
    socketRef.current?.emit('leaveProduct', productId);
  };

  const joinAdmin = () => {
    socketRef.current?.emit('joinAdmin');
  };

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        joinProduct,
        leaveProduct,
        joinAdmin,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
