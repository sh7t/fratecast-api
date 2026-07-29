import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegramUpdate } from './telegram.update';
import { TelegramService } from './telegram.service';
import { WeatherModule } from '../weather/weather.module';
import { UserModule } from '../user/user.module';
import { WeatherService } from '../weather/weather.service';

@Module({
  imports: [
    WeatherModule,
    UserModule,
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        token: config.getOrThrow<string>('TELEGRAM_BOT_TOKEN'),
      }),
    }),
  ],
  providers: [TelegramUpdate, TelegramService, WeatherService],
})
export class TelegramModule {}
