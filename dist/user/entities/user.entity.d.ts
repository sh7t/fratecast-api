import { UserLocale } from "../../common/enums/locale.enum";
export declare class User {
    id: number;
    userId: number;
    locationKey: number;
    locale: UserLocale;
    waitingFor: string | null;
    createdAt: Date;
    updatedAt: Date;
}
