import { generateToken } from "../lib/utils.js"
import User from "../models/user.model.js"
import bcrypt from "bcryptjs"
import cloudinary from "../lib/cloudinary.js"

export const signup = async (req,res) => {
    try{
        const { fullname, email, password } = req.body;
        
        console.log("Signup request body:", { fullname, email, password: '***' });
        
        if(!fullname || !email || !password){
            console.log("Missing required fields:", {
                fullname: !!fullname,
                email: !!email,
                password: !!password
            });
            return res.status(400).json({error : "All fields are required"})
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({error: "Invalid email format"});
        }

        if(password.length < 6){
            return res.status(400).json({error : "Password must be at least 6 characters"})
        }

        const user = await User.findOne({email : email})

        if(user){
            return res.status(400).json({error : "Email already exists"})
        }

        const hashedPassword = await bcrypt.hash(password , 10)

        const newUser = new User({
            fullname,
            email: email.toLowerCase(),
            password : hashedPassword,
        })

        const token = generateToken(newUser._id, res)
        await newUser.save();

        res.status(201).json({
            _id : newUser._id,
            fullname : newUser.fullname,
            email : newUser.email,
            token : token
        })
        
    }
    catch(error){
        console.error("Error in signup:", error);
        res.status(500).json({error : error.message})
    }
}

export const login = async(req,res) => {
    try{
        const {email , password} = req.body;
        console.log("Login attempt for email:", email);

        if(!email || !password){
            console.log("Login failed - missing fields:", { email: !!email, password: !!password });
            return res.status(400).json({error : "All fields are required"})
        }

        const user = await User.findOne({email : email})

        if(!user){
            return res.status(400).json({error : "User not found"})
        }

        const isPasswordCorrect = await bcrypt.compare(password , user.password)

        if(!isPasswordCorrect){
            return res.status(400).json({error : "Invalid password"})
        }

        const token = generateToken(user._id , res)
        

        res.status(200).json({
            _id : user._id,
            fullname : user.fullname,
            email : user.email,
            token : token
        })

        
    }
    catch(error){
        console.error("Error in login:", error);
        res.status(500).json({error : error.message})
    }
}

export const logout = (req,res) => {
    try{
        console.log("Logout attempt for user:", req.user?._id);
        res.cookie("jwt", {maxAge:0} )
        res.status(200).json({message : "Logout successful"})
    }
    catch(error){
        console.error("Error in logout:", error);
        res.status(500).json({error : error.message})
    }
}

export const updateProfile = async(req,res) => {
    try{
        const {profilePic} = req.body;
        const userId = req.user._id;
        console.log("Profile update attempt for user:", userId);

        if(!profilePic){
            return res.status(400).json({error : "Profile picture is required"})
        }

        const uploadResponse = await cloudinary.uploader.upload(profilePic, {
            quality: "auto",
            fetch_format: "auto",
            width: 800,
            height: 800,
            crop: "limit",
            flags: "lossy",
            compression: "low"
        });

        const updatedUser = await User.findByIdAndUpdate(
            userId, 
            {profilePic : uploadResponse.secure_url},
            {new : true}
        );

        res.status(200).json({
            _id: updatedUser._id,
            fullname: updatedUser.fullname,
            email: updatedUser.email,
            profilePic: updatedUser.profilePic
        });
    }
    catch(error){
        console.error("Error in updating profile:", error);
        res.status(500).json({error : error.message})
    }
}

export const checkAuth = (req,res) => {
    try{
        console.log("Auth check for user:", req.user?._id);
        res.status(200).json({user : req.user})
    }
    catch(error){
        console.error("Error in checking auth:", error);
        res.status(500).json({error : error.message})
    }
}

