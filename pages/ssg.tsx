import type { GetStaticProps, NextPage } from "next";
import { connect } from "react-redux";
import { TrafficType } from "../shared/split";
import { synchronizeSplitIOServerClientToRedux } from "../shared/split-build";
import { AppState, Feature, wrapper } from "../shared/store";
import { withDefaultStaticProps } from "../shared/with-default-static-props";
import styles from "../styles/Home.module.css";

const SSG: NextPage<AppState> = ({ featureFlags }) => {
  const color = featureFlags[Feature.Color];
  const other = featureFlags[Feature.Other];
  const now = new Date().toISOString();

  return (
    <h1 className={styles.title}>
      {color} {other} {now}
    </h1>
  );
};

export const getStaticProps: GetStaticProps = withDefaultStaticProps();

export default connect((state: AppState) => state)(SSG);
