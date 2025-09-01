export class CarMat {
  constructor(
    public matType: string = '', // 3D z rantami lub bez rantów
    public cellStructure: string = '', // struktura komórek (romb/plaster miodu)
    public materialColor: string = '', // kolor materiału
    public borderColor: string = '', // kolor obszycia
    public imagePath: string = '' // ścieżka do zdjęcia dywanika
  ) {}
}
