import { IsString, MinLength } from 'class-validator';

export class AiQueryDto {
  @IsString()
  @MinLength(3)
  prompt: string;
}
