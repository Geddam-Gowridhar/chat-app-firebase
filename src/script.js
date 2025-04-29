import { auth, db } from "./firebase-config.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { collection, addDoc, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const authSection = document.getElementById('auth-section');
const chatSection = document.getElementById('chat-section');
const welcome = document.getElementById('welcome');
const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');

onAuthStateChanged(auth, user => {
  if (user) {
    authSection.classList.add('hidden');
    chatSection.classList.remove('hidden');
    welcome.innerText = `Welcome, ${user.displayName || user.email}`;
    loadMessages();
  } else {
    authSection.classList.remove('hidden');
    chatSection.classList.add('hidden');
  }
});

window.signUp = async () => {
  await createUserWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
};

window.signIn = async () => {
  await signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
};

window.signOut = async () => {
  await signOut(auth);
};

window.googleSignIn = async () => {
  const provider = new GoogleAuthProvider();
  await signInWithPopup(auth, provider);
};

window.sendMessage = async () => {
  const user = auth.currentUser;
  const text = messageInput.value.trim();
  if (text && user) {
    await addDoc(collection(db, "messages"), {
      text,
      sender: user.displayName || user.email,
      photoURL: user.photoURL || "https://i.pravatar.cc/40",
      timestamp: serverTimestamp()
    });
    messageInput.value = "";
  }
};

function loadMessages() {
  onSnapshot(collection(db, "messages"), snapshot => {
    messagesDiv.innerHTML = '';
    snapshot.forEach(doc => {
      const msg = doc.data();
      const div = document.createElement('div');
      div.className = "flex items-center space-x-2 mb-2";
      div.innerHTML = `
        <img src="${msg.photoURL}" class="w-8 h-8 rounded-full" />
        <div class="bg-white p-2 rounded shadow flex-1">
          <strong>${msg.sender}</strong><br>${msg.text}
        </div>`;
      messagesDiv.appendChild(div);
    });
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  });
}