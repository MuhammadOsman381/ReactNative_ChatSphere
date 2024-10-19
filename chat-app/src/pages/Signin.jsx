import { View, Text, TextInput, TouchableOpacity } from "react-native";
import React, { useState,useEffect } from "react";
import axios from "axios";
import Helpers from "../../config/Helpers";
import AsyncStorage from '@react-native-async-storage/async-storage';

const Signin = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginUser = async () => {
    try {
      const response = await axios.post(`${Helpers.apiUrl}user/login`, {
        email,
        password,
      });
      await AsyncStorage.setItem("token",response.data.token)
      await AsyncStorage.setItem("id",response.data.user._id)
      // Helpers.toast("success", "Login Successful", response.data.message);
      navigation.reset({
        index: 1,
        routes: [{ name: "BottomTabs" }],
      });
    } catch (error) {
      console.error("Error signing up user:", error);
      Helpers.toast("error", "Login failed", error.response.data.message);
    }
  };

  return (
    <View className="w-full h-full flex items-center justify-center">
      <View className="w-[90vw] h-[47vh] -mt-32  rounded-2xl shadow-md shadow-gray-600   items-center justify-center bg-white p-10">
        <Text className="text-2xl font-bold text-black mb-8">
          Login to your Account
        </Text>

        <View className="w-full mb-4">
          <TextInput
            value={email}
            onChangeText={(text) => setEmail(text)}
            placeholder="Email"
            className="w-full h-12 p-4 border border-gray-300 rounded-lg bg-white"
          />
        </View>

        <View className="w-full mb-6">
          <TextInput
            value={password}
            onChangeText={(text) => setPassword(text)}
            placeholder="Password"
            secureTextEntry
            className="w-full h-12 p-4 border border-gray-300 rounded-lg bg-white"
          />
        </View>

        <TouchableOpacity className="w-full h-12 p-3  bg-black rounded-lg">
          <Text
            onPress={() => loginUser()}
            className="text-center  text-white font-bold"
          >
            Sign Up
          </Text>
        </TouchableOpacity>

        <View className="flex-row mt-4">
          <Text className="text-gray-500">if you don't have an account?</Text>
          <TouchableOpacity>
            <Text
              onPress={() => navigation.navigate("Signup")}
              className="text-black ml-2"
            >
              Sign in
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default Signin;
