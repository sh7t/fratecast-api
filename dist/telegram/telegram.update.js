"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramUpdate = void 0;
const nestjs_telegraf_1 = require("nestjs-telegraf");
const telegraf_1 = require("telegraf");
const user_service_1 = require("../user/user.service");
const weather_service_1 = require("../weather/weather.service");
const locale_enum_1 = require("../common/enums/locale.enum");
const locales_regexp_1 = require("../common/regexps/locales.regexp");
const locales_1 = require("../locales");
let TelegramUpdate = class TelegramUpdate {
    userService;
    weatherService;
    constructor(userService, weatherService) {
        this.userService = userService;
        this.weatherService = weatherService;
    }
    async getCurrentConditionsMessage(userId) {
        const user = await this.userService.findOrSave(userId);
        const conditions = await this.weatherService.getCurrentConditions(user.locationKey, user.locale);
        const location = await this.weatherService.getLocationByKey(user.locationKey);
        const localization = (0, locales_1.getLocalized)(user.locale);
        return (`${await this.getEmojiByDayTime(conditions.IsDayTime)} ${localization.currentlyInLocation} <b>${location.LocalizedName}, ${location.Country.LocalizedName}</b>\n\n` +
            `☀️ ${localization.weather}: <b>${conditions.WeatherText}</b>\n` +
            `🌡️ ${localization.temperature}: <b>${conditions.Temperature.Metric.Value} °${conditions.Temperature.Metric.Unit}</b>\n` +
            `☔ ${localization.precipitation}: <b>${conditions.HasPrecipitation ? localization.yes : localization.no}.</b>`);
    }
    async getEmojiByDayTime(isDayTime) { return isDayTime ? '🏙️' : '🌆'; }
    async countryCodeToFlag(code) {
        return code
            .toUpperCase()
            .replace(/./g, char => String.fromCodePoint(127397 + char.charCodeAt(0)));
    }
    async reloadCurrentConditionsMessage(ctx) {
        const user = await this.userService.findOrSave(ctx.from.id);
        const msg = await this.getCurrentConditionsMessage(user.userId);
        const localization = (0, locales_1.getLocalized)(user.locale);
        await ctx.editMessageText(msg, {
            parse_mode: 'HTML',
            ...telegraf_1.Markup.inlineKeyboard([
                [telegraf_1.Markup.button.callback(`🔄 ${localization.reload}`, 'reload')],
                [telegraf_1.Markup.button.callback(`👤 ${localization.backToProfile}`, 'profile')]
            ])
        });
    }
    async onStart(ctx) {
        const user = await this.userService.findOrSave(ctx.from.id);
        const location = await this.weatherService.getLocationByKey(user.locationKey);
        const conditions = await this.weatherService.getCurrentConditions(user.locationKey, user.locale);
        const localization = (0, locales_1.getLocalized)(user.locale);
        const msg = `👋 <b>${localization.greeting}, ${ctx.from.first_name}!</b>\n\n` +
            `<blockquote>🫂 ${localization.your} FrateProfile</blockquote>` +
            `FrateID: <b>№ <code>${user.id}</code></b>\n` +
            `${localization.language}: <b>${locale_enum_1.LOCALE_NAMES[user.locale] ?? "Unknown language"}</b>\n` +
            `${localization.currentLocation}: ${await this.countryCodeToFlag(location.Country.ID)} <b>${location.LocalizedName}, ${location.Country.LocalizedName}</b>`;
        await ctx.reply(msg, {
            parse_mode: 'HTML',
            ...telegraf_1.Markup.inlineKeyboard([
                [
                    telegraf_1.Markup.button.callback(`${await this.countryCodeToFlag(user.locale.slice(-2))} ${localization.changeLanguage}`, 'changeLanguage'),
                    telegraf_1.Markup.button.callback(`📍 ${localization.changeLocation}`, 'changeLocation')
                ],
                [
                    telegraf_1.Markup.button.callback(`${await this.getEmojiByDayTime(conditions.IsDayTime)} ${localization.currentlyInLocation} ${location.LocalizedName}`, 'current')
                ]
            ])
        });
    }
    async onCurrent(ctx) {
        await this.reloadCurrentConditionsMessage(ctx);
    }
    async onReload(ctx) {
        await ctx.answerCbQuery();
        try {
            await this.reloadCurrentConditionsMessage(ctx);
        }
        catch (e) {
            await ctx.answerCbQuery('Up-to-date!');
        }
    }
    async onProfile(ctx) {
        await ctx.deleteMessage();
        await this.onStart(ctx);
    }
    async onChangeLanguage(ctx) {
        const user = await this.userService.findOrSave(ctx.from.id);
        const localization = (0, locales_1.getLocalized)(user.locale);
        await ctx.editMessageText(`${localization.currentLanguage} - <b>${locale_enum_1.LOCALE_NAMES[user.locale] ?? "Unknown language"}</b>\n` +
            `${localization.pickNewOne}`, {
            reply_markup: {
                inline_keyboard: Object.entries(locale_enum_1.LOCALE_NAMES).map(([key, value]) => [telegraf_1.Markup.button.callback(value, key)])
            },
            parse_mode: 'HTML'
        });
    }
    async onLanguageSelect(ctx) {
        if ('data' in ctx.callbackQuery) {
            const user = await this.userService.findOrSave(ctx.from.id);
            const locale = ctx.callbackQuery.data;
            await this.userService.saveSettings(user.userId, { locale });
            await ctx.answerCbQuery();
            await ctx.deleteMessage();
            await this.onStart(ctx);
        }
    }
    async onChangeLocation(ctx) {
        await this.userService.setWaitingFor(ctx.from.id, 'location');
        const user = await this.userService.findOrSave(ctx.from.id);
        const location = await this.weatherService.getLocationByKey(user.locationKey);
        const localization = (0, locales_1.getLocalized)(user.locale);
        await ctx.answerCbQuery();
        await ctx.editMessageText(`${localization.currentLocation} - ${await this.countryCodeToFlag(location.Country.ID)} <b>${location.LocalizedName}, ${location.Country.LocalizedName}</b>.\n` +
            `${localization.whichNewLocation}?`, { parse_mode: 'HTML' });
    }
    async onText(ctx) {
        const user = await this.userService.findOrSave(ctx.from.id);
        const localization = (0, locales_1.getLocalized)(user.locale);
        if (user.waitingFor === 'location') {
            try {
                const city = ctx.text ?? "";
                const locationKey = await this.weatherService.getLocationKey(city);
                await this.userService.saveSettings(user.userId, { locationKey: +locationKey });
                await this.userService.setWaitingFor(user.userId, null);
                await ctx.deleteMessage();
            }
            catch (e) {
                await ctx.reply(`${localization.noLocation}. ${localization.tryAgain}.`);
            }
            await this.onStart(ctx);
        }
    }
};
exports.TelegramUpdate = TelegramUpdate;
__decorate([
    (0, nestjs_telegraf_1.Start)(),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], TelegramUpdate.prototype, "onStart", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('current'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], TelegramUpdate.prototype, "onCurrent", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('reload'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], TelegramUpdate.prototype, "onReload", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('profile'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], TelegramUpdate.prototype, "onProfile", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('changeLanguage'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], TelegramUpdate.prototype, "onChangeLanguage", null);
__decorate([
    (0, nestjs_telegraf_1.Action)(locales_regexp_1.LOCALES_REGEXP),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], TelegramUpdate.prototype, "onLanguageSelect", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('changeLocation'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], TelegramUpdate.prototype, "onChangeLocation", null);
__decorate([
    (0, nestjs_telegraf_1.On)('text'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], TelegramUpdate.prototype, "onText", null);
exports.TelegramUpdate = TelegramUpdate = __decorate([
    (0, nestjs_telegraf_1.Update)(),
    __metadata("design:paramtypes", [user_service_1.UserService,
        weather_service_1.WeatherService])
], TelegramUpdate);
//# sourceMappingURL=telegram.update.js.map