export interface Transaction {
  contract_address: any;
  function_name: any;
  nonce: string;
  is_error: string;
  hash: string;
  value: number | string;
  input: string;
  gas: string;
  gas_used: number;
  gas_price: number;
  transaction_fee: number;
  block_number: number;
  transaction_index: string;
  block_hash: string;
  block_timestamp: number;
  receiver: string;
  sender: string;
}
