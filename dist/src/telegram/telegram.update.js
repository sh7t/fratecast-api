'use strict';
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
            ? (desc = Object.getOwnPropertyDescriptor(target, key))
            : desc,
      d;
    if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function')
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return (c > 3 && r && Object.defineProperty(target, key, r), r);
  };
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === 'object' && typeof Reflect.metadata === 'function')
      return Reflect.metadata(k, v);
  };
var __param =
  (this && this.__param) ||
  function (paramIndex, decorator) {
    return function (target, key) {
      decorator(target, key, paramIndex);
    };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.TelegramUpdate = void 0;
const nestjs_telegraf_1 = require('nestjs-telegraf');
const telegraf_1 = require('telegraf');
const user_service_1 = require('../user/user.service');
const weather_service_1 = require('../weather/weather.service');
let TelegramUpdate = class TelegramUpdate {
  userService;
  weatherService;
  constructor(userService, weatherService) {
    this.userService = userService;
    this.weatherService = weatherService;
  }
  async onStart(ctx) {
    const user = await this.userService.findOrSave(ctx.from.id);
    const msg =
      `👋 <b>Hello there, ${ctx.from.first_name}!</b>\n\n` +
      `Your ID: ${user.id} (TelegramID: ${user.userId})\n` +
      `Your locale: ${user.locale}\n` +
      `Your current location key: ${user.locationKey}.`;
    await ctx.reply(msg, { parse_mode: 'HTML' });
  }
  async onCurrent(ctx) {
    const user = await this.userService.findOrSave(ctx.from.id);
    const conditions = await this.weatherService.getCurrentConditions(
      user.locationKey,
    );
    const location = await this.weatherService.getLocationByKey(
      user.locationKey,
    );
    const msg =
      `🏙️ Right now in <b>${location.LocalizedName}, ${location.Country.LocalizedName}</b>\n\n` +
      `☀️ Weather: <b>${conditions.WeatherText}</b>\n` +
      `🌡️ Temperature: <b>${conditions.Temperature.Metric.Value} °${conditions.Temperature.Metric.Unit}</b>\n` +
      `☔ Precipations: <b>${conditions.HasPrecipitation ? 'Yes' : 'No'}.</b>`;
    await ctx.reply(msg, { parse_mode: 'HTML' });
  }
  async onWelcome(ctx) {
    const msg =
      `👋 <b>Welcome there!</b>\n\n` +
      `Glad to see You here, pal.\n` +
      `Our <a href="https://github.com/sh7t/fratecast-api">GitHub Repository</a>.`;
    await ctx.reply(msg, { parse_mode: 'HTML' });
  }
};
exports.TelegramUpdate = TelegramUpdate;
__decorate(
  [
    (0, nestjs_telegraf_1.Start)(),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [telegraf_1.Context]),
    __metadata('design:returntype', Promise),
  ],
  TelegramUpdate.prototype,
  'onStart',
  null,
);
__decorate(
  [
    (0, nestjs_telegraf_1.Command)('current'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [telegraf_1.Context]),
    __metadata('design:returntype', Promise),
  ],
  TelegramUpdate.prototype,
  'onCurrent',
  null,
);
__decorate(
  [
    (0, nestjs_telegraf_1.Command)('welcome'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [telegraf_1.Context]),
    __metadata('design:returntype', Promise),
  ],
  TelegramUpdate.prototype,
  'onWelcome',
  null,
);
exports.TelegramUpdate = TelegramUpdate = __decorate(
  [
    (0, nestjs_telegraf_1.Update)(),
    __metadata('design:paramtypes', [
      user_service_1.UserService,
      weather_service_1.WeatherService,
    ]),
  ],
  TelegramUpdate,
);
//# sourceMappingURL=telegram.update.js.map
