export interface QueryParams {
    page?: number;
    pageSize?: number;
}

export interface PlaceCategoryParams extends QueryParams {
    group?: 'cities' | 'interests' | 'messages';
}