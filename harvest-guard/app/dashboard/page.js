'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sprout, CloudRain, Download, User, AlertTriangle, 
  CloudSun, Leaf, Droplets, MapPin, Camera, Mic, 
  Search, X, Volume2, LogOut, Globe, MessageSquare, Send
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

const STORAGE_TYPES = ["চটের বস্তা (Jute Bag)", "সাইলো (Silo)", "খোলা জায়গা (Open Area)", "প্লাস্টিক ড্রাম (Plastic Drum)", "গোলাঘর (Granary)"];

// --- DATA: CROPS (Bangla First) ---
const CROP_TYPES = [
  "ধান (Paddy)", 
  "গম (Wheat)", 
  "আলু (Potato)", 
  "ভুট্টা (Maize)", 
  "সরিষা (Mustard)",
  "বেগুন (Brinjal)",
  "টমেটো (Tomato)"
];

// --- PEST DATABASE ---
const PEST_DATABASE = [
  { 
    id: 1,
    bn: { pest: "মাজরা পোকা", risk: "উচ্চ (High)", solution: "আক্রান্ত ডালপালা ছাঁটাই করুন এবং জমিতে আলোক ফাঁদ ব্যবহার করুন। দানাদার কীটনাশক (যেমন: কার্বফুরান) প্রয়োগ করুন।" },
    en: { pest: "Stem Borer", risk: "High", solution: "Trim affected stems and use light traps. Apply granular pesticides like Carbofuran." }
  },
  { 
    id: 2,
    bn: { pest: "লেট ব্লাইট (Late Blight)", risk: "মারাত্মক (Critical)", solution: "লক্ষণ দেখা মাত্র ম্যানকোজেব জাতীয় ছত্রাকনাশক স্প্রে করুন। জমিতে সেচ দেওয়া বন্ধ রাখুন এবং আক্রান্ত গাছ পুড়িয়ে ফেলুন।" },
    en: { pest: "Late Blight", risk: "Critical", solution: "Spray Mancozeb fungicide immediately. Stop irrigation and burn affected plants." }
  },
  { 
    id: 3,
    bn: { pest: "জাব পোকা (Aphids)", risk: "মাঝারি (Medium)", solution: "নিম তেল অথবা সাবান পানি (১০ লিটার পানিতে ২ চামচ) স্প্রে করুন। লেডি বার্ড বিটল পোকা সংরক্ষণ করুন।" },
    en: { pest: "Aphids", risk: "Medium", solution: "Spray Neem oil or soapy water. Conserve Lady Bird Beetles." }
  }
];

// --- TRANSLATIONS ---
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
    chatPlaceholder: "আপনার প্রশ্ন লিখুন...",
    advisory: "পরামর্শ (Smart Alert)",
    humidity: "আর্দ্রতা",
    rain: "বৃষ্টি",
    newScan: "নতুন ছবি",
    weight: "ওজন (kg)",
    date: "তারিখ",
    emptyList: "কোন তথ্য পাওয়া যায়নি। নতুন ফসল যোগ করুন।",
    mapPopupRisk: "ঝুঁকি",
    mapPopupCrop: "ফসল",
    mapPopupTime: "আপডেট",
    weatherBad: "সতর্কতা: আগামীকাল বৃষ্টি ৮৫% → আজই ফসল ঢেকে রাখুন!",
    weatherNormal: "আবহাওয়া স্বাভাবিক আছে। নিয়মিত পর্যবেক্ষণ করুন।"
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
    advisory: "Advisory (Smart Alert)",
    humidity: "Humidity",
    rain: "Rain",
    newScan: "New Scan",
    weight: "Weight (kg)",
    date: "Date",
    emptyList: "No data found. Add new crop.",
    mapPopupRisk: "Risk",
    mapPopupCrop: "Crop",
    mapPopupTime: "Updated",
    weatherBad: "Warning: Rain expected (85%). Cover crops immediately!",
    weatherNormal: "Weather is normal. Monitor regularly."
  }
};

