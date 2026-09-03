import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class AngelRepository {
  constructor(private dataSource: DataSource) { }


  async crearOrden(
    numero_orden: string,
    descripcion_trabajo: string,
    mano_obra: number,
    materiales: any[],
    riesgos: any[],
    estado: string = 'PENDIENTE',
  ) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // ------------------------------------------------------
      // 1. INSERTAR ORDEN
      // ------------------------------------------------------

      const ordenResult = await queryRunner.query(
        `
        INSERT INTO orden_produccion (
  
          descripcion_trabajo,
          mano_obra,
          estado
        )
        VALUES ( $1, $2, $3)
        RETURNING id
        `,
        [

          descripcion_trabajo,
          mano_obra,
          estado,
        ],
      );

      const idOrden = ordenResult[0].id;

      // ------------------------------------------------------
      // 2. INSERTAR MATERIALES
      // ------------------------------------------------------

      for (const material of materiales) {
        await queryRunner.query(
          `
          INSERT INTO orden_produccion_material (
            id_orden,
            id_material,
            cantidad,
            unidad_medida
          )
          VALUES ($1, $2, $3, $4)
          `,
          [
            idOrden,
            material.id_material,
            material.cantidad,
            material.unidad_medida,
          ],
        );
      }

      // ------------------------------------------------------
      // 3. INSERTAR RIESGOS
      // ------------------------------------------------------

      for (const riesgo of riesgos) {
        await queryRunner.query(
          `
          INSERT INTO orden_produccion_riesgo (
            id_orden,
            id_riesgo,
            observacion
          )
          VALUES ($1, $2, $3)
          `,
          [
            idOrden,
            riesgo.id_riesgo,
            riesgo.observacion ?? null,
          ],
        );
      }

      await queryRunner.commitTransaction();

      return {
        id: idOrden,
        numero_orden,
        mensaje: 'Orden creada correctamente',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async crearDatosReales(
    idOrden: number,
    manoObraReal: number,
    materiales: any[],
    riesgos: any[],
  ) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // ------------------------------------------------------
      // 1. INSERTAR DATOS REALES
      // ------------------------------------------------------

      const datosResult = await queryRunner.query(
        `
      INSERT INTO orden_datos_reales (
        id_orden,
        mano_obra_real
      )
      VALUES ($1, $2)
      RETURNING id
      `,
        [
          idOrden,
          manoObraReal,
        ],
      );

      const idDatosReales = datosResult[0].id;

      // ------------------------------------------------------
      // 2. INSERTAR MATERIALES REALES
      // ------------------------------------------------------

      for (const material of materiales ?? []) {
        await queryRunner.query(
          `
        INSERT INTO orden_datos_reales_material (
          id_datos_reales,
          id_material,
          cantidad,
          unidad_medida
        )
        VALUES ($1, $2, $3, $4)
        `,
          [
            idDatosReales,
            material.id_material,
            material.cantidad,
            material.unidad_medida,
          ],
        );
      }

      // ------------------------------------------------------
      // 3. INSERTAR RIESGOS REALES
      // ------------------------------------------------------

      for (const riesgo of riesgos ?? []) {
        await queryRunner.query(
          `
        INSERT INTO orden_datos_reales_riesgo (
          id_datos_reales,
          id_riesgo
        )
        VALUES ($1, $2)
        `,
          [
            idDatosReales,
            riesgo.id_riesgo,
          ],
        );
      }

      // ------------------------------------------------------
      // 4. ACTUALIZAR DATA_REAL DE LA ORDEN
      // ------------------------------------------------------

      await queryRunner.query(
        `
      UPDATE orden_produccion
      SET data_real = true
      WHERE id = $1
      `,
        [idOrden],
      );

      // ------------------------------------------------------
      // 5. CONFIRMAR TRANSACCIÓN
      // ------------------------------------------------------

      await queryRunner.commitTransaction();

      return {
        id: idDatosReales,
        id_orden: idOrden,
        mano_obra_real: manoObraReal,
        data_real: true,
        mensaje: 'Datos reales registrados correctamente',
      };

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;

    } finally {
      await queryRunner.release();
    }
  }
  // ==========================================================
  // LISTAR ORDENES
  // ==========================================================

  async listarOrdenes(
    fechaInicio?: string,
    fechaFin?: string,
  ) {
    let where = '';
    const params: any[] = [];

    if (fechaInicio) {
      params.push(fechaInicio);
      where += ` AND op.fecha_creacion >= $${params.length}::date`;
    }

    if (fechaFin) {
      params.push(fechaFin);
      where += ` AND op.fecha_creacion < ($${params.length}::date + INTERVAL '1 day')`;
    }

    const ordenes = await this.dataSource.query(
      `
    SELECT
      op.id,
      op.numero_orden,
      op.descripcion_trabajo,
      op.mano_obra,
      op.estado,
      op.fecha_creacion,
      op.analisis_ml,
      op.data_real,

      COALESCE(
        (
          SELECT json_agg(
            json_build_object(
              'id', opm.id,
              'id_material', cm.id,
              'material', cm.nombre,
              'cantidad', opm.cantidad,
              'unidad_medida', opm.unidad_medida
            )
            ORDER BY opm.id
          )
          FROM orden_produccion_material opm
          INNER JOIN catalogo_material cm
            ON cm.id = opm.id_material
          WHERE opm.id_orden = op.id
        ),
        '[]'::json
      ) AS materiales,

      COALESCE(
        (
          SELECT json_agg(
            json_build_object(
              'id', opr.id,
              'id_riesgo', cr.id,
              'riesgo', cr.nombre
            )
            ORDER BY opr.id
          )
          FROM orden_produccion_riesgo opr
          INNER JOIN catalogo_riesgo cr
            ON cr.id = opr.id_riesgo
          WHERE opr.id_orden = op.id
        ),
        '[]'::json
      ) AS riesgos

    FROM orden_produccion op

    WHERE 1 = 1
    ${where}

    ORDER BY op.fecha_creacion DESC
    `,
      params,
    );

    return ordenes;
  }
  // ==========================================================
  // LISTAR MATERIALES
  // ==========================================================

  async listarMateriales() {
    return await this.dataSource.query(`
    SELECT
      id,
      codigo,
      nombre,
      unidad_medida,
      activo
    FROM catalogo_material
    WHERE activo = TRUE
    ORDER BY nombre ASC
  `);
  }

  // ==========================================================
  // LISTAR RIESGOS
  // ==========================================================

  async listarRiesgos() {
    return await this.dataSource.query(`
    SELECT
      id,
      codigo,
      nombre
    FROM catalogo_riesgo
    WHERE activo = TRUE
    ORDER BY nombre ASC
  `);
  }


  // ==========================================================
  // GUARDAR ANÁLISIS ML (mano de obra, materiales, riesgos)
  // ==========================================================

  async guardarAnalisisMl(
    idOrden: number,
    manoObraPredicha: number,
    versionModelo: string | null,
    materiales: {
      material: string;
      cantidad?: number | null;
      unidad?: string | null;
      probabilidad?: number | null;
    }[],
    riesgos: {
      riesgo: string;
      probabilidad?: number | null;
    }[],
  ) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    const materialesNoEncontrados: string[] = [];
    const riesgosNoEncontrados: string[] = [];

    try {
      // ------------------------------------------------------
      // 1. INSERTAR ANÁLISIS ML (CABECERA)
      // ------------------------------------------------------

      const analisisResult = await queryRunner.query(
        `
        INSERT INTO orden_analisis_ml (
          id_orden,
          mano_obra_predicha,
          version_modelo
        )
        VALUES ($1, $2, $3)
        RETURNING id
        `,
        [idOrden, manoObraPredicha, versionModelo],
      );

      const idAnalisisMl = analisisResult[0].id;

      // ------------------------------------------------------
      // 2. RESOLVER Y GUARDAR MATERIALES POR NOMBRE
      // ------------------------------------------------------

      for (const material of materiales) {
        const nombreNormalizado = this.normalizarTexto(
          material.material,
        );

        const encontrado = await queryRunner.query(
          `
          SELECT id
          FROM catalogo_material
          WHERE nombre_normalizado = $1
            AND activo = TRUE
          LIMIT 1
          `,
          [nombreNormalizado],
        );

        if (encontrado.length === 0) {
          materialesNoEncontrados.push(material.material);
          continue;
        }

        const idMaterial = encontrado[0].id;

        await queryRunner.query(
          `
          INSERT INTO orden_analisis_ml_material (
            id_analisis_ml,
            id_material,
            cantidad,
            unidad_medida,
            probabilidad
          )
          VALUES ($1, $2, $3, $4, $5)
          `,
          [
            idAnalisisMl,
            idMaterial,
            material.cantidad ?? null,
            material.unidad ?? null,
            material.probabilidad ?? null,
          ],
        );
      }

      // ------------------------------------------------------
      // 3. RESOLVER Y GUARDAR RIESGOS POR NOMBRE
      // ------------------------------------------------------

      for (const riesgo of riesgos) {
        const nombreNormalizado = this.normalizarTexto(
          riesgo.riesgo,
        );

        const encontrado = await queryRunner.query(
          `
          SELECT id
          FROM catalogo_riesgo
          WHERE nombre_normalizado = $1
            AND activo = TRUE
          LIMIT 1
          `,
          [nombreNormalizado],
        );

        if (encontrado.length === 0) {
          riesgosNoEncontrados.push(riesgo.riesgo);
          continue;
        }

        const idRiesgo = encontrado[0].id;

        await queryRunner.query(
          `
          INSERT INTO orden_analisis_ml_riesgo (
            id_analisis_ml,
            id_riesgo,
            probabilidad
          )
          VALUES ($1, $2, $3)
          `,
          [idAnalisisMl, idRiesgo, riesgo.probabilidad ?? null],
        );
      }

      // ------------------------------------------------------
      // 4. ACTUALIZAR ORDEN_PRODUCCION - MARCAR ANALISIS_ML
      // ------------------------------------------------------

      await queryRunner.query(
        `
        UPDATE orden_produccion
        SET analisis_ml = TRUE
        WHERE id = $1
        `,
        [idOrden],
      );

      await queryRunner.commitTransaction();

      return {
        id_analisis_ml: idAnalisisMl,
        id_orden: idOrden,
        materiales_guardados:
          materiales.length - materialesNoEncontrados.length,
        materiales_no_encontrados: materialesNoEncontrados,
        riesgos_guardados: riesgos.length - riesgosNoEncontrados.length,
        riesgos_no_encontrados: riesgosNoEncontrados,
        mensaje: 'Análisis ML guardado correctamente',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private normalizarTexto(texto: string): string {
    return texto
      .trim()
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ');
  }

  // ==========================================================
  // OBTENER DETALLE DE ORDEN + INDICADORES
  // ==========================================================
  async obtenerDetalleOrdenIndicadores(idOrden: number) {
    const result = await this.dataSource.query(
      `
    SELECT public.fn_obtener_detalle_orden_indicadores($1) AS data
    `,
      [idOrden],
    );

    if (!result || result.length === 0) {
      throw new Error('No se encontró información para la orden');
    }

    return result[0].data;
  }

  async obtenerDashboard() {
    const result = await this.dataSource.query(`
    SELECT public.fn_obtener_dashboard() AS data
  `);

    if (!result || result.length === 0) {
      throw new Error('No se pudo obtener el dashboard');
    }

    return result[0].data;
  }
}