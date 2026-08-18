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

}