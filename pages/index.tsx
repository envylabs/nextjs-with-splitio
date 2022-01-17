import type { NextPage } from "next";
import { connect } from "react-redux";
import { AppState, Feature } from "../shared/store";
import styles from "../styles/Home.module.css";

const Home: NextPage<AppState> = ({ featureFlags }) => {
  const treatment = featureFlags[Feature.Color];

  return <h1 className={styles.title}>{treatment}</h1>;
};

export default connect((state: AppState) => state)(Home);