const generateNeighbors = () => {
  return Array.from({ length: 12 }).map((_, i) => ({
    id: i,
    top: 20 + Math.random() * 60,
    left: 10 + Math.random() * 80,
    risk: Math.random() > 0.6 ? 'High' : 'Low',
    crop: Math.random() > 0.5 ? 'ধান (Paddy)' : 'গম (Wheat)',
    updated: `${Math.floor(Math.random() * 5) + 1} ঘণ্টা আগে`
  }));
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('inventory'); // Default tab is now INVENTORY
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState('bn');
  const t = TRANSLATIONS[lang];
  
  const [user, setUser] = useState({ name: '', phone: '', registered: false });
  const [crops, setCrops] = useState([]);
  const [weather, setWeather] = useState(null);
  
  const [neighbors] = useState(generateNeighbors());
  const [selectedPin, setSelectedPin] = useState(null);
  const [mapZoom, setMapZoom] = useState(1);
  const [scanImage, setScanImage] = useState(null);
  const [scanResult, setScanResult] = useState(null);

  const [isListening, setIsListening] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");

  const [formData, setFormData] = useState({
    cropType: 'ধান (Paddy)',
    weight: '',
    date: '',
    location: 'Dhaka',
    storage: 'চটের বস্তা (Jute Bag)'
  });

  useEffect(() => {
    setChatMessages([{ sender: 'bot', text: lang === 'bn' ? 'আমি কৃষি সহকারী। আপনার কি সাহায্য দরকার?' : 'I am Agri Assistant. How can I help?' }]);
  }, [lang]);

  useEffect(() => {
    const storedUser = localStorage.getItem('hg_user');
    const storedCrops = localStorage.getItem('hg_crops');
    if (storedUser) setUser(JSON.parse(storedUser));
    if (storedCrops) setCrops(JSON.parse(storedCrops));
  }, []);

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
    setActiveTab('inventory'); // Go back to list after adding
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
    if (user.registered) {
       // Always fetch weather for the farmer's location if registered
       fetchWeather(formData.location); 
    }
  }, [user.registered]);

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

      // B2: SMS SIMULATION
      if (data.daily.precipitation_probability_max[0] > 80) {
        console.log(`%c[SMS ALERT]: Critical Weather! Cover crops.`, "color: red; font-size: 14px;");
      }

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
      const randomResult = PEST_DATABASE[Math.floor(Math.random() * PEST_DATABASE.length)];
      setScanResult(randomResult);
      setLoading(false);
    }, 2000);
  };

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
        setShowChat(true); 
      };
    } else {
      setShowChat(true);
    }
  };

  // --- IMPROVED VOICE RESPONSE ---
  const handleVoiceQuery = (text) => {
    const lower = text.toLowerCase();
    let response = "";
    let understood = false;

    // List all unique crop names
    const cropNames = [...new Set(crops.map(c => c.cropType))].join(", ");

    if (lower.includes("অবস্থা") || lower.includes("status")) {
        understood = true;
        if (crops.length > 0) {
            response = lang === 'bn' 
              ? `আপনার ইনভেন্টরিতে ${crops.length}টি ব্যাচ আছে। ফসলগুলো হলো: ${cropNames}।` 
              : `You have ${crops.length} batches. Crops include: ${cropNames}.`;
        } else {
            response = lang === 'bn' ? "আপনার কোনো ফসল সংরক্ষিত নেই।" : "No crops found.";
        }
    } 
    else if (lower.includes("আবহাওয়া") || lower.includes("weather")) {
        understood = true;
        response = lang === 'bn' 
          ? `তাপমাত্রা ${weather?.temp || 30} ডিগ্রি সেলসিয়াস।` 
          : `Temperature is ${weather?.temp || 30} degrees.`;
    }

    if (understood) {
        const utterance = new SpeechSynthesisUtterance(response);
        utterance.lang = lang === 'bn' ? 'bn-BD' : 'en-US';
        window.speechSynthesis.speak(utterance);
    } else {
        setShowChat(true);
    }
  };

  const sendChatMessage = () => {
    if (!chatInput.trim()) return;
    const newHistory = [...chatMessages, { sender: 'user', text: chatInput }];
    const lowerInput = chatInput.toLowerCase();
    
    let botReply = lang === 'bn' ? "দুঃখিত, আমি বুঝতে পারিনি।" : "Sorry, I didn't understand.";

    if (lang === 'bn') {
        if (lowerInput.includes("পোকা") || lowerInput.includes("রোগ")) botReply = "পোকা দমনের জন্য 'স্ক্যানার' ব্যবহার করুন।";
        else if (lowerInput.includes("বৃষ্টি") || lowerInput.includes("আবহাওয়া")) botReply = "বৃষ্টির সম্ভাবনা থাকলে ফসল ঢেকে রাখুন।";
        else if (lowerInput.includes("অবস্থা") || lowerInput.includes("ফসল")) {
             botReply = crops.length > 0 ? `আপনার ${crops.length}টি ব্যাচ আছে।` : "কোনো ফসল নেই।";
        }
    }

    setChatMessages([...newHistory, { sender: 'bot', text: botReply }]);
    setChatInput("");
  };

  // --- B2: STRICT SMART ALERT LOGIC ---
  const getAdvisory = (w) => {
    if (!w) return "";
    
    // Check Crops
    const hasPotato = crops.some(c => c.cropType.includes("Potato") || c.cropType.includes("আলু"));
    const hasBrinjal = crops.some(c => c.cropType.includes("Brinjal") || c.cropType.includes("বেগুন"));
    const hasPaddy = crops.some(c => c.cropType.includes("Paddy") || c.cropType.includes("ধান"));

    // 1. POTATO + High Humidity (PDF Example)
    if (hasPotato && w.humidity > 80) {
        return lang === 'bn' 
          ? "সতর্কতা: আগামীকাল বৃষ্টি হবে এবং আপনার আলুর গুদামে আর্দ্রতা বেশি। এখনই ফ্যান চালু করুন।" 
          : "Warning: High humidity in Potato storage. Turn on fans immediately.";
    }

    // 2. BRINJAL + High Rain (Specific Crop Logic)
    if (hasBrinjal && w.rainChance > 50) {
        return lang === 'bn'
          ? "সতর্কতা: বেগুনের জমিতে পানি জমতে দেবেন না। ছত্রাকনাশক স্প্রে করুন।"
          : "Warning: Avoid water logging for Brinjal. Spray fungicides.";
    }

    // 3. PADDY + Rain
    if (hasPaddy && w.rainChance > 70) {
        return lang === 'bn'
          ? "সতর্কতা: ধান শুকাতে সমস্যা হতে পারে। পলিথিন দিয়ে ঢেকে রাখুন।"
          : "Warning: Cover paddy with polythene to prevent moisture.";
    }

    // 4. GENERAL BAD WEATHER (Fallback)
    if (w.rainChance > 80) {
        return lang === 'bn' ? t.weatherBad : "Warning: Heavy rain expected!";
    }
    
    return lang === 'bn' ? t.weatherNormal : "Weather is normal.";
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
             <AnimatePresence>
               {selectedPin && (
                 <motion.div initial={{y:20, opacity:0}} animate={{y:0, opacity:1}} exit={{y:20, opacity:0}} className="p-4 bg-white border-t flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-slate-800">{t.mapPopupCrop}: {selectedPin.crop}</h3>
                      <p className="text-xs text-gray-500">{t.mapPopupTime}: {selectedPin.updated}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${selectedPin.risk === 'High' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {t.mapPopupRisk}: {selectedPin.risk}
                    </div>
                 </motion.div>
               )}
             </AnimatePresence>
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

        {/* --- TAB: WEATHER (Updated Logic) --- */}
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
                  <div><h3 className="font-bold text-orange-900 text-lg">{t.advisory}</h3><p className="text-gray-800 mt-1">{getAdvisory(weather)}</p></div>
               </div>
             )}
          </motion.div>
        )}

        {/* --- TAB: INVENTORY (Default view) --- */}
        {activeTab === 'inventory' && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800">{t.inventory} ({crops.length})</h2>
            {crops.length === 0 && <p className="text-gray-400 text-center py-10">{t.emptyList}</p>}
            
            {/* INVENTORY LIST */}
            {crops.map((crop) => (
               <div key={crop.id} className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-green-500">
                  <h3 className="font-bold text-lg">{crop.cropType}</h3>
                  <div className="text-sm text-gray-500 grid grid-cols-2 gap-2 mt-2"><p>⚖️ {crop.weight} kg</p><p>📅 {crop.date}</p><p>📍 {crop.location}</p><p>🏠 {crop.storage}</p></div>
               </div>
            ))}
          </motion.div>
        )}

        {/* --- TAB: ADD CROP (Separate from Inventory) --- */}
        {activeTab === 'add' && (
           <div className="bg-white p-6 rounded-xl shadow-sm">
             <h2 className="text-xl font-bold mb-4">{t.addCropTitle}</h2>
             <form onSubmit={handleAddCrop} className="space-y-4">
               <select className="w-full p-3 border rounded bg-gray-50" onChange={(e) => setFormData({...formData, cropType: e.target.value})}>
                 {CROP_TYPES.map((c, i) => <option key={i} value={c}>{c}</option>)}
               </select>
               <input required type="number" placeholder={t.weight} className="w-full p-3 border rounded" onChange={(e) => setFormData({...formData, weight: e.target.value})} />
               <input required type="date" className="w-full p-3 border rounded" onChange={(e) => setFormData({...formData, date: e.target.value})} />
               <select className="w-full p-3 border rounded" onChange={(e) => setFormData({...formData, location: e.target.value})}>{Object.keys(DISTRICT_COORDS).map(d => <option key={d} value={d}>{d}</option>)}</select>
               <select className="w-full p-3 border rounded" onChange={(e) => setFormData({...formData, storage: e.target.value})}>{STORAGE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select>
               <button className="w-full bg-green-600 text-white font-bold py-3 rounded">{t.save}</button>
             </form>
           </div>
        )}

        {/* --- TAB: PROFILE --- */}
        {activeTab === 'profile' && (
           <div className="bg-white p-6 rounded-xl shadow-sm text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><User size={40} className="text-green-600"/></div>
              <h2 className="text-xl font-bold">{user.name}</h2>
              <p className="text-gray-500">{user.phone}</p>
              <button onClick={handleLogout} className="mt-6 bg-red-100 text-red-600 px-6 py-2 rounded-full font-bold flex items-center gap-2 mx-auto"><LogOut size={16}/> {t.logout}</button>
           </div>
        )}

      </div>

      {/* --- Floating Voice Button --- */}
      <button onClick={startListening} className={`fixed bottom-24 right-4 p-4 rounded-full shadow-xl z-30 transition-all ${isListening ? 'bg-red-500 scale-110' : 'bg-blue-600' } text-white`}>
        {isListening ? <Volume2 className="animate-pulse" /> : <Mic />}
      </button>

      {/* --- Chat Box --- */}
      <AnimatePresence>
        {showChat && (
          <motion.div 
            initial={{y:100}} animate={{y:0}} exit={{y:100}} 
            className="fixed bottom-0 left-0 w-full bg-white rounded-t-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-[60] p-4 border-t border-green-200"
          >
             <div className="flex justify-between items-center mb-2 border-b pb-2">
                <h3 className="font-bold text-green-800 flex items-center gap-2"><MessageSquare size={18}/> {t.chatTitle}</h3>
                <button onClick={() => setShowChat(false)}><X size={20} className="text-gray-500"/></button>
             </div>
             <div className="h-40 overflow-y-auto mb-3 space-y-2 bg-gray-50 p-2 rounded">
               {chatMessages.map((msg, i) => (
                 <div key={i} className={`p-2 rounded-lg text-sm max-w-[80%] ${msg.sender === 'user' ? 'bg-blue-100 ml-auto' : 'bg-green-100'}`}>{msg.text}</div>
               ))}
             </div>
             <div className="flex gap-2">
               <input 
                 type="text" 
                 value={chatInput} 
                 onChange={(e) => setChatInput(e.target.value)} 
                 placeholder={t.chatPlaceholder} 
                 className="flex-1 border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" 
               />
               <button onClick={sendChatMessage} className="bg-green-600 text-white px-4 rounded-lg"><Send size={20} /></button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Bottom Nav --- */}
      <div className="fixed bottom-0 w-full bg-white border-t flex justify-around py-2 pb-5 text-gray-500 text-xs font-medium z-50">
        <button onClick={() => setActiveTab('map')} className={`flex flex-col items-center p-2 ${activeTab === 'map' ? 'text-green-600' : ''}`}><MapPin size={24} /> {t.map}</button>
        <button onClick={() => setActiveTab('weather')} className={`flex flex-col items-center p-2 ${activeTab === 'weather' ? 'text-green-600' : ''}`}><CloudSun size={24} /> {t.weather}</button>
        <button onClick={() => setActiveTab('add')} className="relative"><div className="bg-green-600 text-white p-3 rounded-full -mt-6 shadow-lg border-4 border-slate-50"><Sprout size={24} /></div></button>
        <button onClick={() => setActiveTab('scanner')} className={`flex flex-col items-center p-2 ${activeTab === 'scanner' ? 'text-green-600' : ''}`}><Camera size={24} /> {t.scanner}</button>
        <button onClick={() => setActiveTab('inventory')} className={`flex flex-col items-center p-2 ${activeTab === 'inventory' ? 'text-green-600' : ''}`}><Leaf size={24} /> {t.inventory}</button>
        <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center p-2 ${activeTab === 'profile' ? 'text-green-600' : ''}`}><User size={24} /> {t.profile}</button>
      </div>
    </div>
  );
}
