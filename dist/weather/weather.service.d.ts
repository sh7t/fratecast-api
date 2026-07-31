import { ConfigService } from '@nestjs/config';
export declare class WeatherService {
    private readonly configService;
    constructor(configService: ConfigService);
    private fetchWeatherData;
    getLocationKey(location: string): Promise<any>;
    getCurrentConditions(key: number, language?: string, isDetailed?: boolean): Promise<any>;
    getLocationByKey(key: number): Promise<any>;
}
