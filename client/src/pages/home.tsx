import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AuthModal from "@/components/auth/AuthModal";
import { useAuth } from "@/context/AuthContext";
import { Check, Crown, BookOpen, BarChart2, Brain, Timer } from "lucide-react";
import { motion } from "framer-motion";
import Pricing from "@/components/pricing/Pricing";

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "register">("login");
  
  // Reindirizza gli utenti autenticati alla dashboard
  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/dashboard");
      return;
    }
    
    // Controlla se ci sono parametri nell'URL per aprire il modale di autenticazione
    const params = new URLSearchParams(location.split("?")[1]);
    if (params.get("auth") === "login") {
      setAuthModalMode("login");
      setIsAuthModalOpen(true);
    } else if (params.get("auth") === "register") {
      setAuthModalMode("register");
      setIsAuthModalOpen(true);
    }
  }, [location, isAuthenticated, setLocation]);
  
  const openRegisterModal = () => {
    setAuthModalMode("register");
    setIsAuthModalOpen(true);
  };
  
  const openLoginModal = () => {
    setAuthModalMode("login");
    setIsAuthModalOpen(true);
  };
  
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-primary-50 to-white dark:from-gray-900 dark:to-gray-900 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6 leading-tight">
                Preparati per gli esami TOLC con <span className="text-primary">TolcPrep</span>
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                La piattaforma completa per prepararti agli esami di ammissione universitari TOLC con percorsi di studio personalizzati, quiz interattivi e analisi dettagliate.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                {isAuthenticated ? (
                  <Button size="lg" onClick={() => setLocation("/dashboard")}>
                    Vai alla dashboard
                  </Button>
                ) : (
                  <>
                    <Button size="lg" onClick={openRegisterModal}>
                      Inizia gratuitamente
                    </Button>
                    <Button variant="outline" size="lg" onClick={openLoginModal}>
                      Accedi
                    </Button>
                  </>
                )}
              </div>
            </div>
            <div className="flex justify-center">
              <div className="relative w-full max-w-md">
                <div className="absolute -top-6 -left-6 w-24 h-24 bg-primary/10 rounded-full"></div>
                <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-primary/10 rounded-full"></div>
                <Card className="shadow-lg relative z-10">
                  <CardContent className="p-0">
                    <img 
                      src="https://plus.unsplash.com/premium_photo-1679079456083-9f288e224e96?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                      alt="Studenti che studiano"
                      className="w-full h-auto rounded-lg"
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-heading font-bold mb-4">Tutto ciò di cui hai bisogno per superare il TOLC</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              TolcPrep offre strumenti completi per aiutarti a prepararti al meglio per l'esame di ammissione.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
              <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-heading font-semibold mb-3">Materiali di studio mirati</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Contenuti organizzati per argomento e livello di difficoltà, creati appositamente per il TOLC.
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
              <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Timer className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-heading font-semibold mb-3">Simulazioni realistiche</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Esercitati con simulazioni che replicano esattamente le condizioni dell'esame ufficiale.
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
              <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <BarChart2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-heading font-semibold mb-3">Analisi delle performance</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Monitora i tuoi progressi e identifica le aree che richiedono maggiore attenzione.
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
              <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-heading font-semibold mb-3">Percorsi personalizzati</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Ricevi raccomandazioni di studio basate sulle tue performance individuali.
              </p>
            </div>
            

            
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
              <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Crown className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-heading font-semibold mb-3">Funzionalità Premium</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Sblocca spiegazioni dettagliate, analytics avanzate e accesso illimitato ai test.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-heading font-bold mb-4">Cosa dicono i nostri studenti</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Scopri le esperienze di chi ha superato il TOLC con TolcPrep.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mr-4">
                    <span className="text-primary font-bold">MR</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Marco Rossi</h4>
                    <p className="text-sm text-muted-foreground">Politecnico di Milano</p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  "Grazie a TolcPrep sono riuscito a concentrarmi sulle mie aree più deboli. Le simulazioni erano praticamente identiche all'esame reale. Ho superato il TOLC-I con 35/50!"
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mr-4">
                    <span className="text-primary font-bold">LB</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Laura Bianchi</h4>
                    <p className="text-sm text-muted-foreground">Università di Bologna</p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  "Le analisi dettagliate dopo ogni quiz mi hanno permesso di capire davvero i miei errori. Il piano di studio personalizzato è stato fondamentale per ottimizzare il mio tempo."
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mr-4">
                    <span className="text-primary font-bold">GF</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Giulia Ferrari</h4>
                    <p className="text-sm text-muted-foreground">Università di Padova</p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  "Studiare con TolcPrep mi ha dato molta sicurezza. Ho potuto fare tutte le simulazioni che volevo e questo mi ha aiutato a gestire meglio l'ansia il giorno dell'esame."
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Pricing Section */}
      <Pricing />
      
      {/* FAQ Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-heading font-bold mb-4">Domande frequenti</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Risposte alle domande più comuni su TolcPrep.
            </p>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">Cosa sono gli esami TOLC?</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  I TOLC (Test Online CISIA) sono i test di ammissione utilizzati da molte università italiane per l'accesso ai corsi di laurea. Esistono diversi tipi di TOLC in base all'area di studio: TOLC-I (Ingegneria), TOLC-E (Economia), TOLC-F (Farmacia) e altri.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">Come funziona l'abbonamento Premium?</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  L'abbonamento Premium ha un costo di €5 al mese e può essere cancellato in qualsiasi momento. Ti dà accesso a tutte le funzionalità avanzate della piattaforma, incluse spiegazioni dettagliate, analytics avanzate e accesso illimitato a tutti i materiali.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">Quanto tempo prima dovrei iniziare a prepararmi?</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Consigliamo di iniziare la preparazione almeno 2-3 mesi prima della data dell'esame. Questo ti darà il tempo sufficiente per coprire tutti gli argomenti e fare abbastanza esercitazione pratica.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">Le simulazioni sono aggiornate?</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Sì, tutte le nostre simulazioni sono aggiornate regolarmente per riflettere i cambiamenti nei format e nei contenuti degli esami TOLC ufficiali.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      

      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        initialMode={authModalMode}
      />
    </>
  );
};

export default Home;
