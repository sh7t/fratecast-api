export declare enum UserLocale {
  en = 'en-us',
  uk = 'uk-ua',
  ru = 'ru-ua',
}
export declare class User {
  id: number;
  userId: number;
  locationKey: number;
  locale: UserLocale;
  createdAt: Date;
  updatedAt: Date;
}
