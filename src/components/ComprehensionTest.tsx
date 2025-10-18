'use client';

import { useState } from 'react';
import { ComprehensionTest as ComprehensionTestType } from '@/types';
import { Lightbulb, CheckCircle, XCircle } from 'lucide-react';

interface ComprehensionTestProps {
  test: ComprehensionTestType;
  onPass: () => void;
  onFail?: () => void;
}

export default function ComprehensionTest({ test, onPass, onFail }: ComprehensionTestProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleSubmit = () => {
    if (selectedOption === null) return;

    setSubmitted(true);
    const correct = selectedOption === test.correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      onPass();
    } else if (onFail) {
      onFail();
    }
  };

  const handleRetry = () => {
    setSelectedOption(null);
    setSubmitted(false);
    setIsCorrect(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-card p-6 border border-morandi-gray-200">
      <h3 className="text-xl font-bold text-morandi-gray-800 mb-4 flex items-center gap-2">
        <div className="p-2 bg-morandi-blue-100 rounded-lg">
          <Lightbulb className="w-5 h-5 text-morandi-blue-600" />
        </div>
        理解测试
      </h3>

      <div className="mb-6">
        <p className="text-morandi-gray-700 font-medium mb-4">{test.question}</p>

        <div className="space-y-3">
          {test.options.map((option, index) => (
            <div
              key={index}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                submitted
                  ? index === test.correctAnswer
                    ? 'border-morandi-green-500 bg-morandi-green-50'
                    : index === selectedOption
                      ? 'border-morandi-red-500 bg-morandi-red-50'
                      : 'border-morandi-gray-200'
                  : selectedOption === index
                    ? 'border-morandi-blue-500 bg-morandi-blue-50'
                    : 'border-morandi-gray-200 hover:border-morandi-blue-300 hover:bg-morandi-blue-50'
              }`}
              onClick={() => !submitted && setSelectedOption(index)}
            >
              <div className="flex items-start gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  submitted
                    ? index === test.correctAnswer
                      ? 'bg-morandi-green-500 text-white'
                      : index === selectedOption
                        ? 'bg-morandi-red-500 text-white'
                        : 'bg-morandi-gray-200 text-morandi-gray-500'
                    : selectedOption === index
                      ? 'bg-morandi-blue-500 text-white'
                      : 'bg-morandi-gray-200 text-morandi-gray-500'
                }`}>
                  {String.fromCharCode(65 + index)}
                </div>
                <p className="text-morandi-gray-700">{option}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {!submitted ? (
        <button
          onClick={handleSubmit}
          disabled={selectedOption === null}
          className={`w-full py-3 px-4 rounded-xl font-medium transition-all ${
            selectedOption === null
              ? 'bg-morandi-gray-200 text-morandi-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-morandi-blue-500 to-morandi-blue-600 hover:from-morandi-blue-600 hover:to-morandi-blue-700 text-white shadow-md hover:shadow-lg'
          }`}
        >
          提交答案
        </button>
      ) : (
        <div className="space-y-4">
          <div className={`p-4 rounded-xl ${
            isCorrect
              ? 'bg-morandi-green-50 border border-morandi-green-200'
              : 'bg-morandi-red-50 border border-morandi-red-200'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {isCorrect ? (
                <CheckCircle className="w-5 h-5 text-morandi-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-morandi-red-600" />
              )}
              <span className={`font-bold ${
                isCorrect ? 'text-morandi-green-800' : 'text-morandi-red-800'
              }`}>
                {isCorrect ? '回答正确！' : '回答错误'}
              </span>
            </div>
            <p className={`text-sm ${
              isCorrect ? 'text-morandi-green-700' : 'text-morandi-red-700'
            }`}>
              {test.explanation}
            </p>
          </div>

          {!isCorrect && (
            <button
              onClick={handleRetry}
              className="w-full bg-gradient-to-r from-morandi-blue-500 to-morandi-blue-600 hover:from-morandi-blue-600 hover:to-morandi-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg"
            >
              重新答题
            </button>
          )}
        </div>
      )}
    </div>
  );
}