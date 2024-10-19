import { View, Text, Image, TouchableOpacity } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import Helpers from "../../config/Helpers";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialIcons";
import { MyContext } from "../../Context";

const Request = () => {
  const [requestedUsers, setRequestedUsers] = useState([]);
  const [refresh, setRefresh] = useState(true);

  const { state, updateState } = useContext(MyContext);

  const getRequestedUsers = async () => {
    const token = await AsyncStorage.getItem("token");
    axios
      .get(`${Helpers.apiUrl}user/request-users`, {
        headers: {
          "Content-Type": "multipart/form-data",
          token: token,
        },
      })
      .then((response) => {
        setRequestedUsers(response.data.requestedUser);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const cancelRequest = async (id) => {
    const token = await AsyncStorage.getItem("token");
    axios
      .get(`${Helpers.apiUrl}user/cancle-request/${id}`, {
        headers: {
          "Content-Type": "multipart/form-data",
          token: token,
        },
      })
      .then((response) => {
        console.log(response.data.message);
        setRefresh(!refresh);
      })
      .catch((error) => {
        console.log(error);
        setRefresh(!refresh);

      });
  };

  const acceptRequest = async (id) => {
    const token = await AsyncStorage.getItem("token");
    axios
      .get(`${Helpers.apiUrl}user/accept-request/${id}`, {
        headers: {
          "Content-Type": "multipart/form-data",
          token: token,
        },
      })
      .then((response) => {
        // Helpers.toast("success", "Success", response.data.message);
        updateState(!state);
      })
      .catch((error) => {
        console.log(error);
        Helpers.toast("error", "Failed", error.response.data.message);
      });
  };

  useEffect(() => {
    getRequestedUsers();
  }, [state, refresh]);

  return (
    <View className="p-2">
      <View className="z-10 w-full flex items-center justify-start p-3 gap-2 h-full ">
        {requestedUsers?.length > 0 ? (
          requestedUsers.map((items) => (
            <View
              key={items._id}
              className="border-none w-[86vw] h-[14vh] text-gray-600 rounded-xl bg-white shadow-lg shadow-gray-400 flex-row items-center justify-center   p-4 mb-2"
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
                  <TouchableOpacity onPress={() => acceptRequest(items._id)}>
                    <View className="bg-blue-600 w-24 h-8 flex items-center justify-center rounded-xl flex-row">
                      <Icon name="thumb-up" size={18} color="white" />
                      <Text className="text-white ml-1">Accept</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => cancelRequest(items._id)}>
                    <View className="bg-red-500 w-24 h-8 flex items-center justify-center  rounded-xl flex-row">
                      <Icon name="close" size={18} color="white" />
                      <Text className="text-white ml-1">Cancel</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View className="flex h-full justify-center items-center">
            <Text className="text-center mt-10 text-gray-600">
              No requests found!
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default Request;
