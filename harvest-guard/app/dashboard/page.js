'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sprout, CloudRain, Download, User, AlertTriangle, 
  CloudSun, Leaf, Droplets, MapPin, Camera, Mic, 
  Search, X, Volume2, ShieldAlert, LogOut, Globe, MessageSquare, Send
} from 'lucide-react';
import Papa from 'papaparse'; 

// --- Configuration ---
const DISTRICT_COORDS = {
  "Dhaka": { lat: 23.8103, lng: 90.4125 },
  "Chittagong": { lat: 22.3569, lng: 91.7832 },
  "Rajshahi": { lat: 24.3636, lng: 88.6241 },
  "Khulna": { lat: 22.8456, lng: 89.5403 },
  "Sylhet": { lat: 24.8949, lng: 91.8687 },
  "Barisal": { lat: 22.7010, lng: 90.3535 },
  "Rangpur": { lat: 25.7439, lng: 89.2752 },
  "Mymensingh": { lat: 24.7471, lng: 90.4203 }
};

const STORAGE_TYPES = ["Jute Bag Stack", "Silo", "Open Area", "Plastic Drum", "Traditional Granary"];

// --- DATA: BILINGUAL SUPPORT ---
const CROP_TYPES = [
  { bn: "ধান (Paddy)", en: "Paddy/Rice" },
  { bn: "গম (Wheat)", en: "Wheat" },
  { bn: "আলু (Potato)", en: "Potato" },
  { bn: "ভুট্টা (Maize)", en: "Maize" },
  { bn: "সরিষা (Mustard)", en: "Mustard" },
  { bn: "বেগুন (Brinjal)", en: "Brinjal" },
  { bn: "টমেটো (Tomato)", en: "Tomato" }
];

// Detailed Pest Database with Translations
const PEST_DATABASE = [
  { 
    id: 1,
    bn: { pest: "মাজরা পোকা", risk: "উচ্চ (High)", solution: "আক্রান্ত ডালপালা ছাঁটাই করুন এবং জমিতে আলোক ফাঁদ ব্যবহার করুন। প্রয়োজনে দানাদার কীটনাশক ব্যবহার করুন।" },
    en: { pest: "Stem Borer", risk: "High", solution: "Trim affected stems and use light traps. Apply granular pesticides if necessary." }
  },
  { 
    id: 2,
    bn: { pest: "লেট ব্লাইট (Late Blight)", risk: "মারাত্মক (Critical)", solution: "অবিলম্বে ম্যানকোজেব জাতীয় ছত্রাকনাশক স্প্রে করুন। জমিতে সেচ দেওয়া বন্ধ রাখুন।" },
    en: { pest: "Late Blight", risk: "Critical", solution: "Spray Mancozeb fungicide immediately. Stop irrigation." }
  },
  { 
    id: 3,
    bn: { pest: "জাব পোকা (Aphids)", risk: "মাঝারি (Medium)", solution: "নিম তেল অথবা সাবান পানি স্প্রে করুন। লেডি বার্ড বিটল পোকা সংরক্ষণ করুন।" },
    en: { pest: "Aphids", risk: "Medium", solution: "Spray Neem oil or soapy water. Conserve Lady Bird Beetles." }
  },
  { 
    id: 4,
    bn: { pest: "ধানের ব্লাস্ট", risk: "উচ্চ (High)", solution: "ট্রাইসাইক্লাজোল জাতীয় ছত্রাকনাশক স্প্রে করুন। জমিতে সব সময় পানি ধরে রাখুন।" },
    en: { pest: "Rice Blast", risk: "High", solution: "Spray Tricyclazole fungicide. Maintain standing water in the field." }
  }
];

