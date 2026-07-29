import { WeatherService } from './weather.service';
export declare class WeatherController {
  private readonly weatherService;
  constructor(weatherService: WeatherService);
  getLocationKey(location: string): Promise<any>;
  getCurrentConditions(key: string, isDetailed?: boolean): Promise<any>;
}
