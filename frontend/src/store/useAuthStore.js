import {create} from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === 'development' ? 'http://localhost:5001' : '/';

export const useAuthStore = create ((set, get) => ({
    authUser: null,
    onlineUsers: [],
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    socket: null,

    isCheckingAuth: true,
    checkAuth: async () => {
        try {
            const res = await axiosInstance.get('/auth/check');
            set({authUser: res.data.user});
            get().connectSocket();
        } catch(error) {
            console.error("Error checking auth:", error);
            set({authUser: null});
        } finally {
            set({isCheckingAuth: false});
        }
    },

    updateProfile : async(data) => {
        set({ isUpdatingProfile: true });
        try {
            const res = await axiosInstance.put('/auth/update-profile', data);
            set({ authUser: res.data });
            toast.success("Profile Image updated successfully!");
            
        } catch (error) {
            console.log("Error updating profile:", error);
            const message = error.response?.data?.message || "Failed to update profile";
            toast.error(message);
        } finally {
            set({ isUpdatingProfile: false });
        }
    },

    signup: async (data) => {
        set({ isSigningUp: true });
        try {
            const res = await axiosInstance.post('/auth/signup', data);
            toast.success("Signup successful!");
            set({authUser: res.data});
            get().connectSocket();
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isSigningUp: false });
        }
    },

    login: async (data) => {
        set({ isLoggingIn: true });
        try {
            const res = await axiosInstance.post('/auth/login', data);
            toast.success("Login successful!");
            set({authUser: res.data});

            get().connectSocket();
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isLoggingIn: false });
        }
    },

    logout : async () => {
        try {
            await axiosInstance.post('/auth/logout');
            set({authUser: null});
            toast.success("Logged out successfully");
            get().disconnectSocket();
        } catch (error) {
            toast.error(error.response.data.message);
        }
    },

    connectSocket: () => {
        const {authUser} = get();
        if(!authUser || get().socket?.connected) return;

        const socket = io(BASE_URL, {
            query: {userId: authUser._id},
        });
        socket.connect();

        set({socket : socket});// save socket instance in the store

        socket.on('getOnlineUsers', (userIds) => {
            set({onlineUsers : userIds});
        });
    },

    disconnectSocket: () => {
        if(get().socket?.connected) {
            get().socket.disconnect();
        }
    }
}))