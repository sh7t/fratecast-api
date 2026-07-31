import {UserLocale} from "../enums/locale.enum";

export const LOCALES_REGEXP = new RegExp(`^(${Object.values(UserLocale).join('|')})$`);