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

// --- DATA: CROPS ---
const CROP_TYPES = [
  "ধান (Paddy)", 
  "গম (Wheat)", 
  "আলু (Potato)", 
  "ভুট্টা (Maize)", 
  "সরিষা (Mustard)",
  "বেগুন (Brinjal)",
  "টমেটো (Tomato)"
];

// --- VISUALS: Fixed Image Links ---
const getCropImage = (cropName) => {
  if (!cropName) return "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=150&q=80";
  // Fixed Maize Image
  if (cropName.includes('Maize') || cropName.includes('ভুট্টা')) return "https://images.unsplash.com/photo-1601648764658-cf3a18353244?w=150&q=80";
  if (cropName.includes('Paddy') || cropName.includes('ধান')) return "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=150&q=80";
  if (cropName.includes('Wheat') || cropName.includes('গম')) return "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=150&q=80";
  if (cropName.includes('Potato') || cropName.includes('আলু')) return "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=150&q=80";
  if (cropName.includes('Tomato') || cropName.includes('টমেটো')) return "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=150&q=80";
  if (cropName.includes('Brinjal') || cropName.includes('বেগুন')) return "https://images.unsplash.com/photo-1615485499738-4c4b57422b78?w=150&q=80";
  return "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=150&q=80"; 
};

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
  const [activeTab, setActiveTab] = useState('inventory');
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState('bn');
  const t = TRANSLATIONS[lang];
  
  const [user, setUser] = useState({ name: '', phone: '', district: 'Dhaka', registered: false });
  const [crops, setCrops] = useState([]);
  const [weather, setWeather] = useState(null);
  const [neighbors, setNeighbors] = useState([]); 
  
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

  useEffect(() => { setNeighbors(generateNeighbors()); }, []);

  useEffect(() => {
    const loadVoices = () => { window.speechSynthesis.getVoices(); };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  useEffect(() => {
    setChatMessages([{ sender: 'bot', text: lang === 'bn' ? 'আমি কৃষি সহকারী। আপনার কি সাহায্য দরকার?' : 'I am Agri Assistant. How can I help?' }]);
  }, [lang]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('hg_user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            if (!parsedUser.district) parsedUser.district = 'Dhaka';
            
            setUser(parsedUser);
            const userCropsKey = `hg_crops_${parsedUser.phone}`;
            const storedCrops = localStorage.getItem(userCropsKey);
            if (storedCrops) setCrops(JSON.parse(storedCrops));
            else setCrops([]); 
            
            fetchWeather(parsedUser.district);
        }
    }
  }, []);

  const handleRegister = (e) => {
    e.preventDefault();
    const newUser = { ...user, registered: true };
    setUser(newUser);
    localStorage.setItem('hg_user', JSON.stringify(newUser));
    
    const userCropsKey = `hg_crops_${newUser.phone}`;
    const existingCrops = localStorage.getItem(userCropsKey);
    if (existingCrops) setCrops(JSON.parse(existingCrops));
    else setCrops([]);
    
    fetchWeather(newUser.district);
  };

  const handleLogout = () => {
    localStorage.removeItem('hg_user');
    setUser({ name: '', phone: '', district: 'Dhaka', registered: false });
    setCrops([]); 
    window.location.reload();
  };

  const handleAddCrop = (e) => {
    e.preventDefault();
    const newCrop = { id: Date.now(), ...formData, status: 'Active', risk: 'Calculating...' };
    let updatedCrops = [...crops, newCrop];
    setCrops(updatedCrops);
    localStorage.setItem(`hg_crops_${user.phone}`, JSON.stringify(updatedCrops));
    fetchWeather(formData.location);
    alert(lang === 'bn' ? 'ফসল সফলভাবে যোগ করা হয়েছে!' : 'Crop added successfully!');
    setActiveTab('inventory'); 
  };

  const exportData = () => {
    const csv = Papa.unparse(crops);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `harvest_guard_${user.phone}.csv`); 
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    if (user.registered && activeTab === 'weather') {
       fetchWeather(user.district); 
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

  const speakText = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'bn' ? 'bn-BD' : 'en-US';
    if (lang === 'bn') {
        const voices = window.speechSynthesis.getVoices();
        const banglaVoice = voices.find(v => v.lang.includes('bn') || v.name.includes('Bangla') || v.name.includes('Bengali'));
        if (banglaVoice) utterance.voice = banglaVoice;
    }
    window.speechSynthesis.speak(utterance);
  };

  const handleVoiceQuery = (text) => {
    const lower = text.toLowerCase();
    let response = "";
    let understood = false;

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
        speakText(response);
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

  // --- FIXED: WEATHER ADVISORY & ALERTS ---
  const getAdvisory = (w) => {
    if (!w) return "";
    
    const hasPotato = crops.some(c => c.cropType.includes("Potato") || c.cropType.includes("আলু"));
    const hasBrinjal = crops.some(c => c.cropType.includes("Brinjal") || c.cropType.includes("বেগুন"));
    const hasPaddy = crops.some(c => c.cropType.includes("Paddy") || c.cropType.includes("ধান"));

    // 1. Potato - High Humidity (Lowered threshold to 60 for demo)
    if (hasPotato && w.humidity > 60) return lang === 'bn' ? "সতর্কতা: আগামীকাল বৃষ্টি হবে এবং আপনার আলুর গুদামে আর্দ্রতা বেশি। এখনই ফ্যান চালু করুন।" : "Warning: High humidity in Potato storage. Turn on fans immediately.";
    
    // 2. Brinjal - Rain (Lowered threshold to 40 for demo)
    if (hasBrinjal && w.rainChance > 40) return lang === 'bn' ? "সতর্কতা: বেগুনের জমিতে পানি জমতে দেবেন না। ছত্রাকনাশক স্প্রে করুন।" : "Warning: Avoid water logging for Brinjal. Spray fungicides.";
    
    // 3. Paddy - Rain
    if (hasPaddy && w.rainChance > 60) return lang === 'bn' ? "সতর্কতা: ধান শুকাতে সমস্যা হতে পারে। পলিথিন দিয়ে ঢেকে রাখুন।" : "Warning: Cover paddy with polythene to prevent moisture.";
    
    // 4. General Rain Alert
    if (w.rainChance > 80) return lang === 'bn' ? t.weatherBad : "Warning: Heavy rain expected!";
    
    // 5. Default
    return lang === 'bn' ? t.weatherNormal : "Weather is normal.";
  };

  if (!user.registered) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4 font-sans bg-slate-100">
        <div className="absolute inset-0 z-0">
           {/* FIX: Reliable Background Image */}
           <img src="https://images.unsplash.com/photo-1625246333195-58197bd47f3b?auto=format&fit=crop&q=80&w=1920" className="w-full h-full object-cover opacity-20" alt="Farm Background" />
           <div className="absolute inset-0 bg-gradient-to-t from-green-50/90 to-transparent" />
        </div>

        <motion.div initial={{scale:0.9, opacity: 0}} animate={{scale:1, opacity: 1}} className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-md z-10 border border-white/50">
          <div className="flex justify-end mb-4"><button onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')} className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold shadow-sm hover:bg-green-200"><Globe size={14}/> {lang === 'bn' ? 'English' : 'বাংলা'}</button></div>
          <div className="text-center mb-8">
             <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg text-white">
               <Sprout size={32} />
             </div>
             <h2 className="text-3xl font-black text-green-800">{lang === 'bn' ? 'কৃষক নিবন্ধন' : 'Farmer Registration'}</h2>
             <p className="text-sm text-gray-500 mt-2">Join HarvestGuard Today</p>
          </div>
          <form onSubmit={handleRegister} className="space-y-4">
             <div className="relative">
               <User className="absolute left-3 top-3.5 text-gray-400" size={20} />
               <input required type="text" placeholder={lang === 'bn' ? "আপনার নাম" : "Your Name"} className="w-full pl-10 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none bg-white/50" onChange={(e) => setUser({...user, name: e.target.value})} />
             </div>
             <div className="relative">
               <Mic className="absolute left-3 top-3.5 text-gray-400" size={20} />
               <input required type="tel" placeholder={lang === 'bn' ? "মোবাইল নম্বর" : "Mobile Number"} className="w-full pl-10 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none bg-white/50" onChange={(e) => setUser({...user, phone: e.target.value})} />
             </div>
             <div className="relative">
               <MapPin className="absolute left-3 top-3.5 text-gray-400" size={20} />
               <select className="w-full pl-10 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none bg-white/50 text-gray-700" onChange={(e) => setUser({...user, district: e.target.value})}>
                  <option value="Dhaka">Select District (জেলা)</option>
                  {Object.keys(DISTRICT_COORDS).map(d => <option key={d} value={d}>{d}</option>)}
               </select>
             </div>
             <button type="submit" className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-4 rounded-xl font-bold shadow-lg transform active:scale-95 transition-all">{lang === 'bn' ? "নিবন্ধন করুন" : "Register"}</button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans text-slate-900 relative overflow-hidden">
      
      {/* Background Visual */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <img src="https://images.unsplash.com/photo-1625246333195-58197bd47f3b?auto=format&fit=crop&q=80&w=1920" className="w-full h-full object-cover opacity-5" alt="Pattern" />
      </div>

      {/* Top Bar (Glassmorphism) */}
      <div className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-green-100 p-4 shadow-sm z-30 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-green-100 p-2 rounded-lg text-green-700"><Sprout size={20} /></div>
          <div>
            <h1 className="text-lg font-black text-green-900 leading-none">{t.appTitle}</h1>
            <p className="text-xs font-medium text-green-600 mt-1">{t.welcome}, {user.name}</p>
          </div>
        </div>
        <div className="flex gap-2">
           <button onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')} className="bg-slate-100 hover:bg-slate-200 p-2.5 rounded-full transition-colors"><Globe size={18} className="text-slate-600"/></button>
           <button onClick={handleLogout} className="bg-red-50 hover:bg-red-100 p-2.5 rounded-full transition-colors"><LogOut size={18} className="text-red-500"/></button>
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto space-y-6 pt-24 relative z-10">
        
        {/* --- TAB: MAP --- */}
        {activeTab === 'map' && (
          <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
             <div className="p-4 bg-gradient-to-r from-green-50 to-white border-b flex justify-between"><h2 className="font-bold text-green-900 flex gap-2"><MapPin size={18}/> {t.riskMap}</h2></div>
             <div className="relative w-full h-96 bg-blue-50/50 overflow-hidden" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                <motion.div className="w-full h-full relative" drag dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }} style={{ scale: mapZoom }}>
                  <div className="absolute top-1/2 left-1/2 z-20 flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2">
                     <div className="relative">
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-ping"></span>
                        <MapPin size={48} className="text-blue-600 fill-white drop-shadow-xl" />
                     </div>
                     <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg mt-1">ME</span>
                  </div>
                  {neighbors.map((n) => (
                    <div key={n.id} className="absolute flex flex-col items-center z-10 hover:scale-110 transition-transform cursor-pointer" style={{ top: `${n.top}%`, left: `${n.left}%` }} onClick={() => setSelectedPin(n)}>
                      <div className={`w-6 h-6 rounded-full border-4 border-white shadow-lg ${n.risk === 'High' ? 'bg-red-500' : 'bg-green-500'}`} />
                    </div>
                  ))}
                </motion.div>
                <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                  <button onClick={() => setMapZoom(z => Math.min(z + 0.2, 2))} className="w-10 h-10 bg-white rounded-xl shadow-lg font-bold text-xl text-gray-600 active:scale-95 transition-transform">+</button>
                  <button onClick={() => setMapZoom(z => Math.max(z - 0.2, 0.5))} className="w-10 h-10 bg-white rounded-xl shadow-lg font-bold text-xl text-gray-600 active:scale-95 transition-transform">-</button>
                </div>
             </div>
             <AnimatePresence>
               {selectedPin && (
                 <motion.div initial={{y:20, opacity:0}} animate={{y:0, opacity:1}} exit={{y:20, opacity:0}} className="p-4 bg-white/90 backdrop-blur border-t flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg">{t.mapPopupCrop}: {selectedPin.crop}</h3>
                      <p className="text-xs font-medium text-gray-500 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-300"></span> {t.mapPopupTime}: {selectedPin.updated}</p>
                    </div>
                    <div className={`px-4 py-1.5 rounded-full text-xs font-bold border ${selectedPin.risk === 'High' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-green-50 border-green-200 text-green-600'}`}>
                      {t.mapPopupRisk}: {selectedPin.risk}
                    </div>
                 </motion.div>
               )}
             </AnimatePresence>
          </motion.div>
        )}

        {/* --- TAB: SCANNER --- */}
        {activeTab === 'scanner' && (
          <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100">
             <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-800"><Camera className="text-green-600"/> {t.scanTitle}</h2>
             {!scanImage ? (
               <label className="group flex flex-col items-center justify-center h-64 border-2 border-dashed border-green-200 rounded-2xl bg-green-50/50 cursor-pointer hover:bg-green-50 hover:border-green-400 transition-all">
                 <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform">
                    <Camera size={32} className="text-green-500" />
                 </div>
                 <span className="text-sm font-semibold text-green-700">{t.scanPlaceholder}</span>
                 <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
               </label>
             ) : (
               <div className="space-y-4">
                 <div className="relative rounded-2xl overflow-hidden shadow-lg group">
                    <img src={scanImage} alt="Crop" className="w-full h-56 object-cover" />
                    {loading && (
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                            <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                            <p className="text-white font-bold animate-pulse">{t.analyzing}</p>
                        </div>
                    )}
                 </div>
                 
                 {!loading && !scanResult && (
                   <div className="flex gap-3">
                     <button onClick={() => setScanImage(null)} className="flex-1 py-3.5 border-2 border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50">{t.cancel}</button>
                     <button onClick={analyzeImage} className="flex-1 py-3.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-200"><Search size={18} /> {t.analyze}</button>
                   </div>
                 )}

                 {scanResult && (
                   <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                      <div className={`p-4 ${scanResult[lang].risk.includes("High") || scanResult[lang].risk.includes("Critical") ? "bg-red-50" : "bg-orange-50"} border-b border-slate-100 flex items-start gap-3`}>
                         <div className={`p-2 rounded-full ${scanResult[lang].risk.includes("High") ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"}`}><AlertTriangle size={24}/></div>
                         <div>
                            <h3 className="text-lg font-bold text-slate-800">{scanResult[lang].pest}</h3>
                            <p className="text-sm font-semibold text-slate-500 mt-0.5">Risk Level: <span className={scanResult[lang].risk.includes("High") ? "text-red-600" : "text-orange-600"}>{scanResult[lang].risk}</span></p>
                         </div>
                      </div>
                      <div className="p-5">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Recommended Action</h4>
                        <p className="text-slate-700 leading-relaxed font-medium bg-slate-50 p-3 rounded-lg border border-slate-100">{scanResult[lang].solution}</p>
                        <button onClick={() => setScanImage(null)} className="mt-5 w-full py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold">{t.newScan}</button>
                      </div>
                   </div>
                 )}
               </div>
             )}
          </motion.div>
        )}

        {/* --- TAB: WEATHER --- */}
        {activeTab === 'weather' && (
          <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="space-y-4">
             <div className={`p-6 rounded-3xl shadow-xl relative overflow-hidden text-white ${weather?.rainChance > 80 ? 'bg-gradient-to-br from-slate-700 to-slate-900' : 'bg-gradient-to-br from-blue-500 to-cyan-400'}`}>
                {/* Weather Background Graphics */}
                <div className="absolute top-0 right-0 p-8 opacity-20 transform translate-x-4 -translate-y-4">
                    {weather?.rainChance > 50 ? <CloudRain size={120} /> : <CloudSun size={120} />}
                </div>
                
                <h2 className="text-sm font-bold uppercase tracking-widest opacity-80 mb-6 flex items-center gap-2"><MapPin size={14}/> {weather?.location || "Loading..."}</h2>
                
                {weather ? (
                  <div>
                    <div className="flex items-start gap-4">
                        <span className="text-7xl font-black tracking-tighter">{weather.temp}°</span>
                        <div className="mt-2">
                            <p className="text-lg font-medium opacity-90">{t.weatherAlert}</p>
                            <p className="text-sm opacity-70">{new Date().toLocaleDateString()}</p>
                        </div>
                    </div>
                    <div className="mt-8 flex gap-4">
                         <div className="flex-1 bg-white/20 backdrop-blur-md rounded-2xl p-3 flex flex-col items-center">
                            <Droplets size={20} className="mb-1 opacity-80"/>
                            <span className="text-sm opacity-70">{t.humidity}</span>
                            <span className="font-bold text-lg">{weather.humidity}%</span>
                         </div>
                         <div className="flex-1 bg-white/20 backdrop-blur-md rounded-2xl p-3 flex flex-col items-center">
                            <CloudRain size={20} className="mb-1 opacity-80"/>
                            <span className="text-sm opacity-70">{t.rain}</span>
                            <span className="font-bold text-lg">{weather.rainChance}%</span>
                         </div>
                    </div>
                  </div>
                ) : <div className="h-40 flex items-center justify-center"><div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"/></div>}
             </div>
             
             {weather && (
               <div className="bg-white border border-orange-100 p-5 rounded-2xl flex gap-4 items-start shadow-sm ring-1 ring-orange-50">
                  <div className="bg-orange-100 p-2.5 rounded-full text-orange-600"><AlertTriangle size={20} /></div>
                  <div>
                    <h3 className="font-bold text-orange-900 text-lg">{t.advisory}</h3>
                    <p className="text-slate-600 mt-1 leading-relaxed font-medium">{getAdvisory(weather)}</p>
                  </div>
               </div>
             )}
          </motion.div>
        )}

        {/* --- TAB: INVENTORY --- */}
        {activeTab === 'inventory' && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-800">{t.inventory}</h2>
                <span className="bg-green-100 text-green-800 font-bold px-3 py-1 rounded-full text-xs">{crops.length} Items</span>
            </div>
            
            {crops.length === 0 && (
                <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4"><Leaf className="text-slate-300" size={32}/></div>
                    <p className="text-slate-400 font-medium">{t.emptyList}</p>
                </div>
            )}
            
            <div className="space-y-3">
            {crops.map((crop) => (
               <motion.div initial={{y:10, opacity:0}} animate={{y:0, opacity:1}} key={crop.id} className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                  <img src={getCropImage(crop.cropType)} className="w-20 h-20 rounded-xl object-cover shadow-sm bg-gray-100" alt="Crop" />
                  <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-slate-800 text-lg">{crop.cropType}</h3>
                        <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{crop.storage.split(' ')[0]}</span>
                      </div>
                      <div className="text-xs text-slate-500 grid grid-cols-2 gap-y-1">
                        <p className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span> {crop.weight} kg</p>
                        <p className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span> {crop.date}</p>
                        <p className="col-span-2 text-green-600 font-medium flex items-center gap-1"><MapPin size={10}/> {crop.location}</p>
                      </div>
                  </div>
               </motion.div>
            ))}
            </div>
          </motion.div>
        )}

        {/* --- TAB: ADD CROP --- */}
        {activeTab === 'add' && (
           <motion.div initial={{scale:0.95, opacity:0}} animate={{scale:1, opacity:1}} className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100">
             <h2 className="text-2xl font-bold mb-6 text-slate-800">{t.addCropTitle}</h2>
             <form onSubmit={handleAddCrop} className="space-y-5">
               <div>
                   <label className="text-xs font-bold text-slate-400 uppercase ml-1 mb-1 block">Crop Type</label>
                   <select className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-green-500 outline-none font-medium" 
                           value={formData.cropType} 
                           onChange={(e) => setFormData({...formData, cropType: e.target.value})}>
                     {CROP_TYPES.map((c, i) => <option key={i} value={c}>{c}</option>)}
                   </select>
               </div>
               <div className="grid grid-cols-2 gap-4">
                   <div>
                       <label className="text-xs font-bold text-slate-400 uppercase ml-1 mb-1 block">Weight</label>
                       <input required type="number" placeholder="kg" className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-green-500 outline-none" onChange={(e) => setFormData({...formData, weight: e.target.value})} />
                   </div>
                   <div>
                       <label className="text-xs font-bold text-slate-400 uppercase ml-1 mb-1 block">Date</label>
                       <input required type="date" className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-green-500 outline-none" onChange={(e) => setFormData({...formData, date: e.target.value})} />
                   </div>
               </div>
               <div>
                   <label className="text-xs font-bold text-slate-400 uppercase ml-1 mb-1 block">Location</label>
                   <select className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-green-500 outline-none" onChange={(e) => setFormData({...formData, location: e.target.value})}>{Object.keys(DISTRICT_COORDS).map(d => <option key={d} value={d}>{d}</option>)}</select>
               </div>
               <div>
                   <label className="text-xs font-bold text-slate-400 uppercase ml-1 mb-1 block">Storage Method</label>
                   <select className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-green-500 outline-none" onChange={(e) => setFormData({...formData, storage: e.target.value})}>{STORAGE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select>
               </div>
               <button className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-green-200 active:scale-95 transition-all">{t.save}</button>
             </form>
           </motion.div>
        )}

        {/* --- TAB: PROFILE --- */}
        {activeTab === 'profile' && (
           <motion.div initial={{opacity:0}} animate={{opacity:1}} className="bg-white p-8 rounded-3xl shadow-xl text-center border border-slate-100">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <User size={48} className="text-green-600"/>
              </div>
              <h2 className="text-3xl font-black text-slate-800">{user.name}</h2>
              <p className="text-slate-500 font-medium text-lg mt-1">{user.phone}</p>
              
              <div className="mt-8 grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl">
                      <p className="text-2xl font-black text-slate-800">{crops.length}</p>
                      <p className="text-xs text-slate-500 uppercase font-bold">Batches</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl">
                      <p className="text-2xl font-black text-slate-800">{user.district}</p>
                      <p className="text-xs text-slate-500 uppercase font-bold">Region</p>
                  </div>
              </div>

              <button onClick={handleLogout} className="mt-8 w-full bg-red-50 hover:bg-red-100 text-red-600 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"><LogOut size={20}/> {t.logout}</button>
           </motion.div>
        )}

      </div>

      {/* --- Floating Voice Button --- */}
      <button onClick={startListening} className={`fixed bottom-24 right-4 p-4 rounded-full shadow-xl z-30 transition-all border-4 border-white ${isListening ? 'bg-red-500 scale-110 shadow-red-300' : 'bg-green-600 hover:bg-green-700 shadow-green-300' } text-white`}>
        {isListening ? <Volume2 className="animate-pulse" /> : <Mic />}
      </button>

      {/* --- Chat Box --- */}
      <AnimatePresence>
        {showChat && (
          <motion.div 
            initial={{y:100}} animate={{y:0}} exit={{y:100}} 
            className="fixed bottom-0 left-0 w-full bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.15)] z-[60] p-5 border-t border-slate-100"
          >
             <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 flex items-center gap-2"><MessageSquare size={20} className="text-green-600"/> {t.chatTitle}</h3>
                <button onClick={() => setShowChat(false)} className="bg-slate-100 p-1 rounded-full"><X size={20} className="text-slate-500"/></button>
             </div>
             <div className="h-48 overflow-y-auto mb-4 space-y-3 p-2">
               {chatMessages.map((msg, i) => (
                 <div key={i} className={`p-3 rounded-2xl text-sm max-w-[85%] leading-relaxed ${msg.sender === 'user' ? 'bg-blue-600 text-white ml-auto rounded-br-none' : 'bg-slate-100 text-slate-700 rounded-bl-none'}`}>{msg.text}</div>
               ))}
             </div>
             <div className="flex gap-2">
               <input 
                 type="text" 
                 value={chatInput} 
                 onChange={(e) => setChatInput(e.target.value)} 
                 placeholder={t.chatPlaceholder} 
                 className="flex-1 bg-slate-50 border border-slate-200 p-3.5 rounded-xl focus:ring-2 focus:ring-green-500 outline-none" 
               />
               <button onClick={sendChatMessage} className="bg-green-600 text-white px-5 rounded-xl hover:bg-green-700 active:scale-95 transition-transform"><Send size={20} /></button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Bottom Nav (Glassmorphism) --- */}
      <div className="fixed bottom-0 w-full bg-white/90 backdrop-blur-lg border-t border-slate-200 flex justify-around py-3 pb-6 text-xs font-bold text-slate-400 z-50">
        <button onClick={() => setActiveTab('map')} className={`flex flex-col items-center gap-1 ${activeTab === 'map' ? 'text-green-600' : 'hover:text-slate-600'}`}><MapPin size={24} /> {t.map}</button>
        <button onClick={() => setActiveTab('weather')} className={`flex flex-col items-center gap-1 ${activeTab === 'weather' ? 'text-green-600' : 'hover:text-slate-600'}`}><CloudSun size={24} /> {t.weather}</button>
        <button onClick={() => setActiveTab('add')} className="relative -top-8"><div className="bg-green-600 text-white p-4 rounded-full shadow-lg shadow-green-200 border-[6px] border-slate-50 transform hover:scale-105 transition-transform"><Sprout size={28} /></div></button>
        <button onClick={() => setActiveTab('scanner')} className={`flex flex-col items-center gap-1 ${activeTab === 'scanner' ? 'text-green-600' : 'hover:text-slate-600'}`}><Camera size={24} /> {t.scanner}</button>
        <button onClick={() => setActiveTab('inventory')} className={`flex flex-col items-center gap-1 ${activeTab === 'inventory' ? 'text-green-600' : 'hover:text-slate-600'}`}><Leaf size={24} /> {t.inventory}</button>
        <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center gap-1 ${activeTab === 'profile' ? 'text-green-600' : 'hover:text-slate-600'}`}><User size={24} /> {t.profile}</button>
      </div>
    </div>
  );
}
