export interface Transaction {
  // Essential properties
  hash: string;
  value: string | number;
  block_number: string | number;
  block_timestamp: string | number;

  // Transaction details
  input: string;
  gas: string;
  gas_used: string | number;
  gas_price: string | number;
  transaction_fee: string | number;
  transaction_index: string;
  block_hash: string;

  // Address related
  from_address?: string;
  to_address?: string;
  sender: string;
  receiver: string;
  direction: string | "incoming" | "outgoing";

  // Contract related
  contract_address?: string;
  function_name?: string;

  // Additional metadata
  nonce?: string;
  is_error?: string;

  // Optional receipt fields
  receipt_cumulative_gas_used?: string;
  receipt_gas_used?: string;
  receipt_status?: string;

  // To accommodate any function properties if needed
  [key: string]: any;
}
