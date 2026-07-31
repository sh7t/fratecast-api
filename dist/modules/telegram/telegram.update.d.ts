import { Context } from 'telegraf';
import { UserService } from '../user/user.service';
import { WeatherService } from '../weather/weather.service';
export declare class TelegramUpdate {
    private readonly userService;
    private readonly weatherService;
    constructor(userService: UserService, weatherService: WeatherService);
    private getCurrentConditionsMessage;
    private getEmojiByDayTime;
    private countryCodeToFlag;
    private reloadCurrentConditionsMessage;
    onStart(ctx: Context): Promise<void>;
    onCurrent(ctx: Context): Promise<void>;
    onReload(ctx: Context): Promise<void>;
    onProfile(ctx: Context): Promise<void>;
    onChangeLanguage(ctx: Context): Promise<void>;
    onLanguageSelect(ctx: Context): Promise<void>;
    onChangeLocation(ctx: Context): Promise<void>;
    onText(ctx: Context): Promise<void>;
}
