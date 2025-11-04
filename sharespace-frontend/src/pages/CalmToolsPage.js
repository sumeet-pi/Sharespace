import { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Wind, Play, Pause } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import AmbientSounds from '@/components/CalmTools/AmbientSounds';

const CalmToolsPage = ({ user, onLogout }) => {
  const [activeExercise, setActiveExercise] = useState(null);
  const [breathingPhase, setBreathingPhase] = useState('ready');
  const [breathingCount, setBreathingCount] = useState(0);
  // Ambient Sounds UI moved into dedicated component
  const breathingIntervalRef = useRef(null);

  const breathingExercises = [
    { name: '4-7-8 Breathing', description: 'Inhale for 4, hold for 7, exhale for 8', pattern: [4, 7, 8] },
    { name: 'Box Breathing', description: 'Inhale, hold, exhale, hold - each for 4 seconds', pattern: [4, 4, 4, 4] },
    { name: 'Simple Deep Breathing', description: 'Inhale for 4, exhale for 6', pattern: [4, 0, 6, 0] },
  ];

  // Ambient sounds list handled inside AmbientSounds component

  const dailyQuotes = [
    "You are stronger than you think.",
    "Every day is a fresh start.",
    "Your feelings are valid.",
    "It's okay to not be okay.",
    "You are worthy of love and happiness.",
    "Progress, not perfection.",
    "You are doing your best, and that's enough.",
    "Healing takes time, be patient with yourself.",
  ];

  const [todayQuote] = useState(() => {
    const index = new Date().getDate() % dailyQuotes.length;
    return dailyQuotes[index];
  });

  const startBreathing = (exerciseName, pattern) => {
    if (breathingIntervalRef.current) {
      clearInterval(breathingIntervalRef.current);
    }
    
    setActiveExercise(exerciseName);
    setBreathingCount(0);
    let phase = 0;
    const phases = ['Inhale', 'Hold', 'Exhale', 'Hold'].filter((_, i) => pattern[i] > 0);
    const durations = pattern.filter(d => d > 0);
    
    setBreathingPhase(phases[0]);
    
    breathingIntervalRef.current = setInterval(() => {
      phase = (phase + 1) % phases.length;
      setBreathingPhase(phases[phase]);
      if (phase === 0) {
        setBreathingCount(c => c + 1);
      }
    }, durations[phase] * 1000);
  };

  const stopBreathing = () => {
    setActiveExercise(null);
    setBreathingPhase('ready');
    if (breathingIntervalRef.current) {
      clearInterval(breathingIntervalRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (breathingIntervalRef.current) {
        clearInterval(breathingIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <Sidebar user={user} onLogout={onLogout} />
      
      <div className="flex-1 p-8 ml-64">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900">Calm & Focus Tools</h1>
            <p className="text-gray-600">Find your peace and center yourself</p>
          </div>

          {/* Daily Quote */}
          <Card className="p-8 bg-gradient-to-r from-blue-50 to-purple-50 border-none shadow-xl mb-8">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Daily Affirmation</p>
              <p className="text-2xl font-semibold text-gray-800 italic">"{todayQuote}"</p>
            </div>
          </Card>

          <Tabs defaultValue="breathing" className="space-y-6">
            <TabsList className="bg-white/70 backdrop-blur-sm">
              <TabsTrigger value="breathing" data-testid="tab-breathing">Breathing Exercises</TabsTrigger>
              <TabsTrigger value="sounds" data-testid="tab-sounds">Ambient Sounds</TabsTrigger>
            </TabsList>

            <TabsContent value="breathing" className="space-y-6">
              {/* Breathing Visualizer */}
              <Card className="p-12 bg-white/70 backdrop-blur-sm border-none shadow-xl text-center">
                <div className="mb-8 flex items-center justify-center min-h-[350px] overflow-hidden">
                  <div 
                    className={`w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full flex items-center justify-center transition-all duration-1000 ease-in-out ${
                      breathingPhase === 'Inhale' ? 'scale-150 bg-blue-200' :
                      breathingPhase === 'Hold' ? 'scale-150 bg-purple-200' :
                      breathingPhase === 'Exhale' ? 'scale-100 bg-green-200' :
                      'scale-100 bg-gray-200'
                    }`}
                  >
                    <span className="text-xl sm:text-2xl font-semibold text-gray-700">
                      {breathingPhase === 'ready' ? 'Ready' : breathingPhase}
                    </span>
                  </div>
                </div>
                {activeExercise && (
                  <p className="text-lg text-gray-600 mb-4">Cycles completed: {breathingCount}</p>
                )}
              </Card>

              {/* Breathing Exercises */}
              <div className="grid md:grid-cols-3 gap-4">
                {breathingExercises.map((exercise) => (
                  <Card key={exercise.name} className="p-6 bg-white/70 backdrop-blur-sm border-none shadow-lg hover:shadow-xl transition-shadow">
                    <Wind className="text-blue-600 mb-3" size={32} />
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{exercise.name}</h3>
                    <p className="text-sm text-gray-600 mb-4">{exercise.description}</p>
                    <Button
                      data-testid={`breathing-${exercise.name.toLowerCase().replace(/\s+/g, '-')}`}
                      onClick={() => activeExercise === exercise.name ? stopBreathing() : startBreathing(exercise.name, exercise.pattern)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full"
                    >
                      {activeExercise === exercise.name ? (
                        <><Pause size={18} className="mr-2" /> Stop</>
                      ) : (
                        <><Play size={18} className="mr-2" /> Start</>
                      )}
                    </Button>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="sounds" className="space-y-6">
              <AmbientSounds />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default CalmToolsPage;