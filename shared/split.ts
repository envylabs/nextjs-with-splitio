import { Action, Dispatch } from "@reduxjs/toolkit";
import { SplitFactory } from "@splitsoftware/splitio";
import SplitIO from "@splitsoftware/splitio/types/splitio";
import { Features, Feature, featureFlagsSlice, wrapper } from "./store";

export enum TrafficType {
  User = "user",
}

interface IServerClientConfig {
  trafficType: TrafficType;
}

interface IBrowserClientConfig extends IServerClientConfig {
  key: string;
}

type IClientConfig = IServerClientConfig | IBrowserClientConfig;

type SplitIOClient = SplitIO.IClient | SplitIO.IBrowserClient;

const clients: Record<string, SplitIOClient> = {};
const LOCALHOST = "localhost";
const authorizationKey = process.env.NEXT_PUBLIC_SPLIT_IO_API_KEY || LOCALHOST;

function isIBrowserClientConfig(config: any): config is IBrowserClientConfig {
  return typeof config.key === "string";
}

function isLocalhost() {
  return authorizationKey === LOCALHOST;
}

function clientKey(config: IClientConfig): string {
  if (isIBrowserClientConfig(config)) {
    return `${config.trafficType}/${config.key}`;
  }

  return config.trafficType;
}

function getClient(config: IClientConfig): SplitIOClient | undefined {
  return clients[clientKey(config)];
}

function storeClient({
  client,
  config,
}: {
  client: SplitIO.IClient;
  config: IClientConfig;
}): void {
  if (getClient(config)) {
    return;
  }

  clients[clientKey(config)] = client;
}

function createClient(config: IClientConfig): SplitIOClient {
  const core = isIBrowserClientConfig(config)
    ? ({
        authorizationKey,
        key: config.key,
        trafficType: config.trafficType,
      } as SplitIO.IBrowserSettings["core"])
    : ({ authorizationKey } as SplitIO.INodeSettings["core"]);

  const factory = SplitFactory({ core, debug: false });
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
  config: IClientConfig;
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
  config: IBrowserClientConfig,
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

  storeClient({ client, config });
}

export async function addSplitIOServerClient(
  config: IServerClientConfig,
  dispatch: Dispatch
): Promise<void> {
  const client = getClient(config) || createClient(config);
  const getTreatment: GetTreatment = (name) => {
    return client.getTreatment(config.trafficType, name) as any;
  };
  const handleUpdate = () => {
    synchronizeSplitIOAndRedux({ config, dispatch, getTreatment });
  };

  client.on(client.Event.SDK_READY, handleUpdate);
  client.on(client.Event.SDK_UPDATE, handleUpdate);

  if (!isLocalhost()) {
    await client.ready();
  }

  // Purposely run after both localhost mode or server client creation. Also run
  // so that subsequent queries on the server-side will reuse the client, but
  // needs to reset the state.
  handleUpdate();

  storeClient({ client, config });
}

export async function synchronizeSplitIOServerClientToRedux(
  config: IServerClientConfig,
  dispatch: Dispatch
): Promise<void> {
  const client = createClient(config);
  const getTreatment: GetTreatment = (name) => {
    return client.getTreatment(config.trafficType, name) as any;
  };
  const handleUpdate = () => {
    synchronizeSplitIOAndRedux({ config, dispatch, getTreatment });
  };

  if (!isLocalhost()) {
    await client.ready();
  }

  handleUpdate();

  await client.destroy();
}
