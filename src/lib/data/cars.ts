import type { Car } from "@/lib/types";
import { useSelector } from "react-redux";
import type { RootState } from "@/lib/store";

export const useCarsFromRedux = () => {
  return useSelector((state: RootState) => state.data.allCars) || [];
};

export const CARS: Car[] = [];
