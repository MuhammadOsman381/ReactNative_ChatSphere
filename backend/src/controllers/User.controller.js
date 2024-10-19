import { User } from "../models/User.model.js";
import bcrypt from "bcrypt";
import { createToken } from "../utils/tokenGenerator.js";
import jwt from "jsonwebtoken";
import { Room } from "../models/Room.model.js";
import { Message } from "../models/Message.model.js";

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const isUserExist = await User.findOne({ email: email });
    if (isUserExist) {
      return res.status(409).json({
        success: false,
        message: "This email is already taken by another user!",
      });
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = await User.create({
      name: name,
      email: email,
      password: hashedPassword,
      image: req.file.filename,
    });
    return res.status(201).json({
      success: true,
      message: "User register succesfully!",
      newUser: newUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const isUserEmailCorrect = await User.findOne({ email: email });
    if (!isUserEmailCorrect) {
      return res.status(404).json({
        success: false,
        message: "Invalid email!",
      });
    }
    const isUserPassCorrect = bcrypt.compare(
      password,
      isUserEmailCorrect.password
    );
    if (!isUserPassCorrect) {
      return res.status(404).json({
        success: false,
        message: "Invalid password!",
      });
    }

    const token = createToken(isUserEmailCorrect);

    return res.status(201).json({
      success: true,
      message: `Welcome back ${isUserEmailCorrect.name}!`,
      user: isUserEmailCorrect,
      token: token,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const token = req.headers["token"];
    const decodedToken = jwt.decode(token);
    const user = await User.findOne({ _id: decodedToken._id });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "user not found!",
      });
    }
    let userTempObj = {
      _id: user._id,
      name: user.name,
      email: user.email,
      image: `${process.env.URL}profilepic/${user.image}`,
      contactList: user.contactList,
    };
    return res.status(201).json({
      success: true,
      message: "working fine!",
      user: userTempObj,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};

const allUsers = async (req, res) => {
  const users = await User.find().exec();
  if (users.length == 0) {
    return res.status(404).json({
      success: false,
      message: "No users found!",
    });
  }
  return res.status(201).json({
    success: true,
    message: "Users found succesfully!",
    users: users,
  });
};

const sendRequest = async (req, res) => {
  try {
    const { value } = req.params;
    const decodedToken = jwt.decode(req.headers["token"]);
    const receiver = await User.findOne({ _id: value });
    const sender = await User.findOne({ _id: decodedToken._id });
    if (sender.contactList.includes(receiver._id)) {
      return res.status(404).json({
        success: false,
        message: `${receiver.name} already exists in your friend list!`,
      });
    }
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: "Receiver not found",
      });
    }
    if (receiver.requestList.includes(decodedToken._id)) {
      return res.status(400).json({
        success: false,
        message: "You already sent a request to this user",
      });
    }
    sender.pendingRequests.push(receiver._id);
    receiver.requestList.push(sender._id);
    await receiver.save();
    await sender.save();
    return res.status(201).json({
      success: true,
      message: "Request sent successfully!",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred",
      error: error.message,
    });
  }
};

const pendingRequestList = async (req, res) => {
  try {
    const decodedToken = jwt.decode(req.headers["token"]);
    const user = await User.findOne({ _id: decodedToken._id });
    const pendingReqArray = await Promise.all(
      user.pendingRequests.map(async (items) => {
        const requestUser = await User.findOne({ _id: items });
        const imageUrl = `${process.env.URL}profilePic/${requestUser.image}`;
        return {
          _id: requestUser._id,
          name: requestUser.name,
          email: requestUser.email,
          image: imageUrl,
        };
      })
    );
    return res.status(201).json({
      success: true,
      message: "Working fine!",
      pendingRequests: pendingReqArray,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred",
      error: error.message,
    });
  }
};

const cancelPendingRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const decodedToken = jwt.decode(req.headers["token"]);
    const sender = await User.findOne({ _id: decodedToken._id });
    const receiver = await User.findOne({ _id: id });

    if (!sender || !receiver) {
      return res.status(404).json({
        success: false,
        message: "Sender or receiver not found",
      });
    }
    receiver.requestList = receiver.requestList.filter(
      (requestId) => requestId.toString() !== sender._id.toString()
    );
    sender.pendingRequests = sender.pendingRequests.filter(
      (pendingId) => pendingId.toString() !== receiver._id.toString()
    );
    await receiver.save();
    await sender.save();
    console.log(sender, receiver);
    return res.status(201).json({
      success: true,
      message: "Request canceled successfully!",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred",
      error: error.message,
    });
  }
};

