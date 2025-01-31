import { create } from 'zustand'
import { axiosInstance } from '../lib/axios'
import { toast } from 'react-hot-toast'
import { io } from 'socket.io-client'

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

export const useAuthStore = create((set ,get ) => ({
    authUser: null,
    isSigningUp : false,
    isLoggingIn : false,
    isUpdatingProfile : false,

    isCheckingAuth: true,
    onlineUsers : [],
    socket: null,

    checkAuth: async () => {
        try{
            const res = await axiosInstance.get('/auth/check')
            set({authUser: res.data})

            get().connectSocket();
        }
        catch(error){
            console.log("Error checking auth ", error);
            set({authUser: null}); 
        }
        finally{
            set({isCheckingAuth: false})
        }
    },

    signUp: async (data) => {
        set({isSigningUp: true});
        try{
            console.log(data);
            const res = await axiosInstance.post('/auth/signup', data)
            set({authUser: res.data})
            toast.success("Sign up successful")

            get().connectSocket();
        }
        catch(error){
            console.log("Error signing up", error)
            toast.error("Sign up failed")
        }
        finally{
            set({isSigningUp: false})
        }
    },


    login: async(data) => {
        set({isLoggingIn: true});
        try{
            const res = await axiosInstance.post('/auth/login', data)
            set({authUser: res.data})
            toast.success("Login successful")

            get().connectSocket();
        }
        catch(error){
            console.log("Error logging in", error)
            toast.error("Login failed")
        }
        finally{
            set({isLoggingIn: false})
        }
    },

    logout: async() => {
        try{
            await axiosInstance.post('/auth/logout')
            set({authUser: null})
            toast.success("Logged out successfully")

            get().disconnectSocket();
        }
        catch(error){
            console.log("Error logging out", error)
            toast.error("Logout failed")
        }
    },

    updateProfile: async(data) => {
        set({isUpdatingProfile: true});
        try{
            const res = await axiosInstance.put('/auth/update-profile', data)
            set({authUser: res.data})
            toast.success("Profile updated successfully")
        }
        catch(error){
            console.log("Error updating profile", error)
            toast.error("Profile update failed")
        }
        finally{
            set({isUpdatingProfile: false})
        }
    },
    

    connectSocket: () => {

        const {authUser} = get();
        if(!authUser || get().socket?.connected ) return;

        const socket = io(BASE_URL,
            {
                query: {
                    userId: authUser.user._id
                }
            }
        );
        socket.connect();

        set({socket : socket });
        
        socket.on("getOnlineUsers" , (userIds) => {
            set({onlineUsers: userIds})
        })
    },

    disconnectSocket: () => {
        if(get().socket?.connected){
            get().socket.disconnect();
            set({socket: null});
        }
    }
}))