// UI Translations
const TRANSLATIONS = {
  bn: {
    appTitle: "হার্ভেস্টগার্ড",
    welcome: "স্বাগতম",
    logout: "লগ আউট",
    export: "এক্সপোর্ট",
    map: "ম্যাপ",
    weather: "আবহাওয়া",
    add: "ফসল যোগ",
    scanner: "স্ক্যানার",
    inventory: "ইনভেন্টরি",
    profile: "প্রোফাইল",
    riskMap: "ঝুঁকি মানচিত্র",
    weatherAlert: "আবহাওয়া বার্তা",
    scanTitle: "রোগ নির্ণয়",
    scanPlaceholder: "ছবি তুলুন বা আপলোড করুন",
    analyzing: "এআই বিশ্লেষণ করছে...",
    cancel: "বাতিল",
    analyze: "বিশ্লেষণ করুন",
    addCropTitle: "নতুন ফসল যোগ করুন",
    save: "সংরক্ষণ করুন",
    chatTitle: "কৃষি সহকারী (Chat)",
    chatPlaceholder: "এখানে আপনার প্রশ্ন লিখুন...",
    advisory: "পরামর্শ",
    humidity: "আর্দ্রতা",
    rain: "বৃষ্টি",
    newScan: "নতুন ছবি",
    weight: "ওজন (kg)",
    date: "তারিখ",
    emptyList: "কোন তথ্য পাওয়া যায়নি। নতুন ফসল যোগ করুন।",
    advisoryBad: "সতর্কতা: আগামীকাল বৃষ্টি ৮৫% → আজই ফসল ঢেকে রাখুন!",
    advisoryGood: "আর্দ্রতা খুব বেশি! গুদামে ফ্যান চালু করুন।",
    advisoryNormal: "আবহাওয়া স্বাভাবিক আছে।"
  },
  en: {
    appTitle: "HarvestGuard",
    welcome: "Welcome",
    logout: "Logout",
    export: "Export",
    map: "Map",
    weather: "Weather",
    add: "Add Crop",
    scanner: "Scanner",
    inventory: "Inventory",
    profile: "Profile",
    riskMap: "Risk Map",
    weatherAlert: "Weather Report",
    scanTitle: "Disease Diagnosis",
    scanPlaceholder: "Take or Upload Photo",
    analyzing: "AI Analyzing...",
    cancel: "Cancel",
    analyze: "Analyze",
    addCropTitle: "Add New Crop",
    save: "Save",
    chatTitle: "Agri Assistant (Chat)",
    chatPlaceholder: "Type your question here...",
    advisory: "Advisory",
    humidity: "Humidity",
    rain: "Rain",
    newScan: "New Scan",
    weight: "Weight (kg)",
    date: "Date",
    emptyList: "No data found. Add new crop.",
    advisoryBad: "Warning: Rain expected (85%). Cover crops immediately!",
    advisoryGood: "High Humidity! Turn on warehouse fans.",
    advisoryNormal: "Weather is normal."
  }
};

