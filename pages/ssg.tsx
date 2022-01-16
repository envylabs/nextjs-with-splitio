import type { GetStaticProps, NextPage } from "next";
import styles from "../styles/Home.module.css";

const SSG: NextPage = () => {
  const treatment = "blue";

  return <h1 className={styles.title}>{treatment}</h1>;
};

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
  };
};

export default SSG;
