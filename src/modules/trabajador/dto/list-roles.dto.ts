// listar-roles.dto.ts
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class ListarRolesDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id_rol: number;
}
