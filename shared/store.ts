import {
  configureStore,
  createSlice,
  PayloadAction,
  ThunkAction,
} from "@reduxjs/toolkit";
import { Action } from "redux";
import { createWrapper, HYDRATE } from "next-redux-wrapper";

export enum Feature {
  Color = "MY_FLAG",
  Other = "MY_DIFFERENT_FLAG",
}

export type Features = {
  [Feature.Color]?: "blue" | "red";
  [Feature.Other]?: "off" | "on";
};

export const featureFlagsSlice = createSlice({
  extraReducers: {
    [HYDRATE]: (state, action) => {
      return {
        ...action.payload.featureFlags,
        ...state,
      };
    },
  },
  initialState: {} as Features,
  name: "featureFlags",
  reducers: {
    setFeatureFlag<F extends Feature>(
      state: Features,
      action: PayloadAction<{ name: F; value: Features[F] }>
    ) {
      return {
        ...state,
        [action.payload.name]: action.payload.value,
      };
    },
  },
});

const makeStore = () =>
  configureStore({
    reducer: {
      [featureFlagsSlice.name]: featureFlagsSlice.reducer,
    },
    devTools: true,
  });

export type AppStore = ReturnType<typeof makeStore>;
export type AppState = ReturnType<AppStore["getState"]>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  AppState,
  unknown,
  Action
>;

export const wrapper = createWrapper<AppStore>(makeStore);
