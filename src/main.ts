import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('FratecastAPI')
    .setDescription(
      'This API is used to get weather forecasts using AccuWeather API. Telegram bot - goal for future updates.',
    )
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('v1/api', app, documentFactory);

  await app.listen(process.env.API_PORT ?? 3000);
}

void bootstrap();
