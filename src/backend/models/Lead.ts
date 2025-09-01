export class Lead {
  constructor(
    public firstName: string,
    public phone: string,
    public company: string = '',
    public jobTitle: string = '',
    public industry: string = '',
    public completeness: string = '',
    public borderColor: string = '',
    public materialColor: string = '',
    public includeHooks: boolean = false
  ) {}
}
