import React from 'react';
import { Volume2, MessageSquare, BookOpen } from 'lucide-react';

const Item = ({ icon: Icon, title, desc }) => (
  <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-sm">
    <div className="flex items-center gap-2">
      <Icon className="text-[#00BDB6]" size={20} />
      <h3 className="font-semibold text-[#1D2957]">{title}</h3>
    </div>
    <p className="mt-2 text-sm text-gray-600">{desc}</p>
  </div>
);

export default function FeatureTrio() {
  return (
    <section className="my-8">
      <div className="grid md:grid-cols-3 gap-4">
        <Item icon={Volume2} title="Pronunciation" desc="Hear native-like audio and practice phonetics for every word." />
        <Item icon={MessageSquare} title="Conversation Practice" desc="Chat with AI to improve fluency and confidence." />
        <Item icon={BookOpen} title="Vocabulary Builder" desc="Save words with meanings and learn efficiently." />
      </div>
    </section>
  );
}
