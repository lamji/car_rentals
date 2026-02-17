/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";

import { setAllCars, setCars, setRecalCulate } from "@/lib/slices/data";
import useGetCars from "@/lib/api/useGetCars";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import { getUserAgentRoom } from "@/utils/getUserAgentRoom";

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
  const authUser = useAppSelector((state) => state.auth.user);
  const authRole = useAppSelector((state) => state.auth.role);

  useEffect(() => {
    // Check if API is available before connecting
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const isApiDisabled = !apiUrl || apiUrl === "https://your-backend-api.com";
    
    if (isApiDisabled) {
      console.warn("Socket.IO connection disabled - API not configured");
      return;
    }
    
    // Initialize Socket.IO connection
    const socketInstance = io(apiUrl, {
      transports: ["websocket", "polling"],
      autoConnect: true,
      timeout: 5000,
    });

    // Connection events
    socketInstance.on("connect", () => {
      console.log("Socket.IO connected globally");
      console.log(`Socket ID: ${socketInstance.id}`);
      setIsConnected(true);

      // Join a room unique to this browser's userAgent for hold expiry signals
      const userAgentRoom = getUserAgentRoom(navigator.userAgent);
      socketInstance.emit("joinRoom", userAgentRoom);
      console.log(`Joined hold room: ${userAgentRoom}`);

      if (authUser?.id && (authRole === "admin" || authRole === "owner")) {
        socketInstance.emit("join", authUser.id);
        console.log(`Joined user room: user:${authUser.id}`);
      }

      if (authRole === "owner" && authUser?.notificationId) {
        const ownerRoom = `owner:${authUser.notificationId}`;
        socketInstance.emit("joinRoom", ownerRoom);
        console.log(`Joined owner room: ${ownerRoom}`);
      }
    });

    socketInstance.on("disconnect", () => {
      console.log("Socket.IO disconnected globally");
      setIsConnected(false);
    });

    socketInstance.on("connect_error", (error) => {
      console.log("Socket.IO connection error:", error.message);
      setIsConnected(false);
    });

    // Listen for all events for debugging
    socketInstance.onAny((eventName, ...args) => {
      console.log(`Socket.IO event received: ${eventName}`, args);
    });

    // Listen for car hold status updates globally
    socketInstance.on("car_hold_status_updated", (payload: any) => {
      console.log("SOCKET EVENT RECEIVED - car_hold_status_updated", {payload, stateData});

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
          holdReason: payload.data.car.holdReason || '',
          availability: {
            ...currentCar.availability,
            unavailableDates: payload.data.car.availability?.unavailableDates || currentCar.availability?.unavailableDates || []
          }
        };
        dispatch(setCars(updatedCar));
      }
      
     /**
      * Update all cars in main display
      */
      refetch().then((result) => {
        if (result.data) {
          console.log("Refreshing Redux store with server data");
          dispatch(setAllCars(result.data.data));
          dispatch(setRecalCulate());
        }
      });
    });

    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      console.log("Cleaning up Socket.IO connection");
      socketInstance.disconnect();
    };
  }, [queryClient, refetch, dispatch, stateData, authUser, authRole]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}
