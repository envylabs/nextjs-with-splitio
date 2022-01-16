import type { GetServerSideProps, NextPage } from "next";
import styles from "../styles/Home.module.css";

const SSR: NextPage = () => {
  const treatment = "blue";

  return <h1 className={styles.title}>{treatment}</h1>;
};

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {},
  };
};

export default SSR;
