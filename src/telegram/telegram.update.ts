import { Command, Ctx, Start, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { UserService } from '../user/user.service';
import { WeatherService } from '../weather/weather.service';
import { CurrentConditions } from '../../common/types/current-conditions.type';
import { LocationByKey } from '../../common/types/location-by-key.type';

@Update()
export class TelegramUpdate {
  constructor(
    private readonly userService: UserService,
    private readonly weatherService: WeatherService,
  ) {}

  @Start()
  async onStart(@Ctx() ctx: Context) {
    const user = await this.userService.findOrSave(ctx.from!.id);
    const msg =
      `👋 <b>Hello there, ${ctx.from!.first_name}!</b>\n\n` +
      `Your ID: ${user.id} (TelegramID: ${user.userId})\n` +
      `Your locale: ${user.locale}\n` +
      `Your current location key: ${user.locationKey}.`;
    await ctx.reply(msg, { parse_mode: 'HTML' });
  }

  @Command('current')
  async onCurrent(@Ctx() ctx: Context) {
    const user = await this.userService.findOrSave(ctx.from!.id);
    const conditions: CurrentConditions =
      await this.weatherService.getCurrentConditions(user.locationKey);
    const location: LocationByKey = await this.weatherService.getLocationByKey(
      user.locationKey,
    );

    const msg =
      `🏙️ Right now in <b>${location.LocalizedName}, ${location.Country.LocalizedName}</b>\n\n` +
      `☀️ Weather: <b>${conditions.WeatherText}</b>\n` +
      `🌡️ Temperature: <b>${conditions.Temperature.Metric.Value} °${conditions.Temperature.Metric.Unit}</b>\n` +
      `☔ Precipations: <b>${conditions.HasPrecipitation ? 'Yes' : 'No'}.</b>`;

    await ctx.reply(msg, { parse_mode: 'HTML' });
  }

  @Command('welcome')
  async onWelcome(@Ctx() ctx: Context) {
    const msg =
      `👋 <b>Welcome there!</b>\n\n` +
      `Glad to see You here, pal.\n` +
      `Our <a href="https://github.com/sh7t/fratecast-api">GitHub Repository</a>.`;
    await ctx.reply(msg, { parse_mode: 'HTML' });
  }
}
