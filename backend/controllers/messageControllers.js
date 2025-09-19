import User from "../models/User.js";
import Message from "../models/message.js";
import cloudinary from "../db/cloudinary.js"
import { getReceiverSocketId } from "../db/socket.js";
import {io} from "../db/socket.js"


export const getUsersForSidebar = async (req, res) => {
    try {
        const currentUserId = req.user._id;
        const users = await User.find({ _id: { $ne: currentUserId } }).select("-password ");
        res.status(200).json(users);
    }
    catch (error) {
        console.error("Error fetching users for sidebar:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getMessages = async (req, res) => {
   
    try{
         const {id:userToChatId}=req.params;
         const myId=req.user._id;
         const messages=await Message.find({
              $or:[
                {senderId:myId,receiverId:userToChatId},{
                senderId:userToChatId,receiverId:myId
                }
              ]
         })

         res.status(200).json(messages);
    }
    catch(error){
        console.error("Error fetching messages:", error);
        res.status(500).json({ message: "Server error" });
    }

}

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl = "";
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });
    await newMessage.save();

  
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

   
    const senderSocketId = getReceiverSocketId(senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Server error" });
  }
};




export default { getUsersForSidebar,getMessages,sendMessage}; ;
