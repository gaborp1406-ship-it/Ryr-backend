import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  CrearEgresoDto,
  CrearVentaDto,
  FiltroEgresosDto,
  FiltroReporteDto,
  FiltroVentasDto,
  GuardarClienteDto,
  GuardarProductoDto,
} from './lune.dto';

@Injectable()
export class LuneService {
  constructor(
    @InjectDataSource('secundaria')
    private readonly db: DataSource,
  ) {}

  // ===================================================================
  // Helper: ejecuta una función de BD (que devuelve JSONB) y traduce
  // los errores de Postgres a errores HTTP entendibles.
  // ===================================================================
  private async fn<T = any>(nombre: string, args: unknown[] = []): Promise<T> {
    const placeholders = args.map((_, i) => `$${i + 1}`).join(', ');
    try {
      const rows = await this.db.query(
        `SELECT ${nombre}(${placeholders}) AS data`,
        args.map((a) => a ?? null),
      );
      return rows[0].data as T;
    } catch (e: any) {
      const code = e?.code ?? e?.driverError?.code;
      const message = e?.message ?? e?.driverError?.message;
      if (code === 'P0001') throw new BadRequestException(message); // RAISE EXCEPTION
      if (code === '23505') throw new ConflictException('Ya existe un registro con ese nombre');
      if (code === '23503') throw new BadRequestException('Referencia inválida (cliente o producto no existe)');
      throw e;
    }
  }

  // ===================================================================
  // CATÁLOGOS
  // ===================================================================
  listarProductos(soloActivos = true) {
    return this.fn('fn_listar_productos', [soloActivos]);
  }

  crearProducto(dto: GuardarProductoDto) {
    return this.fn('fn_guardar_producto', [null, dto.nombre, dto.precio, dto.activo ?? true]);
  }

  actualizarProducto(id: number, dto: GuardarProductoDto) {
    return this.fn('fn_guardar_producto', [id, dto.nombre, dto.precio, dto.activo ?? true]);
  }

  // ===================================================================
  // CLIENTES
  // ===================================================================
  listarClientes(buscar?: string) {
    return this.fn('fn_listar_clientes', [buscar]);
  }

  crearCliente(dto: GuardarClienteDto) {
    return this.fn('fn_guardar_cliente', [null, dto.nombre, dto.telefono, dto.notas]);
  }

  actualizarCliente(id: number, dto: GuardarClienteDto) {
    return this.fn('fn_guardar_cliente', [id, dto.nombre, dto.telefono, dto.notas]);
  }

  // ===================================================================
  // VENTAS (INGRESOS)
  // ===================================================================
  listarVentas(f: FiltroVentasDto = {}) {
    return this.fn('fn_listar_ventas', [f.desde, f.hasta, f.cliente, f.pagado]);
  }

  registrarVenta(dto: CrearVentaDto) {
    return this.fn('fn_registrar_venta', [
      dto.cliente,
      dto.productoId,
      dto.cantidad,
      dto.monto,
      dto.pagado ?? true,
      dto.metodoPago,
      dto.fecha,
      dto.notas,
    ]);
  }

  /** Marca una venta puntual como pagada */
  marcarPagado(ventaId: number, metodoPago?: string) {
    return this.fn('fn_marcar_pagado', [ventaId, metodoPago]);
  }

  /** Cobra de una vez toda la deuda de un cliente */
  cobrarCliente(clienteId: number, metodoPago?: string) {
    return this.fn('fn_cobrar_cliente', [clienteId, metodoPago]);
  }

  eliminarVenta(id: number) {
    return this.fn('fn_eliminar_venta', [id]);
  }

  /** Reemplaza tu hoja "Cuentas" del Excel */
  cuentasPorCobrar() {
    return this.fn('fn_cuentas_por_cobrar');
  }

  // ===================================================================
  // EGRESOS
  // ===================================================================
  listarEgresos(f: FiltroEgresosDto = {}) {
    return this.fn('fn_listar_egresos', [f.desde, f.hasta, f.categoria]);
  }

  registrarEgreso(dto: CrearEgresoDto) {
    return this.fn('fn_registrar_egreso', [
      dto.concepto,
      dto.monto,
      dto.categoria ?? 'Insumos',
      dto.proveedor,
      dto.metodoPago,
      dto.socio,
      dto.fecha,
    ]);
  }

  eliminarEgreso(id: number) {
    return this.fn('fn_eliminar_egreso', [id]);
  }

  // ===================================================================
  // REPORTES
  // ===================================================================
  reporte(f: FiltroReporteDto = {}) {
    return this.fn('fn_reporte', [f.desde, f.hasta]);
  }
}