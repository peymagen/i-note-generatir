import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./reducers/authReducers"; 
import { pageApi } from "./services/page.api";
import { userApi } from "./services/user.api";
import {itemDetail} from './services/item-details';
import {poDetailApi} from './services/po-details';
import {poHeaderApi} from './services/po-header';
import {vendorDetail} from './services/vendor-detail';
import {moDetailApi} from './services/mo-detail';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [pageApi.reducerPath]: pageApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [itemDetail.reducerPath]: itemDetail.reducer,
    [poDetailApi.reducerPath]: poDetailApi.reducer,
    [poHeaderApi.reducerPath]:poHeaderApi.reducer,
    [vendorDetail.reducerPath]:vendorDetail.reducer,
    [moDetailApi.reducerPath]:moDetailApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false,immutableCheck: false,  })
      .concat(
        pageApi.middleware,
        userApi.middleware,
        itemDetail.middleware,
        poDetailApi.middleware,
        poHeaderApi.middleware,
        vendorDetail.middleware,
        moDetailApi.middleware,
      ),
});

// For Type-safe dispatching in React
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
