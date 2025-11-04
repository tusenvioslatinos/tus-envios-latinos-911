export interface Admin {
  id: string;
  email: string;
  password: string;
  name: string;
  createdAt: string;
}

export interface OrderDB {
  id: string;
  type: string;
  recipientData: string;
  amount: number;
  currency: string;
  senderName: string;
  senderPhone?: string;
  senderEmail?: string;
  senderCountry: string;
  details?: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

let admins: Admin[] = [];
let orders: OrderDB[] = [];

export const db = {
  admins: {
    async findByEmail(email: string): Promise<Admin | undefined> {
      return admins.find(a => a.email === email);
    },
    async findById(id: string): Promise<Admin | undefined> {
      return admins.find(a => a.id === id);
    },
    async create(admin: Admin): Promise<Admin> {
      admins.push(admin);
      return admin;
    },
    async getAll(): Promise<Admin[]> {
      return admins;
    }
  },
  orders: {
    async create(order: OrderDB): Promise<OrderDB> {
      orders.unshift(order);
      return order;
    },
    async findById(id: string): Promise<OrderDB | undefined> {
      return orders.find(o => o.id === id);
    },
    async getAll(): Promise<OrderDB[]> {
      return orders;
    },
    async update(id: string, updates: Partial<OrderDB>): Promise<OrderDB | null> {
      const index = orders.findIndex(o => o.id === id);
      if (index === -1) return null;
      orders[index] = { ...orders[index], ...updates, updatedAt: new Date().toISOString() };
      return orders[index];
    },
    async delete(id: string): Promise<boolean> {
      const initialLength = orders.length;
      orders = orders.filter(o => o.id !== id);
      return orders.length < initialLength;
    }
  }
};
