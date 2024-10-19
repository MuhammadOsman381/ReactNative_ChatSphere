import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import Helpers from "../../config/Helpers";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialIcons";

const Home = () => {
  const [showUserList, setShowUserList] = useState(false);
  const [searchedUser, setSearchedUser] = useState("");
  const [user, setUser] = useState([]);
  const [filteredUser, setFilteredUser] = useState([]);
  const [value, setValue] = useState("");
  const [pendingRequests, setPendingRequests] = useState([]);
  const [refresher, setRefresher] = useState(false);

  const handleUserSelect = (user) => {
    setValue(user._id);
    setSearchedUser(user.name);
    setShowUserList(false);
  };

  const handleInputChange = (text) => {
    setSearchedUser(text);
    if (text) {
      const filtered = user.filter((user) =>
        user.name.toLowerCase().startsWith(text.toLowerCase())
      );
      setFilteredUser(filtered);
      if (
        filtered.length === 1 &&
        filtered[0].name.toLowerCase() === text.toLowerCase()
      ) {
        setValue(filtered[0]._id);
      } else {
        setValue("");
      }
    } else {
      setFilteredUser(user);
      setValue("");
    }
  };

  const sendRequest = async () => {
    setShowUserList(false);
    const token = await AsyncStorage.getItem("token");
    axios
      .get(`${Helpers.apiUrl}user/request/${value}`, {
        headers: {
          "Content-Type": "application/json",
          token: token,
        },
      })
      .then((response) => {
        setRefresher(!refresher);
      })
      .catch((error) => {
        Helpers.toast("error", "Failed", error.response.data.message);
        setRefresher(!refresher);

        console.log(error);
      });
  };

  useEffect(() => {
    const fetchUsers = async () => {
    const id = await AsyncStorage.getItem("id");
      try {
        const response = await axios.get(`${Helpers.apiUrl}user/allUsers`);
        setUser(response.data.users.filter((user)=>(user._id !== id)));
        setFilteredUser(response.data.users.filter((user)=>(user._id !== id)));
      } catch (error) {
        console.log(error);
      }
    };
    fetchUsers();
  }, []);

  const getPendingRequests = async () => {
    const token = await AsyncStorage.getItem("token");

    axios
      .get(`${Helpers.apiUrl}user/pending-request`, {
        headers: {
          "Content-Type": "application/json",
          token: token,
        },
      })
      .then((response) => {
        setPendingRequests(response.data.pendingRequests);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const cancleRequest = async (id) => {
    const token = await AsyncStorage.getItem("token");

    console.log(id);
    axios
      .get(`${Helpers.apiUrl}user/cancle-pending-request/${id}`, {
        headers: {
          "Content-Type": "application/json",
          token: token,
        },
      })
      .then((response) => {
        // Helpers.toast("success", "Success", response.data.message);
        setRefresher(!refresher);
      })
      .catch((error) => {
        Helpers.toast("error", "Failed", error.response.data.message);
        setRefresher(!refresher);
      });
  };

  useEffect(() => {
    getPendingRequests();
  }, [refresher]);

  return (
    <View className="flex-1 items-center justify-start p-5  bg-gray-100">
      <View className="w-full">
        <TextInput
          className="mb-3 h-12 w-full bg-white shadow-sm shadow-gray-600 rounded-lg px-3"
          placeholder="Search a user"
          value={searchedUser}
          onChangeText={handleInputChange}
          onFocus={() => setShowUserList(true)}
        />
        <TouchableOpacity
          onPress={sendRequest}
          className="border w-28 h-9 rounded-lg bg-black flex items-center justify-center"
        >
          <Text className="text-white">Send Request</Text>
        </TouchableOpacity>
      </View>

      {showUserList && (
        <FlatList
          data={filteredUser}
          className="absolute top-20 z-20 w-full rounded-lg p-5 bg-white shadow-sm shadow-gray-600 "
          // keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="py-2 border-b border-gray-200"
              onPress={() => handleUserSelect(item)}
            >
              <Text className="text-[16px]">{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      <View className="z-10 w-full flex items-center justify-start gap-4 h-full   mt-2">
        {pendingRequests?.length > 0 ? (
          pendingRequests?.map((items) => (
            <View className="border-none w-[87vw] h-[14vh] text-gray-600 rounded-xl bg-white shadow-sm shadow-gray-600  flex-row items-center justify-start  p-6">
              <Image
                source={{ uri: `${items.image}` }}
                className="w-[80px] h-[80px] rounded-full mr-4"
              />
              <View className="flex flex-col  ">
                <View className="mb-2">
                  <Text className="text-lg font-bold  text-gray-600 ">
                    {items.name}
                  </Text>
                  <Text className="text-sm text-gray-600">{items.email}</Text>
                </View>
                <TouchableOpacity onPress={() => cancleRequest(items._id)}>
                  <View className=" bg-red-500  w-24 h-8 flex flex-row items-center justify-center rounded-xl   ">
                    <Icon name="close" size={18} color="white" />
                    <Text className="text-white ml-1 ">Cancel</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <View className="flex h-full ">
            <Text className="text-center mt-10  text-gray-600">
              No pending requests found!
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default Home;
