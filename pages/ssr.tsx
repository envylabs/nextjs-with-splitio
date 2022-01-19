import type { GetServerSideProps, NextPage } from "next";
import { connect } from "react-redux";
import { addSplitIOServerClient, TrafficType } from "../shared/split";
import { AppState, Feature, wrapper } from "../shared/store";
import styles from "../styles/Home.module.css";

const SSR: NextPage<AppState> = ({ featureFlags }) => {
  const color = featureFlags[Feature.Color];
  const other = featureFlags[Feature.Other];

  return (
    <h1 className={styles.title}>
      {color} {other}
    </h1>
  );
};

export const getServerSideProps: GetServerSideProps =
  wrapper.getServerSideProps((store) => async () => {
    await addSplitIOServerClient({}, store.dispatch);

    return {
      props: {},
    };
  });

export default connect((state: AppState) => state)(SSR);
