import User from "../models/User.js"
import bcrypt from "bcryptjs";
import express from "express";
import jwt from "jsonwebtoken";
import cloudinary from "../db/cloudinary.js";
 const generateToken = (userId,res) => {
      const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      res.cookie("jwt", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return token;
}
export const signup = async(req, res) => {
   try{
        const {name,password,email}=req.body;
          
         if(password.length<6){
            return res.status(400).json({message:"Password must be at least 6 characters long"});
         }

         const user=await User.findOne({email});
         if(user){
            return res.status(400).json({message:"User already exists"});
         }
         const salt=await bcrypt.genSalt(10);
         const hashedPassword=await bcrypt.hash(password,salt);
         const newUser=new User({

            name:name,
            password:hashedPassword,
            email:email,
           
         });
         
         if(newUser){
          const token=  generateToken(newUser._id,res);
            await newUser.save();
            return res.status(201).json({
                _id:newUser._id,
                name:newUser.name,
                email:newUser.email,
                token
              
         });}
         else{
            return res.status(400).json({message:"Invalid user data"});
         }

    }catch(error){
        console.error("Error in signup:", error);
        return res.status(500).json({message:"Internal Server Error"});

   }
}

 export const login=async(req,res)=>{
      const {email,password}=req.body;
      try{
          
            const user=await User.findOne({email});

            if(!user){
               return res.status(400).json({message:"User not found"});
            }  
            const isMatch=await bcrypt.compare(password,user.password);
            if(!isMatch){
               return res.status(400).json({message:"Invalid email or password"});
            }

            generateToken(user._id,res);

            return res.status(200).json({
               _id:user._id,
               name:user.name, 
               email:user.email,
               profilePic: user.profilePic,  // ✅ include it here
              createdAt: user.createdAt,
            });
          
      }
      catch(error){
         console.error("Error in login:", error);
         return res.status(500).json({message:"Internal Server Error"});
      }
}

export const logout = (req, res) => {
   res.clearCookie("jwt", {
     httpOnly: true, 
       secure: process.env.NODE_ENV !== "development",
         sameSite: "strict",

   });
   res.status(200).json({ message: "Logged out successfully" });
 }

  export const updateProfile=async(req,res)=>{
     try{
           const {profilePic}=req.body;
             const userId=req.user._id;

             if(!profilePic){
               return res.status(400).json({message:"Profile picture is required"});
             }

             const uploadResponse=await cloudinary.uploader.upload(profilePic)
             const updatedUser=await User.findByIdAndUpdate(userId,
               {profilePic:uploadResponse.secure_url},
               {new:true}).select("-password");
                res.status(200).json(updatedUser);
  }catch        
   (error){ 

      console.error("Error in updateProfile:", error);
      return res.status(500).json({message:"Internal Server Error"});
}
  }

  export const checkAuth=async(req,res)=>{
   try{

         res.status(200).json(req.user);

   }
   catch(error){

      console.error("Error in checkAuth:", error);
      return res.status(500).json({message:"Internal Server Error"});
   }


   }


export default {signup,login,logout,updateProfile,checkAuth
};
