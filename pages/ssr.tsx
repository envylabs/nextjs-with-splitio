import type { NextPage } from "next";
import { connect } from "react-redux";
import { AppState, Feature } from "../shared/store";
import { withDefaultServerSideProps } from "../shared/with-default-server-side-props";
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

export const getServerSideProps = withDefaultServerSideProps();

export default connect((state: AppState) => state)(SSR);
