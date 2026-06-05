import { IsOptional, IsNumber, IsString } from 'class-validator';

export class AddressDto {
  @IsString()
  etiqueta: string; // "Casa", "Trabajo"

  @IsString()
  direccion: string;

  @IsOptional()
  @IsNumber()
  lat?: number;

  @IsOptional()
  @IsNumber()
  lng?: number;
}
