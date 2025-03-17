import { vi } from 'vitest';
import { sendContactEmail, sendRegistrationEmail, sendConfirmationEmail } from '../../services/emailService';

// Mock Brevo API
vi.mock('@getbrevo/brevo', () => {
  const mockSendTransacEmail = vi.fn().mockResolvedValue({ success: true });
  
  return {
    TransactionalEmailsApi: vi.fn().mockImplementation(() => ({
      sendTransacEmail: mockSendTransacEmail,
      setApiKey: vi.fn()
    })),
    TransactionalEmailsApiApiKeys: {
      apiKey: 'api-key'
    },
    SendSmtpEmail: vi.fn().mockImplementation(() => ({}))
  };
});

describe('Email Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  test('sendContactEmail returns success in development mode', async () => {
    const result = await sendContactEmail({
      name: 'Test User',
      email: 'test@example.com',
      subject: 'Test Subject',
      message: 'Test Message'
    });
    
    expect(result.success).toBe(true);
  });
  
  test('sendRegistrationEmail returns success in development mode', async () => {
    const result = await sendRegistrationEmail({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      phone: '771234567',
      type: 'booking',
      details: {
        platform: 'ps5',
        date: '2025-05-20',
        time: '14:00',
        duration: '120',
        players: '2',
        extras: ['snacks', 'drinks'],
        totalPrice: '7000 FCFA'
      }
    });
    
    expect(result.success).toBe(true);
  });
  
  test('sendConfirmationEmail returns success in development mode', async () => {
    const result = await sendConfirmationEmail({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      phone: '771234567',
      type: 'booking',
      details: {
        platform: 'ps5',
        date: '2025-05-20',
        time: '14:00',
        duration: '120',
        players: '2',
        extras: ['snacks', 'drinks'],
        totalPrice: '7000 FCFA'
      }
    });
    
    expect(result.success).toBe(true);
  });
  
  test('handles non-serializable data in details object', async () => {
    // Create an object with a circular reference
    const circularObj: any = {};
    circularObj.self = circularObj;
    
    const result = await sendRegistrationEmail({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      phone: '771234567',
      type: 'booking',
      details: {
        platform: 'ps5',
        date: '2025-05-20',
        time: '14:00',
        duration: '120',
        players: '2',
        extras: ['snacks', 'drinks'],
        totalPrice: '7000 FCFA',
        circular: circularObj
      }
    });
    
    expect(result.success).toBe(true);
  });
});