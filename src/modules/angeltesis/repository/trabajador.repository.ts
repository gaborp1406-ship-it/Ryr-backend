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
          numero_orden,
          descripcion_trabajo,
          mano_obra,
          estado
        )
        VALUES (1, $2, $3, $4)
        RETURNING id
        `,
        [
          numero_orden,
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

  // ==========================================================
  // CREAR ORDEN POR NOMBRES
  // ==========================================================

  async crearOrdenPorNombres(
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
          numero_orden,
          descripcion_trabajo,
          mano_obra,
          estado
        )
        VALUES (1, $1, $2, $3)
        RETURNING id
        `,
        [
          numero_orden,
          descripcion_trabajo,
          mano_obra,
          estado,
        ],
      );

      const idOrden = ordenResult[0].id;

      // ------------------------------------------------------
      // 2. MATERIALES
      // ------------------------------------------------------

      for (const material of materiales) {
        const nombreMaterial = this.normalizarTexto(
          material.material,
        );

        // Buscar material
        let materialResult = await queryRunner.query(
          `
          SELECT id
          FROM catalogo_material
          WHERE nombre_normalizado = $1
          LIMIT 1
          `,
          [nombreMaterial],
        );

        let idMaterial: number;

        // Si no existe -> crear
        if (materialResult.length === 0) {
          const nuevoMaterial = await queryRunner.query(
            `
            INSERT INTO catalogo_material (
              codigo,
              nombre,
              nombre_normalizado,
              unidad_medida,
              activo
            )
            VALUES (
              'MAT-' || LPAD(nextval('catalogo_material_id_seq')::text, 6, '0'),
              $1,
              $2,
              $3,
              TRUE
            )
            RETURNING id
            `,
            [
              material.material.trim(),
              nombreMaterial,
              material.unidad_medida,
            ],
          );

          idMaterial = nuevoMaterial[0].id;
        } else {
          idMaterial = materialResult[0].id;
        }

        // Guardar relación con orden
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
            idMaterial,
            material.cantidad,
            material.unidad_medida,
          ],
        );
      }

      // ------------------------------------------------------
      // 3. RIESGOS
      // ------------------------------------------------------

      for (const riesgo of riesgos) {
        const nombreRiesgo = this.normalizarTexto(
          riesgo.riesgo,
        );

        // Buscar riesgo
        let riesgoResult = await queryRunner.query(
          `
          SELECT id
          FROM catalogo_riesgo
          WHERE nombre_normalizado = $1
          LIMIT 1
          `,
          [nombreRiesgo],
        );

        let idRiesgo: number;

        // Si no existe -> crear
        if (riesgoResult.length === 0) {
          const nuevoRiesgo = await queryRunner.query(
            `
            INSERT INTO catalogo_riesgo (
              codigo,
              nombre,
              nombre_normalizado,
              activo
            )
            VALUES (
              'RIE-' || LPAD(nextval('catalogo_riesgo_id_seq')::text, 6, '0'),
              $1,
              $2,
              TRUE
            )
            RETURNING id
            `,
            [
              riesgo.riesgo.trim(),
              nombreRiesgo,
            ],
          );

          idRiesgo = nuevoRiesgo[0].id;
        } else {
          idRiesgo = riesgoResult[0].id;
        }

        // Guardar relación con orden
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
            idRiesgo,
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
  private normalizarTexto(texto: string): string {
    return texto
      .trim()
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ');
  }
}