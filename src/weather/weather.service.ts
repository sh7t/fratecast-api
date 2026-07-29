import { Injectable, NotFoundException } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WeatherService {
  constructor(private readonly configService: ConfigService) {}

  private async fetchWeatherData(url: string, params?: {}) {
    const response = await axios.get(
      `https://dataservice.accuweather.com/${url}`,
      {
        headers: {
          authorization: `Bearer ${this.configService.get<string>('ACCUWEATHER_KEY')}`,
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

  async getLocationKey(location: string) {
    const url = `locations/v1/cities/search?q=${location}`;
    const data = await this.fetchWeatherData(url);

    if (!data) throw new NotFoundException('The location has not been found');

    return data ? data.Key : null;
  }

  async getCurrentConditions(key: number, isDetailed?: boolean) {
    const url = `currentconditions/v1/${key}`;
    return await this.fetchWeatherData(url, {
      language: 'en-us',
      details: isDetailed,
    });
  }

  async getLocationByKey(key: number) {
    const url = `locations/v1/${key}`;
    return await this.fetchWeatherData(url);
  }
}
