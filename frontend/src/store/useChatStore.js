import {create} from "zustand"

import toast from "react-hot-toast";
import axiosInstance from "../lib/axios"
import { useAuthStore } from "./useAuthStore";

export const useChatStore=create((set,get)=>({
    messages:[],
    users:[],
    selectedUser:null,
    isUsersLoading:false,
    isMessagesLoading:false,

    getUsers:async ()=>{
         set({isUsersLoading:true});
         try{
             const res=await axiosInstance.get("/messages/users");
             set({users:res.data});
             console.log(res.data)
         }
         catch(err){
             toast.error(err.response.data.message);

         }
         finally{
              set({isUsersLoading:false});
         }
    }
,
    getMessages:async(userId)=>{
        set({isMessagesLoading:true})
          try{
             const res=await axiosInstance.get(`/messages/${userId}`);
             set({messages:res.data})
          }
          catch(err){
               toast.error(err.response.data.message)
          }
          finally{
               set({isMessagesLoading:false})
          }
    },

   sendMessage: async (data) => {
  const { selectedUser } = get();
  try {
    await axiosInstance.post(`/messages/${selectedUser._id}`, data);
    // don't push to state here, socket listener will handle it
  } catch (err) {
    toast.error(err.response.data.message);
  }
},

    setSelectedUser:(selectedUser)=>set({
          selectedUser
    }),

     subscribeToMessages: () => {
  const { selectedUser } = get();
  if (!selectedUser) return;

  const socket = useAuthStore.getState().socket;
  const authUser = useAuthStore.getState().authUser;

  socket.on("newMessage", (newMessage) => {
    // Only add messages relevant to the open chat
    const isChatMessage =
      (newMessage.senderId === selectedUser._id && newMessage.receiverId === authUser._id) ||
      (newMessage.receiverId === selectedUser._id && newMessage.senderId === authUser._id);

    if (!isChatMessage) return;

    set((state) => ({
      messages: [...state.messages, newMessage],
    }));
  });
},


  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },



}))