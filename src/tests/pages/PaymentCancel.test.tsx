import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PaymentCancel from '../../pages/PaymentCancel';

describe('PaymentCancel Page', () => {
  test('renders cancellation message and navigation buttons', () => {
    render(
      <BrowserRouter>
        <PaymentCancel />
      </BrowserRouter>
    );
    
    // Check if cancellation message is rendered
    expect(screen.getByText('Paiement Annulé')).toBeInTheDocument();
    expect(screen.getByText('Votre paiement a été annulé. Aucun montant n\'a été débité de votre compte.')).toBeInTheDocument();
    
    // Check if navigation buttons are rendered
    expect(screen.getByText('Réessayer')).toBeInTheDocument();
    expect(screen.getByText('Retour à l\'accueil')).toBeInTheDocument();
  });
});