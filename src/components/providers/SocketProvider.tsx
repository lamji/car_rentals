/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";

import { setAllCars, setCars, setRecalCulate } from "@/lib/slices/data";
import useGetCars from "@/lib/api/useGetCars";
import { useAppDispatch, useAppSelector } from "@/lib/store";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export function useSocket() {
  return useContext(SocketContext);
}

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const queryClient = useQueryClient();
  const { refetch } = useGetCars();
  const dispatch = useAppDispatch();
  const stateData = useAppSelector((state) => state.data);

  useEffect(() => {
    // Check if API is available before connecting
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const isApiDisabled = !apiUrl || apiUrl === "https://your-backend-api.com";
    
    if (isApiDisabled) {
      console.warn("⚠️ Socket.IO connection disabled - API not configured");
      return;
    }
    
    console.log("🚀 Initializing Socket.IO connection...");
    
    // Initialize Socket.IO connection
    const socketInstance = io(apiUrl, {
      transports: ["websocket", "polling"],
      autoConnect: true,
      timeout: 5000,
    });

    // Connection events
    socketInstance.on("connect", () => {
      console.log("🟢 Socket.IO connected globally");
      console.log(`📍 Socket ID: ${socketInstance.id}`);
      setIsConnected(true);
    });

    socketInstance.on("disconnect", () => {
      console.log("🔴 Socket.IO disconnected globally");
      setIsConnected(false);
    });

    socketInstance.on("connect_error", (error) => {
      console.log("❌ Socket.IO connection error:", error.message);
      console.log("🔧 This is expected when API is not available");
      setIsConnected(false);
    });

    // Listen for all events for debugging
    socketInstance.onAny((eventName, ...args) => {
      console.log(`📡 Socket.IO event received: ${eventName}`, args);
    });

    // Listen for car hold status updates globally
    socketInstance.on("car_hold_status_updated", (payload: any) => {
      console.log("🔥 SOCKET EVENT RECEIVED - car_hold_status_updated", {payload, stateData});

      /**
       * Update selected car in redux
       */
      const carId = payload.data.car.id;
      const currentCar = stateData?.cars;
      let updatedCar = currentCar;
      
      if (currentCar && currentCar._id === carId) {
        updatedCar = {
          ...currentCar,
          isOnHold: payload.data.car.isOnHold,
          holdReason: payload.data.car.holdReason || ''
        };
        
        console.log("🔄 Updating Redux store directly with Socket.IO data");
        dispatch(setCars(updatedCar));
      }
      
     /**
      * Update all cars in main display
      */
      refetch().then((result) => {
        if (result.data) {
          console.log("🔄 Refreshing Redux store with server data");
          dispatch(setAllCars(result.data.data));
          dispatch(setRecalCulate());
        }
      });
    });

    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      console.log("🧹 Cleaning up Socket.IO connection");
      socketInstance.disconnect();
    };
  }, [queryClient, refetch, dispatch, stateData]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}
