import { useEffect, useMemo, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Play, Pause, Repeat } from 'lucide-react';

import rain from '@/audio/rain.mp3';
import ocean from '@/audio/ocean-waves.mp3';
import forest from '@/audio/forest.mp3';
import whiteNoise from '@/audio/white-noise.mp3';

const SOUNDS = [
  { key: 'rain', title: 'Rain Sounds', emoji: '🌧️', src: rain },
  { key: 'ocean', title: 'Ocean Waves', emoji: '🌊', src: ocean },
  { key: 'forest', title: 'Forest', emoji: '🌲', src: forest },
  { key: 'white-noise', title: 'White Noise', emoji: '⚪', src: whiteNoise },
];

const LOCAL_KEY = 'calm_ambient_prefs';
const DEFAULT_VOLUME = 0.5;

export default function AmbientSounds() {
  const [activeKey, setActiveKey] = useState(null);
  // Loop state is now per-sound: { 'rain': true, 'ocean': false, ... }
  const [loopStates, setLoopStates] = useState(() => {
    // Initialize all sounds with loop enabled by default
    const defaultStates = {};
    SOUNDS.forEach(sound => {
      defaultStates[sound.key] = true;
    });
    return defaultStates;
  });
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRefs = useRef({});

  const prefs = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}');
    } catch {
      return {};
    }
  }, []);

  useEffect(() => {
    if (prefs?.lastKey) setActiveKey(prefs.lastKey);
    // Restore per-sound loop states from localStorage
    if (prefs?.loopStates && typeof prefs.loopStates === 'object') {
      setLoopStates(prev => ({ ...prev, ...prefs.loopStates }));
    }
  }, [prefs]);

  useEffect(() => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify({ lastKey: activeKey, loopStates }));
  }, [activeKey, loopStates]);

  // Initialize audio elements with default volume (only once)
  useEffect(() => {
    Object.values(audioRefs.current).forEach((audio) => {
      if (audio) {
        audio.volume = DEFAULT_VOLUME;
      }
    });
  }, []);

  // Update loop states for all audio elements when loopStates change
  useEffect(() => {
    Object.entries(audioRefs.current).forEach(([key, audio]) => {
      if (audio) {
        audio.loop = loopStates[key] ?? true;
      }
    });
  }, [loopStates]);

  // Update progress in real-time
  useEffect(() => {
    if (activeKey) {
      const audio = audioRefs.current[activeKey];
      if (audio) {
        const updateProgress = () => {
          if (audio.duration) {
            setDuration(audio.duration);
            setProgress(audio.currentTime / audio.duration);
          }
        };

        const handleEnded = () => {
          const isLooping = loopStates[activeKey];
          if (!isLooping) {
            setProgress(0);
            setActiveKey(null);
          } else {
            // If looping, reset progress when loop restarts
            setProgress(0);
          }
        };

        const handleLoadedMetadata = () => {
          if (audio.duration) {
            setDuration(audio.duration);
          }
        };

        // Update on timeupdate
        audio.addEventListener('timeupdate', updateProgress);
        
        // Handle when audio ends (if not looping, reset progress)
        audio.addEventListener('ended', handleEnded);

        // Get duration when metadata loads
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);

        return () => {
          audio.removeEventListener('timeupdate', updateProgress);
          audio.removeEventListener('ended', handleEnded);
          audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        };
      }
    } else {
      setProgress(0);
    }
  }, [activeKey, loopStates]);

  const stopAll = () => {
    Object.values(audioRefs.current).forEach((audio) => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    });
    setProgress(0);
  };

  const handleToggle = (key) => {
    const current = audioRefs.current[key];
    if (!current) return;

    // Stop other sounds first
    Object.entries(audioRefs.current).forEach(([k, audio]) => {
      if (k !== key && audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    });

    if (activeKey === key && !current.paused) {
      current.pause();
      setActiveKey(null);
      setProgress(0);
    } else {
      // Reset progress when starting a new sound
      setProgress(0);
      current.currentTime = 0;
      current.volume = DEFAULT_VOLUME;
      // Use per-sound loop state
      current.loop = loopStates[key] ?? true;
      current.play();
      setActiveKey(key);
    }
  };

  const handleProgressSeek = (vals) => {
    const value = Array.isArray(vals) ? vals[0] : Number(vals);
    const active = audioRefs.current[activeKey];
    if (active && active.duration) {
      active.currentTime = value * active.duration;
      setProgress(value);
    }
  };

  const handleLoopToggle = (key) => {
    const currentLoopState = loopStates[key] ?? true;
    const next = !currentLoopState;
    
    // Update the loop state for this specific sound
    setLoopStates(prev => ({
      ...prev,
      [key]: next
    }));
    
    // Update the audio element's loop property if it's currently active
    const audio = audioRefs.current[key];
    if (audio) {
      audio.loop = next;
    }
  };

  useEffect(() => () => stopAll(), []);

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <Card className="p-8 bg-white/70 backdrop-blur-sm border-none shadow-xl">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Ambient Sounds</h2>
            <p className="text-gray-600">Find your calm. Listen to peaceful ambient sounds — rain, forest, ocean waves, and more to relax your mind.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {SOUNDS.map((s) => {
              const isActive = activeKey === s.key;
              const isLooping = loopStates[s.key] ?? true;
              return (
                <Card
                  key={s.key}
                  className={`p-6 bg-white/70 backdrop-blur-sm border-none shadow-lg hover:shadow-xl transition-all ${isActive ? 'ring-2 ring-green-600' : ''}`}
                >
                  <div className="text-center">
                    <div className="text-5xl mb-3" aria-hidden>{s.emoji}</div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">{s.title}</h3>

                    <div className="flex items-center justify-center space-x-2 mb-4">
                      <Button
                        onClick={() => handleToggle(s.key)}
                        className="rounded-full"
                        variant={isActive ? 'default' : 'outline'}
                      >
                        {isActive ? <><Pause size={16} className="mr-2" /> Pause</> : <><Play size={16} className="mr-2" /> Play</>}
                      </Button>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={() => handleLoopToggle(s.key)}
                            variant="ghost"
                            className={`rounded-full transition-all duration-200 ${
                              isLooping
                                ? 'bg-green-50 text-green-600 border-2 border-green-400 shadow-md shadow-green-200/50 hover:bg-green-100 hover:shadow-lg hover:shadow-green-300/50'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                            aria-pressed={isLooping}
                            aria-label={`Toggle loop for ${s.title}`}
                          >
                            <Repeat size={18} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{isLooping ? 'Loop On' : 'Loop Off'}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>

                  {/* Progress Bar */}
                  {isActive && (
                    <div className="w-full mt-2">
                      <SliderPrimitive.Root
                        min={0}
                        max={1}
                        step={0.001}
                        value={[progress]}
                        onValueChange={handleProgressSeek}
                        className="relative flex w-full touch-none select-none items-center cursor-pointer group"
                        aria-label={`Playback progress for ${s.title}`}
                      >
                        <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-gray-200 shadow-inner">
                          <SliderPrimitive.Range className="absolute h-full bg-gradient-to-r from-green-400 via-teal-400 to-green-500 rounded-full transition-all duration-100 ease-out" />
                        </SliderPrimitive.Track>
                        <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border-2 border-green-500 bg-white shadow-lg transition-all hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2" />
                      </SliderPrimitive.Root>
                    </div>
                  )}
                </div>

                <audio
                  ref={(el) => { audioRefs.current[s.key] = el; }}
                  src={s.src}
                  preload="auto"
                />
              </Card>
            );
          })}
          </div>
        </Card>
      </div>
    </TooltipProvider>
  );
}


