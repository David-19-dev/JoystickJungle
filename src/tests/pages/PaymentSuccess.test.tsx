import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import PaymentSuccess from '../../pages/PaymentSuccess';

// Mock useLocation
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useLocation: () => ({
      search: '?token=test-token&reference=TEST-REF-123'
    })
  };
});

describe('PaymentSuccess Page', () => {
  test('renders success message and transaction reference', () => {
    render(
      <BrowserRouter>
        <PaymentSuccess />
      </BrowserRouter>
    );
    
    // Check if success message is rendered
    expect(screen.getByText('Paiement Réussi !')).toBeInTheDocument();
    expect(screen.getByText('Votre paiement a été traité avec succès. Merci pour votre achat !')).toBeInTheDocument();
    
    // Check if transaction reference is rendered
    expect(screen.getByText('Référence de transaction')).toBeInTheDocument();
    expect(screen.getByText('TEST-REF-123')).toBeInTheDocument();
    
    // Check if navigation buttons are rendered
    expect(screen.getByText('Retour à l\'accueil')).toBeInTheDocument();
    expect(screen.getByText('Retour aux réservations')).toBeInTheDocument();
  });
});