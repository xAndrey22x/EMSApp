import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { userApiSlice } from "./api/slices/UserApiSlice";
import { deviceApiSlice } from "./api/slices/DeviceApiSlice";

export const store = configureStore({
    reducer: combineReducers({
      [userApiSlice.reducerPath]: userApiSlice.reducer,
      [deviceApiSlice.reducerPath]: deviceApiSlice.reducer,
    }),
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false }).concat(
        userApiSlice.middleware,
        deviceApiSlice.middleware,
      )
  });
  
  export type RootState = ReturnType<typeof store.getState>;
  export type AppDispatch = typeof store.dispatch;
  