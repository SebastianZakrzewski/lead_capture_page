import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LeadCaptureForm from '../LeadCaptureForm';
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
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { assign: jest.fn() },
    });
  });

  it('powinien natychmiast pokazać stronę sukcesu po kliknięciu submit', async () => {
    // Symuluj Beacon API
    (navigator.sendBeacon as jest.Mock).mockReturnValue(true);
    jest.useFakeTimers();

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

    // Sprawdź czy nastąpiło przekierowanie
    jest.advanceTimersByTime(1000);
    expect(window.location.assign).toHaveBeenCalledWith('https://www.evapremium.pl');
    jest.useRealTimers();
    
  });

  it('powinien wywołać Beacon API w tle', async () => {
    // Symuluj Beacon API
    (navigator.sendBeacon as jest.Mock).mockReturnValue(true);
    jest.useFakeTimers();

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

    // Sprawdź czy nastąpiło przekierowanie
    jest.advanceTimersByTime(1000);
    expect(window.location.assign).toHaveBeenCalledWith('https://www.evapremium.pl');
    jest.useRealTimers();
  });

  it('nie powinien przekierować gdy Beacon API nie działa', async () => {
    // Symuluj Beacon API failure
    (navigator.sendBeacon as jest.Mock).mockReturnValue(false);
    jest.useFakeTimers();
    
    render(<LeadCaptureForm />);

    // Wypełnij wymagane pola
    const firstNameInput = screen.getByLabelText(/imię/i);
    const phoneInput = screen.getByLabelText(/numer telefonu/i);
    const submitButton = screen.getByRole('button', { name: /wyślij i otrzymaj rabat/i });

    fireEvent.change(firstNameInput, { target: { value: 'Piotr' } });
    fireEvent.change(phoneInput, { target: { value: '+48765432198' } });

    // Kliknij submit
    fireEvent.click(submitButton);

    // Sprawdź czy Beacon API został wywołany
    expect(navigator.sendBeacon).toHaveBeenCalledTimes(1);

    // Sprawdź czy nie nastąpiło przekierowanie
    jest.advanceTimersByTime(1000);
    expect(window.location.assign).not.toHaveBeenCalled();
    jest.useRealTimers();
  });

  it('powinien wysłać dane z trackingiem przez Beacon API', async () => {
    // Symuluj Beacon API
    (navigator.sendBeacon as jest.Mock).mockReturnValue(true);
    jest.useFakeTimers();

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

    // Sprawdź czy nastąpiło przekierowanie
    jest.advanceTimersByTime(1000);
    expect(window.location.assign).toHaveBeenCalledWith('https://www.evapremium.pl');
    jest.useRealTimers();
    
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

  it('powinien przekierować po wysłaniu formularza', async () => {
    // Symuluj Beacon API
    (navigator.sendBeacon as jest.Mock).mockReturnValue(true);
    jest.useFakeTimers();

    render(<LeadCaptureForm />);

    // Wypełnij wymagane pola
    const firstNameInput = screen.getByLabelText(/imię/i);
    const phoneInput = screen.getByLabelText(/numer telefonu/i);
    const submitButton = screen.getByRole('button', { name: /wyślij i otrzymaj rabat/i });

    fireEvent.change(firstNameInput, { target: { value: 'Maria' } });
    fireEvent.change(phoneInput, { target: { value: '+48654321987' } });

    // Kliknij submit
    fireEvent.click(submitButton);

    // Sprawdź czy nastąpiło przekierowanie
    jest.advanceTimersByTime(1000);
    expect(window.location.assign).toHaveBeenCalledWith('https://www.evapremium.pl');
    jest.useRealTimers();
  });
});
