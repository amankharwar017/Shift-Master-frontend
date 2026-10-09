import axios from "axios";
const axiosInstance = axios.create({
  baseURL: "http://localhost:8080",
});

export const saveShift = async (shiftData: unknown) => {
  return await axiosInstance.post("/shift/save", shiftData);
};

export const getShiftList = async ( page = 0,size = 10,sort = "id,asc") => {
  return await axiosInstance.get("/shift/list", {params: {page,size,sort,},});
};

export const getShiftById = async (shiftId: number) => {
  return await axiosInstance.get(`/shift/${shiftId}`);
};

export const updateShift = async (shiftId: number,shiftData: unknown) => {
  return await axiosInstance.put(`/shift/update/${shiftId}`,shiftData);
};

export const deleteShift = async (shiftId: number) => {
  return await axiosInstance.delete(`/shift/delete/${shiftId}`);
};

export const searchShifts = async (searchParams: Record<string, any>,page = 0,size = 10, sort = "id,asc") => {
  return await axiosInstance.post("/shift/search", null, {
    params: { ...searchParams, page, size, sort },
    paramsSerializer: {indexes: null},
  });
};