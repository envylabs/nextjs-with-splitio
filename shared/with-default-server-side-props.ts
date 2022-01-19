import { GetServerSideProps } from "next";
import { addSplitIOServerClient } from "./split";
import { wrapper } from "./store";

export function withDefaultServerSideProps(
  callback?: GetServerSideProps
): GetServerSideProps {
  return async (context) => {
    // wrapper.getServerSideProps adds additional properties that must be passed
    // forward to retain the correct Redux store scope.
    const props = await wrapper.getServerSideProps((store) => async () => {
      await addSplitIOServerClient({}, store.dispatch);
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
