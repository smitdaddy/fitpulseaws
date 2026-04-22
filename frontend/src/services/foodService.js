import API from "./api";

export const addFoodLog = async (formData) => {
  const res = await API.post("/food-log", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};

export const getTodayLogs = async () => {
  const res = await API.get("/food-log/today");
  return res.data;
};
