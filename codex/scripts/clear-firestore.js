const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, deleteDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyBftA1Uhp0dshz7Iy8e_kb_6pKKKgtd6bE",
  authDomain: "codex-83bd0.firebaseapp.com",
  projectId: "codex-83bd0",
  storageBucket: "codex-83bd0.appspot.com",
  messagingSenderId: "561913711337",
  appId: "1:561913711337:web:2a32db66f117164540be78"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function clearCollection(name) {
  const snap = await getDocs(collection(db, name));
  let count = 0;
  for (const d of snap.docs) {
    await deleteDoc(doc(db, name, d.id));
    count++;
  }
  return count;
}

async function run() {
  const targets = [
    'courses',
    'assignments',
    'problems',
    'notices',
    'submissions',
    'analytics'
  ];
  for (const t of targets) {
    const deleted = await clearCollection(t);
    console.log(`${t}: ${deleted} deleted`);
  }
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
