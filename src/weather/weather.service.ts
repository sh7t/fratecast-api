import { Injectable } from '@nestjs/common';


@Injectable()
export class WeatherService {
    getHello() {
        return 'Hello World!';
    }
}
