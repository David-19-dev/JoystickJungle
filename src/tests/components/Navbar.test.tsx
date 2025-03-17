import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from '../../components/Navbar';

describe('Navbar Component', () => {
  test('renders logo and navigation links', () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );
    
    // Check if logo is rendered
    expect(screen.getByText('Joystick Jungle')).toBeInTheDocument();
    
    // Check if navigation links are rendered
    expect(screen.getByText('Accueil')).toBeInTheDocument();
    expect(screen.getByText('À Propos')).toBeInTheDocument();
    expect(screen.getByText('Services')).toBeInTheDocument();
    expect(screen.getByText('Événements')).toBeInTheDocument();
    expect(screen.getByText('Boutique')).toBeInTheDocument();
    expect(screen.getByText('Tarifs')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
    expect(screen.getByText('Paiement')).toBeInTheDocument();
    
    // Check if reservation button is rendered
    expect(screen.getAllByText('Réserver')[0]).toBeInTheDocument();
  });
});