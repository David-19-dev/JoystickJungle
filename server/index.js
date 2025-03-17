import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// PayTech API configuration
const PAYTECH_API_KEY = process.env.PAYTECH_API_KEY;
const PAYTECH_SECRET_KEY = process.env.PAYTECH_SECRET_KEY;
const PAYTECH_API_URL = 'https://paytech.sn/api/payment/request-payment';

// Validate environment variables
if (!PAYTECH_API_KEY || !PAYTECH_SECRET_KEY) {
  console.error('PayTech API credentials are missing. Please check your .env file.');
  process.exit(1);
}

// API Routes
app.post('/api/pay-with-wave', async (req, res) => {
  try {
    const { name, phone, amount, item_name, description, session_id, subscription_id } = req.body;

    // Validate required fields
    if (!name || !phone || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, phone, and amount are required'
      });
    }

    // Format phone number (ensure it starts with 221 for Senegal)
    let formattedPhone = phone.replace(/\D/g, ''); // Remove non-digits
    if (!formattedPhone.startsWith('221') && formattedPhone.length === 9) {
      formattedPhone = `221${formattedPhone}`;
    }

    // Create a unique reference for this transaction
    const reference = `WAVE-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Prepare the request to PayTech API
    const paymentData = {
      item_name: item_name || 'Joystick Jungle Payment',
      item_price: amount,
      currency: 'XOF',
      reference: reference,
      command_name: description || `Payment for ${name}`,
      env: 'test', // Change to 'prod' for production
      ipn_url: `${req.protocol}://${req.get('host')}/api/payment-callback`,
      success_url: `${process.env.VITE_API_URL || 'http://localhost:5173'}/payment-success`,
      cancel_url: `${process.env.VITE_API_URL || 'http://localhost:5173'}/payment-cancel`,
      custom_field: JSON.stringify({
        customer_name: name,
        customer_phone: formattedPhone,
        session_id,
        subscription_id
      })
    };

    // Make request to PayTech API
    const response = await axios.post(PAYTECH_API_URL, paymentData, {
      headers: {
        'Content-Type': 'application/json',
        'API_KEY': PAYTECH_API_KEY,
        'API_SECRET': PAYTECH_SECRET_KEY
      }
    });

    // Check if the response contains the payment URL
    if (response.data && response.data.success && response.data.redirect_url) {
      // Store payment information in database
      if (session_id || subscription_id) {
        try {
          const userId = await getUserIdFromSessionOrSubscription(session_id, subscription_id);
          
          if (userId) {
            await supabase.from('payments').insert({
              user_id: userId,
              amount: parseFloat(amount),
              currency: 'XOF',
              payment_method: 'wave',
              status: 'pending',
              reference: reference,
              session_id: session_id || null,
              subscription_id: subscription_id || null,
              created_at: new Date().toISOString()
            });
          }
        } catch (dbError) {
          console.error('Error storing payment information:', dbError);
          // Continue with payment process even if DB storage fails
        }
      }
      
      // Return the payment URL to the client
      return res.status(200).json({
        success: true,
        message: 'Payment request created successfully',
        payment_url: response.data.redirect_url,
        token: response.data.token
      });
    } else {
      console.error('PayTech API error:', response.data);
      return res.status(500).json({
        success: false,
        message: 'Failed to create payment request',
        error: response.data
      });
    }
  } catch (error) {
    console.error('Payment processing error:', error.message);
    
    // Handle specific axios errors
    if (error.response) {
      console.error('PayTech API response error:', error.response.data);
      return res.status(error.response.status).json({
        success: false,
        message: 'Payment provider error',
        error: error.response.data
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'An error occurred while processing your payment',
      error: error.message
    });
  }
});

// Payment callback endpoint (IPN - Instant Payment Notification)
app.post('/api/payment-callback', async (req, res) => {
  try {
    const paymentData = req.body;
    console.log('Payment callback received:', paymentData);
    
    // Verify the payment data
    if (!paymentData || !paymentData.token || !paymentData.status) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid payment data' 
      });
    }
    
    // Extract custom field data
    let customField = {};
    try {
      if (paymentData.custom_field) {
        customField = JSON.parse(paymentData.custom_field);
      }
    } catch (e) {
      console.error('Error parsing custom field:', e);
    }
    
    const { session_id, subscription_id } = customField;
    
    // Update payment status in database
    if (paymentData.reference) {
      try {
        const { data, error } = await supabase
          .from('payments')
          .update({ 
            status: paymentData.status === 'completed' ? 'completed' : 'failed',
            updated_at: new Date().toISOString()
          })
          .eq('reference', paymentData.reference);
        
        if (error) {
          console.error('Error updating payment status:', error);
        }
      } catch (dbError) {
        console.error('Database error:', dbError);
      }
    }
    
    // Update session or subscription status if payment is completed
    if (paymentData.status === 'completed') {
      if (session_id) {
        await updateSessionStatus(session_id, 'confirmed');
      } else if (subscription_id) {
        await updateSubscriptionStatus(subscription_id, 'active');
      }
    }
    
    res.status(200).json({ success: true, message: 'Payment notification received' });
  } catch (error) {
    console.error('Payment callback error:', error);
    res.status(500).json({ success: false, message: 'Error processing payment callback' });
  }
});

// Helper function to get user ID from session or subscription
async function getUserIdFromSessionOrSubscription(sessionId, subscriptionId) {
  try {
    if (sessionId) {
      const { data, error } = await supabase
        .from('gaming_sessions')
        .select('user_id')
        .eq('id', sessionId)
        .single();
      
      if (error) throw error;
      return data?.user_id;
    } else if (subscriptionId) {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('user_id')
        .eq('id', subscriptionId)
        .single();
      
      if (error) throw error;
      return data?.user_id;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user ID:', error);
    return null;
  }
}

// Helper function to update session status
async function updateSessionStatus(sessionId, status) {
  try {
    const { error } = await supabase
      .from('gaming_sessions')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId);
    
    if (error) {
      console.error('Error updating session status:', error);
    }
  } catch (error) {
    console.error('Error updating session:', error);
  }
}

// Helper function to update subscription status
async function updateSubscriptionStatus(subscriptionId, status) {
  try {
    const { error } = await supabase
      .from('subscriptions')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', subscriptionId);
    
    if (error) {
      console.error('Error updating subscription status:', error);
    }
  } catch (error) {
    console.error('Error updating subscription:', error);
  }
}

// API endpoint to get available sessions
app.get('/api/sessions', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('gaming_sessions')
      .select('*')
      .order('start_time', { ascending: true });
    
    if (error) {
      throw error;
    }
    
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ success: false, message: 'Error fetching sessions' });
  }
});

// API endpoint to get user subscriptions
app.get('/api/subscriptions/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verify user authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      // Verify JWT token (simplified - in production use proper JWT verification)
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      // Check if token user ID matches requested user ID
      if (decoded.sub !== userId && !decoded.isAdmin) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
      }
    } catch (jwtError) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({ success: false, message: 'Error fetching subscriptions' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});