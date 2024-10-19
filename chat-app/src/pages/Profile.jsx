import axios from "axios";
import React, { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import Helpers from "../../config/Helpers";
import AsyncStorage from "@react-native-async-storage/async-storage";


const Profile = ({ navigation }) => {
  const defaultUserProfileData = {
    name: "",
    email: "",
    image: "",
    contactList: [],
    requestList: [],
  };
  const [userProfile, setUserProfile] = useState(defaultUserProfileData);

  const getProfileData = async () => {
    const token = await AsyncStorage.getItem("token");
    axios
      .get(`${Helpers.apiUrl}user/profile`, {
        headers: {
          "Content-Type": "multipart/form-data",
          token: token,
        },
      })
      .then((response) => {
        setUserProfile(response.data.user);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const logoutUser = () => {
    AsyncStorage.removeItem("token");
    return navigation.navigate("Login");
  };

  const deleteAccount = (id) =>{
    console.log(id)
  }

  useEffect(() => {
    getProfileData();
  }, []);

  return (
    <View className="flex items-center justify-center bg-gray-100 p-10">
      <View className=" shadow-lg shadow-gray-500 w-[84vw] h-[49vh] rounded-xl bg-white  p-10 ">
        <View className="items-center mb-8">
          {userProfile?.image && (
            <Image
              source={{ uri: userProfile?.image }}
              className="w-32 h-32 rounded-full mb-4"
            />
          )}
          <Text className="text-xl font-bold text-gray-900">
            {userProfile.name}
          </Text>
          <Text className="text-gray-600">{userProfile.email}</Text>
        </View>

        <View className="w-full flex ">
          <TouchableOpacity
            className=" flex-row items-center justify-center bg-blue-500 rounded-xl py-3 mb-4"
            onPress={() => logoutUser()}
          >
            <Icon name="logout" size={20} color="white" />
            <Text className="text-white font-semibold ml-2">Logout</Text>
          </TouchableOpacity>

          {/* <TouchableOpacity
            className="flex-row items-center justify-center bg-red-500 rounded-xl py-3"
              onPress={()=>deleteAccount(userProfile._id)}
          >
            <Icon name="delete" size={20} color="white" />
            <Text className="text-white font-semibold ml-2">
              Delete Account
            </Text>
          </TouchableOpacity> */}
        </View>
      </View>
    </View>
  );
};

export default Profile;
