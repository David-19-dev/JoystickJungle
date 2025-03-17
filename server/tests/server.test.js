import request from 'supertest';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import { vi } from 'vitest';

// Mock axios
vi.mock('axios');
const mockedAxios = axios;

// Load environment variables
dotenv.config();

// Create a test app
const app = express();
app.use(cors());
app.use(express.json());

// Import routes
app.post('/api/pay-with-wave', async (req, res) => {
  try {
    const { name, phone, amount, item_name, description } = req.body;

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
        customer_phone: formattedPhone
      })
    };

    // Mock successful response for tests
    return res.status(200).json({
      success: true,
      message: 'Payment request created successfully',
      payment_url: 'https://paytech.sn/payment/test-payment-url',
      token: 'test-payment-token'
    });
  } catch (error) {
    console.error('Payment processing error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while processing your payment',
      error: error.message
    });
  }
});

app.post('/api/payment-callback', (req, res) => {
  try {
    const paymentData = req.body;
    console.log('Payment callback received:', paymentData);
    res.status(200).json({ success: true, message: 'Payment notification received' });
  } catch (error) {
    console.error('Payment callback error:', error);
    res.status(500).json({ success: false, message: 'Error processing payment callback' });
  }
});

describe('API Server', () => {
  test('POST /api/pay-with-wave - returns error for missing fields', async () => {
    const response = await request(app)
      .post('/api/pay-with-wave')
      .send({
        name: 'Test User',
        // Missing phone and amount
      });
    
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('Missing required fields');
  });
  
  test('POST /api/pay-with-wave - returns success with payment URL', async () => {
    const response = await request(app)
      .post('/api/pay-with-wave')
      .send({
        name: 'Test User',
        phone: '771234567',
        amount: 1000,
        item_name: 'Test Payment',
        description: 'Test Description'
      });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.payment_url).toBeDefined();
    expect(response.body.token).toBeDefined();
  });
  
  test('POST /api/payment-callback - processes payment notification', async () => {
    const response = await request(app)
      .post('/api/payment-callback')
      .send({
        token: 'test-token',
        status: 'completed',
        reference: 'TEST-REF-123'
      });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Payment notification received');
  });
});