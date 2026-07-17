import { IsString, MinLength } from 'class-validator';

export class QueryEstadoWhatsappDto {
  @IsString()
  @MinLength(5)
  numero_whatsapp: string;
}
