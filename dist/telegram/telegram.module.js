"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramModule = void 0;
const common_1 = require("@nestjs/common");
const nestjs_telegraf_1 = require("nestjs-telegraf");
const config_1 = require("@nestjs/config");
const telegram_update_1 = require("./telegram.update");
const telegram_service_1 = require("./telegram.service");
const weather_module_1 = require("../weather/weather.module");
const user_module_1 = require("../user/user.module");
const weather_service_1 = require("../weather/weather.service");
let TelegramModule = class TelegramModule {
};
exports.TelegramModule = TelegramModule;
exports.TelegramModule = TelegramModule = __decorate([
    (0, common_1.Module)({
        imports: [
            weather_module_1.WeatherModule,
            user_module_1.UserModule,
            nestjs_telegraf_1.TelegrafModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    token: config.getOrThrow('TELEGRAM_BOT_TOKEN'),
                }),
            }),
        ],
        providers: [telegram_update_1.TelegramUpdate, telegram_service_1.TelegramService, weather_service_1.WeatherService],
    })
], TelegramModule);
//# sourceMappingURL=telegram.module.js.map