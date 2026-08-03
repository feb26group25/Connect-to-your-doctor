import { configureStore } from "@reduxjs/toolkit";  //configureStore is function
import authReducer from "./authSlice";

export const store = configureStore({  
    reducer: {
        auth: authReducer, // auth is used in authonthication component for vaild user login and protection
    },
});