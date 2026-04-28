import { createSlice, PayloadAction } from "@reduxjs/toolkit";


interface UserState {
    info: {
        name: string | undefined,
        id: string | undefined,
        email: string | undefined,
        image: string | undefined,
    } | null | undefined;
    isAuthenticated: boolean;
}

const initialState: UserState = {
    info: null,
    isAuthenticated: false
}

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<UserState['info']>) => {
            state.info = action.payload;
            state.isAuthenticated = !!action.payload;
        },
        logoutUser: (state) => {
            state.info = null;
            state.isAuthenticated = false;
        }
    }
})

export const { setUser, logoutUser } = userSlice.actions;
export default userSlice.reducer;