declare module "@/types/booking" {
  export interface Booking {
    id: string;
    userDetails: {
      fullName: string;
      email: string;
      phone: string;
    };
    journey: {
      pickup: {
        address: string;
      };
      dropoff: {
        address: string;
      };
      date: string;
      time: string;
    };
    vehicle: {
      type: string;
    };
    passengers: {
      count: number;
    };
    status: "pending" | "confirmed" | "completed" | "cancelled";
    specialRequests?: string;
  }
}
