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

// Mock tracking utility
jest.mock('../../utils/tracking', () => ({
  prepareLeadSubmissionData: jest.fn((data) => ({
    ...data,
    sessionId: 'test-session-123',
    utmSource: 'google',
    utmMedium: 'cpc',
    utmCampaign: 'test-campaign',
    referrer: 'https://google.com',
    gclid: 'test-gclid',
    fbclid: 'test-fbclid',
  })),
}));

describe('Natychmiastowe przejście na stronę sukcesu', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('powinien natychmiast pokazać stronę sukcesu po kliknięciu submit', async () => {
    // Symuluj Beacon API
    (navigator.sendBeacon as jest.Mock).mockReturnValue(true);

    render(<LeadCaptureForm />);

    // Wypełnij wymagane pola
    const firstNameInput = screen.getByLabelText(/imię/i);
    const phoneInput = screen.getByLabelText(/numer telefonu/i);
    const submitButton = screen.getByRole('button', { name: /wyślij i otrzymaj rabat/i });

    fireEvent.change(firstNameInput, { target: { value: 'Jan' } });
    fireEvent.change(phoneInput, { target: { value: '+48123456789' } });

    // Sprawdź czy przycisk jest włączony
    expect(submitButton).toBeEnabled();

    // Kliknij submit
    fireEvent.click(submitButton);

    // Sprawdź czy natychmiast pokazuje się strona sukcesu
    expect(screen.getByText(/dziękujemy!/i)).toBeInTheDocument();
    expect(screen.getByText(/twoje dane zostały pomyślnie wysłane/i)).toBeInTheDocument();

    // Sprawdź czy Beacon API został wywołany
    expect(navigator.sendBeacon).toHaveBeenCalledWith(
      '/api/leads',
      expect.stringContaining('Jan')
    );
    
    // Sprawdź czy LeadService NIE został wywołany (Beacon API działa)
    expect(LeadService.createLead).not.toHaveBeenCalled();
  });

  it('powinien wywołać Beacon API w tle', async () => {
    // Symuluj Beacon API
    (navigator.sendBeacon as jest.Mock).mockReturnValue(true);

    render(<LeadCaptureForm />);

    // Wypełnij wymagane pola
    const firstNameInput = screen.getByLabelText(/imię/i);
    const phoneInput = screen.getByLabelText(/numer telefonu/i);
    const submitButton = screen.getByRole('button', { name: /wyślij i otrzymaj rabat/i });

    fireEvent.change(firstNameInput, { target: { value: 'Anna' } });
    fireEvent.change(phoneInput, { target: { value: '+48987654321' } });

    // Kliknij submit
    fireEvent.click(submitButton);

    // Sprawdź czy natychmiast pokazuje się strona sukcesu
    expect(screen.getByText(/dziękujemy!/i)).toBeInTheDocument();

    // Sprawdź czy Beacon API został wywołany
    expect(navigator.sendBeacon).toHaveBeenCalledTimes(1);
    expect(navigator.sendBeacon).toHaveBeenCalledWith(
      '/api/leads',
      expect.stringContaining('Anna')
    );
  });

  it('powinien obsłużyć fallback do LeadService gdy Beacon API nie działa', async () => {
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
    const submitButton = screen.getByRole('button', { name: /wyślij i otrzymaj rabat/i });

    fireEvent.change(firstNameInput, { target: { value: 'Piotr' } });
    fireEvent.change(phoneInput, { target: { value: '+48765432198' } });

    // Kliknij submit
    fireEvent.click(submitButton);

    // Sprawdź czy natychmiast pokazuje się strona sukcesu
    expect(screen.getByText(/dziękujemy!/i)).toBeInTheDocument();

    // Sprawdź czy Beacon API został wywołany
    expect(navigator.sendBeacon).toHaveBeenCalledTimes(1);
    
    // Sprawdź czy LeadService został wywołany jako fallback
    expect(LeadService.createLead).toHaveBeenCalledTimes(1);
    expect(LeadService.createLead).toHaveBeenCalledWith({
      firstName: 'Piotr',
      phone: '+48765432198',
      email: undefined,
      company: undefined,
      jobTitle: undefined,
      industry: undefined,
      completeness: undefined,
    });
  });

  it('powinien wysłać dane z trackingiem przez Beacon API', async () => {
    // Symuluj Beacon API
    (navigator.sendBeacon as jest.Mock).mockReturnValue(true);

    render(<LeadCaptureForm />);

    // Wypełnij wymagane pola
    const firstNameInput = screen.getByLabelText(/imię/i);
    const phoneInput = screen.getByLabelText(/numer telefonu/i);
    const submitButton = screen.getByRole('button', { name: /wyślij i otrzymaj rabat/i });

    fireEvent.change(firstNameInput, { target: { value: 'Maria' } });
    fireEvent.change(phoneInput, { target: { value: '+48654321987' } });

    // Kliknij submit
    fireEvent.click(submitButton);

    // Sprawdź czy pokazuje się strona sukcesu
    expect(screen.getByText(/dziękujemy!/i)).toBeInTheDocument();

    // Sprawdź czy Beacon API został wywołany z trackingiem
    expect(navigator.sendBeacon).toHaveBeenCalledWith(
      '/api/leads',
      expect.stringContaining('Maria')
    );
    
    // Sprawdź czy payload zawiera tracking data
    const beaconCall = (navigator.sendBeacon as jest.Mock).mock.calls[0];
    const payload = JSON.parse(beaconCall[1]);
    
    expect(payload).toHaveProperty('firstName', 'Maria');
    expect(payload).toHaveProperty('phone', '+48654321987');
    expect(payload).toHaveProperty('timestamp');
    expect(payload).toHaveProperty('sessionId');
    expect(payload).toHaveProperty('utmSource');
    expect(payload).toHaveProperty('utmMedium');
    expect(payload).toHaveProperty('utmCampaign');
  });

  it('powinien zresetować formularz po 3 sekundach', async () => {
    // Użyj fake timers
    jest.useFakeTimers();
    
    // Symuluj Beacon API
    (navigator.sendBeacon as jest.Mock).mockReturnValue(true);

    render(<LeadCaptureForm />);

    // Wypełnij wymagane pola
    const firstNameInput = screen.getByLabelText(/imię/i);
    const phoneInput = screen.getByLabelText(/numer telefonu/i);
    const submitButton = screen.getByRole('button', { name: /wyślij i otrzymaj rabat/i });

    fireEvent.change(firstNameInput, { target: { value: 'Maria' } });
    fireEvent.change(phoneInput, { target: { value: '+48654321987' } });

    // Kliknij submit
    fireEvent.click(submitButton);

    // Sprawdź czy pokazuje się strona sukcesu
    expect(screen.getByText(/dziękujemy!/i)).toBeInTheDocument();

    // Przewiń czas o 3 sekundy
    jest.advanceTimersByTime(3000);

    // Sprawdź czy formularz został zresetowany
    expect(screen.getByText(/wypełnij formularz/i)).toBeInTheDocument();
    expect(firstNameInput).toHaveValue('');
    expect(phoneInput).toHaveValue('');
    
    // Przywróć prawdziwe timery
    jest.useRealTimers();
  });
});
