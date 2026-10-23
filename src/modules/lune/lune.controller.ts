import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { LuneService } from './lune.service';

import {
  CambiarEstadoDto,
  CATEGORIAS_EGRESO,
  CobrarDto,
  CrearEgresoDto,
  CrearVentaDto,
  ESTADOS_VENTA,
  FiltroEgresosDto,
  FiltroMovimientosDto,
  FiltroReporteDto,
  FiltroStockDto,
  FiltroVentasDto,
  GuardarClienteDto,
  GuardarProductoDto,
  METODOS_PAGO,
  RegistrarMovimientoDto,
  SOCIOS,
  StockMinimoDto,
} from './lune.dto';

@Controller('lune')
export class LuneController {
  constructor(private readonly luneService: LuneService) {}

  // ===================================================================
  // Para llenar los desplegables del front
  // ===================================================================
  @Get('catalogos')
  async catalogos() {
    return {
      productos: await this.luneService.listarProductos(true),
      metodosPago: METODOS_PAGO,
      categoriasEgreso: CATEGORIAS_EGRESO,
      socios: SOCIOS,
      estadosVenta: ESTADOS_VENTA,
    };
  }

  // ===================================================================
  // VISTA 1 · VENTAS Y CLIENTES
  // ===================================================================
  @Get('ventas')
  listarVentas(@Query() filtro: FiltroVentasDto) {
    return this.luneService.listarVentas(filtro);
  }

  /** Pedido con sus productos */
  @Get('ventas/:id')
  obtenerVenta(@Param('id', ParseIntPipe) id: number) {
    return this.luneService.obtenerVenta(id);
  }

  @Post('ventas')
  registrarVenta(@Body() dto: CrearVentaDto) {
    return this.luneService.registrarVenta(dto);
  }

  /** Cambiar estado (agendado / entregado) y opcionalmente reprogramar */
  @Patch('ventas/:id/estado')
  cambiarEstado(@Param('id', ParseIntPipe) id: number, @Body() dto: CambiarEstadoDto) {
    return this.luneService.cambiarEstado(id, dto);
  }

  /** Atajo: marcar como entregado */
  @Patch('ventas/:id/entregar')
  marcarEntregado(@Param('id', ParseIntPipe) id: number) {
    return this.luneService.marcarEntregado(id);
  }

  @Patch('ventas/:id/pagar')
  marcarPagado(@Param('id', ParseIntPipe) id: number, @Body() dto: CobrarDto) {
    return this.luneService.marcarPagado(id, dto.metodoPago);
  }

  @Delete('ventas/:id')
  eliminarVenta(@Param('id', ParseIntPipe) id: number) {
    return this.luneService.eliminarVenta(id);
  }

  @Get('cuentas')
  cuentasPorCobrar() {
    return this.luneService.cuentasPorCobrar();
  }

  @Get('clientes')
  listarClientes(@Query('buscar') buscar?: string) {
    return this.luneService.listarClientes(buscar);
  }

  @Post('clientes')
  crearCliente(@Body() dto: GuardarClienteDto) {
    return this.luneService.crearCliente(dto);
  }

  @Put('clientes/:id')
  actualizarCliente(@Param('id', ParseIntPipe) id: number, @Body() dto: GuardarClienteDto) {
    return this.luneService.actualizarCliente(id, dto);
  }

  /** Cobra toda la deuda pendiente de un cliente */
  @Patch('clientes/:id/cobrar')
  cobrarCliente(@Param('id', ParseIntPipe) id: number, @Body() dto: CobrarDto) {
    return this.luneService.cobrarCliente(id, dto.metodoPago);
  }

  @Get('productos')
  listarProductos(@Query('todos') todos?: string) {
    return this.luneService.listarProductos(todos !== 'true');
  }

  @Post('productos')
  crearProducto(@Body() dto: GuardarProductoDto) {
    return this.luneService.crearProducto(dto);
  }

  @Put('productos/:id')
  actualizarProducto(@Param('id', ParseIntPipe) id: number, @Body() dto: GuardarProductoDto) {
    return this.luneService.actualizarProducto(id, dto);
  }

  // ===================================================================
  // VISTA 2 · EGRESOS
  // ===================================================================
  @Get('egresos')
  listarEgresos(@Query() filtro: FiltroEgresosDto) {
    return this.luneService.listarEgresos(filtro);
  }

  @Post('egresos')
  registrarEgreso(@Body() dto: CrearEgresoDto) {
    return this.luneService.registrarEgreso(dto);
  }

  @Delete('egresos/:id')
  eliminarEgreso(@Param('id', ParseIntPipe) id: number) {
    return this.luneService.eliminarEgreso(id);
  }

  // ===================================================================
  // VISTA 3 · REPORTES
  // ===================================================================
  @Get('reportes')
  reporte(@Query() filtro: FiltroReporteDto) {
    return this.luneService.reporte(filtro);
  }


    // ===================================================================
  // STOCK
  // ===================================================================
  @Get('stock')
  listarStock(@Query() filtro: FiltroStockDto) {
    return this.luneService.listarStock(filtro);
  }

  /** Historial de movimientos (va antes que stock/:id) */
  @Get('stock/movimientos')
  listarMovimientos(@Query() filtro: FiltroMovimientosDto) {
    return this.luneService.listarMovimientosStock(filtro);
  }

  @Post('stock/movimientos')
  registrarMovimiento(@Body() dto: RegistrarMovimientoDto) {
    return this.luneService.registrarMovimientoStock(dto);
  }

  @Patch('stock/:productoId/minimo')
  actualizarMinimo(
    @Param('productoId', ParseIntPipe) productoId: number,
    @Body() dto: StockMinimoDto,
  ) {
    return this.luneService.actualizarStockMinimo(productoId, dto.stockMinimo);
  }
}