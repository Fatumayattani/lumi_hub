/*
  # Crypto Payment System

  1. New Tables
    - `crypto_transactions`
      - `id` (uuid, primary key)
      - `product_id` (uuid, references products)
      - `user_id` (uuid, references auth.users)
      - `amount` (numeric, payment amount in USD)
      - `crypto_amount` (text, amount in cryptocurrency)
      - `currency` (text, cryptocurrency used)
      - `status` (text, payment status)
      - `gateway_payment_id` (text, Coinbase Commerce charge ID)
      - `transaction_hash` (text, blockchain transaction hash)
      - `payment_url` (text, Coinbase Commerce hosted URL)
      - `expires_at` (timestamp, payment expiration)
      - `completed_at` (timestamp, when payment was completed)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `user_purchases`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `product_id` (uuid, references products)
      - `transaction_id` (uuid, references crypto_transactions)
      - `purchase_type` (text, 'crypto' or 'stripe')
      - `amount_paid` (numeric, amount paid)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for users to read their own transactions and purchases
    - Add policies for authenticated users to create transactions

  3. Indexes
    - Add indexes for performance on foreign keys and status fields
*/

-- Create crypto_transactions table
CREATE TABLE IF NOT EXISTS crypto_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  amount numeric(10,2) NOT NULL DEFAULT 0,
  crypto_amount text DEFAULT '',
  currency text DEFAULT '',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed', 'expired')),
  gateway_payment_id text DEFAULT '',
  transaction_hash text DEFAULT '',
  payment_url text DEFAULT '',
  expires_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_purchases table
CREATE TABLE IF NOT EXISTS user_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  transaction_id uuid REFERENCES crypto_transactions(id) ON DELETE SET NULL,
  purchase_type text DEFAULT 'crypto' CHECK (purchase_type IN ('crypto', 'stripe')),
  amount_paid numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE crypto_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_purchases ENABLE ROW LEVEL SECURITY;

-- Crypto transactions policies
CREATE POLICY "Users can read own crypto transactions"
  ON crypto_transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create crypto transactions"
  ON crypto_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own crypto transactions"
  ON crypto_transactions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- User purchases policies
CREATE POLICY "Users can read own purchases"
  ON user_purchases
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create purchases"
  ON user_purchases
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS crypto_transactions_user_id_idx ON crypto_transactions(user_id);
CREATE INDEX IF NOT EXISTS crypto_transactions_product_id_idx ON crypto_transactions(product_id);
CREATE INDEX IF NOT EXISTS crypto_transactions_status_idx ON crypto_transactions(status);
CREATE INDEX IF NOT EXISTS crypto_transactions_gateway_id_idx ON crypto_transactions(gateway_payment_id);

CREATE INDEX IF NOT EXISTS user_purchases_user_id_idx ON user_purchases(user_id);
CREATE INDEX IF NOT EXISTS user_purchases_product_id_idx ON user_purchases(product_id);
CREATE INDEX IF NOT EXISTS user_purchases_transaction_id_idx ON user_purchases(transaction_id);

-- Create updated_at trigger for crypto_transactions
CREATE TRIGGER update_crypto_transactions_updated_at
  BEFORE UPDATE ON crypto_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();