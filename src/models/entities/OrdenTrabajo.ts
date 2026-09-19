import { OrderStatus } from "@prisma/client";

export interface OrdenTrabajo {
  id: string;
  clientId: string;
  vehicleId: string;
  mechanicId: string | null;
  status: OrderStatus;
  diagnosis: string | null;
  fuelLevel: string;
  laborCost: number;
  totalCost: number;
  createdAt: Date;
}
