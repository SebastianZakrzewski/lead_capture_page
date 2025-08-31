export class Lead {
  constructor(
    public firstName: string,
    public phone: string,
    public email: string = '',
    public company: string = '',
    public jobTitle: string = '',
    public industry: string = '',
    public completeness: string = ''
  ) {}
}
