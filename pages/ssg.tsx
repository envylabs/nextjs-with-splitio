import type { GetStaticProps, NextPage } from "next";
import { connect } from "react-redux";
import { AppState, Feature } from "../shared/store";
import { withDefaultStaticProps } from "../shared/with-default-static-props";
import styles from "../styles/Home.module.css";

const SSG: NextPage<AppState> = ({ featureFlags }) => {
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

export const getStaticProps: GetStaticProps = withDefaultStaticProps();

export default connect((state: AppState) => state)(SSG);
