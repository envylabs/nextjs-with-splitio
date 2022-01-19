import type { GetStaticProps, NextPage } from "next";
import { connect } from "react-redux";
import { TrafficType } from "../shared/split";
import { synchronizeSplitIOServerClientToRedux } from "../shared/split-build";
import { AppState, Feature, wrapper } from "../shared/store";
import styles from "../styles/Home.module.css";

const SSG: NextPage<AppState> = ({ featureFlags }) => {
  const color = featureFlags[Feature.Color];
  const other = featureFlags[Feature.Other];

  return (
    <h1 className={styles.title}>
      {color} {other}
    </h1>
  );
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
