'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sprout, CloudRain, Download, User, AlertTriangle, 
  CloudSun, Leaf, Droplets, MapPin, Camera, Mic, 
  Search, X, Volume2, ShieldAlert 
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

// --- B1: MOCK DATA FOR RISK MAP ---
const generateNeighbors = () => {
  return Array.from({ length: 12 }).map((_, i) => ({
    id: i,
    top: 20 + Math.random() * 60, // Random position on "Map"
    left: 10 + Math.random() * 80,
    risk: Math.random() > 0.6 ? 'High' : 'Low', // Random Risk
    crop: Math.random() > 0.5 ? 'ধান (Paddy)' : 'গম (Wheat)',
    updated: `${Math.floor(Math.random() * 5) + 1} ঘণ্টা আগে`
  }));
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  
  // --- State for Data ---
  const [user, setUser] = useState({ name: '', phone: '', registered: false });
  const [crops, setCrops] = useState([]);
  const [weather, setWeather] = useState(null);
  
  // --- B1: Map State ---
  const [neighbors] = useState(generateNeighbors());
  const [selectedPin, setSelectedPin] = useState(null);
  const [mapZoom, setMapZoom] = useState(1);

  // --- B3: Scanner State ---
  const [scanImage, setScanImage] = useState(null);
  const [scanResult, setScanResult] = useState(null);

  // --- B4: Voice State ---
  const [isListening, setIsListening] = useState(false);
  const [voiceText, setVoiceText] = useState("");

  // --- Form States ---
  const [formData, setFormData] = useState({
    cropType: 'Paddy/Rice',
    weight: '',
    date: '',
    location: 'Dhaka',
    storage: 'Jute Bag Stack'
  });

  // --- 1. Load Data (Offline Capability) ---
  useEffect(() => {
    const storedUser = localStorage.getItem('hg_user');
    const storedCrops = localStorage.getItem('hg_crops');
    if (storedUser) setUser(JSON.parse(storedUser));
    if (storedCrops) setCrops(JSON.parse(storedCrops));
  }, []);

  // --- 2. Save Data logic ---
  const handleRegister = (e) => {
    e.preventDefault();
    const newUser = { ...user, registered: true };
    setUser(newUser);
    localStorage.setItem('hg_user', JSON.stringify(newUser));
  };

  const handleAddCrop = (e) => {
    e.preventDefault();
    const newCrop = { 
      id: Date.now(), 
      ...formData, 
      status: 'Active',
      risk: 'Calculating...' 
    };
    
    let updatedCrops = [...crops, newCrop];
    setCrops(updatedCrops);
    localStorage.setItem('hg_crops', JSON.stringify(updatedCrops));
    
    alert('ফসল সফলভাবে যোগ করা হয়েছে!');
    setActiveTab('inventory');
  };

  // --- 3. CSV Export ---
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

  // --- 4. Weather & B2: Smart Alert System ---
  useEffect(() => {
    if (user.registered) {
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
      
      const newWeather = {
        location: city,
        temp: data.current.temperature_2m,
        humidity: data.current.relative_humidity_2m,
        rainChance: data.daily.precipitation_probability_max[0],
        maxTemp: data.daily.temperature_2m_max[0]
      };
      setWeather(newWeather);

      // --- B2: Critical SMS Simulation ---
      if (newWeather.rainChance > 80 || newWeather.humidity > 85) {
        console.log(`[SMS SENT TO ${user.phone}]: Critical Alert! High moisture detected in ${city}. Turn on aeration fans immediately.`);
      }

    } catch (error) {
      console.error("Weather Error", error);
    }
    setLoading(false);
  };

  // --- B3: Gemini Visual RAG Simulation ---
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setScanImage(url);
      setScanResult(null);
    }
  };

  const analyzeImage = () => {
    setLoading(true);
    // Simulate API Delay
    setTimeout(() => {
      setScanResult({
        pest: "মাজরা পোকা (Stem Borer)",
        risk: "High (উচ্চ)",
        solution: "অবিলম্বে আক্রান্ত ডালপালা ছাঁটাই করুন এবং জমিতে আলোক ফাঁদ ব্যবহার করুন। প্রয়োজনে অনুমোদিত কীটনাশক স্প্রে করুন।"
      });
      setLoading(false);
    }, 2000);
  };

  // --- B4: Voice Interface (Web Speech API) ---
  const startListening = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.lang = 'bn-BD';
      recognition.start();
      setIsListening(true);

      recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        setVoiceText(text);
        setIsListening(false);
        handleVoiceQuery(text);
      };
      
      recognition.onerror = () => setIsListening(false);
    } else {
      alert("আপনার ব্রাউজারে ভয়েস সাপোর্ট নেই।");
    }
  };

  const handleVoiceQuery = (text) => {
    let response = "";
    if (text.includes("আবহাওয়া")) response = `আজকের তাপমাত্রা ${weather?.temp || 30} ডিগ্রি সেলসিয়াস।`;
    else if (text.includes("ফসল") || text.includes("অবস্থা")) response = `আপনার ${crops.length} টি ফসল নিবন্ধিত আছে।`;
    else if (text.includes("পরামর্শ")) response = "বৃষ্টির সম্ভাবনা আছে, ফসল শুকনো জায়গায় রাখুন।";
    else response = "দুঃখিত, আমি বুঝতে পারিনি। আবার বলুন।";

    // Text to Speech
    const utterance = new SpeechSynthesisUtterance(response);
    utterance.lang = 'bn-BD'; // Try Bangla accent
    window.speechSynthesis.speak(utterance);
    
    alert(`🗣️ আপনি বলেছেন: "${text}"\n🤖 উত্তর: ${response}`);
  };

  // --- Helper: Advisory Text ---
  const getAdvisory = (w) => {
    if (!w) return "";
    if (w.rainChance > 80) return "সতর্কতা: আগামীকাল বৃষ্টি ৮৫% → আজই ফসল ঢেকে রাখুন! (Bad Alert)";
    if (w.humidity > 80) return "আর্দ্রতা খুব বেশি! গুদামে ফ্যান চালু করুন। (Good Alert)";
    return "আবহাওয়া স্বাভাবিক আছে। নিয়মিত পর্যবেক্ষণ করুন।";
  };

  // --- LOGIN SCREEN ---
  if (!user.registered) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center p-4 font-sans">
        <motion.div initial={{scale:0.9}} animate={{scale:1}} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
          <h2 className="text-2xl font-bold text-green-800 mb-6 text-center">কৃষক নিবন্ধন (Farmer Registration)</h2>
          <form onSubmit={handleRegister} className="space-y-4">
             <div>
               <label className="block text-sm font-medium text-gray-700">আপনার নাম</label>
               <input required type="text" className="w-full p-3 border rounded-lg" onChange={(e) => setUser({...user, name: e.target.value})} />
             </div>
             <div>
               <label className="block text-sm font-medium text-gray-700">মোবাইল নম্বর</label>
               <input required type="tel" className="w-full p-3 border rounded-lg" onChange={(e) => setUser({...user, phone: e.target.value})} />
             </div>
             <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-lg font-bold">নিবন্ধন করুন</button>
          </form>
        </motion.div>
      </div>
    );
  }

  // --- DASHBOARD ---
  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans text-slate-900 relative">
      
      {/* Top Bar */}
      <div className="bg-green-700 text-white p-4 shadow-md sticky top-0 z-20 flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold">HarvestGuard</h1>
          <p className="text-xs opacity-80">{user.name} | {formData.location}</p>
        </div>
        <button onClick={exportData} className="bg-white/20 p-2 rounded-lg text-xs flex items-center gap-1">
          <Download size={14} /> Export
        </button>
      </div>

      {/* Content Area */}
      <div className="p-4 max-w-2xl mx-auto space-y-6">
        
        {/* --- TAB: MAP (B1: Local Risk Map) --- */}
        {activeTab === 'map' && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
             <div className="p-4 bg-green-50 border-b flex justify-between items-center">
               <h2 className="font-bold text-green-900 flex items-center gap-2"><MapPin size={18}/> ঝুঁকি মানচিত্র (Risk Map)</h2>
               <span className="text-xs bg-white px-2 py-1 rounded border">Zoom: {Math.round(mapZoom * 100)}%</span>
             </div>
             
             {/* Map Container (Simulated) */}
             <div className="relative w-full h-96 bg-blue-50 overflow-hidden touch-none" style={{ backgroundImage: 'radial-gradient(#ccc 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                <motion.div 
                  className="w-full h-full relative"
                  drag
                  dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
                  style={{ scale: mapZoom }}
                >
                  {/* Farmer's Own Pin */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
                     <MapPin size={40} className="text-blue-600 drop-shadow-lg fill-blue-100" />
                     <span className="bg-blue-600 text-white text-[10px] px-1 rounded">আমি</span>
                  </div>

                  {/* Neighbors */}
                  {neighbors.map((n) => (
                    <div 
                      key={n.id}
                      className="absolute cursor-pointer flex flex-col items-center z-10"
                      style={{ top: `${n.top}%`, left: `${n.left}%` }}
                      onClick={() => setSelectedPin(n)}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 border-white shadow-md ${n.risk === 'High' ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                    </div>
                  ))}
                </motion.div>
                
                {/* Map Controls */}
                <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                  <button onClick={() => setMapZoom(z => Math.min(z + 0.2, 2))} className="w-10 h-10 bg-white rounded-full shadow flex items-center justify-center font-bold text-xl">+</button>
                  <button onClick={() => setMapZoom(z => Math.max(z - 0.2, 0.5))} className="w-10 h-10 bg-white rounded-full shadow flex items-center justify-center font-bold text-xl">-</button>
                </div>
             </div>

             {/* B1: Bangla Pop-up Interaction */}
             <AnimatePresence>
               {selectedPin && (
                 <motion.div 
                   initial={{y: 20, opacity:0}} animate={{y:0, opacity:1}} exit={{y:20, opacity:0}}
                   className="p-4 bg-white border-t border-slate-200"
                 >
                   <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-slate-800">{selectedPin.crop}</h3>
                        <p className="text-sm text-slate-500">আপডেট: {selectedPin.updated}</p>
                      </div>
                      <button onClick={() => setSelectedPin(null)}><X size={18} /></button>
                   </div>
                   <div className={`mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${selectedPin.risk === 'High' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      <AlertTriangle size={14} />
                      ঝুঁকি: {selectedPin.risk === 'High' ? 'উচ্চ (Critical)' : 'নিম্ন (Safe)'}
                   </div>
                 </motion.div>
               )}
             </AnimatePresence>
          </motion.div>
        )}

        {/* --- TAB: SCANNER (B3: Pest ID & RAG) --- */}
        {activeTab === 'scanner' && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} className="bg-white p-6 rounded-xl shadow-sm">
             <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2"><Camera /> রোগ নির্ণয় (Scanner)</h2>
             
             {!scanImage ? (
               <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-green-300 rounded-xl bg-green-50 cursor-pointer">
                 <Camera size={48} className="text-green-400 mb-2" />
                 <span className="text-sm font-medium text-green-700">ছবি তুলুন বা আপলোড করুন</span>
                 <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
               </label>
             ) : (
               <div className="space-y-4">
                 <img src={scanImage} alt="Crop" className="w-full h-48 object-cover rounded-xl" />
                 {loading ? (
                   <div className="text-center py-4 text-green-600 animate-pulse font-bold">এআই বিশ্লেষণ করছে... (AI Analyzing)</div>
                 ) : !scanResult ? (
                   <div className="flex gap-2">
                     <button onClick={() => setScanImage(null)} className="flex-1 py-3 border rounded-lg font-bold">বাতিল</button>
                     <button onClick={analyzeImage} className="flex-1 py-3 bg-green-600 text-white rounded-lg font-bold flex items-center justify-center gap-2">
                       <Search size={18} /> বিশ্লেষণ করুন
                     </button>
                   </div>
                 ) : (
                   <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <h3 className="text-lg font-bold text-red-600 flex items-center gap-2">
                        <AlertTriangle size={20} /> {scanResult.pest}
                      </h3>
                      <p className="text-sm font-bold text-slate-700 mt-1">ঝুঁকির মাত্রা: {scanResult.risk}</p>
                      <div className="mt-3 bg-white p-3 rounded border-l-4 border-green-500 text-sm">
                        <p className="font-bold mb-1">প্রতিকার (Action Plan):</p>
                        {scanResult.solution}
                      </div>
                      <button onClick={() => setScanImage(null)} className="mt-4 w-full py-2 bg-slate-200 rounded-lg font-bold">নতুন ছবি</button>
                   </div>
                 )}
               </div>
             )}
          </motion.div>
        )}

        {/* --- TAB: WEATHER (Updated with B2) --- */}
        {activeTab === 'weather' && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-4">
             <div className={`p-6 rounded-2xl shadow-lg relative overflow-hidden text-white ${weather?.rainChance > 80 ? 'bg-red-600' : 'bg-blue-600'}`}>
                <div className="relative z-10">
                  <h2 className="text-xl font-bold mb-1 opacity-90">আবহাওয়া বার্তা</h2>
                  {weather ? (
                    <div>
                      <div className="flex items-end gap-2 mt-2">
                        <p className="text-5xl font-black">{weather.temp}°C</p>
                        <p className="text-lg font-medium opacity-80 mb-2">{weather.location}</p>
                      </div>
                      <div className="mt-4 flex gap-4 text-sm bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                         <span className="flex items-center gap-1 font-semibold"><Droplets size={16}/> {weather.humidity}% Humidity</span>
                         <span className="flex items-center gap-1 font-semibold"><CloudRain size={16}/> {weather.rainChance}% Rain</span>
                      </div>
                    </div>
                  ) : <p>Loading...</p>}
                </div>
             </div>

             {weather && (
               <div className="bg-orange-50 border border-orange-200 p-5 rounded-xl flex gap-4 items-start shadow-sm">
                  <AlertTriangle className="text-orange-600 w-6 h-6 mt-1" />
                  <div>
                    <h3 className="font-bold text-orange-900 text-lg">পরামর্শ (Smart Alert)</h3>
                    <p className="text-base text-gray-800 mt-1 leading-relaxed">{getAdvisory(weather)}</p>
                  </div>
               </div>
             )}
          </motion.div>
        )}

        {/* --- TAB: INVENTORY --- */}
        {activeTab === 'inventory' && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800">আমার ফসল ({crops.length})</h2>
            {crops.map((crop) => (
               <div key={crop.id} className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-green-500">
                  <h3 className="font-bold text-lg">{crop.cropType}</h3>
                  <div className="text-sm text-gray-500 grid grid-cols-2 gap-2 mt-2">
                    <p>⚖️ {crop.weight} kg</p>
                    <p>📅 {crop.date}</p>
                    <p>📍 {crop.location}</p>
                    <p>🏠 {crop.storage}</p>
                  </div>
               </div>
            ))}
          </motion.div>
        )}

        {/* --- TAB: ADD CROP --- */}
        {activeTab === 'add' && (
           <div className="bg-white p-6 rounded-xl shadow-sm">
             <h2 className="text-xl font-bold mb-4">নতুন ফসল যোগ করুন</h2>
             <form onSubmit={handleAddCrop} className="space-y-4">
               <select className="w-full p-3 border rounded bg-gray-50" value={formData.cropType} readOnly><option>Paddy/Rice (ধান)</option></select>
               <input required type="number" placeholder="ওজন (kg)" className="w-full p-3 border rounded" onChange={(e) => setFormData({...formData, weight: e.target.value})} />
               <input required type="date" className="w-full p-3 border rounded" onChange={(e) => setFormData({...formData, date: e.target.value})} />
               <select className="w-full p-3 border rounded" onChange={(e) => setFormData({...formData, location: e.target.value})}>{Object.keys(DISTRICT_COORDS).map(d => <option key={d} value={d}>{d}</option>)}</select>
               <select className="w-full p-3 border rounded" onChange={(e) => setFormData({...formData, storage: e.target.value})}>{STORAGE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select>
               <button className="w-full bg-green-600 text-white font-bold py-3 rounded">সংরক্ষণ করুন</button>
             </form>
           </div>
        )}

      </div>

      {/* --- B4: Floating Voice Assistant --- */}
      <button 
        onClick={startListening}
        className={`fixed bottom-24 right-4 p-4 rounded-full shadow-xl z-30 transition-all ${isListening ? 'bg-red-500 scale-110' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
      >
        {isListening ? <Volume2 className="animate-pulse" /> : <Mic />}
      </button>

      {/* --- Bottom Nav --- */}
      <div className="fixed bottom-0 w-full bg-white border-t flex justify-around py-2 pb-5 text-gray-500 text-xs font-medium z-50">
        <button onClick={() => setActiveTab('map')} className={`flex flex-col items-center p-2 ${activeTab === 'map' ? 'text-green-600' : ''}`}><MapPin size={24} /> ম্যাপ</button>
        <button onClick={() => setActiveTab('weather')} className={`flex flex-col items-center p-2 ${activeTab === 'weather' ? 'text-green-600' : ''}`}><CloudSun size={24} /> আবহাওয়া</button>
        <button onClick={() => setActiveTab('add')} className="relative"><div className="bg-green-600 text-white p-3 rounded-full -mt-6 shadow-lg border-4 border-slate-50"><Sprout size={24} /></div></button>
        <button onClick={() => setActiveTab('scanner')} className={`flex flex-col items-center p-2 ${activeTab === 'scanner' ? 'text-green-600' : ''}`}><Camera size={24} /> স্ক্যানার</button>
        <button onClick={() => setActiveTab('inventory')} className={`flex flex-col items-center p-2 ${activeTab === 'inventory' ? 'text-green-600' : ''}`}><Leaf size={24} /> ইনভেন্টরি</button>
      </div>

    </div>
  );
}
