import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Aumentar límite de body para aceptar imágenes en base64
  // + guardar el body original (rawBody) para validar la firma de Meta
  app.use(
    bodyParser.json({
      limit: '10mb',
      verify: (req: any, _res, buf: Buffer) => {
        req.rawBody = buf;
      },
    }),
  );
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

const dev = process.env.NODE_ENV !== 'production';

app.enableCors({
  origin: [
    'https://portalryr.com',
    'http://localhost:5173',
    ...(dev ? ['null'] : []),
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-bot-key'],
});

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();