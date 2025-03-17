/*
  # Shop System Schema

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `description` (text)
      - `price` (numeric, not null)
      - `image_url` (text)
      - `category` (text, not null)
      - `stock` (integer, not null)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    - `orders`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `status` (text, not null)
      - `total_amount` (numeric, not null)
      - `payment_method` (text, not null)
      - `payment_reference` (text)
      - `shipping_address` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    - `order_items`
      - `id` (uuid, primary key)
      - `order_id` (uuid, foreign key to orders)
      - `product_id` (uuid, foreign key to products)
      - `quantity` (integer, not null)
      - `price` (numeric, not null)
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users and admins
    - Create functions for stock management
*/

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric NOT NULL CHECK (price >= 0),
  image_url text,
  category text NOT NULL,
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  total_amount numeric NOT NULL CHECK (total_amount >= 0),
  payment_method text NOT NULL,
  payment_reference text,
  shipping_address text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity integer NOT NULL CHECK (quantity > 0),
  price numeric NOT NULL CHECK (price >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Products policies
CREATE POLICY "Anyone can view products"
  ON products
  FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert products"
  ON products
  FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Only admins can update products"
  ON products
  FOR UPDATE
  USING (is_admin());

CREATE POLICY "Only admins can delete products"
  ON products
  FOR DELETE
  USING (is_admin());

-- Orders policies
CREATE POLICY "Users can view their own orders"
  ON orders
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders"
  ON orders
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending orders"
  ON orders
  FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending');

-- Order items policies
CREATE POLICY "Users can view their own order items"
  ON order_items
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their own order items"
  ON order_items
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  ));

-- Admin policies for orders and order items
CREATE POLICY "Admins can view all orders"
  ON orders
  FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can update all orders"
  ON orders
  FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins can view all order items"
  ON order_items
  FOR SELECT
  USING (is_admin());

-- Function to update stock when order is placed
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
  -- Decrease product stock
  UPDATE products
  SET 
    stock = stock - NEW.quantity,
    updated_at = now()
  WHERE id = NEW.product_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update stock when order item is inserted
CREATE TRIGGER update_stock_on_order
AFTER INSERT ON order_items
FOR EACH ROW
EXECUTE FUNCTION update_product_stock();

-- Function to restore stock when order item is deleted or order is cancelled
CREATE OR REPLACE FUNCTION restore_product_stock()
RETURNS TRIGGER AS $$
BEGIN
  -- Increase product stock
  UPDATE products
  SET 
    stock = stock + OLD.quantity,
    updated_at = now()
  WHERE id = OLD.product_id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger to restore stock when order item is deleted
CREATE TRIGGER restore_stock_on_delete
AFTER DELETE ON order_items
FOR EACH ROW
EXECUTE FUNCTION restore_product_stock();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS products_category_idx ON products(category);
CREATE INDEX IF NOT EXISTS orders_user_id_idx ON orders(user_id);
CREATE INDEX IF NOT EXISTS orders_status_idx ON orders(status);
CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON order_items(order_id);
CREATE INDEX IF NOT EXISTS order_items_product_id_idx ON order_items(product_id);