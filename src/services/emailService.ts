import * as Brevo from '@getbrevo/brevo';

const BREVO_API_KEY = import.meta.env.VITE_BREVO_API_KEY;
const CONTACT_EMAIL = 'contact@joystickjungle.fr';
const ADMIN_EMAIL = 'admin@joystickjungle.fr'; // Change this to your actual admin email

// Initialize the API instance
const apiInstance = new Brevo.TransactionalEmailsApi();

// Check if TransactionalEmailsApiApiKeys exists and has apiKey property
if (BREVO_API_KEY && Brevo.TransactionalEmailsApiApiKeys && Brevo.TransactionalEmailsApiApiKeys.apiKey) {
  apiInstance.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, BREVO_API_KEY);
} else {
  console.warn('Brevo API configuration issue. Email functionality will not work.');
}

interface EmailData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface RegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  details: Record<string, any>;
  type: 'tournament' | 'subscription' | 'booking';
}

// Helper function to create a safe copy of an object without circular references
const createSafeCopy = (obj: Record<string, any>): Record<string, any> => {
  const safeObj: Record<string, any> = {};
  
  try {
    // Use JSON stringify/parse to remove non-serializable data
    // This will throw an error if there are circular references
    return JSON.parse(JSON.stringify(obj));
  } catch (error) {
    // If JSON stringify fails, manually copy primitive values and arrays
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      if (value === null || value === undefined) {
        safeObj[key] = value;
      } else if (typeof value !== 'object') {
        // Primitive values (string, number, boolean)
        safeObj[key] = value;
      } else if (Array.isArray(value)) {
        // Handle arrays (shallow copy)
        safeObj[key] = [...value];
      } else {
        // For objects, just use a placeholder to avoid circular references
        safeObj[key] = `[Object]`;
      }
    });
    return safeObj;
  }
};

export const sendContactEmail = async (data: EmailData) => {
  try {
    if (!BREVO_API_KEY) {
      console.warn('Email not sent: Brevo API key is missing');
      return { success: true, message: 'Email simulation successful (dev mode)' };
    }
    
    // Create safe copies of data to prevent Symbol() cloning issues
    const safeData = createSafeCopy(data);
    
    const sendSmtpEmail = new Brevo.SendSmtpEmail();
    
    sendSmtpEmail.sender = { email: safeData.email, name: safeData.name };
    sendSmtpEmail.to = [{ email: CONTACT_EMAIL }];
    sendSmtpEmail.subject = `Contact Form: ${safeData.subject}`;
    sendSmtpEmail.htmlContent = `
      <h2>Nouveau message de contact</h2>
      <p><strong>Nom:</strong> ${safeData.name}</p>
      <p><strong>Email:</strong> ${safeData.email}</p>
      <p><strong>Sujet:</strong> ${safeData.subject}</p>
      <p><strong>Message:</strong></p>
      <p>${safeData.message}</p>
    `;

    await apiInstance.sendTransacEmail(sendSmtpEmail);
    return { success: true };
  } catch (error) {
    console.error('Error sending contact email:', error);
    // In development, return success anyway to allow testing
    if (import.meta.env.DEV) {
      return { success: true, message: 'Email simulation successful (dev mode)' };
    }
    return { success: false, error: 'Failed to send email' };
  }
};

