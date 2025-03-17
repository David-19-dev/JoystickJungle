import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Footer from '../../components/Footer';

describe('Footer Component', () => {
  test('renders footer content and links', () => {
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );
    
    // Check if footer title is rendered
    expect(screen.getByText('Joystick Jungle')).toBeInTheDocument();
    
    // Check if quick links section is rendered
    expect(screen.getByText('Liens Rapides')).toBeInTheDocument();
    expect(screen.getByText('À Propos')).toBeInTheDocument();
    expect(screen.getByText('Services')).toBeInTheDocument();
    expect(screen.getByText('Événements')).toBeInTheDocument();
    expect(screen.getByText('Réservation')).toBeInTheDocument();
    
    // Check if contact section is rendered
    expect(screen.getByText('Contact')).toBeInTheDocument();
    expect(screen.getByText('123 Rue Gaming, Dakar')).toBeInTheDocument();
    expect(screen.getByText('+221 XX XXX XX XX')).toBeInTheDocument();
    expect(screen.getByText('contact@joystickjungle.sn')).toBeInTheDocument();
    
    // Check if social media section is rendered
    expect(screen.getByText('Suivez-nous')).toBeInTheDocument();
    
    // Check if copyright is rendered with current year
    const currentYear = new Date().getFullYear().toString();
    expect(screen.getByText(`© ${currentYear} Joystick Jungle. Tous droits réservés.`)).toBeInTheDocument();
  });
});