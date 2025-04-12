import { useState } from "react";
import { useLocation } from "wouter";
import QuizTypes from "@/components/practice/QuizTypes";
import RecentQuizzes from "@/components/practice/RecentQuizzes";
import QuizContainer from "@/components/practice/QuizContainer";

const Practice = () => {
  const [location] = useLocation();
  const [activeTab, setActiveTab] = useState<"types" | "recent" | "demo">("types");
  
  // Se siamo in una pagina specifica di quiz, mostriamo il quiz container appropriato
  const isQuizPage = location.includes("/practice/quiz/") || 
                       location.includes("/practice/simulation/") || 
                       location.includes("/practice/flashcards/");
  
  // Estrai l'ID del quiz dall'URL se presente
  const quizIdMatch = location.match(/\/practice\/(quiz|simulation|flashcards)\/(\d+)/);
  const quizId = quizIdMatch ? parseInt(quizIdMatch[2]) : undefined;
  
  if (isQuizPage && quizId) {
    // Se siamo in una pagina di quiz, mostra il contenitore del quiz
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-2xl font-heading font-bold mb-6">Quiz</h1>
        <QuizContainer quizId={quizId} />
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-heading font-bold mb-6">Pratica</h1>
      
      <div className="space-y-8">
        {/* Tipi di quiz */}
        <QuizTypes />
        
        {/* Quiz recenti */}
        <RecentQuizzes />
        
        {/* Demo di una domanda */}
        <QuizContainer demoMode={true} />
      </div>
    </div>
  );
};

export default Practice;
