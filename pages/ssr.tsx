import type { GetServerSideProps, NextPage } from "next";
import { connect } from "react-redux";
import { AppState, Feature } from "../shared/store";
import { withDefaultServerSideProps } from "../shared/with-default-server-side-props";
import styles from "../styles/Home.module.css";

const SSR: NextPage<AppState> = ({ featureFlags }) => {
  const color = featureFlags[Feature.Color];
  const other = featureFlags[Feature.Other];
  const now = new Date().toISOString();

  return (
    <>
      <h1 className={styles.title}>
        {color} {other}
      </h1>
      <p>{now}</p>
    </>
  );
};

export const getServerSideProps: GetServerSideProps =
  withDefaultServerSideProps();

export default connect((state: AppState) => state)(SSR);
