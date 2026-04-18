import dayjs from "dayjs";
import {
  DATE_FORMAT_DISPLAY,
  DATETIME_FORMAT_DISPLAY,
} from "../constants/date.constant";

export const getDate = (date: string): string => {
  return dayjs(date).format(DATE_FORMAT_DISPLAY);
};

export const getDateTime = (date: string): string => {
  return dayjs(date).format(DATETIME_FORMAT_DISPLAY);
};

export const getDayOfWeek = (date: string): string => {
  return dayjs(date).format("dddd");
};
