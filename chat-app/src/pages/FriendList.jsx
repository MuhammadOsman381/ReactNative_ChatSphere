import { View, Text, TouchableOpacity, Image } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import Helpers from "../../config/Helpers";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialIcons";
import { MyContext } from "../../Context";

const FriendList = ({ navigation }) => {
  const [friends, setFriends] = useState([]);
  const { state, updateState } = useContext(MyContext);

  const getFriendsData = async () => {
    const token = await AsyncStorage.getItem("token");
    axios
      .get(`${Helpers.apiUrl}user/friends-list`, {
        headers: {
          "Content-Type": "multipart/form-data",
          token: token,
        },
      })
      .then((response) => {
        setFriends(response.data.friends);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const deleteFriend = async (id) => {
    const token = await AsyncStorage.getItem("token");
    axios
      .delete(`${Helpers.apiUrl}user/delete-friend/${id}`, {
        headers: {
          "Content-Type": "multipart/form-data",
          token: token,
        },
      })
      .then((response) => {
        updateState(!state);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const messageRouter = async (id) => {
    try {
      await AsyncStorage.removeItem("userID");
      await AsyncStorage.setItem("userID", id);
      navigation.navigate("Message");
    } catch (error) {
      console.error("Error updating userID in AsyncStorage:", error);
    }
  };

  useEffect(() => {
    getFriendsData();
  }, [state]);

  return (
    <View>
      <View className="p-2">
        <View className="  z-10 w-full flex items-center justify-start p-3 gap-2 h-full ">
          {friends?.length > 0 ? (
            friends.map((items) => (
              <TouchableOpacity
                onPress={() => messageRouter(items._id)}
                key={items._id}
                className="border-none w-[85vw] h-[14vh] text-gray-600 rounded-xl bg-white shadow-lg shadow-gray-400 flex-row items-center justify-start p-4 mb-2"
              >
                <Image
                  source={{ uri: `${items.image}` }}
                  className="w-[80px] h-[80px] rounded-full mr-4"
                />
                <View className="flex flex-col items-start justify-center">
                  <View className="mb-2">
                    <Text className="text-base font-bold text-gray-800">
                      {items.name}
                    </Text>
                    <Text className="text-sm text-gray-500">{items.email}</Text>
                  </View>
                  <View className="flex flex-row gap-2">
                    <TouchableOpacity onPress={() => deleteFriend(items._id)}>
                      <View className="bg-red-500 w-24 h-8 flex items-center justify-center  rounded-xl flex-row">
                        <Icon name="delete" size={18} color="white" />
                        <Text className="text-white ml-1">Delete</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View className="flex h-full justify-center items-center">
              <Text className="text-center mt-10 text-gray-600">No found!</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default FriendList;
