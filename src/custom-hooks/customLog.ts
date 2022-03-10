//MAT-3804
import log from "loglevel";
import remote from "loglevel-plugin-remote";

const customLog = (input, level, action) => {
  if (input != null) {
    const customJSON = (log) => ({
      msg: { input },
      level: { level },
    });

    remote.apply(log, {
      format: customJSON,
      url: `http://localhost:8080/api/log/${action}`,
    });
    log.enableAll();
    log.info(input);
  }
};

export const loginLogger = (content, level) => {
  customLog(content, level, "login");
};

export const logoutLogger = (content, level) => {
  customLog(content, level, "logout");
};
