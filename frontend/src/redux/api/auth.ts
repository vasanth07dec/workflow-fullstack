import { api } from ".";
import type { LoginPayload, UserResponse } from "../../types/user";

const auth = api.injectEndpoints({
    endpoints: (build) => ({
        /**
         * login api
         */
        login: build.mutation<UserResponse, LoginPayload>({
            query: (data) => ({
                url: `login`,
                method: 'POST',
                body: data,
            }),
        }),
        /**
         * logout api
         */
        logout: build.mutation({
            query: () => ({
                url: `logout`,
                method: 'POST',
            }),
        }),
        /**
         * get current user info
         */
        getMe: build.query({
            query: () => `me`,
        }),
    })
})

export const { useLoginMutation, useLogoutMutation, useGetMeQuery } = auth