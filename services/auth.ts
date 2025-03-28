import api from "./apiService";
import { parseSnakeToCamel } from "@/utils/parseSnakeToCamel";
export const signIn = async (email: string, password: string) => {
    try {
        const response = await api.post('/v1/accounts/login/', { email, password });
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }

};


export const signUp = async (email: string, password: string) => {
    try {
        const response = await api.post('/v1/accounts/users/', { email, password });
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const profile = async (id: string) => {
    try {
        const response = await api.get(`/v1/accounts/users/${id}/`);
        return parseSnakeToCamel(response.data);
    } catch (error) {
        console.error(error);
        throw error;
    }
};
