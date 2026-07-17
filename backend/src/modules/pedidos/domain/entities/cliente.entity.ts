export class Cliente {
  constructor(
    public readonly id: string,
    public nombre: string,
    public numeroWhatsapp: string | null,
  ) {}
}
