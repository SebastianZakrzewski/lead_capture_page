import React, { useState } from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import LeadCaptureForm from '../LeadCaptureForm';
import { trackLeadSubmissionWithData } from '../FacebookPixel';
import { LeadFormData } from '@/types/lead';

jest.mock('../../hooks/useCarMatImage', () => ({
  useCarMatImage: () => ({
    imageData: null,
    isLoading: false,
    error: null,
    findImage: jest.fn(),
    clearImage: jest.fn(),
  }),
}));

jest.mock('../../backend/services/LeadService', () => ({
  LeadService: {
    createLead: jest.fn(),
  },
}));

jest.mock('../../backend/database', () => ({
  supabase: {},
  supabaseAdmin: {},
  checkConnection: jest.fn(),
}));

const emptyForm = (): LeadFormData => ({
  firstName: '',
  lastName: '',
  phone: '',
  company: '',
  jobTitle: '',
  industry: '',
  completeness: '',
  structure: '',
  borderColor: '',
  materialColor: '',
  message: '',
});

function FormHarness() {
  const [formData, setFormData] = useState<LeadFormData>(emptyForm());
  return <LeadCaptureForm formData={formData} onFormDataChange={setFormData} />;
}

function conversionCalls(eventName: 'Lead' | 'CompleteRegistration') {
  const fbq = window.fbq as unknown as jest.Mock;
  return fbq.mock.calls.filter(
    (call) => call[0] === 'track' && call[1] === eventName
  );
}

