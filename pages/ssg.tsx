import type { GetStaticProps, NextPage } from "next";
import { connect } from "react-redux";
import { TrafficType } from "../shared/split";
import { synchronizeSplitIOServerClientToRedux } from "../shared/split-build";
import { AppState, Feature, wrapper } from "../shared/store";
import styles from "../styles/Home.module.css";

const SSG: NextPage<AppState> = ({ featureFlags }) => {
  const treatment = featureFlags[Feature.Color];

  return <h1 className={styles.title}>{treatment}</h1>;
};

export const getStaticProps: GetStaticProps = wrapper.getStaticProps(
  (store) => async () => {
    await synchronizeSplitIOServerClientToRedux({}, store.dispatch);

    return {
      props: {},
    };
  }
);

export default connect((state: AppState) => state)(SSG);
