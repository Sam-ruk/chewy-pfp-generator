"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";

interface SelectedTraits {
  Background: string;
  Backpack: string;
  Model: string;
  Crown: string;
  Clothes: string;
  Mouth: string;
  Eyes: string;
}

interface Traits {
  Background: string[];
  Backpack: string[];
  Model: string[];
  Crown: string[];
  Clothes: string[];
  Mouth: string[];
  Eyes: string[];
}

const PFPs = () => {
  const traits: Traits = {
    Background: ["1", "2", "3", "4", "5", "6", "7", "8"],
    Backpack: ["1", "2", "3", "4", "5", "6", "7", "8"],
    Model: ["1", "2", "3", "4", "5", "6", "7", "8"],
    Crown: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
    Clothes: [
      "1","2","3","4","5","6","7","8","9","10",
      "11","12","13","14","15","16","17","18","19"
    ],
    Mouth: ["1", "2", "3", "4", "5", "6", "7"],
    Eyes: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
  };

  const [selectedTraits, setSelectedTraits] = useState<SelectedTraits>({
    Background: traits.Background.length > 0 ? traits.Background[0] : "",
    Backpack: "",
    Model: traits.Model.length > 0 ? traits.Model[0] : "",
    Crown: "",
    Clothes: "",
    Mouth: "",
    Eyes: ""
  });
  const [backgroundColor, setBackgroundColor] = useState("#191C1E");
  const [backgroundAlpha, setBackgroundAlpha] = useState(1);
  const [currentCategory, setCurrentCategory] = useState<keyof Traits | null>("Background");
  const [isLoading, setIsLoading] = useState(false);
  const [buttonStates, setButtonStates] = useState({
    Download: false,
    Randomize: false,
    Reset: false
  });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageCache = useRef<{ [key: string]: HTMLImageElement }>({});

  const layerOrder: (keyof SelectedTraits)[] = ["Background", "Backpack", "Model", "Crown", "Clothes", "Mouth", "Eyes"];

  const getImagePath = useCallback((category: string, value: string, isPreview: boolean = false) => {
    const suffix = isPreview ? ".png" : ".png";
    return `/pfp/${category}/${value}${suffix}`;
  }, []);

  const loadImage = useCallback((src: string): Promise<HTMLImageElement | null> => {
    if (imageCache.current[src]) {
      return Promise.resolve(imageCache.current[src]);
    }
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        imageCache.current[src] = img;
        resolve(img);
      };
      img.onerror = () => {
        console.warn(`Failed to load image: ${src}`);
        resolve(null);
      };
      img.src = src;
    });
  }, []);

  const renderCanvas = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const canvasSize = 800;
    canvas.width = canvasSize;
    canvas.height = canvasSize;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.clearRect(0, 0, canvasSize, canvasSize);

    setIsLoading(true);

    try {
      for (const layer of layerOrder) {
        const value = selectedTraits[layer];
        if (value) {
          let imgSrc = getImagePath(layer, value, layer === "Background");
          let img = await loadImage(imgSrc);

          if (!img && layer !== "Background") {
            imgSrc = getImagePath(layer, value, true);
            img = await loadImage(imgSrc);
          }

          if (img) {
            ctx.globalAlpha = layer === "Background" ? backgroundAlpha : 1;
            ctx.drawImage(img, 0, 0, canvasSize, canvasSize);
            ctx.globalAlpha = 1;
          } else if (layer === "Background") {
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, canvasSize, canvasSize);
          }
        } else if (layer === "Background") {
          ctx.fillStyle = backgroundColor;
          ctx.fillRect(0, 0, canvasSize, canvasSize);
        }
      }
    } catch (error) {
      console.error("Error rendering canvas:", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedTraits, backgroundColor, backgroundAlpha, loadImage, getImagePath]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  const handleTraitChange = useCallback((category: keyof SelectedTraits, value: string) => {
    setSelectedTraits((prev) => ({
      ...prev,
      [category]: value
    }));
  }, []);

  const handleButtonClick = useCallback((buttonName: keyof typeof buttonStates, handler: () => void) => {
    setButtonStates(prev => ({ ...prev, [buttonName]: true }));
    handler();
    setTimeout(() => {
      setButtonStates(prev => ({ ...prev, [buttonName]: false }));
    }, 200);
  }, []);

  const handleDownload = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `chewy-pfp.png`;
    link.href = canvas.toDataURL("image/png", 1.0);
    link.click();
  }, []);

  const handleReset = useCallback(() => {
    setSelectedTraits({
      Background: traits.Background.length > 0 ? traits.Background[0] : "",
      Backpack: "",
      Model: "",
      Crown: "",
      Clothes: "",
      Mouth: "",
      Eyes: ""
    });
    setBackgroundColor("#191C1E");
    setBackgroundAlpha(1);
  }, [traits]);

  const handleRandomize = useCallback(() => {
    const randomTraits: SelectedTraits = {
      Background: "",
      Backpack: "",
      Model: "",
      Crown: "",
      Clothes: "",
      Mouth: "",
      Eyes: ""
    };
  
    Object.entries(traits).forEach(([category, options]) => {
      if (options.length > 0) {
        const randomIndex = Math.floor(Math.random() * options.length);
        randomTraits[category as keyof Traits] = options[randomIndex];
      }
    });
  
    setSelectedTraits(randomTraits);
    setBackgroundAlpha(Math.round((0.5 + Math.random() * 0.5) * 10) / 10);
  }, [traits]);
  
  const customizationOrder = ["Background", "Backpack", "Model", "Crown", "Clothes", "Mouth", "Eyes"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#1a1a2e] relative overflow-x-hidden">      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#FFD447] rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#FFA500] rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#FFD447] rounded-full blur-3xl"></div>
      </div>

      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `linear-gradient(rgba(255, 212, 71, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 212, 71, 0.1) 1px, transparent 1px)`,
        backgroundSize: '40px 40px'
      }}></div>

      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#5C4033]/90 backdrop-blur-lg border-b border-[#FFD447]/20 shadow-[0_0_15px_rgba(255,212,71,0.3)]">
        <div className="absolute inset-0 bg-gradient-to-r from-[#FFD447]/20 via-[#FFD447]/10 to-[#FFD447]/20 opacity-50"></div>

        <div className="container mx-auto px-4 lg:px-8 py-3 md:py-4 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-[#FFD447] rounded-full blur-md opacity-50 animate-pulse"></div>
                <img 
                  src="/logo.png" 
                  alt="Chewy Logo" 
                  className="relative w-15 h-15 lg:w-10 lg:h-10 object-contain filter drop-shadow-[0_0_8px_rgba(255,212,71,0.5)]"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
              <span className="text-sm sm:text-lg md:text-2xl font-bold bg-gradient-to-r from-[#FFD447] to-[#FFA500] bg-clip-text text-transparent font-[Orbitron] tracking-wider">
                CHEWY PFP GENERATOR
              </span>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <a 
                href="https://x.com/Chewy_xyz" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-6 h-6 md:w-8 md:h-8 hover:scale-110 transition-transform duration-300 relative group"
              >
                <div className="absolute inset-0 bg-[#FFD447] rounded-full blur-sm opacity-0 group-hover:opacity-30 transition-opacity"></div>
                <img 
                  src="/x.png" 
                  alt="X/Twitter" 
                  className="w-full h-full object-contain relative z-10"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.parentElement!.innerHTML = `
                      <div class="w-full h-full bg-white rounded-sm flex items-center justify-center relative">
                        <span class="text-black font-bold text-xs md:text-sm">X</span>
                      </div>
                    `;
                  }}
                />
              </a>
              <a 
                href="https://discord.gg/chewymonad" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-6 h-6 md:w-8 md:h-8 hover:scale-110 transition-transform duration-300 relative group"
              >
                <div className="absolute inset-0 bg-[#FFD447] rounded-full blur-sm opacity-0 group-hover:opacity-30 transition-opacity"></div>
                <img 
                  src="/dc.png" 
                  alt="Discord" 
                  className="w-full h-full object-contain relative z-10"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.parentElement!.innerHTML = `
                      <div class="w-full h-full bg-[#7289DA] rounded-sm flex items-center justify-center relative">
                        <span class="text-white font-bold text-xs md:text-sm">D</span>
                      </div>
                    `;
                  }}
                />
              </a>
            </div>
          </div>
        </div>
      </nav>

      <div className="relative z-10 pt-20 md:pt-24 lg:pb-20 pb-7">
        <div className="container mx-auto px-2 sm:px-4 lg:px-8">
          
          <div className="mt-6 md:mt-12 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 max-w-7xl mx-auto">
            {/* Left Canvas Panel */}
            <div className="flex flex-col justify-center space-y-4 md:space-y-6 h-full order-1 lg:order-none">
              <div className="relative group w-full max-w-sm md:max-w-md mx-auto">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#FFD447] via-[#FFA500] to-[#FFD447] rounded-2xl blur opacity-5 group-hover:opacity-10 transition-opacity duration-500"></div>
                <div className="relative bg-[#000] rounded-2xl p-2 md:p-3 shadow-xl border border-[#FFD447]/10">
                  <canvas
                    ref={canvasRef}
                    width={800}
                    height={800}
                    className="w-full h-auto max-w-80 md:max-w-none md:w-105 md:h-105 rounded-xl shadow-xl bg-[#000] block mx-auto"
                    style={{ aspectRatio: "1 / 1" }}
                  />
                  {isLoading && (
                    <div className="absolute inset-2 md:inset-3 bg-black bg-opacity-90 flex flex-col items-center justify-center rounded-xl backdrop-blur-sm">
                      <div className="w-6 h-6 md:w-8 md:h-8 border-2 border-[#FFD447] border-t-transparent rounded-full animate-spin mb-2 md:mb-3"></div>
                      <div className="text-[#FFD447] font-[Orbitron] text-xs md:text-sm font-medium">GENERATING...</div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2 md:gap-3 justify-center w-full max-w-sm md:max-w-md mx-auto">
                {[
                  { name: "Save", handler: handleDownload },
                  { name: "Random", handler: handleRandomize },
                  { name: "Reset", handler: handleReset }
                ].map(({ name, handler }) => (
                  <button
                    key={name}
                    onClick={() => handleButtonClick(name as keyof typeof buttonStates, handler)}
                    className={`flex-1 border-2 text-[#C0C0C0] font-[Orbitron] font-medium py-2 md:py-3 px-1 sm:px-2 md:px-4 rounded-xl transition-all duration-200 text-xs md:text-sm uppercase tracking-wider backdrop-blur-sm relative overflow-hidden group ${
                      buttonStates[name as keyof typeof buttonStates]
                        ? "border-[#FFD447] bg-[#FFD447]/10 text-[#FFD447] scale-95"
                        : "bg-[#000]/50 border-[#FFD447]/30 hover:border-[#FFD447]/50 hover:bg-[#FFD447]/5 hover:text-[#FFD447]"
                    }`}
                  >
                    <span className="relative z-10 text-[10px] sm:text-xs md:text-sm">{name}</span>
                    <div className="absolute inset-0 bg-[#FFD447]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Traits Panel */}
            <div className="flex flex-col space-y-3 md:space-y-4 order-2 lg:order-none h-auto lg:h-[520px]">
              {/* Category Selector */}
              <div className="bg-[#000]/60 backdrop-blur-md rounded-2xl p-3 md:p-4 border border-[#FFD447]/20 flex-shrink-0">
                <h3 className="text-base sm:pb-2 md:text-lg font-[Orbitron] font-semibold text-[#FFD447] mb-2 md:mb-3 text-center">
                  SELECT CATEGORY
                </h3>
                <div className="grid sm:pb-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5 md:gap-2">
                  {customizationOrder.map((category) => (
                    <button
                      key={category}
                      onClick={() => setCurrentCategory(category as keyof Traits)}
                      className={`w-full border-2 font-[Orbitron] font-medium py-1.5 md:py-2 px-2 md:px-3 rounded-lg transition-all duration-300 text-xs uppercase tracking-wider backdrop-blur-sm relative overflow-hidden group ${
                        currentCategory === category
                          ? "border-[#FFD447] text-[#FFD447] bg-[#FFD447]/10 shadow-[0_0_10px_rgba(255,212,71,0.3)]"
                          : "bg-[#000]/30 border-[#FFD447]/20 text-[#C0C0C0] hover:border-[#FFD447]/50 hover:text-[#FFD447] hover:bg-[#FFD447]/5"
                      }`}
                    >
                      <span className="relative z-10">
                        {category === "Background" ? "BACKDROP" : category.toUpperCase()}
                      </span>
                      {currentCategory === category && (
                        <div className="absolute inset-0 bg-[#FFD447]/5 opacity-100"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Trait Options */}
              {currentCategory && (
                <div className="bg-[#000]/60 backdrop-blur-md rounded-2xl p-3 md:p-4 border border-[#FFD447]/20 flex-1 flex flex-col min-h-0 max-h-[240px] sm:max-h-[300px] lg:max-h-none lg:h-auto overflow-y-auto custom-scrollbar">
                  <div className="overflow-y-auto flex-1 custom-scrollbar">
                    <div className="p-1 md:p-3 grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-4 gap-2 md:gap-4">
                      {traits[currentCategory].map((option) => (
                        <div key={option} className="relative group">
                          <button
                            onClick={() => handleTraitChange(currentCategory, option)}
                            className={`relative w-full aspect-square rounded-xl border-2 transition-all duration-300 overflow-hidden backdrop-blur-sm hover:scale-102 ${
                              selectedTraits[currentCategory] === option
                                ? "border-[#FFD447] bg-[#FFD447]/10 shadow-[0_0_10px_rgba(255,212,71,0.3)]"
                                : "border-[#FFD447]/20 bg-[#000]/50 hover:border-[#FFD447]/50"
                            }`}
                            title={`${currentCategory} ${option}`}
                          >
                            <img
                              src={getImagePath(currentCategory, option, true)}
                              alt={`${currentCategory} ${option}`}
                              className="w-full h-full object-contain transition-transform duration-200 group-hover:scale-110"
                              onError={(e) => {
                                const img = e.target as HTMLImageElement;
                                img.src = getImagePath(currentCategory, option, false);
                              }}
                            />
                            {selectedTraits[currentCategory] === option && (
                              <div className="absolute inset-0 bg-[#FFD447]/5 opacity-100 pointer-events-none"></div>
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <footer className="relative z-10 bg-gradient-to-r from-[#FFD447]/90 via-[#5C4033]/90 to-[#FFD447]/90 backdrop-blur-lg border-t border-[#FFD447]/20 shadow-[0_0_15px_rgba(255,212,71,0.3)]">
        <div className="container mx-auto px-4 lg:px-8 py-4 md:py-6 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#FFD447]/10 via-transparent to-[#FFD447]/10 opacity-50"></div>
          <div className="flex items-center justify-center gap-2 md:gap-3 relative">
            <span className="text-[#C0C0C0] font-[Orbitron] text-sm">
              © 2025 Chewy.
            </span>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #FFD447 rgba(255, 212, 71, 0.1);
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 212, 71, 0.1);
          border-radius: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #FFD447;
          border-radius: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #ffea80;
        }

        @media (min-width: 1024px) {
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
          
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
        }
      `}</style>
    </div>
  );
};

export default PFPs;