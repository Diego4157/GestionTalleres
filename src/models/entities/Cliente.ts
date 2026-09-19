export interface Cliente {
  id: string;
  name: string;
  identification: string;
  phone: string;
  email: string | null;
  address: string | null;
  createdAt: Date;
}
