import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  CambiarEstadoDto,
  CrearEgresoDto,
  CrearVentaDto,
  FiltroEgresosDto,
  FiltroMovimientosDto,
  FiltroReporteDto,
  FiltroStockDto,
  FiltroVentasDto,
  GuardarClienteDto,
  GuardarProductoDto,
  RegistrarMovimientoDto,
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
  // VENTAS (PEDIDOS)
  // ===================================================================
  listarVentas(f: FiltroVentasDto = {}) {
    return this.fn('fn_listar_ventas', [f.desde, f.hasta, f.cliente, f.pagado, f.estado]);
  }

  /** Un pedido con todos sus productos */
  obtenerVenta(id: number) {
    return this.fn('fn_obtener_venta', [id]);
  }

  registrarVenta(dto: CrearVentaDto) {
    return this.fn('fn_registrar_venta', [
      dto.cliente,
      JSON.stringify(dto.items),
      dto.monto,
      dto.pagado ?? true,
      dto.metodoPago,
      dto.fecha,
      dto.notas,
      dto.estado ?? 'entregado',
      dto.fechaEntrega,
    ]);
  }

  /** Cambia entre agendado / entregado (y opcionalmente reprograma) */
  cambiarEstado(id: number, dto: CambiarEstadoDto) {
    return this.fn('fn_cambiar_estado_venta', [id, dto.estado, dto.fechaEntrega]);
  }

  /** Atajo: marca el pedido como entregado */
  marcarEntregado(id: number) {
    return this.fn('fn_cambiar_estado_venta', [id, 'entregado', null]);
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


    // ===================================================================
  // STOCK
  // ===================================================================
  listarStock(f: FiltroStockDto = {}) {
    return this.fn('fn_listar_stock', [f.buscar, f.soloAlertas]);
  }

  registrarMovimientoStock(dto: RegistrarMovimientoDto) {
    return this.fn('fn_registrar_movimiento_stock', [
      dto.productoId,
      dto.tipo,
      dto.cantidad,
      dto.nota,
    ]);
  }

  actualizarStockMinimo(productoId: number, stockMinimo: number) {
    return this.fn('fn_actualizar_stock_minimo', [productoId, stockMinimo]);
  }

  listarMovimientosStock(f: FiltroMovimientosDto = {}) {
    return this.fn('fn_listar_movimientos_stock', [f.productoId, f.desde, f.hasta]);
  }
}