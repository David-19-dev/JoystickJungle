import { http, HttpResponse } from 'msw';

// Mock API handlers for testing
export const handlers = [
  // Mock payment API
  http.post('http://localhost:3000/api/pay-with-wave', async ({ request }) => {
    const data = await request.json();
    
    // Validate required fields
    if (!data.name || !data.phone || !data.amount) {
      return HttpResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Return success response with mock payment URL
    return HttpResponse.json({
      success: true,
      message: 'Payment request created successfully',
      payment_url: 'https://paytech.sn/payment/test-payment-url',
      token: 'test-payment-token'
    });
  }),
  
  // Mock payment callback
  http.post('http://localhost:3000/api/payment-callback', () => {
    return HttpResponse.json({ success: true, message: 'Payment notification received' });
  })
];