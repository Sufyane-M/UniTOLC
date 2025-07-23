import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { 
  BookOpen, 
  Clock, 
  Euro, 
  Users, 
  Monitor, 
  Home, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  Target,
  GraduationCap
} from "lucide-react";
import { useLocation } from "wouter";

const CosETolc = () => {
  const [, setLocation] = useLocation();

  const tolcTypes = [
    {
      name: "TOLC-I",
      description: "Ingegneria e corsi tecnico-scientifici",
      subjects: "Matematica, Logica, Scienze, Comprensione verbale",
      questions: "50 + Inglese",
      duration: "125 min",
      color: "bg-blue-100 text-blue-800"
    },
    {
      name: "TOLC-E",
      description: "Economia e scienze sociali",
      subjects: "Logica, Comprensione verbale, Matematica",
      questions: "36 + Inglese",
      duration: "105 min",
      color: "bg-green-100 text-green-800"
    },
    {
      name: "TOLC-F",
      description: "Farmacia e Chimica farmaceutica",
      subjects: "Biologia, Chimica, Matematica, Fisica, Logica",
      questions: "50 + Inglese",
      duration: "87 min",
      color: "bg-purple-100 text-purple-800"
    },
    {
      name: "TOLC-B",
      description: "Biologia e Biotecnologie",
      subjects: "Matematica, Biologia, Fisica, Chimica",
      questions: "50 + Inglese",
      duration: "125 min",
      color: "bg-orange-100 text-orange-800"
    },
    {
      name: "TOLC-S",
      description: "Scienze (Matematica, Fisica, Chimica, ecc.)",
      subjects: "Matematica, Ragionamento, Biologia, Chimica, Fisica, Scienze della Terra",
      questions: "55 + Inglese",
      duration: "135 min",
      color: "bg-red-100 text-red-800"
    },
    {
      name: "TOLC-SU",
      description: "Studi umanistici",
      subjects: "Comprensione del testo, Conoscenze acquisite, Ragionamento logico",
      questions: "50 + Inglese",
      duration: "115 min",
      color: "bg-yellow-100 text-yellow-800"
    },
    {
      name: "TOLC-AV",
      description: "Agraria e Veterinaria",
      subjects: "Biologia, Chimica, Fisica, Matematica, Logica, Comprensione verbale",
      questions: "50 + Inglese",
      duration: "115 min",
      color: "bg-emerald-100 text-emerald-800"
    },
    {
      name: "TOLC-PSI",
      description: "Psicologia",
      subjects: "Comprensione del testo, Matematica, Ragionamento verbale e numerico, Biologia",
      questions: "50 + Inglese",
      duration: "115 min",
      color: "bg-pink-100 text-pink-800"
    }
  ];

  const keyFeatures = [
    {
      icon: <Target className="h-6 w-6" />,
      title: "Test di Ammissione",
      description: "Utilizzato dalle università per valutare le conoscenze necessarie per intraprendere un percorso di studi"
    },
    {
      icon: <GraduationCap className="h-6 w-6" />,
      title: "Strumento di Orientamento",
      description: "Può essere sostenuto dal penultimo anno delle superiori per aiutare nella scelta del percorso di studi"
    },
    {
      icon: <CheckCircle className="h-6 w-6" />,
      title: "Validità Nazionale",
      description: "Il risultato è valido in tutti gli atenei che utilizzano quel tipo di TOLC, indipendentemente dalla sede"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink 
              onClick={() => setLocation("/")} 
              className="cursor-pointer hover:text-blue-600"
            >
              <Home className="h-4 w-4" />
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Cos'è il TOLC</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Cos'è il TOLC?
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Tutto quello che devi sapere sui Test OnLine CISIA per l'accesso all'università
        </p>
      </div>

      {/* Introduzione */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-blue-600" />
            Introduzione al TOLC
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Il <strong>TOLC (Test OnLine CISIA)</strong> è un test di ammissione creato dal <strong>CISIA</strong> 
            (Consorzio Interuniversitario Sistemi Integrati per l'Accesso), un consorzio senza finalità di lucro 
            a cui aderiscono esclusivamente università pubbliche italiane.
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            I TOLC sono test individuali, solitamente diversi per ogni partecipante, composti da quesiti 
            selezionati automaticamente e casualmente dal database CISIA attraverso software proprietario.
          </p>
        </CardContent>
      </Card>

      {/* Caratteristiche Principali */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {keyFeatures.map((feature, index) => (
          <Card key={index} className="text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
                {feature.icon}
              </div>
              <CardTitle className="text-lg">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Accordion con informazioni dettagliate */}
      <Accordion type="single" collapsible className="space-y-4">
        {/* Tipologie di TOLC */}
        <AccordionItem value="types" className="border rounded-lg px-6">
          <AccordionTrigger className="text-lg font-semibold">
            Tipologie di TOLC
          </AccordionTrigger>
          <AccordionContent className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Esistono diverse tipologie di TOLC, ciascuna specifica per determinati corsi di laurea:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {tolcTypes.map((tolc, index) => (
                <Card key={index} className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{tolc.name}</CardTitle>
                      <Badge className={tolc.color}>{tolc.questions}</Badge>
                    </div>
                    <CardDescription className="font-medium">
                      {tolc.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">{tolc.subjects}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">Durata: {tolc.duration}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Modalità di svolgimento */}
        <AccordionItem value="modes" className="border rounded-lg px-6">
          <AccordionTrigger className="text-lg font-semibold">
            Modalità di Svolgimento
          </AccordionTrigger>
          <AccordionContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="h-5 w-5 text-blue-600" />
                    TOLC@UNI
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li>• Test svolto in presenza presso le aule universitarie</li>
                    <li>• Supervisione diretta da parte del personale universitario</li>
                    <li>• Ambiente controllato e standardizzato</li>
                    <li>• Maggiore disponibilità di date e sedi</li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="h-5 w-5 text-green-600" />
                    TOLC@CASA
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li>• Test svolto da remoto tramite laptop e smartphone/tablet</li>
                    <li>• Supervisione tramite Zoom e app HORIZON</li>
                    <li>• Requisiti tecnici specifici (connessione stabile, webcam)</li>
                    <li>• Maggiore flessibilità geografica</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Sistema di punteggio */}
        <AccordionItem value="scoring" className="border rounded-lg px-6">
          <AccordionTrigger className="text-lg font-semibold">
            Sistema di Punteggio e Struttura
          </AccordionTrigger>
          <AccordionContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Punteggio Sezioni Specifiche</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span><strong>+1 punto</strong> per risposta corretta</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span><strong>-0,25 punti</strong> per risposta errata</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-gray-400" />
                      <span><strong>0 punti</strong> per risposta non data</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Sezione Inglese</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span><strong>+1 punto</strong> per risposta corretta</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-gray-400" />
                      <span><strong>0 punti</strong> per risposta errata o non data</span>
                    </li>
                    <li className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      * La sezione inglese non contribuisce al punteggio finale
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Costi e validità */}
        <AccordionItem value="costs" className="border rounded-lg px-6">
          <AccordionTrigger className="text-lg font-semibold">
            Costi, Validità e Frequenza
          </AccordionTrigger>
          <AccordionContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Euro className="h-5 w-5 text-green-600" />
                    Costo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">35€</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Contributo fisso per ogni tentativo (aggiornato 2025)
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    Validità
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-2">Anno solare</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Valido almeno fino a dicembre dell'anno di svolgimento
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-purple-600" />
                    Frequenza
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 mb-2">1/mese</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Stesso tipo di TOLC una volta per mese solare
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Iscrizione e prenotazione */}
        <AccordionItem value="registration" className="border rounded-lg px-6">
          <AccordionTrigger className="text-lg font-semibold">
            Come Iscriversi e Prenotare
          </AccordionTrigger>
          <AccordionContent className="space-y-4">
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Procedura di Iscrizione</h4>
                <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
                  <li>Registrazione nell'Area Riservata CISIA</li>
                  <li>Verifica delle date disponibili nel calendario</li>
                  <li>Selezione della modalità (TOLC@UNI o TOLC@CASA)</li>
                  <li>Scelta della sede e della data</li>
                  <li>Pagamento tramite carta di credito o MAV bancario</li>
                  <li>Upload del documento di identità</li>
                  <li>Download dell'app HORIZON (per TOLC@CASA)</li>
                </ol>
              </div>
              
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">Requisiti Tecnici TOLC@CASA</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                  <li>Laptop con webcam integrata e connessione elettrica</li>
                  <li>Smartphone/tablet con app Zoom aggiornata</li>
                  <li>Connessione internet stabile (no VPN/Proxy)</li>
                  <li>Stanza privata, ben illuminata e chiusa</li>
                  <li>Fogli bianchi e penna per appunti</li>
                </ul>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Call to Action */}
      <Card className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <CardContent className="text-center py-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Pronto per iniziare la tua preparazione?
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
            Inizia subito a prepararti con le nostre simulazioni TOLC personalizzate e materiali di studio aggiornati.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => setLocation("/practice")} 
              className="bg-blue-600 hover:bg-blue-700"
            >
              Inizia a Praticare
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setLocation("/dashboard")}
            >
              Vai alla Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CosETolc;