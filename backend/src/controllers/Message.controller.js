import jwt from "jsonwebtoken";
import { User } from "../models/User.model.js";
import { Room } from "../models/Room.model.js";
import { Message } from "../models/Message.model.js";

const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const { id } = req.params;
    const token = req.headers["token"];

    if (!message || !id || !token) {
      return res.status(400).json({
        success: false,
        message: "Bad request: Missing parameters!",
      });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    const sender = await User.findById(decodedToken._id);
    const receiver = await User.findById(id);

    if (!sender || !receiver) {
      return res.status(404).json({
        success: false,
        message: "User not found!",
      });
    }

    let room = await Room.findOne({
      members: { $all: [sender._id, receiver._id] },
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found!",
      });
    }

    const newMessage = await Message.create({
      sender: sender._id,
      receiver: receiver._id,
      message,
      roomID: room._id,
    });

    room.message.push(newMessage._id);
    await room.save();

    return res.status(201).json({
      success: true,
      message: "Message sent successfully!",
      newMessage,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};

const getMessages = async (req, res) => {
  try {
    const { userID } = req.params;
    const token = req.headers["token"];
    const decodedToken = jwt.decode(token);

    const room = await Room.findOne({
      members: { $all: [userID, decodedToken._id] },
    });

    // console.log(userID,decodedToken._id)

    const messageArray = await Promise.all(
      room.message.map(async (items) => await Message.findOne({ _id: items }))
    );

    return res.status(201).json({
      success: true,
      message: "working fine!",
      messageArray: messageArray,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const room = await Room.findOne({ message: id });
    const msg = await Message.findOne({ _id: id });

    room.message = await room.message.filter(
      (message) => message._id.toString() !== id
    );
    await room.save();
    await msg.deleteOne();

    return res.status(201).json({
      success: true,
      message: "working fine!",
      msg:msg
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};

export { sendMessage, getMessages, deleteMessage };
