import type { NextPage } from "next";
import styles from "../styles/Home.module.css";

const Home: NextPage = () => {
  const treatment = "blue";

  return <h1 className={styles.title}>{treatment}</h1>;
};

export default Home;