const requestedUsers = async (req, res) => {
  try {
    const decodedToken = jwt.decode(req.headers["token"]);
    const user = await User.findOne({ _id: decodedToken._id });
    const requestedUser = await Promise.all(
      user.requestList.map(async (items) => {
        const user = await User.findOne({ _id: items });
        const imageUrl = `${process.env.URL}profilePic/${user.image}`;
        return {
          _id: user._id,
          name: user.name,
          email: user.email,
          image: imageUrl,
        };
      })
    );
    return res.status(201).json({
      success: true,
      message: "working fine!",
      requestedUser: requestedUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred",
      error: error.message,
    });
  }
};

const acceptRequest = async (req, res) => {
  try {
    const decodedToken = jwt.decode(req.headers["token"]);
    const { id } = req.params;
    const receiver = await User.findOne({ _id: decodedToken._id });
    const sender = await User.findOne({ _id: id });
    receiver.requestList = receiver.requestList.filter(
      (userId) => userId.toString() !== sender._id.toString()
    );
    receiver.contactList.push(sender._id);
    sender.pendingRequests = sender.pendingRequests.filter(
      (userId) => userId.toString() !== receiver._id.toString()
    );
    sender.contactList.push(receiver._id);
    await receiver.save();
    await sender.save();
    const newRoom = await Room.create({
      members: [sender._id, receiver._id],
    });
    return res.status(201).json({
      success: true,
      message: `${sender.name} added to friend List!`,
      newRoom: newRoom,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred",
      error: error.message,
    });
  }
};

const friendsList = async (req, res) => {
  try {
    const decodedToken = jwt.decode(req.headers["token"]);
    const user = await User.findOne({ _id: decodedToken._id });
    const friends = await Promise.all(
      user.contactList.map(async (items) => {
        {
          const requestUser = await User.findOne({ _id: items });
          const imageUrl = `${process.env.URL}profilePic/${requestUser.image}`;
          return {
            _id: requestUser._id,
            name: requestUser.name,
            email: requestUser.email,
            image: imageUrl,
          };
        }
      })
    );
    return res.status(201).json({
      success: true,
      message: `working fine!`,
      friends: friends,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred",
      error: error.message,
    });
  }
};

const deleteFriend = async (req, res) => {
  try {
    const decodedToken = jwt.decode(req.headers["token"]);
    const { id } = req.params;
    const user = await User.findById(decodedToken._id);
    const friend = await User.findById(id);
    if (!user || !friend) {
      return res.status(404).json({
        success: false,
        message: "User or friend not found",
      });
    }
    const room = await Room.findOne({
      members: { $all: [user._id, friend._id] },
    });
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }
    user.contactList = user.contactList.filter(
      (contactId) => contactId.toString() !== friend._id.toString()
    );
    await user.save();

    friend.contactList = friend.contactList.filter(
      (contactId) => contactId.toString() !== user._id.toString()
    );
    await friend.save();
    await Message.deleteMany({ roomID: room._id });
    await room.deleteOne();
    return res.status(200).json({
      success: true,
      message: "Friend deleted successfully!",
    });
  } catch (error) {
    console.error("Error in deleteFriend:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred",
      error: error.message,
    });
  }
};

const cancelRequest = async (req, res) => {
  try {
    const decodedToken = jwt.decode(req.headers["token"]);
    const { id } = req.params;
    const user = await User.findOne({ _id: decodedToken._id });
    const friend = await User.findOne({ _id: id });
    user.requestList = user.requestList.filter(
      (items) => items.toString() !== friend._id.toString()
    );
    friend.pendingRequests = friend.pendingRequests.filter(
      (items) => items.toString() !== user._id.toString()
    );
    await user.save();
    await friend.save();
    return res.status(200).json({
      success: true,
      message: "Request canceled succesfully!",
    });
  } catch (error) {
    console.error("Error in deleteFriend:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred",
      error: error.message,
    });
  }
};



const deleteAccount = async (req, res) => {
  try {
    const decodedToken = jwt.decode(req.headers["token"]);
    const user = await User.findOne({ _id: decodedToken._id });

    console.log(user)

    return res.status(200).json({
      success: true,
      message: "Account deleted.",
    });
  } catch (error) {
    console.error("Error in deleteFriend:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred",
      error: error.message,
    });
  }
};



export {
  register,
  login,
  getUserProfile,
  allUsers,
  sendRequest,
  pendingRequestList,
  cancelPendingRequest,
  requestedUsers,
  acceptRequest,
  friendsList,
  deleteFriend,
  cancelRequest,
  deleteAccount
};
