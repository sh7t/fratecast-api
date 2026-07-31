"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LOCALES_REGEXP = void 0;
const locale_enum_1 = require("../enums/locale.enum");
exports.LOCALES_REGEXP = new RegExp(`^(${Object.values(locale_enum_1.UserLocale).join('|')})$`);
//# sourceMappingURL=locales.regexp.js.map