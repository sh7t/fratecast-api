import { Context } from 'telegraf';
import { UserService } from '../user/user.service';
import { WeatherService } from '../weather/weather.service';
export declare class TelegramUpdate {
  private readonly userService;
  private readonly weatherService;
  constructor(userService: UserService, weatherService: WeatherService);
  onStart(ctx: Context): Promise<void>;
  onCurrent(ctx: Context): Promise<void>;
  onWelcome(ctx: Context): Promise<void>;
}
