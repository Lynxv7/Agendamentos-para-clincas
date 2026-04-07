import { dayjs } from "@/lib/dayjs";

export const generateTimeSlots = (from: string, to: string, interval = 30) => {
  const slots: string[] = [];

  let current = dayjs(`2000-01-01 ${from}`);
  const end = dayjs(`2000-01-01 ${to}`);

  while (current.isBefore(end)) {
    slots.push(current.format("HH:mm"));
    current = current.add(interval, "minute");
  }

  return slots;
};

export const getAvailabilityTimeInTimezone = (
  time: string,
  timeZone: string,
  referenceDate = dayjs().format("YYYY-MM-DD"),
) => dayjs.utc(`${referenceDate}T${time}`).tz(timeZone).format("HH:mm:ss");
