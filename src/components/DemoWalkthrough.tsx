import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSimulationStore } from '../store/useSimulationStore';
import { PlayCircle, Loader2 } from 'lucide-react';

export default function DemoWalkthrough() {
  const navigate = useNavigate();
  const { setIsPlaying } = useSimulationStore();
  const [demoState, setDemoState] = useState<'idle' | 'running'>('idle');
  const [demoStep, setDemoStep] = useState<string>('');

  const runDemo = async () => {
    if (demoState === 'running') return;
    setDemoState('running');
    
    // Step 1: Overview
    setDemoStep('1. Overview');
    navigate('/');
    await new Promise(r => setTimeout(r, 2000));

    // Step 2: Scenario Builder
    setDemoStep('2. Configuring Scenario');
    navigate('/scenario');
    await new Promise(r => setTimeout(r, 2000));
    
    // Simulate Run click
    setDemoStep('3. Running Simulation');
    // We let the actual builder do this, or we just force the state
    // Let's force the state here for a smooth demo
    const scenarioBtn = document.querySelector('button:has(svg.lucide-play)') as HTMLButtonElement;
    if (scenarioBtn) scenarioBtn.click();
    
    // Wait for simulation to finish (builder takes ~2.4s)
    await new Promise(r => setTimeout(r, 3500));
    
    // The builder navigates to /results automatically.
    setDemoStep('4. Viewing Results');
    await new Promise(r => setTimeout(r, 3000));

    // Step 5: Simulation Timeline
    setDemoStep('5. Playing Timeline');
    navigate('/simulation');
    setIsPlaying(true);
    await new Promise(r => setTimeout(r, 5000));

    // Step 6: Emergency Impact
    setDemoStep('6. Emergency Impact');
    navigate('/emergency');
    await new Promise(r => setTimeout(r, 4000));

    setDemoState('idle');
    setDemoStep('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button 
        onClick={runDemo}
        disabled={demoState === 'running'}
        className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl rounded-full px-6 py-3 font-bold flex items-center gap-3 transition-colors disabled:opacity-80"
      >
        {demoState === 'running' ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Demo: {demoStep}</span>
          </>
        ) : (
          <>
            <PlayCircle className="w-5 h-5" />
            <span className="text-sm">Judge Demo</span>
          </>
        )}
      </button>
    </div>
  );
}
