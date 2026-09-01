import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ChildProcess, spawn } from 'child_process';
import { join } from 'path';


@Injectable()
export class PrediccionPythonService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrediccionPythonService.name);
  private proceso: ChildProcess | null = null;


  private readonly carpetaPython = join(
    process.cwd(),
    'src',
    'modules',
    'prediccion',
  );
  private readonly puerto = process.env.PREDICCION_API_PORT ?? '8000';
  private readonly comandoPython = process.env.PYTHON_BIN ?? 'python3';

  onModuleInit() {
    this.logger.log(`Iniciando servicio de predicción (Python) en :${this.puerto} ...`);

    this.proceso = spawn(
      this.comandoPython,
      ['-m', 'uvicorn', 'api_prediccion:app', '--host', '127.0.0.1', '--port', this.puerto],
      { cwd: this.carpetaPython },
    );

    this.proceso.stdout?.on('data', (data) =>
      this.logger.log(`[python] ${data.toString().trim()}`),
    );
    this.proceso.stderr?.on('data', (data) =>
      this.logger.warn(`[python] ${data.toString().trim()}`),
    );
    this.proceso.on('exit', (code) => {
      this.logger.warn(`El servicio Python terminó (código ${code}).`);
    });
    this.proceso.on('error', (err) => {
      this.logger.error(
        `No se pudo iniciar Python. ¿Está "python3" en el PATH? Detalle: ${err.message}`,
      );
    });
  }

  onModuleDestroy() {
    this.proceso?.kill();
  }
}