import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import axios from 'axios';
import Payment from '../../pages/Payment';

// Mock axios
vi.mock('axios');
const mockedAxios = vi.mocked(axios);

describe('Payment Page', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks();
    
    // Mock window.location.href
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true
    });
  });
  
  test('renders payment form with all fields', () => {
    render(
      <BrowserRouter>
        <Payment />
      </BrowserRouter>
    );
    
    // Check if page title is rendered
    expect(screen.getByText('Paiement Wave')).toBeInTheDocument();
    
    // Check if form fields are rendered
    expect(screen.getByLabelText(/Nom complet/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Numéro Wave/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Montant/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description de l'achat/i)).toBeInTheDocument();
    
    // Check if submit button is rendered
    expect(screen.getByText(/Payer avec Wave/i)).toBeInTheDocument();
    
    // Check if instructions are rendered
    expect(screen.getByText('Comment ça marche :')).toBeInTheDocument();
  });
  
  test('shows validation error when submitting empty form', async () => {
    render(
      <BrowserRouter>
        <Payment />
      </BrowserRouter>
    );
    
    // Submit form without filling fields
    const submitButton = screen.getByText(/Payer avec Wave/i);
    fireEvent.click(submitButton);
    
    // Check if validation error is shown
    await waitFor(() => {
      const errorElement = screen.getByTestId('payment-status-message');
      expect(errorElement.textContent).toContain('Veuillez remplir tous les champs obligatoires');
    });
  });
  
  test('shows error when amount is invalid', async () => {
    render(
      <BrowserRouter>
        <Payment />
      </BrowserRouter>
    );
    
    // Fill form with invalid amount
    fireEvent.change(screen.getByLabelText(/Nom complet/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/Numéro Wave/i), { target: { value: '771234567' } });
    fireEvent.change(screen.getByLabelText(/Montant/i), { target: { value: '0' } });
    
    // Submit form
    const submitButton = screen.getByText(/Payer avec Wave/i);
    fireEvent.click(submitButton);
    
    // Check if validation error is shown
    await waitFor(() => {
      const errorElement = screen.getByTestId('payment-status-message');
      expect(errorElement.textContent).toContain('Veuillez entrer un montant valide');
    });
  });
  
  test('redirects to payment URL on successful form submission', async () => {
    // Mock successful API response
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        success: true,
        payment_url: 'https://paytech.sn/payment/test-url',
        message: 'Payment request created successfully'
      }
    });
    
    render(
      <BrowserRouter>
        <Payment />
      </BrowserRouter>
    );
    
    // Fill form with valid data
    fireEvent.change(screen.getByLabelText(/Nom complet/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/Numéro Wave/i), { target: { value: '771234567' } });
    fireEvent.change(screen.getByLabelText(/Montant/i), { target: { value: '1000' } });
    
    // Submit form
    const submitButton = screen.getByText(/Payer avec Wave/i);
    fireEvent.click(submitButton);
    
    // Check if loading state is shown
    expect(screen.getByText(/Traitement en cours/i)).toBeInTheDocument();
    
    // Check if success message is shown
    await waitFor(() => {
      const statusElement = screen.getByTestId('payment-status-message');
      expect(statusElement.textContent).toContain('Redirection vers la page de paiement');
    });
    
    // Check if API was called with correct data
    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        name: 'John Doe',
        phone: '771234567',
        amount: 1000
      })
    );
    
    // Wait for redirect timeout
    await new Promise(resolve => setTimeout(resolve, 1600));
    
    // Check if redirect happened
    expect(window.location.href).toBe('https://paytech.sn/payment/test-url');
  });
  
  test('shows error message when API request fails', async () => {
    // Mock failed API response
    mockedAxios.post.mockRejectedValueOnce({
      response: {
        data: {
          success: false,
          message: 'Payment service unavailable'
        }
      }
    });
    
    render(
      <BrowserRouter>
        <Payment />
      </BrowserRouter>
    );
    
    // Fill form with valid data
    fireEvent.change(screen.getByLabelText(/Nom complet/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/Numéro Wave/i), { target: { value: '771234567' } });
    fireEvent.change(screen.getByLabelText(/Montant/i), { target: { value: '1000' } });
    
    // Submit form
    const submitButton = screen.getByText(/Payer avec Wave/i);
    fireEvent.click(submitButton);
    
    // Check if error message is shown
    await waitFor(() => {
      const statusElement = screen.getByTestId('payment-status-message');
      expect(statusElement.textContent).toContain('Payment service unavailable');
    });
  });
});