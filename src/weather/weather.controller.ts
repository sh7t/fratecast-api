import { Controller, Get, Query } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { ApiQuery } from '@nestjs/swagger';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get('getLocationKey')
  async getLocationKey(@Query('location') location: string) {
    return await this.weatherService.getLocationKey(location);
  }

  @Get('getCurrentConditions')
  @ApiQuery({ name: 'isDetailed', required: false })
  async getCurrentConditions(
    @Query('key') key: string,
    @Query('isDetailed') isDetailed?: boolean,
  ) {
    return await this.weatherService.getCurrentConditions(+key, isDetailed);
  }
}
