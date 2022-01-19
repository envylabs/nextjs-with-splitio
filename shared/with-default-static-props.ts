import { GetStaticProps } from "next";
import { synchronizeSplitIOServerClientToRedux } from "./split-build";
import { wrapper } from "./store";

export function withDefaultStaticProps(
  callback?: GetStaticProps
): GetStaticProps {
  return async (context) => {
    // wrapper.getServerSideProps adds additional properties that must be passed
    // forward to retain the correct Redux store scope.
    const props = await wrapper.getStaticProps((store) => async () => {
      await synchronizeSplitIOServerClientToRedux({}, store.dispatch);
      return { props: {} };
    })(context);

    if (callback) {
      return {
        ...props,
        ...callback(context),
      };
    }

    return props;
  };
}
