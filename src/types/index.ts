export type User = {
  id: string;
  email: string;
  name: string;
  created_at: string;
};

export type Auction = {
  id: string;
  seller_id: string;
  seller_name?: string;
  title: string;
  description: string | null;
  starting_price: number;
  current_price: number;
  status: 'active' | 'ended';
  ends_at: string;
  created_at: string;
  bid_count?: number;
};

export type Bid = {
  id: string;
  auction_id: string;
  bidder_id: string;
  bidder_name?: string;
  amount: number;
  created_at: string;
  rank?: number;
};

export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };
