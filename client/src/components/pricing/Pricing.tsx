import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CheckIcon = () => (
  <svg
    className="w-6 h-6 text-blue-500 mr-3 flex-shrink-0"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const Pricing = () => {
  return (
    <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center p-4 sm:p-8">
      <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
        
        {/* Left Column */}
        <div className="space-y-8">
          <div>
            <span className="inline-block bg-blue-500/10 text-blue-400 text-sm font-semibold px-3 py-1 rounded-full">
              Piano Premium
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold mt-4 leading-tight">
              Sblocca tutto il potenziale con Premium
            </h1>
            <p className="mt-4 text-lg text-gray-400">
              Accedi a funzionalità avanzate che ti aiuteranno a ottenere risultati migliori e a prepararti in modo più efficiente.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start">
              <CheckIcon />
              <div>
                <h3 className="font-semibold text-lg">Spiegazioni dettagliate</h3>
                <p className="text-gray-400">
                  Accedi a spiegazioni approfondite per ogni domanda, con riferimenti teorici e metodologie di risoluzione.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <CheckIcon />
              <div>
                <h3 className="font-semibold text-lg">Piano di studio AI</h3>
                <p className="text-gray-400">
                  Ricevi un piano di preparazione personalizzato generato dall'intelligenza artificiale in base alle tue esigenze.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <CheckIcon />
              <div>
                <h3 className="font-semibold text-lg">Quiz personalizzati</h3>
                <p className="text-gray-400">
                  Ricevi quotidianamente domande mirate per migliorare nelle aree in cui sei più debole.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg w-full sm:w-auto text-base">
              Inizia con il piano gratuito
            </Button>
            <Button variant="outline" className="border-gray-600 hover:bg-gray-800 text-gray-300 font-bold py-3 px-6 rounded-lg w-full sm:w-auto text-base">
              Premium a soli 5€/mese
            </Button>
          </div>
        </div>

        {/* Right Column (Pricing Card) */}
        <div className="relative">
          {/* Outer glow effect */}
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/30 via-blue-400/30 to-cyan-500/30 rounded-3xl blur-2xl opacity-60"></div>
          {/* Inner glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/40 to-blue-500/40 rounded-2xl blur-xl opacity-80"></div>
          {/* Card with enhanced shadow */}
          <div className="relative bg-gray-800/90 backdrop-blur-sm p-8 rounded-2xl shadow-[0_0_50px_rgba(59,130,246,0.3),0_0_100px_rgba(59,130,246,0.2)] border border-gray-600/50">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold">Piano Premium</h2>
                <p className="text-gray-400">Tutte le funzionalità avanzate</p>
              </div>
              <p className="text-4xl font-bold">5€<span className="text-lg font-medium text-gray-400">/mese</span></p>
            </div>

            <ul className="space-y-4 mt-8">
              <li className="flex items-center">
                <Check className="w-5 h-5 text-blue-500 mr-3" />
                <span>Accesso a tutte le simulazioni</span>
              </li>
              <li className="flex items-center">
                <Check className="w-5 h-5 text-blue-500 mr-3" />
                <span>Spiegazioni dettagliate delle soluzioni</span>
              </li>
              <li className="flex items-center">
                <Check className="w-5 h-5 text-blue-500 mr-3" />
                <span>Piano di studio personalizzato con AI</span>
              </li>
              <li className="flex items-center">
                <Check className="w-5 h-5 text-blue-500 mr-3" />
                <span>Domande del giorno personalizzate</span>
              </li>
              <li className="flex items-center">
                <Check className="w-5 h-5 text-blue-500 mr-3" />
                <span>Quiz di verifica per ogni argomento</span>
              </li>
              <li className="flex items-center">
                <Check className="w-5 h-5 text-blue-500 mr-3" />
                <span>Report avanzati e statistiche dettagliate</span>
              </li>
              <li className="flex items-center">
                <Check className="w-5 h-5 text-blue-500 mr-3" />
                <span>Download illimitati di PDF e risorse</span>
              </li>
            </ul>

            <Button size="lg" className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg text-base">
              Attiva Premium
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Pricing;