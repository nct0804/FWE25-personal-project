export interface Trip {
    _id: string;
    name: string;
    description?: string;
    image?: string;
    participants?: string[];
    startDate?: Date;
    endDate?: Date;
    destinations?: Destination[];
    budget?: number;
  }
  
  export interface Destination {
    id: string | undefined;
    _id: string;
    name: string;
    description?: string;
    activities?: string[];
    startDate?: Date;
    endDate?: Date;
    photos?: string[];
  }
  
  export interface Budget {
    _id: string;
    tripId: string;
    category: string;
    amount: number;
    description?: string;
  }
  
  export interface CurrencyConversion {
    amount: number;
    from: string;
    to: string;
    convertedAmount: number;
    rate: number;
  }