const generateNeighbors = () => {
  return Array.from({ length: 12 }).map((_, i) => ({
    id: i,
    top: 20 + Math.random() * 60,
    left: 10 + Math.random() * 80,
    risk: Math.random() > 0.6 ? 'High' : 'Low',
    cropBn: Math.random() > 0.5 ? 'ধান' : 'গম',
    cropEn: Math.random() > 0.5 ? 'Paddy' : 'Wheat',
    updated: `${Math.floor(Math.random() * 5) + 1}h ago`
  }));
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('inventory');
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState('bn'); // DEFAULT BANGLA
  const t = TRANSLATIONS[lang];
  
  // --- State for Data ---
  const [user, setUser] = useState({ name: '', phone: '', registered: false });
  const [crops, setCrops] = useState([]);
  const [weather, setWeather] = useState(null);
  
  // --- Feature States ---
  const [neighbors] = useState(generateNeighbors());
  const [selectedPin, setSelectedPin] = useState(null);
  const [mapZoom, setMapZoom] = useState(1);
  const [scanImage, setScanImage] = useState(null);
  const [scanResult, setScanResult] = useState(null); // Stores the full bilingual object

  // --- Voice & Chat Fallback States ---
  const [isListening, setIsListening] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");

  const [formData, setFormData] = useState({
    cropType: 'ধান (Paddy)',
    weight: '',
    date: '',
    location: 'Dhaka',
    storage: 'Jute Bag Stack'
  });

  // Init Chat Message based on Lang
  useEffect(() => {
    setChatMessages([{ sender: 'bot', text: lang === 'bn' ? 'আমি কীভাবে সাহায্য করতে পারি?' : 'How can I help you?' }]);
  }, [lang]);

  useEffect(() => {
    const storedUser = localStorage.getItem('hg_user');
    const storedCrops = localStorage.getItem('hg_crops');
    if (storedUser) setUser(JSON.parse(storedUser));
    if (storedCrops) setCrops(JSON.parse(storedCrops));
  }, []);

  // --- Actions ---
  const handleRegister = (e) => {
    e.preventDefault();
    const newUser = { ...user, registered: true };
    setUser(newUser);
    localStorage.setItem('hg_user', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    localStorage.removeItem('hg_user');
    setUser({ name: '', phone: '', registered: false });
    window.location.reload();
  };

  const handleAddCrop = (e) => {
    e.preventDefault();
    const newCrop = { id: Date.now(), ...formData, status: 'Active', risk: 'Calculating...' };
    let updatedCrops = [...crops, newCrop];
    setCrops(updatedCrops);
    localStorage.setItem('hg_crops', JSON.stringify(updatedCrops));
    alert(lang === 'bn' ? 'ফসল সফলভাবে যোগ করা হয়েছে!' : 'Crop added successfully!');
    setActiveTab('inventory');
  };

  const exportData = () => {
    const csv = Papa.unparse(crops);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'harvest_guard_data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    if (user.registered && activeTab === 'weather') {
       fetchWeather(formData.location); 
    }
  }, [activeTab]);

  const fetchWeather = async (city) => {
    setLoading(true);
    try {
      const coords = DISTRICT_COORDS[city] || DISTRICT_COORDS["Dhaka"];
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lng}&current=temperature_2m,relative_humidity_2m&daily=precipitation_probability_max,temperature_2m_max&timezone=auto`;
      const res = await fetch(url);
      const data = await res.json();
      setWeather({
        location: city,
        temp: data.current.temperature_2m,
        humidity: data.current.relative_humidity_2m,
        rainChance: data.daily.precipitation_probability_max[0],
        maxTemp: data.daily.temperature_2m_max[0]
      });
    } catch (error) { console.error(error); }
    setLoading(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setScanImage(URL.createObjectURL(file));
      setScanResult(null);
    }
  };

  const analyzeImage = () => {
    setLoading(true);
    setTimeout(() => {
      // Select random bilingual result
      const randomResult = PEST_DATABASE[Math.floor(Math.random() * PEST_DATABASE.length)];
      setScanResult(randomResult);
      setLoading(false);
    }, 2000);
  };

  // --- Voice & Chat Logic ---
  const startListening = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.lang = lang === 'bn' ? 'bn-BD' : 'en-US';
      recognition.start();
      setIsListening(true);
      
      recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        setIsListening(false);
        handleVoiceQuery(text);
      };
      
      recognition.onerror = () => {
        setIsListening(false);
        setShowChat(true); // Fallback to chat
      };
    } else {
      setShowChat(true);
    }
  };

  const handleVoiceQuery = (text) => {
    let response = "";
    // Basic Keyword Detection for Bangla
    if (text.includes("আবহাওয়া") || text.includes("weather")) response = `${t.weather}: ${weather?.temp || 30}°C.`;
    else if (text.includes("ফসল") || text.includes("crop")) response = `${t.inventory}: ${crops.length}.`;
    else {
      response = lang === 'bn' ? "দুঃখিত, চ্যাট বক্স ব্যবহার করুন।" : "Sorry, please use the chat box.";
      setShowChat(true);
    }

    const utterance = new SpeechSynthesisUtterance(response);
    utterance.lang = lang === 'bn' ? 'bn-BD' : 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const sendChatMessage = () => {
    if (!chatInput.trim()) return;
    const newHistory = [...chatMessages, { sender: 'user', text: chatInput }];
    
    // Auto Response Logic
    let botReply = lang === 'bn' ? "ধন্যবাদ। বিষয়টি নোট করা হয়েছে।" : "Thank you. Noted.";
    if (chatInput.includes("পোকা") || chatInput.includes("pest")) 
        botReply = lang === 'bn' ? "পোকা দমনের জন্য স্ক্যানার ব্যবহার করুন।" : "Use the scanner for pest control.";
    else if (chatInput.includes("বৃষ্টি") || chatInput.includes("rain")) 
        botReply = lang === 'bn' ? "ফসল ঢেকে রাখুন।" : "Cover your crops.";

    setChatMessages([...newHistory, { sender: 'bot', text: botReply }]);
    setChatInput("");
  };

  const getAdvisory = (w) => {
    if (!w) return "";
    if (w.rainChance > 80) return t.advisoryBad;
    if (w.humidity > 80) return t.advisoryGood;
    return t.advisoryNormal;
  };

  if (!user.registered) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center p-4 font-sans">
        <motion.div initial={{scale:0.9}} animate={{scale:1}} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
          <div className="flex justify-end mb-4"><button onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')} className="flex items-center gap-1 text-xs bg-gray-100 px-3 py-1 rounded-full"><Globe size={14}/> {lang === 'bn' ? 'English' : 'বাংলা'}</button></div>
          <h2 className="text-2xl font-bold text-green-800 mb-6 text-center">{lang === 'bn' ? 'কৃষক নিবন্ধন' : 'Farmer Registration'}</h2>
          <form onSubmit={handleRegister} className="space-y-4">
             <input required type="text" placeholder={lang === 'bn' ? "আপনার নাম" : "Your Name"} className="w-full p-3 border rounded-lg" onChange={(e) => setUser({...user, name: e.target.value})} />
             <input required type="tel" placeholder={lang === 'bn' ? "মোবাইল নম্বর" : "Mobile Number"} className="w-full p-3 border rounded-lg" onChange={(e) => setUser({...user, phone: e.target.value})} />
             <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-lg font-bold">{lang === 'bn' ? "নিবন্ধন করুন" : "Register"}</button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans text-slate-900 relative">
      
      {/* Top Bar */}
      <div className="bg-green-700 text-white p-4 shadow-md sticky top-0 z-20 flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold">{t.appTitle}</h1>
          <p className="text-xs opacity-80">{t.welcome}, {user.name}</p>
        </div>
        <div className="flex gap-3">
           <button onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')} className="bg-white/20 p-2 rounded-full"><Globe size={18} /></button>
           <button onClick={handleLogout} className="bg-red-500/80 p-2 rounded-full"><LogOut size={18} /></button>
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto space-y-6">
        
        {/* --- TAB: MAP --- */}
        {activeTab === 'map' && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} className="bg-white rounded-xl shadow-sm overflow-hidden border">
             <div className="p-4 bg-green-50 border-b flex justify-between"><h2 className="font-bold text-green-900 flex gap-2"><MapPin size={18}/> {t.riskMap}</h2></div>
             <div className="relative w-full h-96 bg-blue-50 overflow-hidden" style={{ backgroundImage: 'radial-gradient(#ccc 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                <motion.div className="w-full h-full relative" drag dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }} style={{ scale: mapZoom }}>
                  <div className="absolute top-1/2 left-1/2 z-20 flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2">
                     <MapPin size={40} className="text-blue-600 fill-blue-100" /><span className="bg-blue-600 text-white text-[10px] px-1 rounded">ME</span>
                  </div>
                  {neighbors.map((n) => (
                    <div key={n.id} className="absolute flex flex-col items-center z-10" style={{ top: `${n.top}%`, left: `${n.left}%` }} onClick={() => setSelectedPin(n)}>
                      <div className={`w-4 h-4 rounded-full border-2 border-white shadow-md ${n.risk === 'High' ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                    </div>
                  ))}
                </motion.div>
                <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                  <button onClick={() => setMapZoom(z => Math.min(z + 0.2, 2))} className="w-8 h-8 bg-white rounded shadow font-bold">+</button>
                  <button onClick={() => setMapZoom(z => Math.max(z - 0.2, 0.5))} className="w-8 h-8 bg-white rounded shadow font-bold">-</button>
                </div>
             </div>
             {selectedPin && (
               <div className="p-4 bg-white border-t flex justify-between">
                  <div><h3 className="font-bold">{lang === 'bn' ? selectedPin.cropBn : selectedPin.cropEn}</h3><p className="text-xs text-gray-500">{selectedPin.updated}</p></div>
                  <div className={`px-2 py-1 rounded text-xs font-bold h-fit ${selectedPin.risk === 'High' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{selectedPin.risk}</div>
               </div>
             )}
          </motion.div>
        )}

        {/* --- TAB: SCANNER --- */}
        {activeTab === 'scanner' && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} className="bg-white p-6 rounded-xl shadow-sm">
             <h2 className="text-xl font-bold mb-4 flex gap-2"><Camera /> {t.scanTitle}</h2>
             {!scanImage ? (
               <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-green-300 rounded-xl bg-green-50 cursor-pointer">
                 <Camera size={48} className="text-green-400 mb-2" /><span className="text-sm font-medium text-green-700">{t.scanPlaceholder}</span>
                 <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
               </label>
             ) : (
               <div className="space-y-4">
                 <img src={scanImage} alt="Crop" className="w-full h-48 object-cover rounded-xl" />
                 {loading ? <div className="text-center py-4 text-green-600 animate-pulse font-bold">{t.analyzing}</div> : !scanResult ? (
                   <div className="flex gap-2">
                     <button onClick={() => setScanImage(null)} className="flex-1 py-3 border rounded-lg font-bold">{t.cancel}</button>
                     <button onClick={analyzeImage} className="flex-1 py-3 bg-green-600 text-white rounded-lg font-bold flex items-center justify-center gap-2"><Search size={18} /> {t.analyze}</button>
                   </div>
                 ) : (
                   <div className="bg-slate-50 p-4 rounded-xl border">
                      <h3 className="text-lg font-bold text-red-600 flex items-center gap-2"><AlertTriangle size={20} /> {scanResult[lang].pest}</h3>
                      <p className="text-sm font-bold mt-1">Risk: {scanResult[lang].risk}</p>
                      <div className="mt-3 bg-white p-3 rounded border-l-4 border-green-500 text-sm">
                        <p className="font-bold mb-1">Solution:</p>{scanResult[lang].solution}
                      </div>
                      <button onClick={() => setScanImage(null)} className="mt-4 w-full py-2 bg-slate-200 rounded-lg font-bold">{t.newScan}</button>
                   </div>
                 )}
               </div>
             )}
          </motion.div>
        )}

        {/* --- TAB: WEATHER --- */}
        {activeTab === 'weather' && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-4">
             <div className={`p-6 rounded-2xl shadow-lg relative overflow-hidden text-white ${weather?.rainChance > 80 ? 'bg-red-600' : 'bg-blue-600'}`}>
                <h2 className="text-xl font-bold mb-1 opacity-90">{t.weatherAlert}</h2>
                {weather ? (
                  <div>
                    <div className="flex items-end gap-2 mt-2"><p className="text-5xl font-black">{weather.temp}°C</p><p className="opacity-80 mb-2">{weather.location}</p></div>
                    <div className="mt-4 flex gap-4 text-sm bg-white/20 p-3 rounded-lg"><span className="flex gap-1 font-semibold"><Droplets size={16}/> {weather.humidity}% {t.humidity}</span><span className="flex gap-1 font-semibold"><CloudRain size={16}/> {weather.rainChance}% {t.rain}</span></div>
                  </div>
                ) : <p>Loading...</p>}
             </div>
             {weather && (
               <div className="bg-orange-50 border border-orange-200 p-5 rounded-xl flex gap-4 items-start">
                  <AlertTriangle className="text-orange-600 w-6 h-6 mt-1" />
