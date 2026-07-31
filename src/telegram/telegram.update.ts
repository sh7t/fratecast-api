import {Action, Command, Ctx, On, Start, Update} from 'nestjs-telegraf';
import {Context, Markup} from 'telegraf';
import {UserService} from '../user/user.service';
import {WeatherService} from '../weather/weather.service';
import {CurrentConditions} from '../common/types/current-conditions.type';
import {LocationByKey} from '../common/types/location-by-key.type';
import {LOCALE_NAMES, UserLocale} from "../common/enums/locale.enum";
import {LOCALES_REGEXP} from "../common/regexps/locales.regexp";
import {getLocalized} from "../locales";

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
        const localization = getLocalized(user.locale);

        return (
            `${await this.getEmojiByDayTime(conditions.IsDayTime)} ${localization.currentlyInLocation} <b>${location.LocalizedName}, ${location.Country.LocalizedName}</b>\n\n` +
            `☀️ ${localization.weather}: <b>${conditions.WeatherText}</b>\n` +
            `🌡️ ${localization.temperature}: <b>${conditions.Temperature.Metric.Value} °${conditions.Temperature.Metric.Unit}</b>\n` +
            `☔ ${localization.precipitation}: <b>${conditions.HasPrecipitation ? localization.yes : localization.no}.</b>`
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
        const user = await this.userService.findOrSave(ctx.from!.id);
        const msg = await this.getCurrentConditionsMessage(user.userId);
        const localization = getLocalized(user.locale);
        await ctx.editMessageText(msg, {
            parse_mode: 'HTML',
            ...Markup.inlineKeyboard([
                [Markup.button.callback(`🔄 ${localization.reload}`, 'reload')],
                [Markup.button.callback(`👤 ${localization.backToProfile}`, 'profile')]
            ])
        });
    }

    @Start()
    async onStart(@Ctx() ctx: Context) {
        const user = await this.userService.findOrSave(ctx.from!.id);
        const location = await this.weatherService.getLocationByKey(user.locationKey);
        const conditions: CurrentConditions = await this.weatherService.getCurrentConditions(user.locationKey, user.locale);
        const localization = getLocalized(user.locale);
        const msg =
            `👋 <b>${localization.greeting}, ${ctx.from!.first_name}!</b>\n\n` +
            `<blockquote>🫂 ${localization.your} FrateProfile</blockquote>` +
            `FrateID: <b>№ <code>${user.id}</code></b>\n` +
            `${localization.language}: <b>${LOCALE_NAMES[user.locale] ?? "Unknown language"}</b>\n` +
            `${localization.currentLocation}: ${await this.countryCodeToFlag(location.Country.ID)} <b>${location.LocalizedName}, ${location.Country.LocalizedName}</b>`;

        await ctx.reply(msg,
            {
                parse_mode: 'HTML',
                ...Markup.inlineKeyboard([
                    [
                        Markup.button.callback(`${await this.countryCodeToFlag(user.locale.slice(-2))} ${localization.changeLanguage}`, 'changeLanguage'),
                        Markup.button.callback(`📍 ${localization.changeLocation}`, 'changeLocation')
                    ],
                    [
                        Markup.button.callback(`${await this.getEmojiByDayTime(conditions.IsDayTime)} ${localization.currentlyInLocation} ${location.LocalizedName}`, 'current')
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
        const user = await this.userService.findOrSave(ctx.from!.id);
        const localization = getLocalized(user.locale);

        await ctx.editMessageText(
            `${localization.currentLanguage} - <b>${LOCALE_NAMES[user.locale] ?? "Unknown language"}</b>\n` +
            `${localization.pickNewOne}`,
            {
            reply_markup: {
                inline_keyboard: Object.entries(LOCALE_NAMES).map(([key, value]) => [Markup.button.callback(value, key)])
            },
            parse_mode: 'HTML'
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
        const localization = getLocalized(user.locale);

        await ctx.answerCbQuery();
        await ctx.editMessageText(
            `${localization.currentLocation} - ${await this.countryCodeToFlag(location.Country.ID)} <b>${location.LocalizedName}, ${location.Country.LocalizedName}</b>.\n` +
            `${localization.whichNewLocation}?`,
            { parse_mode: 'HTML' }
        );
    }

    @On('text')
    async onText(@Ctx() ctx: Context) {
        const user = await this.userService.findOrSave(ctx.from!.id);
        const localization = getLocalized(user.locale);

        if (user.waitingFor === 'location') {
            try {
                const city = ctx.text ?? "";
                const locationKey = await this.weatherService.getLocationKey(city);
                await this.userService.saveSettings(user.userId, {locationKey: +locationKey});
                await this.userService.setWaitingFor(user.userId, null);
                await ctx.deleteMessage();
            } catch (e) {
                await ctx.reply(`${localization.noLocation}. ${localization.tryAgain}.`);
            }
            await this.onStart(ctx);
        }
    }
}
