import { KnowledgePanel } from './ai_playground/KnowledgePanel';
import { TestingPlayground } from './ai_playground/TestingPlayground';

export default function AIKnowledgeSettings() {
  return (
    <div className=" h-full p-2 font-sans">
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
        
        {/* Left Side: Knowledge Panel */}
        <div className="lg:col-span-7 overflow-y-auto pr-1 pb-6">
          <KnowledgePanel />
        </div>

        {/* Right Side: Chat Playground */}
        <div className="lg:col-span-5 h-full min-h-[600px]">
          <TestingPlayground />
        </div>

      </div>
    </div>
  );
}