"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLocalized = getLocalized;
const en_us_1 = require("./en-us");
const uk_ua_1 = require("./uk-ua");
const es_es_1 = require("./es-es");
const locale_enum_1 = require("../common/enums/locale.enum");
function getLocalized(userLocale) {
    switch (userLocale) {
        case locale_enum_1.UserLocale.EN: return en_us_1.en_us;
        case locale_enum_1.UserLocale.UK: return uk_ua_1.uk_ua;
        case locale_enum_1.UserLocale.ES: return es_es_1.es_es;
    }
}
//# sourceMappingURL=index.js.map