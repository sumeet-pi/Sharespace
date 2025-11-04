import { useEffect, useMemo, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Volume2, Repeat } from 'lucide-react';

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

export default function AmbientSounds() {
  const [activeKey, setActiveKey] = useState(null);
  const [volume, setVolume] = useState(0.7);
  const [loop, setLoop] = useState(true);

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
    if (typeof prefs?.volume === 'number') setVolume(prefs.volume);
    if (typeof prefs?.loop === 'boolean') setLoop(prefs.loop);
  }, [prefs]);

  useEffect(() => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify({ lastKey: activeKey, volume, loop }));
  }, [activeKey, volume, loop]);

  const stopAll = () => {
    Object.values(audioRefs.current).forEach((audio) => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    });
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
    } else {
      current.volume = volume;
      current.loop = loop;
      current.play();
      setActiveKey(key);
    }
  };

  const handleVolumeChange = (vals) => {
    const v = Array.isArray(vals) ? vals[0] : Number(vals);
    setVolume(v);
    const active = audioRefs.current[activeKey];
    if (active) active.volume = v;
  };

  const handleLoopToggle = () => {
    const next = !loop;
    setLoop(next);
    const active = audioRefs.current[activeKey];
    if (active) active.loop = next;
  };

  useEffect(() => () => stopAll(), []);

  return (
    <div className="space-y-6">
      <Card className="p-8 bg-white/70 backdrop-blur-sm border-none shadow-xl">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Ambient Sounds</h2>
          <p className="text-gray-600">Find your calm. Listen to peaceful ambient sounds — rain, forest, ocean waves, and more to relax your mind.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {SOUNDS.map((s) => {
            const isActive = activeKey === s.key;
            return (
              <Card
                key={s.key}
                className={`p-6 bg-white/70 backdrop-blur-sm border-none shadow-lg hover:shadow-xl transition-all ${isActive ? 'ring-2 ring-green-600' : ''}`}
              >
                <div className="text-center">
                  <div className="text-5xl mb-3" aria-hidden>{s.emoji}</div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">{s.title}</h3>

                  <div className="flex items-center justify-center space-x-2 mb-3">
                    <Button
                      onClick={() => handleToggle(s.key)}
                      className="rounded-full"
                      variant={isActive ? 'default' : 'outline'}
                    >
                      {isActive ? <><Pause size={16} className="mr-2" /> Pause</> : <><Play size={16} className="mr-2" /> Play</>}
                    </Button>
                    <Button
                      onClick={handleLoopToggle}
                      variant="ghost"
                      className={`rounded-full ${loop ? 'text-green-600' : 'text-gray-500'}`}
                      aria-pressed={loop}
                      aria-label="Toggle loop"
                    >
                      <Repeat size={18} />
                    </Button>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Volume2 size={16} className="text-gray-500" />
                    <div className="flex-1">
                      <Slider
                        min={0}
                        max={1}
                        step={0.01}
                        value={[volume]}
                        onValueChange={handleVolumeChange}
                        aria-label={`Volume for ${s.title}`}
                      />
                    </div>
                  </div>
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
  );
}


