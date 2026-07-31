export enum UserLocale {
    EN = 'en-us',
    ES = 'es-es',
    UK = 'uk-ua',
}

export const LOCALE_NAMES: Record<UserLocale, string> = {
    [UserLocale.EN]: '🇬🇧 English',
    [UserLocale.UK]: '🇺🇦 Українська',
    [UserLocale.ES]: '🇪🇸 Español'
};