export const sendRegistrationEmail = async (data: RegistrationData) => {
  try {
    if (!BREVO_API_KEY) {
      console.warn('Email not sent: Brevo API key is missing');
      return { success: true, message: 'Email simulation successful (dev mode)' };
    }
    
    // Create safe copies of data to prevent Symbol() cloning issues
    const safeData = createSafeCopy(data);
    const safeDetails = createSafeCopy(data.details);
    
    const sendSmtpEmail = new Brevo.SendSmtpEmail();
    
    sendSmtpEmail.sender = { email: CONTACT_EMAIL, name: 'Joystick Jungle' };
    sendSmtpEmail.to = [{ email: ADMIN_EMAIL }];
    
    const typeLabels = {
      tournament: 'Tournoi',
      subscription: 'Abonnement',
      booking: 'Réservation'
    };
    
    sendSmtpEmail.subject = `Nouvelle inscription ${typeLabels[safeData.type]}`;
    sendSmtpEmail.htmlContent = `
      <h2>Nouvelle inscription ${typeLabels[safeData.type]}</h2>
      <p><strong>Nom:</strong> ${safeData.firstName} ${safeData.lastName}</p>
      <p><strong>Email:</strong> ${safeData.email}</p>
      <p><strong>Téléphone:</strong> ${safeData.phone}</p>
      <h3>Détails:</h3>
      <ul>
        ${Object.entries(safeDetails)
          .map(([key, value]) => {
            if (Array.isArray(value)) {
              return `<li><strong>${key}:</strong> ${value.join(', ')}</li>`;
            }
            return `<li><strong>${key}:</strong> ${value}</li>`;
          })
          .join('')}
      </ul>
      <p>Connectez-vous à l'interface d'administration pour approuver ou rejeter cette demande.</p>
      <p><a href="https://joystickjungle.sn/admin" style="background-color: #8B5CF6; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; display: inline-block;">Accéder à l'administration</a></p>
    `;

    await apiInstance.sendTransacEmail(sendSmtpEmail);
    
    // Send acknowledgment email to the user
    const userEmail = new Brevo.SendSmtpEmail();
    userEmail.sender = { email: CONTACT_EMAIL, name: 'Joystick Jungle' };
    userEmail.to = [{ email: safeData.email }];
    userEmail.subject = `Confirmation de réception - ${typeLabels[safeData.type]} Joystick Jungle`;
    userEmail.htmlContent = `
      <h2>Merci pour votre ${safeData.type === 'booking' ? 'réservation' : 'inscription'} !</h2>
      <p>Cher(e) ${safeData.firstName} ${safeData.lastName},</p>
      <p>Nous avons bien reçu votre ${safeData.type === 'booking' ? 'demande de réservation' : safeData.type === 'tournament' ? 'inscription au tournoi' : 'demande d\'abonnement'}.</p>
      <p>Notre équipe va examiner votre demande et vous recevrez une confirmation par email dans les plus brefs délais.</p>
      <p>Voici un récapitulatif de votre demande :</p>
      <ul>
        ${Object.entries(safeDetails)
          .filter(([key]) => key !== 'paymentMethod') // Exclude payment method from user email
          .map(([key, value]) => {
            if (Array.isArray(value)) {
              return `<li><strong>${key}:</strong> ${value.join(', ')}</li>`;
            }
            return `<li><strong>${key}:</strong> ${value}</li>`;
          })
          .join('')}
      </ul>
      <p>Si vous avez des questions, n'hésitez pas à nous contacter à ${CONTACT_EMAIL}</p>
      <p>À bientôt chez Joystick Jungle !</p>
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
        <p>Joystick Jungle - 123 Rue Gaming, Dakar, Sénégal</p>
        <p>Tél: +221 XX XXX XX XX - Email: ${CONTACT_EMAIL}</p>
      </div>
    `;
    
    await apiInstance.sendTransacEmail(userEmail);
    
    return { success: true };
  } catch (error) {
    console.error('Error sending registration email:', error);
    // In development, return success anyway to allow testing
    if (import.meta.env.DEV) {
      return { success: true, message: 'Email simulation successful (dev mode)' };
    }
    return { success: false, error: 'Failed to send email' };
  }
};

