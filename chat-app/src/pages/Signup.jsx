import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Permissions from "expo-permissions";
import Icon from "react-native-vector-icons/MaterialIcons";
import Signin from "./Signin";
import Helpers from "../../config/Helpers";
import axios from "axios";

const Signup = ({ navigation }) => {
  const [image, setImage] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [previewImage, setPreviewImage] = useState(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Sorry, we need camera roll permissions to make this work!");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setPreviewImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      alert("Sorry, we need camera permissions to make this work!");
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      console.log(result.assets[0])
      setImage(result.assets[0]);
      setPreviewImage(result.assets[0].uri);
    }
  };

  const SignupUser = async () => {
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      if (image) {
        formData.append("image", {
          uri: image.uri,
          type: image.mimeType,
          name: image.fileName, 
        });
      }
      const response = await axios.post(`${Helpers.apiUrl}user/register`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      Helpers.toast("success", "Signup Successful", response.data.message);
    } catch (error) {
      console.error('Error signing up user:', error);
      Helpers.toast("error", "Signup failed", error.response.data.message);
    }
  };
  

  return (
    <View className="w-full h-full flex items-center justify-center">
      <View className="w-[90vw] h-[67vh] -mt-32 rounded-2xl shadow-md shadow-gray-600 items-center justify-center bg-white p-10">
        <Text className="text-2xl font-bold text-black mb-8">
          Create your Account
        </Text>

        <TouchableOpacity onPress={pickImage} className="mb-4">
          <View className="w-24 flex items-center justify-center h-24 rounded-full overflow-hidden bg-gray-200">
            {image ? (
              <Image
                source={{ uri: previewImage }}
                style={{ width: "100%", height: "100%" }}
              />
            ) : (
              <Icon name="person" size={45} color="gray" />
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={takePhoto} className="mb-4">
          <Text className="text-blue-500">Take a Photo</Text>
        </TouchableOpacity>

        <View className="w-full mb-4">
          <TextInput
            onChangeText={(text) => setName(text)}
            value={name}
            placeholder="Name"
            className="w-full h-12 p-4 border border-gray-300 rounded-lg bg-white"
          />
        </View>

        <View className="w-full mb-4">
          <TextInput
            onChangeText={(text) => setEmail(text)}
            value={email}
            placeholder="Email"
            className="w-full h-12 p-4 border border-gray-300 rounded-lg bg-white"
          />
        </View>

        <View className="w-full mb-6">
          <TextInput
            onChangeText={(text) => setPassword(text)}
            value={password}
            placeholder="Password"
            secureTextEntry
            className="w-full h-12 p-4 border border-gray-300 rounded-lg bg-white"
          />
        </View>

        <TouchableOpacity className="w-full h-12 p-3 bg-black rounded-lg">
          <Text
            onPress={() => SignupUser()}
            className="text-center text-white font-bold"
          >
            Sign Up
          </Text>
        </TouchableOpacity>

        <View className="flex-row mt-4">
          <Text className="text-gray-500">Already have an account?</Text>
          <TouchableOpacity>
            <Text
              onPress={() => navigation.navigate("Login")}
              className="text-black ml-2"
            >
              Log in
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default Signup;
