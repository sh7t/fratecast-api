'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const core_1 = require('@nestjs/core');
const app_module_1 = require('./app.module');
const swagger_1 = require('@nestjs/swagger');
async function bootstrap() {
  const app = await core_1.NestFactory.create(app_module_1.AppModule);
  const config = new swagger_1.DocumentBuilder()
    .setTitle('FratecastAPI')
    .setDescription(
      'This API is used to get weather forecasts using AccuWeather API. Telegram bot - goal for future updates.',
    )
    .setVersion('1.0')
    .build();
  const documentFactory = () =>
    swagger_1.SwaggerModule.createDocument(app, config);
  swagger_1.SwaggerModule.setup('v1/api', app, documentFactory);
  await app.listen(process.env.API_PORT ?? 3000);
}
void bootstrap();
//# sourceMappingURL=main.js.map
