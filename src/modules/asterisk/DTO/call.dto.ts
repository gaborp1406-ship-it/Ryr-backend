import {
  IsNotEmpty,
  IsNumber,
} from 'class-validator';

export class CallDto {
  @IsNotEmpty()
  agent!: string;

  @IsNotEmpty()
  phone!: string;

  @IsNotEmpty()
  @IsNumber()
  idTrabajador!: number;

 @IsNotEmpty()
  @IsNumber()
  id_etapa_lead!: number;

   @IsNotEmpty()
  @IsNumber()
  tipo_historial!: number;



}