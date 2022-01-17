import { configureStore, createSlice, ThunkAction } from "@reduxjs/toolkit";
import { Action } from "redux";
import { createWrapper, HYDRATE } from "next-redux-wrapper";

interface Features {
  color?: "blue" | "red";
}

export const featureFlagsSlice = createSlice({
  extraReducers: {
    [HYDRATE]: (state, action) => {
      console.log("HYDRATE", state, action.payload);
      return {
        ...state,
        ...action.payload.subject,
      };
    },
  },
  initialState: { color: "blue" } as Features,
  name: "featureFlags",
  reducers: {
    setColor(state, action) {
      return {
        ...action.payload,
        ...state,
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