describe('Meta Pixel conversion dedupe', () => {
  const originalFbq = window.fbq;

  beforeEach(() => {
    window.fbq = jest.fn() as unknown as Window['fbq'];
    localStorage.clear();
    Object.defineProperty(navigator, 'sendBeacon', {
      writable: true,
      configurable: true,
      value: jest.fn().mockReturnValue(true),
    });
    Object.defineProperty(window, 'location', {
      writable: true,
      configurable: true,
      value: {
        assign: jest.fn(),
        href: 'https://form.evapremium.pl/',
        search: '',
      },
    });
  });

  afterEach(() => {
    window.fbq = originalFbq;
  });

  it('sends one Lead and one CompleteRegistration with the same eventID', () => {
    trackLeadSubmissionWithData(
      {
        industry: '3d-evapremium-z-rantami',
        completeness: 'przod',
        includeHooks: false,
      },
      'complete_1700000000000'
    );

    const leadCalls = conversionCalls('Lead');
    const registrationCalls = conversionCalls('CompleteRegistration');

    expect(leadCalls).toHaveLength(1);
    expect(registrationCalls).toHaveLength(1);
    expect(leadCalls[0][3]).toEqual({ eventID: 'complete_1700000000000' });
    expect(registrationCalls[0][3]).toEqual({ eventID: 'complete_1700000000000' });
    expect(leadCalls[0][2].currency).toBe('PLN');
    expect(registrationCalls[0][2].value).toBe(leadCalls[0][2].value);
  });

  it('generates one eventID when the caller does not pass one', () => {
    trackLeadSubmissionWithData({ completeness: 'dywanik-kierowcy' });
    trackLeadSubmissionWithData({ completeness: 'dywanik-kierowcy' });

    const leadCalls = conversionCalls('Lead');
    const registrationCalls = conversionCalls('CompleteRegistration');

    expect(leadCalls).toHaveLength(2);
    expect(registrationCalls).toHaveLength(2);
    expect(leadCalls[0][3].eventID).toBe(registrationCalls[0][3].eventID);
    expect(leadCalls[1][3].eventID).toBe(registrationCalls[1][3].eventID);
    expect(leadCalls[0][3].eventID).not.toBe(leadCalls[1][3].eventID);
  });

  it('fires exactly one conversion pair after a successful form submit', () => {
    render(<FormHarness />);

    fireEvent.click(screen.getByRole('button', { name: /wybierz typ dywaników/i }));
    fireEvent.click(screen.getByText('3D EVAPREMIUM Z RANTAMI'));

    fireEvent.click(screen.getByRole('button', { name: /wybierz rodzaj kompletu/i }));
    fireEvent.click(screen.getByText('Przód (2 szt.)'));

    fireEvent.click(screen.getByRole('button', { name: /wybierz strukturę komórek/i }));
    fireEvent.click(screen.getByText('Romb'));

    const materialSection = screen.getByText('Kolor Materiału').parentElement?.parentElement;
    const borderSection = screen.getByText('Kolor Obszycia').parentElement?.parentElement;
    expect(materialSection).toBeTruthy();
    expect(borderSection).toBeTruthy();
    fireEvent.click(within(materialSection as HTMLElement).getByTitle('Czarne'));
    fireEvent.click(within(borderSection as HTMLElement).getByTitle('Czerwone'));

    fireEvent.click(screen.getByRole('button', { name: /dalej - podaj dane auta/i }));

    fireEvent.change(screen.getByPlaceholderText('np. BMW X5, Audi A4'), {
      target: { value: 'BMW X5', name: 'company' },
    });
    fireEvent.change(screen.getByPlaceholderText('np. 2020'), {
      target: { value: '2020', name: 'jobTitle' },
    });
    fireEvent.click(screen.getByRole('button', { name: /dalej - dane kontaktowe/i }));

    fireEvent.change(screen.getByPlaceholderText('Wprowadź swoje imię'), {
      target: { value: 'Jan', name: 'firstName' },
    });
    fireEvent.change(screen.getByPlaceholderText('123 456 789'), {
      target: { value: '123456789' },
    });

    fireEvent.click(screen.getByRole('button', { name: /sprawdź wycenę/i }));

    expect(navigator.sendBeacon).toHaveBeenCalledWith(
      '/api/leads',
      expect.stringContaining('"firstName":"Jan"')
    );
    expect(screen.getByText(/dziękujemy!/i)).toBeInTheDocument();

    const leadCalls = conversionCalls('Lead');
    const registrationCalls = conversionCalls('CompleteRegistration');
    expect(leadCalls).toHaveLength(1);
    expect(registrationCalls).toHaveLength(1);

    const eventID = leadCalls[0][3].eventID as string;
    expect(eventID).toMatch(/^complete_\d+$/);
    expect(registrationCalls[0][3]).toEqual({ eventID });

    const trackedNames = (window.fbq as unknown as jest.Mock).mock.calls
      .filter((call) => call[0] === 'track' || call[0] === 'trackCustom')
      .map((call) => call[1]);
    expect(trackedNames.filter((name) => name === 'Lead')).toHaveLength(1);
    expect(trackedNames.filter((name) => name === 'CompleteRegistration')).toHaveLength(1);
    expect(trackedNames).toEqual(
      expect.arrayContaining(['ViewContent', 'CustomizeProduct', 'InitiateCheckout'])
    );
  });

  it('does not send conversion events when the beacon fails', () => {
    (navigator.sendBeacon as jest.Mock).mockReturnValue(false);
    render(<FormHarness />);

    fireEvent.click(screen.getByRole('button', { name: /wybierz typ dywaników/i }));
    fireEvent.click(screen.getByText('3D EVAPREMIUM BEZ RANTÓW'));
    fireEvent.click(screen.getByRole('button', { name: /wybierz rodzaj kompletu/i }));
    fireEvent.click(screen.getByText('Dywanik Kierowcy (1 szt.)'));
    fireEvent.click(screen.getByRole('button', { name: /wybierz strukturę komórek/i }));
    fireEvent.click(screen.getByText('Plaster Miodu'));

    const materialSection = screen.getByText('Kolor Materiału').parentElement?.parentElement;
    const borderSection = screen.getByText('Kolor Obszycia').parentElement?.parentElement;
    fireEvent.click(within(materialSection as HTMLElement).getByTitle('Czarne'));
    fireEvent.click(within(borderSection as HTMLElement).getByTitle('Czerwone'));

    fireEvent.click(screen.getByRole('button', { name: /dalej - podaj dane auta/i }));
    fireEvent.change(screen.getByPlaceholderText('np. BMW X5, Audi A4'), {
      target: { value: 'Audi A4', name: 'company' },
    });
    fireEvent.change(screen.getByPlaceholderText('np. 2020'), {
      target: { value: '2019', name: 'jobTitle' },
    });
    fireEvent.click(screen.getByRole('button', { name: /dalej - dane kontaktowe/i }));
    fireEvent.change(screen.getByPlaceholderText('Wprowadź swoje imię'), {
      target: { value: 'Anna', name: 'firstName' },
    });
    fireEvent.change(screen.getByPlaceholderText('123 456 789'), {
      target: { value: '500600700' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sprawdź wycenę/i }));

    expect(conversionCalls('Lead')).toHaveLength(0);
    expect(conversionCalls('CompleteRegistration')).toHaveLength(0);
    expect(screen.queryByText(/dziękujemy!/i)).not.toBeInTheDocument();
  });
});
