import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from '../../pages/Home';

describe('Home Page', () => {
  test('renders hero section with title and CTA buttons', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    
    // Check if hero title is rendered
    expect(screen.getByText('Bienvenue dans la Jungle du Gaming')).toBeInTheDocument();
    
    // Check if CTA buttons are rendered
    expect(screen.getByText('Réserver Maintenant')).toBeInTheDocument();
    expect(screen.getByText('Voir les Événements')).toBeInTheDocument();
  });
  
  test('renders features section', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    
    // Check if features section title is rendered
    expect(screen.getByText('Une Expérience Gaming Unique')).toBeInTheDocument();
    
    // Check if feature items are rendered
    expect(screen.getByText('Tournois Réguliers')).toBeInTheDocument();
    expect(screen.getByText('Événements Privés')).toBeInTheDocument();
    expect(screen.getByText('Réservation Flexible')).toBeInTheDocument();
    expect(screen.getByText('Équipement Premium')).toBeInTheDocument();
  });
  
  test('renders gallery section', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    
    // Check if gallery section title is rendered
    expect(screen.getByText('Découvrez Nos Installations')).toBeInTheDocument();
    expect(screen.getByText('Voir Plus de Photos')).toBeInTheDocument();
  });
  
  test('renders CTA section', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    
    // Check if CTA section is rendered
    expect(screen.getByText('Prêt à Rejoindre l\'Aventure ?')).toBeInTheDocument();
    expect(screen.getByText('Commencer Maintenant')).toBeInTheDocument();
  });
});