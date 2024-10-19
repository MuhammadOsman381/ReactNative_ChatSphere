import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Helpers from "../../config/Helpers";
import io from "socket.io-client";

const Message = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);
  const [sender, setSender] = useState(null);
  const [isDeleted, setIsDeleted] = useState(false);
  const socketRef = useRef(null);
  const flatListRef = useRef(null);
  const fetchUserData = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem("userID");
      const storedToken = await AsyncStorage.getItem("token");
      const temp = await AsyncStorage.getItem("id");
      setSender(temp);
      setUserId(storedUserId);
      setToken(storedToken);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const sendMessage = async () => {
    if (!userId || !token) {
      console.error("User ID or token not found");
      return;
    }

    try {
      const id = await userId;
      const response = await axios.post(
        `${Helpers.apiUrl}message/send/${id}`,
        { message },
        {
          headers: {
            "Content-Type": "application/json",
            token: token,
          },
        }
      );

      const newMessage = response?.data?.newMessage;
      socketRef.current.emit("message", newMessage);
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const getMessages = async () => {
    if (!userId || !token) {
      console.error("User ID or token not found");
      return;
    }

    socketRef.current = io("http://192.168.18.8:3000", {
      query: { token, userId },
    });

    socketRef.current.on("load-messages", (loadedMessages) => {
      setMessages(loadedMessages);
    });

    socketRef.current.on("message", (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    socketRef.current.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });
  };

  useEffect(() => {
    fetchUserData();
  }, [userId, isDeleted]);

  useEffect(() => {
    if (userId && token) {
      getMessages();
      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    }
  }, [userId, token, isDeleted]);

  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages, isDeleted]);

  const filteredArray = async (id) => {
    setMessages(messages?.filter((items) => items?._id !== id));
  };

  const deleteMessage = (id) => {
    axios
      .delete(`${Helpers.apiUrl}message/delete/${id}`)
      .then((response) => {
        filteredArray(response.data.msg._id);
        // setIsDeleted(!isDeleted)
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const renderItem = ({ item }) => {
    const isSender = item?.sender === sender;

    return (
      <View
        className={`flex flex-row ${
          isSender ? "justify-end" : "justify-start"
        }`}
      >
        {isSender && (
          <TouchableOpacity
            onPress={() => deleteMessage(item?._id)}
            className="mr-2 "
          >
            <Text className="p-2 rounded-full bg-red-500 shadow shadow-gray-600 ">
              <Icon name="delete" size={20} color="white" />
            </Text>
          </TouchableOpacity>
        )}

        <View
          className={`mb-2 p-3 max-w-[80%] rounded-lg ${
            isSender
              ? "bg-blue-500 shadow shadow-gray-600"
              : "bg-gray-300 shadow shadow-gray-600 "
          }`}
        >
          <Text className={`${isSender ? "text-white" : "text-black"}`}>
            {item?.message}
          </Text>
          <Text
            className={`${
              isSender
                ? "text-white text-[11px] font-light mt-1 "
                : "text-black text-[11px] mt-1 font-light"
            }`}
          >
            {new Date(item?.createdAt).toLocaleString()}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView behavior="padding" className="flex-1 p-3 bg-white">
      {/* {messages?.length > 0 && ( */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderItem}
          // keyExtractor={(index) => index.toString()}
        />
      {/* )} */}
      <View className="flex-row  items-center justify-between p-3 bg-white border-t border-gray-300">
        <View className="flex flex-row items-center border border-gray-300 rounded-xl p-2.5 justify-center gap-0 " >
        <TextInput
          value={message}
          onChangeText={(text) => setMessage(text)}
          placeholder="Type a message"
          className="flex-1 bg-white  rounded-full px-2 "
        />
        <TouchableOpacity
          onPress={sendMessage}
          className="bg-white  rounded-full"
        >
          <Icon name="send" size={28} color="dark-gray" />
        </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default Message;
