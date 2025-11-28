'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sprout, CloudRain, Download, User, AlertTriangle, CloudSun, Leaf, Droplets, MapPin } from 'lucide-react';
import Papa from 'papaparse'; 

// --- Configuration ---
// 1. Precise Coordinates for Accurate Weather (Open-Meteo requires Lat/Long)
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

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  
  // --- State for Data ---
  const [user, setUser] = useState({ name: '', phone: '', registered: false });
  const [crops, setCrops] = useState([]);
  const [weather, setWeather] = useState(null);

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

  // --- 3. CSV Export Function ---
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

  // --- 4. REAL ACCURATE WEATHER (Using Open-Meteo) ---
  useEffect(() => {
    if (activeTab === 'weather' && user.registered) {
       fetchWeather(formData.location); 
    }
  }, [activeTab]);

  const fetchWeather = async (city) => {
    setLoading(true);
    try {
      const coords = DISTRICT_COORDS[city] || DISTRICT_COORDS["Dhaka"];
      
      // Open-Meteo API (No Key Required, Very Accurate)
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lng}&current=temperature_2m,relative_humidity_2m&daily=precipitation_probability_max,temperature_2m_max&timezone=auto`;
      
      const res = await fetch(url);
      const data = await res.json();
      
      // Formatting data to match our UI
      setWeather({
        location: city,
        temp: data.current.temperature_2m,
        humidity: data.current.relative_humidity_2m,
        rainChance: data.daily.precipitation_probability_max[0],
        maxTemp: data.daily.temperature_2m_max[0]
      });
      
    } catch (error) {
      console.error("Weather Error", error);
    }
    setLoading(false);
  };

  // --- UI Helpers ---
  const getAdvisory = (w) => {
    if (!w) return "";
    if (w.rainChance > 80) return "আগামীকাল বৃষ্টি ৮৫% → আজই ধান কাটুন অথবা ঢেকে রাখুন";
    if (w.maxTemp > 35) return "তাপমাত্রা ৩৬°C উঠবে → বিকেলের দিকে সেচ দিন";
    return "আবহাওয়া স্বাভাবিক আছে। নিয়মিত পর্যবেক্ষণ করুন (Conditions are normal).";
  };

  // --- Login Screen ---
  if (!user.registered) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center p-4 font-sans">
        <motion.div initial={{scale:0.9}} animate={{scale:1}} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
          <h2 className="text-2xl font-bold text-green-800 mb-6 text-center">কৃষক নিবন্ধন (Farmer Registration)</h2>
          <form onSubmit={handleRegister} className="space-y-4">
             <div>
               <label className="block text-sm font-medium text-gray-700">আপনার নাম (Name)</label>
               <input required type="text" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500" 
                 onChange={(e) => setUser({...user, name: e.target.value})} />
             </div>
             <div>
               <label className="block text-sm font-medium text-gray-700">মোবাইল নম্বর (Phone)</label>
               <input required type="tel" className="w-full p-3 border rounded-lg" 
                 onChange={(e) => setUser({...user, phone: e.target.value})} />
             </div>
             <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition">
               নিবন্ধন করুন
             </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // --- Main Dashboard ---
  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans text-slate-900">
      {/* Top Bar */}
      <div className="bg-green-700 text-white p-4 shadow-md sticky top-0 z-10 flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold">HarvestGuard</h1>
          <p className="text-xs opacity-80">স্বাগতম, {user.name}</p>
        </div>
        <button onClick={exportData} className="bg-white/20 p-2 rounded-lg text-xs flex items-center gap-1 hover:bg-white/30 transition">
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Content Area */}
      <div className="p-4 max-w-2xl mx-auto space-y-6">
        
        {/* --- ADD CROP FORM --- */}
        {activeTab === 'add' && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">নতুন ফসল যোগ করুন</h2>
            <form onSubmit={handleAddCrop} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-600">ফসলের ধরন (Crop Type)</label>
                <select className="w-full p-3 border rounded-lg bg-gray-50" value={formData.cropType} readOnly>
                  <option>Paddy/Rice (ধান)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-600">ওজন (kg)</label>
                  <input required type="number" className="w-full p-3 border rounded-lg" 
                    onChange={(e) => setFormData({...formData, weight: e.target.value})} />
                </div>
                <div>
                   <label className="text-sm font-semibold text-gray-600">তারিখ</label>
                   <input required type="date" className="w-full p-3 border rounded-lg" 
                    onChange={(e) => setFormData({...formData, date: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">সংরক্ষণ এলাকা (Location)</label>
                <select className="w-full p-3 border rounded-lg" 
                   onChange={(e) => setFormData({...formData, location: e.target.value})}>
                   {Object.keys(DISTRICT_COORDS).map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">সংরক্ষণ পদ্ধতি (Storage)</label>
                <select className="w-full p-3 border rounded-lg"
                   onChange={(e) => setFormData({...formData, storage: e.target.value})}>
                   {STORAGE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <button className="w-full bg-green-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-green-600/20 active:scale-95 transition">
                সংরক্ষণ করুন (Save)
              </button>
            </form>
          </motion.div>
        )}

        {/* --- INVENTORY LIST --- */}
        {activeTab === 'inventory' && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-4">
            <div className="flex justify-between items-center">
               <h2 className="text-xl font-bold text-gray-800">আমার ফসল (Inventory)</h2>
               <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-bold">
                 {crops.length} Batches
               </span>
            </div>
            
            {crops.length === 0 ? (
              <div className="text-center py-10 text-gray-400 bg-white rounded-xl border border-dashed">
                <p>কোন তথ্য পাওয়া যায়নি</p>
                <p className="text-xs mt-1">দয়া করে নতুন ফসল যোগ করুন</p>
              </div>
            ) : (
              crops.map((crop) => (
                <div key={crop.id} className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-green-500">
                  <div className="flex justify-between mb-2">
                    <h3 className="font-bold text-lg text-gray-800">{crop.cropType}</h3>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-bold">{crop.status}</span>
                  </div>
                  <div className="text-sm text-gray-500 grid grid-cols-2 gap-y-2">
                    <p className="flex items-center gap-1">⚖️ {crop.weight} kg</p>
                    <p className="flex items-center gap-1">📅 {crop.date}</p>
                    <p className="flex items-center gap-1">📍 {crop.location}</p>
                    <p className="flex items-center gap-1">🏠 {crop.storage}</p>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}

        {/* --- REAL WEATHER & ADVISORY --- */}
        {activeTab === 'weather' && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-4">
             <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                <CloudSun className="absolute right-[-20px] top-[-20px] w-32 h-32 opacity-20" />
                <div className="relative z-10">
                  <h2 className="text-xl font-bold mb-1 opacity-90">আবহাওয়া বার্তা</h2>
                  {loading ? (
                    <p className="animate-pulse mt-4">তথ্য লোড হচ্ছে...</p>
                  ) : weather ? (
                    <div>
                      <div className="flex items-end gap-2 mt-2">
                        {/* ACCURATE TEMP HERE */}
                        <p className="text-5xl font-black">{weather.temp}°C</p>
                        <p className="text-lg font-medium opacity-80 mb-2">
                          <MapPin size={16} className="inline mr-1"/>
                          {weather.location}
                        </p>
                      </div>
                      <div className="mt-4 flex gap-4 text-sm bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                         <span className="flex items-center gap-1 font-semibold"><Droplets size={16}/> {weather.humidity}% Humidity</span>
                         <span className="flex items-center gap-1 font-semibold"><CloudRain size={16}/> {weather.rainChance || 0}% Rain Chance</span>
                      </div>
                    </div>
                  ) : (
                    <p>Weather unavailable</p>
                  )}
                </div>
             </div>

             {/* Advisory Cards */}
             {weather && (
               <motion.div 
                 initial={{ y: 10, opacity: 0 }}
                 animate={{ y: 0, opacity: 1 }}
                 transition={{ delay: 0.2 }}
                 className="bg-orange-50 border border-orange-200 p-5 rounded-xl flex gap-4 items-start shadow-sm"
               >
                  <div className="bg-orange-100 p-2 rounded-full">
                    <AlertTriangle className="text-orange-600 w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-orange-900 text-lg">কৃষি পরামর্শ (Advisory)</h3>
                    <p className="text-base text-gray-800 mt-1 font-medium leading-relaxed">
                      {getAdvisory(weather)}
                    </p>
                  </div>
               </motion.div>
             )}
          </motion.div>
        )}

        {/* --- PROFILE TAB --- */}
        {activeTab === 'profile' && (
          <div className="bg-white p-6 rounded-xl shadow-sm text-center">
             <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
               <User size={40} className="text-green-600" />
             </div>
             <h2 className="text-xl font-bold">{user.name}</h2>
             <p className="text-gray-500">{user.phone}</p>
             <div className="mt-6 flex justify-center gap-2">
               {crops.length > 0 && (
                 <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold border border-yellow-200">
                   🏅 First Harvest Logged
                 </span>
               )}
               {crops.length >= 5 && (
                 <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-bold border border-purple-200">
                   🏆 Risk Mitigated Expert
                 </span>
               )}
             </div>
          </div>
        )}

      </div>

      {/* --- Bottom Navigation --- */}
      <div className="fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around py-2 pb-5 text-gray-500 text-xs font-medium z-50 shadow-[0_-5px_10px_rgba(0,0,0,0.05)]">
        <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'profile' ? 'text-green-600' : ''}`}>
           <User size={24} /> প্রোফাইল
        </button>
        <button onClick={() => setActiveTab('add')} className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'add' ? 'text-green-600' : ''}`}>
           <div className="bg-green-600 text-white p-3 rounded-full mt-[-30px] shadow-lg shadow-green-600/40 border-4 border-slate-50 transition hover:scale-105">
             <Sprout size={24} />
           </div>
           <span>ফসল যোগ</span>
        </button>
        <button onClick={() => setActiveTab('inventory')} className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'inventory' ? 'text-green-600' : ''}`}>
           <Leaf size={24} /> ইনভেন্টরি
        </button>
        <button onClick={() => setActiveTab('weather')} className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'weather' ? 'text-green-600' : ''}`}>
           <CloudSun size={24} /> আবহাওয়া
        </button>
      </div>
    </div>
  );
}