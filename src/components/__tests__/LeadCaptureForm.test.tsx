import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LeadCaptureForm from '../LeadCaptureForm';
import { LeadService } from '../../backend/services/LeadService';

// Mock LeadService
jest.mock('../../backend/services/LeadService', () => ({
  LeadService: {
    createLead: jest.fn(),
  },
}));

// Mock Beacon API
Object.defineProperty(navigator, 'sendBeacon', {
  writable: true,
  value: jest.fn(),
});

const mockCreateLead = jest.fn();

// Mock tracking utility
jest.mock('../../utils/tracking', () => ({
  prepareLeadSubmissionData: jest.fn((data) => ({
    ...data,
    sessionId: 'test-session-123',
    utmSource: 'google',
    utmMedium: 'cpc',
    utmCampaign: 'test-campaign',
  })),
}));

// Mock database
jest.mock('../../backend/database', () => ({
  prisma: {
    lead: {
      create: jest.fn(),
    },
  },
}));

describe('LeadCaptureForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock implementation
    mockCreateLead.mockReset();
  });

  describe('Renderowanie formularza', () => {
    it('powinien wyrenderować wszystkie pola formularza', () => {
      render(<LeadCaptureForm />);

      // Sprawdź czy wszystkie pola są widoczne
      expect(screen.getByLabelText(/imię/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/adres email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/numer telefonu/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/marka i model auta/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/rok produkcji/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/typ dywaników/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/rodzaj kompletu/i)).toBeInTheDocument();
    });

    it('powinien wyrenderować przycisk submit', () => {
      render(<LeadCaptureForm />);
      expect(screen.getByRole('button', { name: /wyślij i otrzymaj rabat/i })).toBeInTheDocument();
    });
  });

  describe('Walidacja formularza', () => {
    it('powinien wymagać numeru telefonu', () => {
      render(<LeadCaptureForm />);
      
      const submitButton = screen.getByRole('button', { name: /wyślij i otrzymaj rabat/i });
      expect(submitButton).toBeDisabled();
    });

    it('powinien włączyć przycisk submit po wprowadzeniu imienia i numeru telefonu', () => {
      render(<LeadCaptureForm />);
      
      const firstNameInput = screen.getByLabelText(/imię/i);
      const phoneInput = screen.getByLabelText(/numer telefonu/i);
      const submitButton = screen.getByRole('button', { name: /wyślij i otrzymaj rabat/i });
      
      // Tylko telefon - przycisk powinien być wyłączony
      fireEvent.change(phoneInput, { target: { value: '+48123456789' } });
      expect(submitButton).toBeDisabled();
      
      // Dodaj imię - przycisk powinien być włączony
      fireEvent.change(firstNameInput, { target: { value: 'Jan' } });
      expect(submitButton).toBeEnabled();
    });

    it('powinien wyświetlić błąd dla nieprawidłowego numeru telefonu', async () => {
      render(<LeadCaptureForm />);
      
      const firstNameInput = screen.getByLabelText(/imię/i);
      const phoneInput = screen.getByLabelText(/numer telefonu/i);
      const submitButton = screen.getByRole('button', { name: /wyślij i otrzymaj rabat/i });
      
      // Wypełnij imię (wymagane)
      fireEvent.change(firstNameInput, { target: { value: 'Jan' } });
      // Wypełnij nieprawidłowy telefon
      fireEvent.change(phoneInput, { target: { value: '123' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/wprowadź poprawny numer telefonu/i)).toBeInTheDocument();
      });
    });

    it('powinien wyświetlić błąd dla nieprawidłowego emaila', async () => {
      render(<LeadCaptureForm />);
      
      const firstNameInput = screen.getByLabelText(/imię/i);
      const emailInput = screen.getByLabelText(/adres email/i);
      const phoneInput = screen.getByLabelText(/numer telefonu/i);
      const submitButton = screen.getByRole('button', { name: /wyślij i otrzymaj rabat/i });
      
      // Wypełnij wymagane pola
      fireEvent.change(firstNameInput, { target: { value: 'Jan' } });
      fireEvent.change(phoneInput, { target: { value: '+48123456789' } });
      // Wypełnij nieprawidłowy email
      fireEvent.change(emailInput, { target: { value: 'nieprawidlowy-email' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/wprowadź poprawny adres email/i)).toBeInTheDocument();
      });
    });
  });

  describe('Wprowadzanie danych', () => {
    it('powinien zapisać dane w stanie formularza', () => {
      render(<LeadCaptureForm />);
      
      const firstNameInput = screen.getByLabelText(/imię/i);
      const phoneInput = screen.getByLabelText(/numer telefonu/i);
      const emailInput = screen.getByLabelText(/adres email/i);
      const companyInput = screen.getByLabelText(/marka i model auta/i);
      const jobTitleInput = screen.getByLabelText(/rok produkcji/i);
      
      fireEvent.change(firstNameInput, { target: { value: 'Jan' } });
      fireEvent.change(phoneInput, { target: { value: '+48123456789' } });
      fireEvent.change(emailInput, { target: { value: 'jan@example.com' } });
      fireEvent.change(companyInput, { target: { value: 'BMW X5' } });
      fireEvent.change(jobTitleInput, { target: { value: '2020' } });
      
      expect(firstNameInput).toHaveValue('Jan');
      expect(phoneInput).toHaveValue('+48123456789');
      expect(emailInput).toHaveValue('jan@example.com');
      expect(companyInput).toHaveValue('BMW X5');
      expect(jobTitleInput).toHaveValue('2020');
    });

    it('powinien zapisać wybór typu dywaników', () => {
      render(<LeadCaptureForm />);
      
      const industrySelect = screen.getByLabelText(/typ dywaników/i);
      
      fireEvent.change(industrySelect, { target: { value: '3d-evapremium-z-rantami' } });
      
      expect(industrySelect).toHaveValue('3d-evapremium-z-rantami');
    });

    it('powinien zapisać wybór rodzaju kompletu', () => {
      render(<LeadCaptureForm />);
      
      const completenessSelect = screen.getByLabelText(/rodzaj kompletu/i);
      
      fireEvent.change(completenessSelect, { target: { value: 'przod-tyl' } });
      
      expect(completenessSelect).toHaveValue('przod-tyl');
    });
  });

  describe('Wysyłanie formularza', () => {
    it('powinien wysłać dane z formularza przez Beacon API', async () => {
      // Symuluj Beacon API
      (navigator.sendBeacon as jest.Mock).mockReturnValue(true);
      
      render(<LeadCaptureForm />);
      
      // Wypełnij wymagane pola
      const firstNameInput = screen.getByLabelText(/imię/i);
      const phoneInput = screen.getByLabelText(/numer telefonu/i);
      const emailInput = screen.getByLabelText(/adres email/i);
      const companyInput = screen.getByLabelText(/marka i model auta/i);
      const jobTitleInput = screen.getByLabelText(/rok produkcji/i);
      const industrySelect = screen.getByLabelText(/typ dywaników/i);
      const completenessSelect = screen.getByLabelText(/rodzaj kompletu/i);
      
      fireEvent.change(firstNameInput, { target: { value: 'Jan' } });
      fireEvent.change(phoneInput, { target: { value: '+48123456789' } });
      fireEvent.change(emailInput, { target: { value: 'jan@example.com' } });
      fireEvent.change(companyInput, { target: { value: 'BMW X5' } });
      fireEvent.change(jobTitleInput, { target: { value: '2020' } });
      fireEvent.change(industrySelect, { target: { value: '3d-evapremium-z-rantami' } });
      fireEvent.change(completenessSelect, { target: { value: 'przod-tyl' } });
      
      const submitButton = screen.getByRole('button', { name: /wyślij i otrzymaj rabat/i });
      fireEvent.click(submitButton);
      
      // Sprawdź czy Beacon API został wywołany
      expect(navigator.sendBeacon).toHaveBeenCalledWith(
        '/api/leads',
        expect.stringContaining('Jan')
      );
      
      // Sprawdź czy LeadService NIE został wywołany (Beacon API działa)
      expect(LeadService.createLead).not.toHaveBeenCalled();
    });

    it('powinien wyświetlić komunikat sukcesu po wysłaniu', async () => {
      // Symuluj Beacon API
      (navigator.sendBeacon as jest.Mock).mockReturnValue(true);
      
      render(<LeadCaptureForm />);
      
      // Wypełnij wymagane pola
      const firstNameInput = screen.getByLabelText(/imię/i);
      const phoneInput = screen.getByLabelText(/numer telefonu/i);
      
      fireEvent.change(firstNameInput, { target: { value: 'Jan' } });
      fireEvent.change(phoneInput, { target: { value: '+48123456789' } });
      
      const submitButton = screen.getByRole('button', { name: /wyślij i otrzymaj rabat/i });
      fireEvent.click(submitButton);
      
      // Sprawdź czy natychmiast pokazuje się komunikat sukcesu
      expect(screen.getByText(/dziękujemy!/i)).toBeInTheDocument();
      expect(screen.getByText(/twoje dane zostały pomyślnie wysłane/i)).toBeInTheDocument();
    });

    it('powinien obsłużyć błąd Beacon API przez fallback do LeadService', async () => {
      // Symuluj Beacon API failure
      (navigator.sendBeacon as jest.Mock).mockReturnValue(false);
      
      // Symuluj LeadService
      (LeadService.createLead as jest.Mock).mockResolvedValue({
        success: true,
        data: { id: 'fallback-id' }
      });
      
      render(<LeadCaptureForm />);
      
      // Wypełnij wymagane pola
      const firstNameInput = screen.getByLabelText(/imię/i);
      const phoneInput = screen.getByLabelText(/numer telefonu/i);
      
      fireEvent.change(firstNameInput, { target: { value: 'Jan' } });
      fireEvent.change(phoneInput, { target: { value: '+48123456789' } });
      
      const submitButton = screen.getByRole('button', { name: /wyślij i otrzymaj rabat/i });
      fireEvent.click(submitButton);
      
      // Sprawdź czy natychmiast pokazuje się komunikat sukcesu
      expect(screen.getByText(/dziękujemy!/i)).toBeInTheDocument();
      
      // Sprawdź czy LeadService został wywołany jako fallback
      expect(LeadService.createLead).toHaveBeenCalledWith({
        firstName: 'Jan',
        phone: '+48123456789',
        email: undefined,
        company: undefined,
        jobTitle: undefined,
        industry: undefined,
        completeness: undefined,
      });
    });
  });

  describe('Mapowanie danych na model', () => {
    it('powinien poprawnie mapować dane z formularza na strukturę Lead przez Beacon API', async () => {
      // Symuluj Beacon API
      (navigator.sendBeacon as jest.Mock).mockReturnValue(true);
      
      render(<LeadCaptureForm />);
      
      // Wypełnij wszystkie pola
      const firstNameInput = screen.getByLabelText(/imię/i);
      const phoneInput = screen.getByLabelText(/numer telefonu/i);
      const emailInput = screen.getByLabelText(/adres email/i);
      const companyInput = screen.getByLabelText(/marka i model auta/i);
      const jobTitleInput = screen.getByLabelText(/rok produkcji/i);
      const industrySelect = screen.getByLabelText(/typ dywaników/i);
      const completenessSelect = screen.getByLabelText(/rodzaj kompletu/i);
      
      fireEvent.change(firstNameInput, { target: { value: 'Jan' } });
      fireEvent.change(phoneInput, { target: { value: '+48123456789' } });
      fireEvent.change(emailInput, { target: { value: 'jan@example.com' } });
      fireEvent.change(companyInput, { target: { value: 'BMW X5' } });
      fireEvent.change(jobTitleInput, { target: { value: '2020' } });
      fireEvent.change(industrySelect, { target: { value: '3d-evapremium-z-rantami' } });
      fireEvent.change(completenessSelect, { target: { value: 'przod-tyl' } });
      
      // Sprawdź czy dane są poprawnie zapisane w stanie
      expect(firstNameInput).toHaveValue('Jan');
      expect(phoneInput).toHaveValue('+48123456789');
      expect(emailInput).toHaveValue('jan@example.com');
      expect(companyInput).toHaveValue('BMW X5');
      expect(jobTitleInput).toHaveValue('2020');
      expect(industrySelect).toHaveValue('3d-evapremium-z-rantami');
      expect(completenessSelect).toHaveValue('przod-tyl');
      
      // Wyślij formularz i sprawdź Beacon API
      const submitButton = screen.getByRole('button', { name: /wyślij i otrzymaj rabat/i });
      fireEvent.click(submitButton);
      
      // Sprawdź czy Beacon API został wywołany z poprawnymi danymi
      expect(navigator.sendBeacon).toHaveBeenCalledWith(
        '/api/leads',
        expect.stringContaining('Jan')
      );
      
      // Sprawdź payload Beacon API
      const beaconCall = (navigator.sendBeacon as jest.Mock).mock.calls[0];
      const payload = JSON.parse(beaconCall[1]);
      
      expect(payload).toHaveProperty('firstName', 'Jan');
      expect(payload).toHaveProperty('phone', '+48123456789');
      expect(payload).toHaveProperty('email', 'jan@example.com');
      expect(payload).toHaveProperty('company', 'BMW X5');
      expect(payload).toHaveProperty('jobTitle', '2020');
      expect(payload).toHaveProperty('industry', '3d-evapremium-z-rantami');
      expect(payload).toHaveProperty('completeness', 'przod-tyl');
      expect(payload).toHaveProperty('timestamp');
      expect(payload).toHaveProperty('sessionId');
    });

    it('powinien obsłużyć puste pola opcjonalne', () => {
      render(<LeadCaptureForm />);
      
      // Wypełnij tylko wymagane pola
      const firstNameInput = screen.getByLabelText(/imię/i);
      const phoneInput = screen.getByLabelText(/numer telefonu/i);
      
      fireEvent.change(firstNameInput, { target: { value: 'Anna' } });
      fireEvent.change(phoneInput, { target: { value: '+48987654321' } });
      
      // Sprawdź czy opcjonalne pola są puste
      const emailInput = screen.getByLabelText(/adres email/i);
      const companyInput = screen.getByLabelText(/marka i model auta/i);
      const jobTitleInput = screen.getByLabelText(/rok produkcji/i);
      const industrySelect = screen.getByLabelText(/typ dywaników/i);
      const completenessSelect = screen.getByLabelText(/rodzaj kompletu/i);
      
      expect(emailInput).toHaveValue('');
      expect(companyInput).toHaveValue('');
      expect(jobTitleInput).toHaveValue('');
      expect(industrySelect).toHaveValue('');
      expect(completenessSelect).toHaveValue('');
    });
  });
});
