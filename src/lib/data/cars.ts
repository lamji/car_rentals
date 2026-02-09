import type { Car } from "@/lib/types";
import { useSelector } from "react-redux";
import type { RootState } from "@/lib/store";

export const useCarsFromRedux = () => {
  const allCars = useSelector((state: RootState) => state.data?.allCars);
  return Array.isArray(allCars) ? allCars : [];
};

export const CARS: Car[] = [];
