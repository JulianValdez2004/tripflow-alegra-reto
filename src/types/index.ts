export type Trip = {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  budgetLimit: number;
  currency: string;
  createdAt: string;
};

export type Expense = {
  id: string;
  tripId: string;
  title: string;
  amount: number;
  category: string;
  receiptUrl?: string; // Foto opcional
  createdAt: string;
};
