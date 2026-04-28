export enum OrderStatus {
  RECEIVED = 'RECEIVED',
  PROCESSING = 'PROCESSING',
  READY = 'READY',
  DELIVERED = 'DELIVERED',
}

export interface Garment {
  type: string;
  quantity: number;
  pricePerUnit: number;
}

export interface Order {
  id?: string;
  customerName: string;
  customerPhone: string;
  garments: Garment[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  estimatedDeliveryDate?: Date;
}

export interface GarmentType {
  id?: string;
  name: string;
  basePrice: number;
}
