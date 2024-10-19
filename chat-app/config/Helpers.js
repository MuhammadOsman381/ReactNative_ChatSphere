import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';

class Helpers {
  static localhost = "192.168.18.8:3000";
  static basePath = `http://${this.localhost}`;
  static apiUrl = `${this.basePath}/api/`;
  
  static async authHeaders() {
    const token = await AsyncStorage.getItem('token');
    return {
      headers: {
        "Content-Type": "multipart/form-data",
        "token": token,     
      },
    };
  }

  static async authFileHeaders() {
    const token = await AsyncStorage.getItem('token');
    return {
      headers: {
        "Content-Type": "application/json",
        "token": token,     
      },
    };
  }

  static toast = (type, message1,message2) => {
    Toast.show({
      type: type,
      position: 'top',
      text1:message1,
      text2: message2,
      visibilityTime: 4000,
      autoHide: true,
      bottomOffset: 0,
      topOffset: 60,
      
    });
  };
}

export default Helpers;
