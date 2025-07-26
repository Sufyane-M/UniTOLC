import { useEffect } from "react";
import { useLocation } from "wouter";

// Types
interface SectionResult {
  name: string;
  score: {
    raw: number;
    total_questions: number;
    correct: number;
    incorrect: number;
    unanswered: number;
    max_score: number;
  };
  time_spent: number;
}

interface SimulationResults {
  session_id: number;
  exam_type: string;
  completion_time: string;
  sections: SectionResult[];
  overall_score: number;
  questions?: QuestionSummaryItem[];
}

interface QuestionSummaryItem {
  id: number;
  text: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation?: string;
}

interface ResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: SimulationResults;
}

const ResultsModal: React.FC<ResultsModalProps> = ({ isOpen, onClose, results }) => {
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    if (isOpen && results) {
      // Save results to localStorage for the results page
      localStorage.setItem('simulationResults', JSON.stringify(results));
      
      // Close the modal
      onClose();
      
      // Navigate to the dedicated results page
      setLocation('/results');
    }
  }, [isOpen, results, onClose, setLocation]);
  
  // This component now redirects to the dedicated results page
  // The modal functionality is handled by the useEffect above
  return null;
};

export default ResultsModal;