export type LocationByKey = {
    Version: number;
    Key: string;
    Type: string;
    Rank: number;
    LocalizedName: string;
    EnglishName: string;
    PrimaryPostalCode: string;
    Region: {
        ID: string;
        LocalizedName: string;
        EnglishName: string;
    };
    Country: {
        ID: string;
        LocalizedName: string;
        EnglishName: string;
    };
    AdministrativeArea: {
        ID: string;
        LocalizedName: string;
        EnglishName: string;
        Level: number;
        LocalizedType: string;
        EnglishType: string;
        CountryID: string;
    };
    TimeZone: {
        Code: string;
        Name: string;
        GmtOffset: number;
        IsDaylightSaving: boolean;
        NextOffsetChange: string;
    };
    GeoPosition: {
        Latitude: number;
        Longitude: number;
        Elevation: {
            Metric: {
                Value: number;
                Unit: string;
                UnitType: number;
            };
            Imperial: {
                Value: number;
                Unit: string;
                UnitType: number;
            };
        };
    };
    IsAlias: boolean;
    SupplementalAdminAreas: any[];
    DataSets: string[];
};
