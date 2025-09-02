export interface LeadFormData {
  firstName: string;
  lastName: string;
  phone: string;
  company: string;
  jobTitle: string;
  industry: string;
  completeness: string;
  structure: string;
  borderColor: string;
  materialColor: string;
  message: string;
  includeHooks?: boolean;
}

export interface LeadSubmissionResponse {
  success: boolean;
  message: string;
  leadId?: string;
}

// Kolory obszycia dostępne w konfiguratorze
export type BorderColorOption = 
  | 'red'
  | 'black'
  | 'blue'
  | 'yellow'
  | 'orange'
  | 'purple'
  | 'brown'
  | 'maroon'
  | 'pink'
  | 'darkblue'
  | 'darkgreen'
  | 'darkgrey'
  | 'lightgrey'
  | 'beige'
  | 'lightbeige'
  | 'white'
  | 'ivory';

// Kolory materiału dostępne w konfiguratorze
export type MaterialColorOption = 
  | 'red'
  | 'black'
  | 'blue'
  | 'yellow'
  | 'lime'
  | 'orange'
  | 'purple'
  | 'brown'
  | 'maroon'
  | 'pink'
  | 'darkblue'
  | 'darkgreen'
  | 'darkgrey'
  | 'lightgrey'
  | 'beige'
  | 'lightbeige'
  | 'white'
  | 'ivory';

// Opcje kolorów obszycia z polskimi nazwami
export const BORDER_COLOR_OPTIONS: { value: BorderColorOption; label: string }[] = [
  { value: 'red', label: 'Czerwone' },
  { value: 'black', label: 'Czarne' },
  { value: 'blue', label: 'Niebieskie' },
  { value: 'yellow', label: 'Żółte' },
  { value: 'orange', label: 'Pomarańczowe' },
  { value: 'purple', label: 'Fioletowe' },
  { value: 'brown', label: 'Brązowe' },
  { value: 'maroon', label: 'Bordowe' },
  { value: 'pink', label: 'Różowe' },
  { value: 'darkblue', label: 'Granatowe' },
  { value: 'darkgreen', label: 'Ciemnozielone' },
  { value: 'darkgrey', label: 'Ciemnoszare' },
  { value: 'lightgrey', label: 'Jasnoszare' },
  { value: 'beige', label: 'Beżowe' },
  { value: 'lightbeige', label: 'Jasnobeżowe' },
  { value: 'white', label: 'Białe' },
  { value: 'ivory', label: 'Kość słoniowa' }
];

// Opcje kolorów materiału z polskimi nazwami
export const MATERIAL_COLOR_OPTIONS: { value: MaterialColorOption; label: string }[] = [
  { value: 'red', label: 'Czerwone' },
  { value: 'black', label: 'Czarne' },
  { value: 'blue', label: 'Niebieskie' },
  { value: 'yellow', label: 'Żółte' },
  { value: 'lime', label: 'Zielone' },
  { value: 'orange', label: 'Pomarańczowe' },
  { value: 'purple', label: 'Fioletowe' },
  { value: 'brown', label: 'Brązowe' },
  { value: 'maroon', label: 'Bordowe' },
  { value: 'pink', label: 'Różowe' },
  { value: 'darkblue', label: 'Granatowe' },
  { value: 'darkgreen', label: 'Ciemnozielone' },
  { value: 'darkgrey', label: 'Ciemnoszare' },
  { value: 'lightgrey', label: 'Jasnoszare' },
  { value: 'beige', label: 'Beżowe' },
  { value: 'lightbeige', label: 'Jasnobeżowe' },
  { value: 'white', label: 'Białe' },
  { value: 'ivory', label: 'Kość słoniowa' }
];

export type IndustryOption = 
  | 'technology'
  | 'healthcare'
  | 'finance'
  | 'education'
  | 'retail'
  | 'manufacturing'
  | 'consulting'
  | 'other';

export const INDUSTRY_OPTIONS: { value: IndustryOption; label: string }[] = [
  { value: 'technology', label: 'Technology' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'finance', label: 'Finance' },
  { value: 'education', label: 'Education' },
  { value: 'retail', label: 'Retail' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'other', label: 'Other' }
];
