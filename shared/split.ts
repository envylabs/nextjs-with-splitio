import { Dispatch } from "@reduxjs/toolkit";
import { SplitFactory } from "@splitsoftware/splitio";
import SplitIO from "@splitsoftware/splitio/types/splitio";
import { Features, Feature, featureFlagsSlice } from "./store";

export enum TrafficType {
  Anonymous = "anonymous",
  User = "user",
}

export interface IServerClientConfig {
  key?: string;
}

interface IBrowserClientConfig {
  key: string;
  trafficType: TrafficType;
}

type IClientConfig = IServerClientConfig | IBrowserClientConfig;

type SplitIOClient = SplitIO.IClient | SplitIO.IBrowserClient;

const clients: Record<string, SplitIOClient> = {};
const LOCALHOST = "localhost";
export const SERVER_KEY = "server";
const AUTHORIZATION_KEY = process.env.NEXT_PUBLIC_SPLIT_IO_API_KEY || LOCALHOST;

function isIBrowserClientConfig(
  config: IClientConfig
): config is IBrowserClientConfig {
  return typeof (config as any).trafficType === "string";
}

function isTrafficTypeUpdated(
  config: IClientConfig,
  trafficType: TrafficType
): boolean {
  return !isIBrowserClientConfig(config) || config.trafficType === trafficType;
}

export function isLocalhost() {
  return AUTHORIZATION_KEY === LOCALHOST;
}

function clientKey(config: IClientConfig): string {
  if (isIBrowserClientConfig(config)) {
    return `${config.trafficType}/${config.key}`;
  }

  return config.key || SERVER_KEY;
}

function getClient(
  config: IBrowserClientConfig
): SplitIO.IBrowserClient | undefined;
function getClient(config: IServerClientConfig): SplitIO.IClient | undefined;
function getClient(config: IClientConfig): SplitIOClient | undefined {
  return clients[clientKey(config)];
}

function storeClient({
  client,
  config,
}: {
  client: SplitIOClient;
  config: IClientConfig;
}): void {
  if (getClient(config)) {
    return;
  }

  clients[clientKey(config)] = client;
}

export function createClient(
  config: IBrowserClientConfig
): SplitIO.IBrowserClient;
export function createClient(config: IServerClientConfig): SplitIO.IClient;
export function createClient(config: IClientConfig): SplitIOClient {
  const core = isIBrowserClientConfig(config)
    ? ({
        authorizationKey: AUTHORIZATION_KEY,
        key: config.key,
        trafficType: config.trafficType,
      } as SplitIO.IBrowserSettings["core"])
    : ({
        authorizationKey: AUTHORIZATION_KEY,
      } as SplitIO.INodeSettings["core"]);

  const factory = SplitFactory({ core, debug: false });

  return factory.client();
}

export type GetTreatment = <F extends Feature>(name: F) => Features[F];

export function synchronizeSplitIOAndRedux({
  config,
  dispatch,
  getTreatment,
}: {
  config: IClientConfig;
  dispatch: Dispatch;
  getTreatment: GetTreatment;
}): void {
  if (isTrafficTypeUpdated(config, TrafficType.User)) {
    dispatch(
      featureFlagsSlice.actions.setFeatureFlag({
        name: Feature.Color,
        value: getTreatment(Feature.Color),
      })
    );
  }
  if (isTrafficTypeUpdated(config, TrafficType.Anonymous)) {
    dispatch(
      featureFlagsSlice.actions.setFeatureFlag({
        name: Feature.Other,
        value: getTreatment(Feature.Other),
      })
    );
  }
}

export function addSplitIOBrowserClient(
  config: IBrowserClientConfig,
  dispatch: Dispatch
): void {
  if (getClient(config)) {
    return;
  }

  const client = createClient(config);

  storeClient({ client, config });

  const getTreatment: GetTreatment = (name) => {
    return client.getTreatment(name) as any;
  };
  const handleUpdate = () => {
    synchronizeSplitIOAndRedux({ config, dispatch, getTreatment });
  };

  client.on(client.Event.SDK_READY, handleUpdate);
  client.on(client.Event.SDK_UPDATE, handleUpdate);
}

function handleUpdate({
  client,
  config,
  dispatch,
}: {
  client: SplitIO.IClient;
  config: IServerClientConfig;
  dispatch: Dispatch;
}): () => void {
  return () => {
    synchronizeSplitIOAndRedux({
      config,
      dispatch,
      getTreatment: (name) => {
        return client.getTreatment(config.key || SERVER_KEY, name) as any;
      },
    });
  };
}

export async function addSplitIOServerClient(
  config: IServerClientConfig,
  dispatch: Dispatch
): Promise<void> {
  let client = getClient(config);

  if (!client) {
    client = createClient(config);
    storeClient({ client, config });
    client.on(
      client.Event.SDK_READY,
      handleUpdate({ client, config, dispatch })
    );
    client.on(
      client.Event.SDK_UPDATE,
      handleUpdate({ client, config, dispatch })
    );
  }

  if (!isLocalhost()) {
    await client.ready();
  }

  // Purposely run after both localhost mode or server client creation. Also run
  // so that subsequent queries on the server-side will reuse the client, but
  // needs to reset the state.
  handleUpdate({ client, config, dispatch })();
}
