import App from "basekit/src/app";
import moment from "moment";

export type SharedData = {};

export const condition = (_app: App<SharedData>): boolean => {
  // check on Fridays at 11am PST
  // TODO: pull this in from configuration
  const date = Date.parse("Fri May 26 2023 09:27:00 GMT-0600");
  const timeToDisburse = moment(date);
  const now = moment();
  if (now.isSame(timeToDisburse, "seconds")) return true;
  return false;
};
