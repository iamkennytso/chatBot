import firebase from 'firebase/app';
import 'firebase/functions';

const config = {
  apiKey: "AIzaSyAjP8cBdmGAnvfbxYoqHoHbHdU-0xcBAFk",
  authDomain: "small-talk-f5edf.firebaseapp.com",
  databaseURL: "https://small-talk-f5edf.firebaseio.com",
  projectId: "small-talk-f5edf",
  storageBucket: "small-talk-f5edf.appspot.com",
  messagingSenderId: "1016192815742"
};

const fire = firebase.initializeApp(config);


export default fire;
export const cloudFunctions = fire.functions();