export const sendConfirmationEmail = async (data: RegistrationData) => {
  try {
    if (!BREVO_API_KEY) {
      console.warn('Email not sent: Brevo API key is missing');
      return { success: true, message: 'Email simulation successful (dev mode)' };
    }
    
    // Create safe copies of data to prevent Symbol() cloning issues
    const safeData = createSafeCopy(data);
    const safeDetails = createSafeCopy(data.details);
    
    const sendSmtpEmail = new Brevo.SendSmtpEmail();
    
    sendSmtpEmail.sender = { email: CONTACT_EMAIL, name: 'Joystick Jungle' };
    sendSmtpEmail.to = [{ email: safeData.email }];
    
    const typeLabels = {
      tournament: 'au tournoi',
      subscription: 'à l\'abonnement',
      booking: 'de votre réservation'
    };
    
    sendSmtpEmail.subject = `Confirmation de votre inscription ${typeLabels[safeData.type]}`;
    sendSmtpEmail.htmlContent = `
      <h2>Votre ${safeData.type === 'booking' ? 'réservation' : 'inscription'} a été approuvée !</h2>
      <p>Cher(e) ${safeData.firstName} ${safeData.lastName},</p>
      <p>Nous avons le plaisir de vous informer que votre ${safeData.type === 'booking' ? 'réservation' : safeData.type === 'tournament' ? 'inscription au tournoi' : 'abonnement'} a été approuvé(e).</p>
      
      ${safeData.type === 'booking' ? `
        <h3>Détails de votre réservation :</h3>
        <ul>
          <li><strong>Date :</strong> ${safeDetails.date}</li>
          <li><strong>Heure :</strong> ${safeDetails.time}</li>
          <li><strong>Durée :</strong> ${safeDetails.duration} minutes</li>
          <li><strong>Plateforme :</strong> ${safeDetails.platform === 'ps5' ? 'PlayStation 5' : 
                                            safeDetails.platform === 'ps4' ? 'PlayStation 4' : 
                                            safeDetails.platform === 'xbox' ? 'Xbox Series X' : 
                                            safeDetails.platform === 'vr' ? 'Réalité Virtuelle' : safeDetails.platform}</li>
          <li><strong>Nombre de joueurs :</strong> ${safeDetails.players}</li>
          ${safeDetails.extras && safeDetails.extras.length > 0 ? 
            `<li><strong>Extras :</strong> ${safeDetails.extras.map((extra: string) => 
              extra === 'snacks' ? 'Pack Snacks' : 
              extra === 'drinks' ? 'Pack Boissons' : 
              extra === 'premium' ? 'Manettes Premium' : 
              extra === 'private' ? 'Espace Privé' : extra
            ).join(', ')}</li>` : ''}
          <li><strong>Prix total :</strong> ${safeDetails.totalPrice}</li>
        </ul>
        <p>Veuillez vous présenter 10 minutes avant l'heure de votre réservation.</p>
      ` : safeData.type === 'tournament' ? `
        <h3>Détails de votre inscription au tournoi :</h3>
        <ul>
          <li><strong>Tournoi :</strong> ${safeDetails.tournament === 'fifa' ? 'Tournoi FIFA' : 
                                         safeDetails.tournament === 'cod' ? 'Tournoi Call of Duty' : 
                                         safeDetails.tournament === 'fortnite' ? 'Tournoi Fortnite' : safeDetails.tournament}</li>
          <li><strong>Plateforme :</strong> ${safeDetails.platform === 'ps5' ? 'PlayStation 5' : 
                                            safeDetails.platform === 'ps4' ? 'PlayStation 4' : 
                                            safeDetails.platform === 'xbox' ? 'Xbox Series X' : 
                                            safeDetails.platform === 'pc' ? 'PC' : safeDetails.platform}</li>
          <li><strong>Pseudo Gaming :</strong> ${safeDetails.gamingName}</li>
        </ul>
        <p>Veuillez vous présenter 30 minutes avant le début du tournoi pour l'enregistrement.</p>
      ` : `
        <h3>Détails de votre abonnement :</h3>
        <ul>
          <li><strong>Type d'abonnement :</strong> ${safeDetails.subscriptionType === 'basic' ? 'Basic' : 
                                                  safeDetails.subscriptionType === 'standard' ? 'Standard' : 
                                                  safeDetails.subscriptionType === 'premium' ? 'Premium' : 
                                                  safeDetails.subscriptionType === 'vip' ? 'VIP' : safeDetails.subscriptionType}</li>
          <li><strong>Date de début :</strong> ${safeDetails.startDate}</li>
        </ul>
        <p>Votre abonnement est maintenant actif. Vous pouvez commencer à profiter de vos avantages dès maintenant.</p>
      `}
      
      <p>Pour toute question, n'hésitez pas à nous contacter à ${CONTACT_EMAIL}</p>
      <p>À bientôt chez Joystick Jungle !</p>
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
        <p>Joystick Jungle - 123 Rue Gaming, Dakar, Sénégal</p>
        <p>Tél: +221 XX XXX XX XX - Email: ${CONTACT_EMAIL}</p>
      </div>
    `;

    await apiInstance.sendTransacEmail(sendSmtpEmail);
    
    // Also notify admin about the approval
    const adminEmail = new Brevo.SendSmtpEmail();
    adminEmail.sender = { email: CONTACT_EMAIL, name: 'Joystick Jungle' };
    adminEmail.to = [{ email: ADMIN_EMAIL }];
    adminEmail.subject = `Confirmation envoyée - ${safeData.type === 'booking' ? 'Réservation' : safeData.type === 'tournament' ? 'Tournoi' : 'Abonnement'} de ${safeData.firstName} ${safeData.lastName}`;
    adminEmail.htmlContent = `
      <h2>Confirmation envoyée</h2>
      <p>Une confirmation a été envoyée à ${safeData.firstName} ${safeData.lastName} (${safeData.email}) pour ${safeData.type === 'booking' ? 'sa réservation' : safeData.type === 'tournament' ? 'son inscription au tournoi' : 'son abonnement'}.</p>
      <p>Détails:</p>
      <ul>
        ${Object.entries(safeDetails)
          .map(([key, value]) => {
            if (Array.isArray(value)) {
              return `<li><strong>${key}:</strong> ${value.join(', ')}</li>`;
            }
            return `<li><strong>${key}:</strong> ${value}</li>`;
          })
          .join('')}
      </ul>
    `;
    
    await apiInstance.sendTransacEmail(adminEmail);
    
    return { success: true };
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    // In development, return success anyway to allow testing
    if (import.meta.env.DEV) {
      return { success: true, message: 'Email simulation successful (dev mode)' };
    }
    return { success: false, error: 'Failed to send email' };
  }
};