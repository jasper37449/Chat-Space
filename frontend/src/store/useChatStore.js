import { create } from 'zustand';
import toast from 'react-hot-toast';
import { axiosInstance } from '../lib/axios';

export const useChatStore = create((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,

    getUsers: async () => {
        set({ isUsersLoading: true });
        try {
            const res = await axiosInstance.get('/messages/users');
            set({ users: res.data.users });
        } catch (error) {
            toast.error("Failed to load users");
        } finally {
            set({ isUsersLoading: false });
        }
    },
    
    getMessages: async (userId) => {
        set({ isMessagesLoading: true });
        try {
            const res = await axiosInstance.get(`/messages/${userId}`);
            set({ messages: res.data.messages });
        } catch (error) {
            toast.error("Failed to load messages");
        } finally {
            set({ isMessagesLoading: false });
        }
    },

    sendMessage: async (messageData) => {
        const { selectedUser, messages } = get();
        try {
            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
            
            const newMessage = res.data.message || res.data.newMessage || res.data;
            if(!newMessage || !newMessage._id){
                console.error("Unexpected message format : ", res.data);
                return;
            }
            
            set((state) => ({
                messages: [...state.messages, newMessage],
            }));
            
            // set({ messages: [...messages, res.data.message] });
            
        } catch (error) {
            toast.error("Failed to send message");
        }
    },

    // TODO : optimize this later
    setSelectedUser: (user) => {
        set({ selectedUser: user });
    },

}));