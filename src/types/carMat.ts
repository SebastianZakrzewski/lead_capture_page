export interface CarMatData {
  matType: string; // 3D z rantami lub bez rantów
  cellStructure: string; // struktura komórek (romb/plaster miodu)
  materialColor: string; // kolor materiału
  borderColor: string; // kolor obszycia
  imagePath: string; // ścieżka do zdjęcia dywanika
}

// Typy dla rodzaju dywanika
export type MatTypeOption = 
  | '3d-with-rims' // 3D z rantami
  | '3d-without-rims'; // 3D bez rantów

// Typy dla struktury komórek
export type CellStructureOption = 
  | 'rhombus' // romb
  | 'honeycomb'; // plaster miodu

// Opcje rodzaju dywanika
export const MAT_TYPE_OPTIONS: { value: MatTypeOption; label: string }[] = [
  { value: '3d-with-rims', label: '3D z rantami' },
  { value: '3d-without-rims', label: '3D bez rantów' }
];

// Opcje struktury komórek
export const CELL_STRUCTURE_OPTIONS: { value: CellStructureOption; label: string }[] = [
  { value: 'rhombus', label: 'Romb' },
  { value: 'honeycomb', label: 'Plaster miodu' }
];
