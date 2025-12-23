
import React, { useState, useRef } from 'react';
import PinkParticleTreeScene from './PinkParticleTreeScene';

const App: React.FC = () => {
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [wishInput, setWishInput] = useState("");
  const [newWish, setNewWish] = useState<{ id: number, text: string } | null>(null);
  const [newGift, setNewGift] = useState<{ id: number, imageUrl: string } | null>(null);
  const [viewedWish, setViewedWish] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSendWish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wishInput.trim()) return;
    setNewWish({ id: Date.now(), text: wishInput });
    setWishInput("");
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        setNewGift({ id: Date.now(), imageUrl });
      };
      reader.readAsDataURL(file);
    }
    // Reset input so the same file can be uploaded again
    if (e.target) e.target.value = '';
  };

  return (
    <div className="relative w-full h-screen bg-[#050505] overflow-hidden">
      {/* Background Title */}
      <div id="bg-title-container">
        <h1 className="bg-title-text font-cursive">
          Merry Christmas
        </h1>
      </div>

      {/* 3D Scene */}
      <PinkParticleTreeScene 
        onGiftClick={setActiveImage} 
        cameraEnabled={cameraEnabled} 
        newWish={newWish}
        newGift={newGift}
        onWishComplete={() => setNewWish(null)}
        onGiftComplete={() => setNewGift(null)}
        onOrnamentClick={setViewedWish}
      />

      {/* UI Overlay - Camera Toggle */}
      <div className="absolute top-8 right-8 z-50 flex items-center gap-4 bg-black/40 backdrop-blur-md px-5 py-3 rounded-full border border-pink-500/20">
        <span className="text-pink-100 text-[10px] tracking-[0.3em] uppercase font-light font-mono">
          {cameraEnabled ? 'Tracking Active' : 'Enable Camera'}
        </span>
        <button 
          onClick={() => setCameraEnabled(!cameraEnabled)}
          className={`w-12 h-6 rounded-full transition-all duration-500 flex items-center px-1 shadow-inner ${
            cameraEnabled ? 'bg-pink-500' : 'bg-gray-800'
          }`}
        >
          <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-500 transform ${
            cameraEnabled ? 'translate-x-6' : 'translate-x-0'
          }`} />
        </button>
      </div>

      {/* Multi-Interaction Bar - Re-aligned to Vertical Stack */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-6 flex flex-col items-stretch">
        {/* Wish Form (Top) */}
        <form onSubmit={handleSendWish} className="flex bg-black/60 backdrop-blur-2xl border border-white/10 rounded-full p-1 shadow-2xl focus-within:border-pink-500/40 transition-colors">
          <input 
            type="text" 
            value={wishInput}
            onChange={(e) => setWishInput(e.target.value)}
            placeholder="SEND A WISH..."
            className="flex-1 bg-transparent px-6 py-3 text-pink-100 text-xs font-mono tracking-widest outline-none uppercase placeholder:text-pink-100/30"
          />
          <button 
            type="submit"
            className="px-8 py-3 bg-white/5 hover:bg-pink-500/20 text-pink-200 text-[10px] font-mono font-bold tracking-[0.2em] uppercase transition-all rounded-full border border-white/5"
          >
            SEND
          </button>
        </form>

        {/* Hidden File Input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handlePhotoUpload} 
          accept="image/*" 
          className="hidden" 
        />
        
        {/* Memory Upload Button (Bottom) */}
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="mt-1 text-pink-100 hover:text-pink-500 font-mono text-[10px] font-bold tracking-[0.3em] shadow-lg transition-all flex items-center justify-center gap-3 uppercase"
        >
          <span>ADD MEMORY</span>
          <span className="text-sm">🎁</span>
        </button>
      </div>

      {/* Ornament Wish Viewer */}
      {viewedWish && (
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-[110] animate-in fade-in duration-300"
          onClick={() => setViewedWish(null)}
        >
          <div 
            className="bg-gradient-to-br from-pink-900/60 to-black/90 p-12 rounded-3xl border border-pink-400/30 shadow-2xl max-w-md w-full text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-pink-100/50 text-[10px] font-mono tracking-[0.5em] uppercase mb-6">Whisper</p>
            <p className="text-pink-100 text-xl font-mono tracking-wider leading-relaxed uppercase break-words">
              {viewedWish}
            </p>
            <button 
              onClick={() => setViewedWish(null)}
              className="mt-16 px-8 py-2 bg-pink-500/20 hover:bg-pink-500/40 text-pink-100 text-[10px] font-mono tracking-widest rounded-full border border-pink-500/30 transition-all"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}

      {/* Gift Modal */}
      {activeImage && (
        <div 
          className="absolute inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 z-[100] animate-in fade-in zoom-in-95 duration-500"
          onClick={() => setActiveImage(null)}
        >
          <div 
            className="relative bg-gradient-to-br from-pink-900/40 to-black/80 p-2 rounded-[2.5rem] border border-pink-400/20 max-w-[420px] w-full shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="aspect-[3/4] w-full rounded-[2.2rem] overflow-hidden shadow-inner bg-black/20">
              <img 
                src={activeImage} 
                alt="Holiday Moment" 
                className="w-full h-full object-cover transition-transform duration-1000 hover:scale-110"
              />
            </div>

            <button 
              className="absolute top-6 right-6 w-7 h-7 text-white flex items-center justify-center hover:text-pink-500"
              onClick={() => setActiveImage(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="absolute bottom-5 left-0 right-0 text-center pointer-events-none z-50">
        <div className="text-pink-400 opacity-20 text-[10px] tracking-[0.5em] uppercase font-mono">
          &copy; BELLA
        </div>
      </div>
    </div>
  );
};

export default App;
