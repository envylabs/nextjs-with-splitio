import { Action, Dispatch } from "@reduxjs/toolkit";
import { SplitFactory } from "@splitsoftware/splitio";
import SplitIO from "@splitsoftware/splitio/types/splitio";
import { Features, Feature, featureFlagsSlice } from "./store";

export enum TrafficType {
  User = "user",
}

interface IBrowserClient {
  key: string;
  trafficType: TrafficType;
}

type SplitIOClient = SplitIO.IClient | SplitIO.IBrowserClient;

const clients: Record<string, SplitIOClient> = {};

function clientKey({ key, trafficType }: IBrowserClient): string {
  return `${trafficType}/${key}`;
}

function getClient(config: IBrowserClient): SplitIOClient | undefined {
  return clients[clientKey(config)];
}

function createClient(config: IBrowserClient): SplitIOClient {
  const factory = SplitFactory({
    core: {
      authorizationKey: process.env.NEXT_PUBLIC_SPLIT_IO_API_KEY || "localhost",
      key: config.key,
      trafficType: config.trafficType,
    },
  });
  const client = factory.client();

  clients[clientKey(config)] = client;

  return client;
}

type GetTreatment = <F extends Feature>(name: F) => Features[F];

function synchronizeSplitIOAndRedux({
  config,
  dispatch,
  getTreatment,
}: {
  config: IBrowserClient;
  dispatch: Dispatch;
  getTreatment: GetTreatment;
}): void {
  if (config.trafficType === TrafficType.User) {
    dispatch(
      featureFlagsSlice.actions.setFeatureFlag({
        name: Feature.Color,
        value: getTreatment(Feature.Color),
      })
    );
  }
}

export function addSplitIOBrowserClient(
  config: IBrowserClient,
  dispatch: Dispatch
): void {
  if (getClient(config)) {
    return;
  }

  const client = createClient(config);
  const getTreatment: GetTreatment = (name) => {
    return client.getTreatment(name) as any;
  };

  const handleUpdate = () => {
    synchronizeSplitIOAndRedux({ config, dispatch, getTreatment });
  };

  client.on(client.Event.SDK_READY, handleUpdate);
  client.on(client.Event.SDK_UPDATE, handleUpdate);
}
