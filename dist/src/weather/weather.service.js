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
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.WeatherService = void 0;
const common_1 = require('@nestjs/common');
const axios_1 = __importDefault(require('axios'));
const config_1 = require('@nestjs/config');
let WeatherService = class WeatherService {
  configService;
  constructor(configService) {
    this.configService = configService;
  }
  async fetchWeatherData(url, params) {
    const response = await axios_1.default.get(
      `https://dataservice.accuweather.com/${url}`,
      {
        headers: {
          authorization: `Bearer ${this.configService.get('ACCUWEATHER_KEY')}`,
        },
        params: params ?? { language: 'en-us' },
      },
    );
    return !response.data || response.data.length === 0
      ? null
      : Array.isArray(response.data)
        ? response.data[0]
        : response.data;
  }
  async getLocationKey(location) {
    const url = `locations/v1/cities/search?q=${location}`;
    const data = await this.fetchWeatherData(url);
    if (!data)
      throw new common_1.NotFoundException('The location has not been found');
    return data ? data.Key : null;
  }
  async getCurrentConditions(key, isDetailed) {
    const url = `currentconditions/v1/${key}`;
    return await this.fetchWeatherData(url, {
      language: 'en-us',
      details: isDetailed,
    });
  }
  async getLocationByKey(key) {
    const url = `locations/v1/${key}`;
    return await this.fetchWeatherData(url);
  }
};
exports.WeatherService = WeatherService;
exports.WeatherService = WeatherService = __decorate(
  [
    (0, common_1.Injectable)(),
    __metadata('design:paramtypes', [config_1.ConfigService]),
  ],
  WeatherService,
);
//# sourceMappingURL=weather.service.js.map
