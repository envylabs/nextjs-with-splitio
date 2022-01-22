import fsPromises from "fs/promises";
import path from "path";

import { AnyAction, Dispatch } from "@reduxjs/toolkit";
import {
  createClient,
  GetTreatment,
  IServerClientConfig,
  isLocalhost,
  SERVER_KEY,
  synchronizeSplitIOAndRedux,
} from "./split";
import { REVALIDATION_INTERVAL_SECONDS } from "./with-default-static-props";

interface Cache {
  revalidateAfter: Date;
  actions: AnyAction[];
}

const SET_FEATURE_FLAG_CACHE_PATH = path.resolve(".set-feature-flag");

function isValidCache(cache: Cache): boolean {
  return new Date() < cache.revalidateAfter;
}

function revalidateAfter(): Date {
  const now = new Date();
  now.setSeconds(now.getSeconds() + REVALIDATION_INTERVAL_SECONDS - 30);
  return now;
}

async function readSetFeatureFlagActionCache(): Promise<AnyAction[]> {
  try {
    const encodedCache = await fsPromises.readFile(
      SET_FEATURE_FLAG_CACHE_PATH,
      {
        encoding: "utf8",
      }
    );
    const cache: Cache = JSON.parse(encodedCache);
    if (isValidCache(cache)) {
      return cache.actions;
    }
  } catch (error) {
    // cache does not exist or is malformed. ignore it.
  }

  return [];
}

async function storeSetFeatureFlagActionCache(
  actions: AnyAction[]
): Promise<void> {
  try {
    const cache: Cache = { actions, revalidateAfter: revalidateAfter() };
    const encodedCache = JSON.stringify(cache);

    await fsPromises.writeFile(SET_FEATURE_FLAG_CACHE_PATH, encodedCache, {
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
  const setFeatureFlagActions = await readSetFeatureFlagActionCache();

  if (setFeatureFlagActions.length > 0) {
    setFeatureFlagActions.forEach(dispatch);
    return;
  }

  const client = createClient(config);
  const getTreatment: GetTreatment = (name) => {
    return client.getTreatment(config.key || SERVER_KEY, name) as any;
  };

  if (!isLocalhost()) {
    await client.ready();
  }

  synchronizeSplitIOAndRedux({
    config,
    dispatch: <A extends AnyAction>(action: A): A => {
      setFeatureFlagActions.push(action);
      return action;
    },
    getTreatment,
  });

  await storeSetFeatureFlagActionCache(setFeatureFlagActions);

  setFeatureFlagActions.forEach(dispatch);

  await client.destroy();
}
