import {Action, Command, Ctx, On, Start, Update} from 'nestjs-telegraf';
import {Context, Markup} from 'telegraf';
import {UserService} from '../user/user.service';
import {WeatherService} from '../weather/weather.service';
import {CurrentConditions} from '../common/types/current-conditions.type';
import {LocationByKey} from '../common/types/location-by-key.type';
import {LOCALE_NAMES, UserLocale} from "../common/enums/locale.enum";
import {LOCALES_REGEXP} from "../common/regexps/locales.regexp";

@Update()
export class TelegramUpdate {
    constructor(
        private readonly userService: UserService,
        private readonly weatherService: WeatherService,
    ) {
    }

    private async getCurrentConditionsMessage(userId: number) {
        const user = await this.userService.findOrSave(userId);
        const conditions: CurrentConditions = await this.weatherService.getCurrentConditions(user.locationKey, user.locale);
        const location: LocationByKey = await this.weatherService.getLocationByKey(user.locationKey);

        return (
            `${await this.getEmojiByDayTime(conditions.IsDayTime)} Right now in <b>${location.LocalizedName}, ${location.Country.LocalizedName}</b>\n\n` +
            `☀️ Weather: <b>${conditions.WeatherText}</b>\n` +
            `🌡️ Temperature: <b>${conditions.Temperature.Metric.Value} °${conditions.Temperature.Metric.Unit}</b>\n` +
            `☔ Precipations: <b>${conditions.HasPrecipitation ? 'Yes' : 'No'}.</b>`
        );
    }

    private async getEmojiByDayTime(isDayTime: boolean) { return isDayTime ? '🏙️' : '🌆'; }

    private async countryCodeToFlag(code: string) {
        return code
            .toUpperCase()
            .replace(/./g, char =>
                String.fromCodePoint(127397 + char.charCodeAt(0))
            );
    }

    private async reloadCurrentConditionsMessage(ctx: Context) {
        const msg = await this.getCurrentConditionsMessage(ctx.from!.id);
        await ctx.editMessageText(msg, {
            parse_mode: 'HTML',
            ...Markup.inlineKeyboard([
                [Markup.button.callback('🔄 Reload', 'reload')],
                [Markup.button.callback('👤 Back to profile', 'profile')]
            ])
        });
    }

    @Start()
    async onStart(@Ctx() ctx: Context) {
        const user = await this.userService.findOrSave(ctx.from!.id);
        const location = await this.weatherService.getLocationByKey(user.locationKey);
        const conditions: CurrentConditions = await this.weatherService.getCurrentConditions(user.locationKey, user.locale);
        const msg =
            `👋 <b>Hello there, ${ctx.from!.first_name}!</b>\n\n` +
            `<blockquote>🫂 Your FrateProfile</blockquote>` +
            `FrateID: <b>№ <code>${user.id}</code></b>\n` +
            `Language: <b>${LOCALE_NAMES[user.locale] ?? "Unknown language"}</b>\n` +
            `Currently picked location: ${await this.countryCodeToFlag(location.Country.ID)} <b>${location.LocalizedName}, ${location.Country.LocalizedName}</b>`;

        await ctx.reply(msg,
            {
                parse_mode: 'HTML',
                ...Markup.inlineKeyboard([
                    [
                        Markup.button.callback(`${await this.countryCodeToFlag(user.locale.slice(-2))} Change language`, 'changeLanguage'),
                        Markup.button.callback('📍 Change location', 'changeLocation')
                    ],
                    [
                        Markup.button.callback(`${await this.getEmojiByDayTime(conditions.IsDayTime)} Currently in ${location.LocalizedName}`, 'current')
                    ]
                ])
            }
        );
    }

    @Action('current')
    async onCurrent(@Ctx() ctx: Context) {
        await this.reloadCurrentConditionsMessage(ctx);
    }

    @Action('reload')
    async onReload(ctx: Context) {
        await ctx.answerCbQuery();
        try { await this.reloadCurrentConditionsMessage(ctx); }
        catch (e) { await ctx.answerCbQuery('Up-to-date!'); }
    }

    @Action('profile')
    async onProfile(@Ctx() ctx: Context) {
        await ctx.deleteMessage();
        await this.onStart(ctx);
    }

    @Action('changeLanguage')
    async onChangeLanguage(@Ctx() ctx: Context) {
        await ctx.editMessageText("Pick a new language:", {
            reply_markup: {
                inline_keyboard: Object.entries(LOCALE_NAMES).map(([key, value]) => [Markup.button.callback(value, key)])
            }
        });
    }

    @Action(LOCALES_REGEXP)
    async onLanguageSelect(@Ctx() ctx: Context) {
        if ('data' in ctx.callbackQuery!) {
            const user = await this.userService.findOrSave(ctx.from!.id);
            const locale: UserLocale = ctx.callbackQuery.data as UserLocale;

            await this.userService.saveSettings(user.userId, {locale});
            await ctx.answerCbQuery();
            await ctx.deleteMessage();
            await this.onStart(ctx);
        }
    }


    @Action('changeLocation')
    async onChangeLocation(@Ctx() ctx: Context) {
        await this.userService.setWaitingFor(
            ctx.from!.id,
            'location'
        );
        const user = await this.userService.findOrSave(ctx.from!.id);
        const location = await this.weatherService.getLocationByKey(user.locationKey);

        await ctx.answerCbQuery();
        await ctx.editMessageText(
            `Currently located in ${await this.countryCodeToFlag(location.Country.ID)} <b>${location.LocalizedName}, ${location.Country.LocalizedName}</b>.\n` +
            `What's the new location you want to set?`,
            { parse_mode: 'HTML' }
        );
    }

    @On('text')
    async onText(@Ctx() ctx: Context) {
        const user = await this.userService.findOrSave(ctx.from!.id);

        if (user.waitingFor === 'location') {
            try {
                const city = ctx.text ?? "";
                const locationKey = await this.weatherService.getLocationKey(city);
                await this.userService.saveSettings(user.userId, {locationKey: +locationKey});
                await this.userService.setWaitingFor(user.userId, null);
                await ctx.deleteMessage();
            } catch (e) {
                await ctx.reply('Sadly, we don\'t have this location. Try again, please.');
            }
            await this.onStart(ctx);
        }
    }
}
