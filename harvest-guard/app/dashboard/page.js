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

  // Ensure voices are loaded for speaking
  useEffect(() => {
    const loadVoices = () => { window.speechSynthesis.getVoices(); };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  useEffect(() => {
    setChatMessages([{ sender: 'bot', text: lang === 'bn' ? 'আমি কৃষি সহকারী। আপনার কি সাহায্য দরকার?' : 'I am Agri Assistant. How can I help?' }]);
  }, [lang]);

  // --- DATA LOADING ---
  useEffect(() => {
    const storedUser = localStorage.getItem('hg_user');
    if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        
        const userCropsKey = `hg_crops_${parsedUser.phone}`;
        const storedCrops = localStorage.getItem(userCropsKey);
        
        if (storedCrops) {
            setCrops(JSON.parse(storedCrops));
        } else {
            setCrops([]); 
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
    if (existingCrops) {
        setCrops(JSON.parse(existingCrops));
    } else {
        setCrops([]);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('hg_user');
    setUser({ name: '', phone: '', registered: false });
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

  // --- FIXED VOICE SPEAKER: FORCES BANGLA VOICE ---
  const speakText = (text) => {
    // 1. Create utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // 2. Set strict language code
    utterance.lang = lang === 'bn' ? 'bn-BD' : 'en-US';

    // 3. FORCE BANGLA VOICE SEARCH
    if (lang === 'bn') {
        const voices = window.speechSynthesis.getVoices();
        // Priority Search: 'Google Bangla', then any 'Bangla', then any 'bn'
        const banglaVoice = voices.find(v => 
            v.name.includes('Bangla') || 
            v.name.includes('Bengali') || 
            v.lang === 'bn-BD' || 
            v.lang === 'bn-IN'
        );
        
        if (banglaVoice) {
            utterance.voice = banglaVoice;
        }
    }

    // 4. Speak
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
        // Use the new Fixed Speaker function
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

  const getAdvisory = (w) => {
    if (!w) return "";
    
    const hasPotato = crops.some(c => c.cropType.includes("Potato") || c.cropType.includes("আলু"));
    const hasBrinjal = crops.some(c => c.cropType.includes("Brinjal") || c.cropType.includes("বেগুন"));
    const hasPaddy = crops.some(c => c.cropType.includes("Paddy") || c.cropType.includes("ধান"));

    // 1. POTATO (PDF Example)
    if (hasPotato && w.humidity > 80) {
        return lang === 'bn' 
          ? "সতর্কতা: আগামীকাল বৃষ্টি হবে এবং আপনার আলুর গুদামে আর্দ্রতা বেশি। এখনই ফ্যান চালু করুন।" 
          : "Warning: High humidity in Potato storage. Turn on fans immediately.";
    }

    // 2. BRINJAL (Specific)
    if (hasBrinjal && w.rainChance > 50) {
        return lang === 'bn'
          ? "সতর্কতা: বেগুনের জমিতে পানি জমতে দেবেন না। ছত্রাকনাশক স্প্রে করুন।"
          : "Warning: Avoid water logging for Brinjal. Spray fungicides.";
    }

    // 3. PADDY (Specific)
    if (hasPaddy && w.rainChance > 70) {
        return lang === 'bn'
          ? "সতর্কতা: ধান শুকাতে সমস্যা হতে পারে। পলিথিন দিয়ে ঢেকে রাখুন।"
          : "Warning: Cover paddy with polythene to prevent moisture.";
    }

    // 4. GENERAL BAD WEATHER
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
      <div className="bg-green-700 text-white p-
