import { en_us } from './en-us'
import { uk_ua } from './uk-ua'
import { es_es } from './es-es'
import {UserLocale} from "../common/enums/locale.enum";



export function getLocalized(userLocale: UserLocale) {
    switch (userLocale) {
        case UserLocale.EN: return en_us;
        case UserLocale.UK: return uk_ua;
        case UserLocale.ES: return es_es;
    }
}
