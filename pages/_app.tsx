import "../styles/globals.css";
import type { AppProps } from "next/app";
import Layout from "../components/layout";
import { wrapper } from "../shared/store";
import { isBrowser } from "../utils/is-browser";
import { addSplitIOBrowserClient, TrafficType } from "../shared/split";
import { useDispatch } from "react-redux";

function MyApp({ Component, pageProps }: AppProps) {
  const dispatch = useDispatch();

  if (isBrowser()) {
    addSplitIOBrowserClient(
      { key: "browser", trafficType: TrafficType.User },
      dispatch
    );
  }

  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}

export default wrapper.withRedux(MyApp);
