import type { GetServerSideProps, NextPage } from "next";
import { connect } from "react-redux";
import { AppState, wrapper } from "../shared/store";
import styles from "../styles/Home.module.css";

const SSR: NextPage<AppState> = ({ featureFlags }) => {
  const treatment = featureFlags.color;

  return <h1 className={styles.title}>{treatment}</h1>;
};

export const getServerSideProps: GetServerSideProps =
  wrapper.getServerSideProps((store) => async () => {
    return {
      props: {},
    };
  });

export default connect((state: AppState) => state)(SSR);
