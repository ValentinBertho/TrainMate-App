// src/pages/Onboarding.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileAPI } from '../lib/profile';
import { Button } from '../components/Button';
import { Alert } from '../components/Alert';
import { ChevronRight, ChevronLeft } from 'lucide-react';

const steps = [
  {
    title: 'Quel est ton sport principal ?',
    field: 'primarySport',
    options: [
      { value: 'Running', label: '🏃‍♂️ Course à pied', emoji: '🏃‍♂️' },
      { value: 'Cycling', label: '🚴‍♂️ Cyclisme', emoji: '🚴‍♂️' },
      { value: 'Both', label: '🏃‍♂️🚴‍♂️ Les deux', emoji: '🏃‍♂️🚴‍♂️' }
    ]
  },
  {
    title: 'Quel est ton niveau ?',
    field: 'level',
    options: [
      { value: 'Beginner', label: 'Débutant', desc: 'Je commence ou reprends' },
      { value: 'Intermediate', label: 'Intermédiaire', desc: "J'ai de l'expérience" },
      { value: 'Advanced', label: 'Avancé', desc: 'Je suis régulier et performant' },
      { value: 'Expert', label: 'Expert', desc: 'Compétiteur aguerri' }
    ]
  },
  {
    title: 'Quel est ton objectif ?',
    field: 'goal',
    type: 'input',
    placeholder: 'Ex: Courir un 10K, améliorer mon endurance...'
  },
  {
    title: 'Combien de temps peux-tu consacrer par semaine ?',
    field: 'availability',
    type: 'multi',
    fields: [
      { 
        name: 'weeklyAvailableHours', 
        label: 'Heures disponibles', 
        type: 'number',
        min: 1,
        max: 20,
        placeholder: '5'
      },
      { 
        name: 'preferredSessionsPerWeek', 
        label: 'Séances par semaine', 
        type: 'number',
        min: 1,
        max: 7,
        placeholder: '3'
      }
    ]
  },
  {
    title: 'Quel matériel as-tu ?',
    field: 'equipment',
    type: 'checkbox',
    options: [
      { value: 'hasGps', label: 'Montre GPS / Application de suivi' },
      { value: 'hasHeartRateMonitor', label: 'Capteur de fréquence cardiaque' },
      { value: 'hasPowerMeter', label: 'Capteur de puissance (vélo)' },
      { value: 'hasIndoorTrainer', label: 'Home trainer / Vélo d\'intérieur' }
    ]
  }
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    primarySport: '',
    level: '',
    goal: '',
    weeklyAvailableHours: 5,
    preferredSessionsPerWeek: 3,
    hasGps: false,
    hasHeartRateMonitor: false,
    hasPowerMeter: false,
    hasIndoorTrainer: false
  });

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = async () => {
    // Validation du step actuel
    if (step.type === 'input' && !formData[step.field]) {
      setError('Merci de remplir ce champ');
      return;
    }
    if (!step.type && !formData[step.field]) {
      setError('Merci de faire un choix');
      return;
    }

    setError('');

    if (isLastStep) {
      await handleSubmit();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await profileAPI.update(formData);
      navigate('/dashboard');
    } catch (err) {
      setError('Une erreur est survenue. Réessaie.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (value) => {
    setFormData(prev => ({ ...prev, [step.field]: value }));
    setError('');
  };

  const handleCheckbox = (field) => {
    setFormData(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleMultiChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: parseInt(value) || 0 }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Étape {currentStep + 1} sur {steps.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(((currentStep + 1) / steps.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">{step.title}</h2>

          {error && (
            <div className="mb-4">
              <Alert type="error">{error}</Alert>
            </div>
          )}

          {/* Options buttons */}
          {!step.type && (
            <div className="space-y-3">
              {step.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    formData[step.field] === option.value
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {option.emoji && <span className="text-3xl">{option.emoji}</span>}
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{option.label}</div>
                      {option.desc && (
                        <div className="text-sm text-gray-500 mt-1">{option.desc}</div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Input text */}
          {step.type === 'input' && (
            <input
              type="text"
              value={formData[step.field]}
              onChange={(e) => setFormData(prev => ({ ...prev, [step.field]: e.target.value }))}
              placeholder={step.placeholder}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-600"
            />
          )}

          {/* Multi fields */}
          {step.type === 'multi' && (
            <div className="space-y-4">
              {step.fields.map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    min={field.min}
                    max={field.max}
                    value={formData[field.name]}
                    onChange={(e) => handleMultiChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-600"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Checkboxes */}
          {step.type === 'checkbox' && (
            <div className="space-y-3">
              {step.options.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center p-4 rounded-xl border-2 border-gray-200 hover:border-gray-300 cursor-pointer transition-all"
                >
                  <input
                    type="checkbox"
                    checked={formData[option.value]}
                    onChange={() => handleCheckbox(option.value)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-gray-900">{option.label}</span>
                </label>
              ))}
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex gap-4 mt-8">
            {currentStep > 0 && (
              <Button
                variant="secondary"
                onClick={handleBack}
                className="flex items-center space-x-2"
              >
                <ChevronLeft size={20} />
                <span>Retour</span>
              </Button>
            )}
            
            <Button
              onClick={handleNext}
              disabled={loading}
              className="flex-1 flex items-center justify-center space-x-2"
              size="lg"
            >
              <span>{loading ? 'Enregistrement...' : isLastStep ? 'Terminer' : 'Suivant'}</span>
              {!isLastStep && <ChevronRight size={20} />}
            </Button>
          </div>
        </div>

        {/* Skip option */}
        {currentStep === 0 && (
          <div className="mt-4 text-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Passer cette étape
            </button>
          </div>
        )}
      </div>
    </div>
  );
}