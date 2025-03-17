/*
  # E-commerce schema for Joystick Jungle

  1. New Tables
    - `products` - Store products information
    - `orders` - Store customer orders
    - `order_items` - Store items in each order
  
  2. Security
    - Enable RLS on all tables
    - Create policies for customers and admins
  
  3. Functions
    - Stock management functions for order processing
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

-- Products policies - check if they exist first
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Anyone can view products'
  ) THEN
    CREATE POLICY "Anyone can view products"
      ON products
      FOR SELECT
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Only admins can insert products'
  ) THEN
    CREATE POLICY "Only admins can insert products"
      ON products
      FOR INSERT
      WITH CHECK (is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Only admins can update products'
  ) THEN
    CREATE POLICY "Only admins can update products"
      ON products
      FOR UPDATE
      USING (is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Only admins can delete products'
  ) THEN
    CREATE POLICY "Only admins can delete products"
      ON products
      FOR DELETE
      USING (is_admin());
  END IF;
END
$$;

-- Orders policies - check if they exist first
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Users can view their own orders'
  ) THEN
    CREATE POLICY "Users can view their own orders"
      ON orders
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Users can insert their own orders'
  ) THEN
    CREATE POLICY "Users can insert their own orders"
      ON orders
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Users can update their own pending orders'
  ) THEN
    CREATE POLICY "Users can update their own pending orders"
      ON orders
      FOR UPDATE
      USING (auth.uid() = user_id AND status = 'pending');
  END IF;
END
$$;

-- Order items policies - check if they exist first
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'order_items' AND policyname = 'Users can view their own order items'
  ) THEN
    CREATE POLICY "Users can view their own order items"
      ON order_items
      FOR SELECT
      USING (EXISTS (
        SELECT 1 FROM orders
        WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
      ));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'order_items' AND policyname = 'Users can insert their own order items'
  ) THEN
    CREATE POLICY "Users can insert their own order items"
      ON order_items
      FOR INSERT
      WITH CHECK (EXISTS (
        SELECT 1 FROM orders
        WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
      ));
  END IF;
END
$$;

-- Admin policies for orders and order items - check if they exist first
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Admins can view all orders'
  ) THEN
    CREATE POLICY "Admins can view all orders"
      ON orders
      FOR SELECT
      USING (is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Admins can update all orders'
  ) THEN
    CREATE POLICY "Admins can update all orders"
      ON orders
      FOR UPDATE
      USING (is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'order_items' AND policyname = 'Admins can view all order items'
  ) THEN
    CREATE POLICY "Admins can view all order items"
      ON order_items
      FOR SELECT
      USING (is_admin());
  END IF;
END
$$;

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
DROP TRIGGER IF EXISTS update_stock_on_order ON order_items;
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
DROP TRIGGER IF EXISTS restore_stock_on_delete ON order_items;
CREATE TRIGGER restore_stock_on_delete
AFTER DELETE ON order_items
FOR EACH ROW
EXECUTE FUNCTION restore_product_stock();

-- Create helper function for getting orders with item count
CREATE OR REPLACE FUNCTION get_orders_with_item_count(user_id_param uuid DEFAULT NULL)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  status text,
  total_amount numeric,
  payment_method text,
  payment_reference text,
  shipping_address text,
  created_at timestamptz,
  updated_at timestamptz,
  items_count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    o.user_id,
    o.status,
    o.total_amount,
    o.payment_method,
    o.payment_reference,
    o.shipping_address,
    o.created_at,
    o.updated_at,
    COUNT(oi.id)::bigint as items_count
  FROM 
    orders o
  LEFT JOIN 
    order_items oi ON o.id = oi.order_id
  WHERE 
    (user_id_param IS NULL OR o.user_id = user_id_param)
  GROUP BY 
    o.id
  ORDER BY 
    o.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Create helper function for getting orders with user info
CREATE OR REPLACE FUNCTION get_orders_with_user_info()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  status text,
  total_amount numeric,
  payment_method text,
  payment_reference text,
  shipping_address text,
  created_at timestamptz,
  updated_at timestamptz,
  user_email text,
  items_count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    o.user_id,
    o.status,
    o.total_amount,
    o.payment_method,
    o.payment_reference,
    o.shipping_address,
    o.created_at,
    o.updated_at,
    p.email as user_email,
    COUNT(oi.id)::bigint as items_count
  FROM 
    orders o
  LEFT JOIN 
    profiles p ON o.user_id = p.id
  LEFT JOIN 
    order_items oi ON o.id = oi.order_id
  GROUP BY 
    o.id, p.email
  ORDER BY 
    o.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS products_category_idx ON products(category);
CREATE INDEX IF NOT EXISTS orders_user_id_idx ON orders(user_id);
CREATE INDEX IF NOT EXISTS orders_status_idx ON orders(status);
CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON order_items(order_id);
CREATE INDEX IF NOT EXISTS order_items_product_id_idx ON order_items(product_id);