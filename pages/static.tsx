import type { NextPage } from "next";
import { connect } from "react-redux";
import { AppState } from "../shared/store";
import styles from "../styles/Home.module.css";

const Static: NextPage<AppState> = ({ featureFlags }) => {
  const treatment = featureFlags.color;

  return <h1 className={styles.title}>{treatment}</h1>;
};

export default connect((state: AppState) => state)(Static);
