

const userModel = require('../models/user.model')
const jwt = require('jsonwebtoken');
const emailService = require('../services/email.services')


const userRegister = async (req, res) => {
    try {

        const { name, email, password } = req.body

        const isExist = await userModel.findOne({ email: email })

        if (isExist) {
            return res.status(422).json({
                success: false,
                message: "User already register"
            })
        }

        const user = await userModel.create({
            name,
            email,
            password,
        })

        const token = jwt.sign({userId:user._id }, process.env.JWT_SECRET, { expiresIn: "30d" })
        res.cookie("token", token)

        res.status(201).json({
            success: true,
            users: {
                _id: user._id,
                name: user.name,
                email: user.email,
            },
            token
        })

        emailService
            .sendRegisterEmail(user.email, user.name)
            .catch(err => console.error("Email error:", err));


    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" })

    }
}


const userLogin = async (req, res) => {
    try {

        const { email, password } = req.body

        const user = await userModel.findOne({ email }).select("+password")

        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid username or password" })
        }

        const isValid = await user.comparePassword(password)

        if (!isValid) {
            return res.status(401).json({ success: false, message: "invalid username or password" })
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "30d" })
        res.cookie("token", token)

        return res.status(200).json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email
            },
            token
        })

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" })

    }
}


module.exports = {
    userRegister,
    userLogin
}