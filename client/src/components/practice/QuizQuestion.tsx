import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Lock, Crown } from "lucide-react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

interface QuizQuestionProps {
  question: {
    id: number;
    text: string;
    options: string[];
    correctAnswer: string;
    explanation?: string;
  };
  selectedAnswer?: string;
  onSelectAnswer: (answer: string) => void;
  showExplanation: boolean;
  isPremium: boolean;
  questionNumber: number;
  totalQuestions: number;
}

const QuizQuestion = ({
  question,
  selectedAnswer,
  onSelectAnswer,
  showExplanation,
  isPremium,
  questionNumber,
  totalQuestions
}: QuizQuestionProps) => {
  const [, setLocation] = useLocation();
  
  const isCorrect = selectedAnswer === question.correctAnswer;
  
  return (
    <div>
      <div className="mb-1 flex justify-between items-center text-sm text-muted-foreground">
        <span>Domanda {questionNumber} di {totalQuestions}</span>
      </div>
      
      <div className="text-base mb-4 font-medium" dangerouslySetInnerHTML={{ __html: question.text }} />
      
      <RadioGroup
        value={selectedAnswer}
        onValueChange={onSelectAnswer}
        className="space-y-3 mt-4"
        disabled={showExplanation}
      >
        {question.options.map((option, index) => {
          const optionLetter = String.fromCharCode(97 + index); // a, b, c, d...
          const isOptionSelected = selectedAnswer === option;
          const isOptionCorrect = option === question.correctAnswer;
          
          return (
            <div
              key={optionLetter}
              className={cn(
                "flex items-center p-3 border rounded-md cursor-pointer transition-all",
                showExplanation && isOptionCorrect && "border-green-500 bg-green-50 dark:bg-green-900/20",
                showExplanation && isOptionSelected && !isOptionCorrect && "border-red-500 bg-red-50 dark:bg-red-900/20",
                !showExplanation && isOptionSelected && "border-primary-500 bg-primary-50 dark:bg-primary-900/20",
                !showExplanation && !isOptionSelected && "border-border"
              )}
            >
              <RadioGroupItem 
                value={option} 
                id={`option-${question.id}-${optionLetter}`} 
                disabled={showExplanation}
                className="h-4 w-4"
              />
              <Label 
                htmlFor={`option-${question.id}-${optionLetter}`}
                className="ml-3 cursor-pointer flex-grow"
                dangerouslySetInnerHTML={{ __html: option }}
              />
            </div>
          );
        })}
      </RadioGroup>
      
      {/* Explanation (premium feature) */}
      {showExplanation && (
        <div className="mt-5 border-t border-border pt-4">
          <h3 className="font-medium mb-2">Spiegazione</h3>
          {!isPremium ? (
            <div className="bg-accent/50 rounded p-4 flex items-start">
              <Lock className="h-5 w-5 text-muted-foreground mr-3 mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Le spiegazioni dettagliate sono disponibili solo per gli utenti Premium.
                </p>
                <Button 
                  size="sm"
                  className="bg-amber-500 hover:bg-amber-600"
                  onClick={() => setLocation("/settings")}
                >
                  <Crown className="h-4 w-4 mr-1.5" /> Sblocca con Premium
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              <p dangerouslySetInnerHTML={{ __html: question.explanation?.replace(/\n/g, '<br />') || "" }} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuizQuestion;
