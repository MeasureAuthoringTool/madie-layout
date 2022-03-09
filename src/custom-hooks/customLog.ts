//MAT-3804
import log from "loglevel";
import remote from "loglevel-plugin-remote";

export const customLog = (input, level, url) => {
  if (input != null) {
    const customJSON = (log) => ({
      msg: { input },
      level: { level },
    });

    remote.apply(log, { format: customJSON, url: `${url}` });
    log.enableAll();
    log.info(input);
  }
};
