export interface AdminAuthPayload {
  adminId: string;
  email: string;
}

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

export interface OrderNotification {
  orderId: string;
  status: OrderStatus;
  message: string;
}
