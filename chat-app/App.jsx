import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Signup from "./src/pages/Signup";
import Signin from "./src/pages/Signin";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Toast from "react-native-toast-message";
import Home from "./src/pages/Home";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Chat from "./src/pages/Chat";
import Profile from "./src/pages/Profile";
import Icon from "react-native-vector-icons/MaterialIcons";
import Request from "./src/pages/Request";
import FriendList from "./src/pages/FriendList";
import Message from "./src/pages/Message";
import MyProvider from "./Provider";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const BottomTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: true,
      tabBarShowLabel: false,
      tabBarStyle: {
        backgroundColor: "white",
        paddingBottom: 0,
        height: 60,
      },
      tabBarActiveTintColor: "black",
      tabBarInactiveTintColor: "gray",
    }}
  >
    <Tab.Screen
      name="chat"
      component={Chat}
      options={{
        title: "Chat",
        tabBarIcon: () => <Icon name="chat-bubble" size={25} color={"black"} />,
      }}
    />

    <Tab.Screen
      name="Friend List"
      component={FriendList}
      options={{
        title: "Friend List",
        tabBarIcon: () => <Icon name="group" size={25} color={"black"} />,
      }}
    />

    <Tab.Screen
      name="Home"
      component={Home}
      options={{
        title: "Home",
        tabBarIcon: () => <Icon name="home" size={25} color={"black"} />,
      }}
    />

    <Tab.Screen
      name="Request"
      component={Request}
      options={{
        title: "Requests",
        tabBarIcon: () => <Icon name="group-add" size={25} color={"black"} />,
      }}
    />

    <Tab.Screen
      name="profile"
      component={Profile}
      options={{
        title: "Profile",
        tabBarIcon: () => <Icon name="person" size={25} color={"black"} />,
      }}
    />
  </Tab.Navigator>
);

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    justifyContent: "start",
    alignItems: "center",
    height: 110,
    backgroundColor: "white",
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 30,
    marginTop: 55,
  },
});
function CustomHeader({ title }) {
  return (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>{title}</Text>
    </View>
  );
}

const check = async () => {
  return await AsyncStorage.getItem("token");
};

export default function App() {
  const token = check();

  return (
    <MyProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerStyle: {
              backgroundColor: "white",
              shadowColor: "black",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.5,
              shadowRadius: 4,
              elevation: 5,
            },
            headerTintColor: "black",
            headerTitleStyle: {
              fontWeight: "bold",
            },
            headerTitleAlign: "left",
          }}
        >
          <>
            <Stack.Screen
              name="BottomTabs"
              component={BottomTabs}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Message"
              component={Message}
              options={{ title: "Message" }}
            />
            <Stack.Screen
              name="Signup"
              component={Signup}
              options={{ header: () => <CustomHeader title="Signup" /> }}
            />
            <Stack.Screen
              name="Login"
              component={Signin}
              options={{ header: () => <CustomHeader title="Login" /> }}
            />
          </>
        </Stack.Navigator>
        <Toast ref={(ref) => Toast.setRef(ref)} />
      </NavigationContainer>
    </MyProvider>
  );
}
