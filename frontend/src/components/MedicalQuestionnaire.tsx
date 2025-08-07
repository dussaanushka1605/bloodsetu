
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { toast } from "sonner";

interface Question {
  id: string;
  text: string;
  disqualifies: boolean;
}

const questions: Question[] = [
  {
    id: 'alcohol',
    text: 'Have you consumed alcohol in the last 24 hours?',
    disqualifies: true
  },
  {
    id: 'period',
    text: 'If you are a woman, are you on your period?',
    disqualifies: true
  },
  {
    id: 'hemoglobin',
    text: 'Have you been diagnosed with low hemoglobin levels?',
    disqualifies: true
  },
  {
    id: 'diabetes',
    text: 'Do you have any illness such as diabetes or hypertension?',
    disqualifies: false
  },
  {
    id: 'diseases',
    text: 'Have you ever tested positive for HIV, Hepatitis B or C?',
    disqualifies: true
  }
];

interface MedicalQuestionnaireProps {
  onComplete: (eligible: boolean) => void;
}

const MedicalQuestionnaire: React.FC<MedicalQuestionnaireProps> = ({ onComplete }) => {
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleAnswer = (questionId: string, answer: boolean) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = () => {
    // Check if all questions are answered
    if (Object.keys(answers).length !== questions.length) {
      toast("Please answer all questions", {
        description: "You need to answer all questions before submitting."
      });
      return;
    }

    // Check if any disqualifying questions were answered yes
    const disqualified = questions.some(q => q.disqualifies && answers[q.id]);

    setSubmitted(true);
    onComplete(!disqualified);

    if (disqualified) {
      toast("Not eligible for donation", {
        description: "Based on your responses, you are currently not eligible to donate blood."
      });
    } else {
      toast("You are eligible to donate!", {
        description: "Thank you for completing the questionnaire. You are eligible to donate blood."
      });
    }
  };

  const resetQuestionnaire = () => {
    setAnswers({});
    setSubmitted(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <AlertCircle className="h-5 w-5 mr-2 text-blood-600" />
          Medical Questionnaire
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!submitted ? (
          <>
            <p className="text-sm text-gray-600 mb-4">
              Please answer the following questions truthfully before accepting any donation request.
            </p>
            <div className="space-y-4">
              {questions.map((question) => (
                <div key={question.id} className="border p-4 rounded-md">
                  <p className="font-medium mb-2">{question.text}</p>
                  <div className="flex space-x-4 mt-2">
                    <Button
                      variant={answers[question.id] === true ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleAnswer(question.id, true)}
                    >
                      Yes
                    </Button>
                    <Button
                      variant={answers[question.id] === false ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleAnswer(question.id, false)}
                    >
                      No
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button className="w-full mt-6" onClick={handleSubmit}>
              Submit Questionnaire
            </Button>
          </>
        ) : (
          <div className="text-center">
            <p className="text-lg font-medium mb-4">
              Questionnaire completed
            </p>
            <Button onClick={resetQuestionnaire}>
              Retake Questionnaire
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MedicalQuestionnaire;
