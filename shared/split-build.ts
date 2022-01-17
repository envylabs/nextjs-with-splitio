import fs from "fs";
import path from "path";

import { AnyAction, Dispatch } from "@reduxjs/toolkit";
import {
  createClient,
  GetTreatment,
  IServerClientConfig,
  isLocalhost,
  synchronizeSplitIOAndRedux,
} from "./split";

const SET_FEATURE_FLAG_CACHE_PATH = path.resolve(".set-feature-flag");

function readSetFeatureFlagActionCache(): AnyAction[] {
  try {
    return JSON.parse(
      fs.readFileSync(SET_FEATURE_FLAG_CACHE_PATH, { encoding: "utf8" })
    );
  } catch (error) {
    // cache does not exist or is malformed. ignore it.
  }

  return [];
}

function storeSetFeatureFlagActionCache(actions: AnyAction[]): void {
  try {
    fs.writeFileSync(SET_FEATURE_FLAG_CACHE_PATH, JSON.stringify(actions), {
      encoding: "utf8",
    });
  } catch (error) {
    console.log("Failed to write setFeatureFlag action cache file");
  }
}

export async function synchronizeSplitIOServerClientToRedux(
  config: IServerClientConfig,
  dispatch: Dispatch
): Promise<void> {
  const setFeatureFlagActions = readSetFeatureFlagActionCache();

  if (setFeatureFlagActions.length > 0) {
    setFeatureFlagActions.forEach(dispatch);
    return;
  }

  const client = createClient(config);
  const getTreatment: GetTreatment = (name) => {
    return client.getTreatment(config.trafficType, name) as any;
  };
  const handleUpdate = () => {
    synchronizeSplitIOAndRedux({
      config,
      dispatch: <A extends AnyAction>(action: A): A => {
        setFeatureFlagActions.push(action);
        return action;
      },
      getTreatment,
    });
  };

  if (!isLocalhost()) {
    await client.ready();
  }

  handleUpdate();

  storeSetFeatureFlagActionCache(setFeatureFlagActions);

  setFeatureFlagActions.forEach(dispatch);

  await client.destroy();
}
