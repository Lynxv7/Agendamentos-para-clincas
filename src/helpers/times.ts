export const genrateTimesSlots = () => {
  const times: string[] = [];

  for (let hour = 0; hour < 24; hour++) {
    for (const minute of [0, 30]) {
      times.push(
        `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`,
      );
    }
  }
  return times;
};
