import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, HelpCircle, BookOpen, CreditCard, Settings, Shield, MessageSquare } from "lucide-react";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  // Generale
  {
    id: "general-1",
    question: "Cos'è StudentExamPrep?",
    answer: "StudentExamPrep è una piattaforma online dedicata alla preparazione degli esami TOLC (Test OnLine CISIA) per l'ammissione universitaria. Offre simulazioni realistiche, materiali di studio e percorsi personalizzati per aiutarti a superare il test con successo.",
    category: "generale"
  },
  {
    id: "general-2",
    question: "Per quali tipi di TOLC posso prepararmi?",
    answer: "La piattaforma supporta tutti i principali test TOLC: TOLC-I (Ingegneria), TOLC-E (Economia), TOLC-F (Farmacia), TOLC-S (Scienze) e English TOLC. Ogni tipo di test ha contenuti specifici e simulazioni dedicate.",
    category: "generale"
  },
  {
    id: "general-3",
    question: "È necessario registrarsi per utilizzare la piattaforma?",
    answer: "Sì, la registrazione è necessaria per accedere alle funzionalità di studio, salvare i progressi e ricevere raccomandazioni personalizzate. La registrazione è gratuita e richiede solo pochi minuti.",
    category: "generale"
  },
  
  // Account
  {
    id: "account-1",
    question: "Come posso creare un account?",
    answer: "Puoi registrarti facilmente con la tua email dalla homepage cliccando su 'Inizia gratuitamente'. Riceverai un'email di conferma per attivare l'account e potrai iniziare subito a studiare.",
    category: "account"
  },
  {
    id: "account-2",
    question: "Posso modificare i miei dati personali?",
    answer: "Sì, puoi modificare username, email e altre informazioni del profilo dalla sezione Impostazioni. Accedi al tuo profilo e clicca su 'Modifica profilo' per aggiornare i tuoi dati.",
    category: "account"
  },
  {
    id: "account-3",
    question: "Come posso recuperare la password?",
    answer: "Utilizza il link 'Password dimenticata?' nella pagina di login e inserisci la tua email. Riceverai un'email con le istruzioni per reimpostare la password in modo sicuro.",
    category: "account"
  },
  
  // Studio
  {
    id: "study-1",
    question: "Come funzionano le simulazioni?",
    answer: "Le simulazioni replicano esattamente le condizioni del test TOLC reale, con lo stesso numero di domande, tempo limite e tipologie di quesiti. Puoi scegliere il tipo di TOLC e iniziare immediatamente la simulazione.",
    category: "studio"
  },
  {
    id: "study-2",
    question: "Posso rivedere le mie risposte dopo una simulazione?",
    answer: "Sì, al termine di ogni simulazione puoi rivedere tutte le domande, le tue risposte e quelle corrette. Con il piano Premium hai accesso anche alle spiegazioni dettagliate per ogni domanda.",
    category: "studio"
  },
  {
    id: "study-3",
    question: "Come vengono identificate le mie aree deboli?",
    answer: "Il sistema analizza automaticamente le tue performance per materia e argomento, identificando dove hai più difficoltà. Nella dashboard puoi vedere un riepilogo delle tue aree deboli e ricevere quiz mirati.",
    category: "studio"
  },
  {
    id: "study-4",
    question: "Posso studiare argomenti specifici?",
    answer: "Sì, puoi accedere a quiz organizzati per materia e argomento per concentrarti su aree specifiche. Vai alla sezione 'Pratica per argomento' per scegliere cosa studiare.",
    category: "studio"
  },
  
  // Premium
  {
    id: "premium-1",
    question: "Cosa include il piano Premium?",
    answer: "Il piano Premium (€5/mese) include: spiegazioni dettagliate per ogni domanda, piano di studio personalizzato con AI, quiz mirati alle tue debolezze, analytics avanzate, accesso illimitato alle simulazioni e download di risorse PDF.",
    category: "premium"
  },
  {
    id: "premium-2",
    question: "Posso provare Premium gratuitamente?",
    answer: "Sì, è disponibile un periodo di prova gratuito per testare tutte le funzionalità Premium. Potrai valutare se il piano Premium fa al caso tuo prima di sottoscrivere l'abbonamento.",
    category: "premium"
  },
  {
    id: "premium-3",
    question: "Come posso disdire l'abbonamento?",
    answer: "Puoi disdire l'abbonamento in qualsiasi momento dalle Impostazioni del tuo account, nella sezione 'Abbonamento'. La disdetta avrà effetto alla fine del periodo di fatturazione corrente.",
    category: "premium"
  },
  {
    id: "premium-4",
    question: "Cosa succede ai miei dati se disdico Premium?",
    answer: "I tuoi progressi e dati rimangono salvati nel tuo account, ma perderai l'accesso alle funzionalità Premium come le spiegazioni dettagliate e il piano di studio AI. Potrai sempre riattivare Premium in futuro.",
    category: "premium"
  },
  
  // Supporto
  {
    id: "support-1",
    question: "Su quali dispositivi posso utilizzare la piattaforma?",
    answer: "La piattaforma è ottimizzata per desktop, tablet e smartphone con qualsiasi browser moderno (Chrome, Firefox, Safari, Edge). L'interfaccia si adatta automaticamente alle dimensioni del tuo schermo.",
    category: "supporto"
  },
  {
    id: "support-2",
    question: "I miei dati sono sicuri?",
    answer: "Sì, utilizziamo Supabase con crittografia avanzata e rispettiamo tutte le normative sulla privacy (GDPR). I tuoi dati personali e i progressi di studio sono protetti e non vengono mai condivisi con terze parti.",
    category: "supporto"
  },
  {
    id: "support-3",
    question: "Come posso contattare il supporto?",
    answer: "Puoi contattarci tramite il sistema di ticket nella sezione Supporto del tuo account. Gli utenti Premium hanno accesso al supporto prioritario con tempi di risposta più rapidi.",
    category: "supporto"
  },
  {
    id: "support-4",
    question: "La piattaforma funziona offline?",
    answer: "No, è necessaria una connessione internet per accedere ai contenuti e sincronizzare i progressi. Questo ci permette di offrirti sempre i contenuti più aggiornati e di salvare automaticamente i tuoi progressi.",
    category: "supporto"
  },
  
  // Preparazione
  {
    id: "prep-1",
    question: "Quanto tempo prima dell'esame dovrei iniziare a prepararmi?",
    answer: "Consigliamo di iniziare almeno 2-3 mesi prima dell'esame per una preparazione completa. Tuttavia, il nostro piano di studio AI può adattarsi anche a tempi più brevi, ottimizzando il tuo percorso in base al tempo disponibile.",
    category: "preparazione"
  },
  {
    id: "prep-2",
    question: "Le domande sono aggiornate?",
    answer: "Sì, il nostro database viene costantemente aggiornato per riflettere le tipologie e difficoltà dei test TOLC attuali. Collaboriamo con esperti del settore per garantire contenuti sempre allineati agli standard CISIA.",
    category: "preparazione"
  },
  {
    id: "prep-3",
    question: "Posso impostare un obiettivo di punteggio?",
    answer: "Sì, puoi configurare il tuo punteggio obiettivo nella sezione 'Configura Esame' della dashboard. Il sistema creerà un piano di studio personalizzato per aiutarti a raggiungere il tuo obiettivo.",
    category: "preparazione"
  },
  {
    id: "prep-4",
    question: "Quanto sono realistiche le simulazioni?",
    answer: "Le nostre simulazioni sono progettate per essere il più fedeli possibile al test reale in termini di difficoltà, tempo e tipologie di domande. Molti studenti riferiscono che l'esperienza è molto simile al test TOLC ufficiale.",
    category: "preparazione"
  }
];

const categories = [
  { id: "generale", name: "Generale", icon: HelpCircle, color: "bg-blue-100 text-blue-800" },
  { id: "account", name: "Account", icon: Settings, color: "bg-green-100 text-green-800" },
  { id: "studio", name: "Studio", icon: BookOpen, color: "bg-purple-100 text-purple-800" },
  { id: "premium", name: "Premium", icon: CreditCard, color: "bg-yellow-100 text-yellow-800" },
  { id: "supporto", name: "Supporto", icon: MessageSquare, color: "bg-red-100 text-red-800" },
  { id: "preparazione", name: "Preparazione", icon: Shield, color: "bg-indigo-100 text-indigo-800" }
];

const FAQ = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredFAQs = faqData.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryInfo = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-heading font-bold mb-4">Domande Frequenti</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Trova rapidamente le risposte alle domande più comuni su StudentExamPrep.
          Se non trovi quello che cerchi, contatta il nostro supporto.
        </p>
      </div>

      {/* Search */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Cerca nelle FAQ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg">Categorie</CardTitle>
          <CardDescription>
            Filtra le domande per categoria per trovare più facilmente quello che cerchi.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
              className="mb-2"
            >
              Tutte le categorie
            </Button>
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="mb-2"
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {category.name}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* FAQ Results */}
      {filteredFAQs.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nessun risultato trovato</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Non abbiamo trovato FAQ che corrispondono alla tua ricerca.
            </p>
            <Button onClick={() => { setSearchTerm(""); setSelectedCategory(null); }}>
              Mostra tutte le FAQ
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              FAQ ({filteredFAQs.length} {filteredFAQs.length === 1 ? 'risultato' : 'risultati'})
            </CardTitle>
            {selectedCategory && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-300">Categoria:</span>
                <Badge className={getCategoryInfo(selectedCategory)?.color}>
                  {getCategoryInfo(selectedCategory)?.name}
                </Badge>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {filteredFAQs.map((faq) => {
                const categoryInfo = getCategoryInfo(faq.category);
                return (
                  <AccordionItem key={faq.id} value={faq.id}>
                    <AccordionTrigger className="text-left">
                      <div className="flex items-start gap-3 w-full">
                        <Badge className={categoryInfo?.color} variant="secondary">
                          {categoryInfo?.name}
                        </Badge>
                        <span className="flex-1">{faq.question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pt-2 pb-4 text-gray-600 dark:text-gray-300 leading-relaxed">
                        {faq.answer}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </CardContent>
        </Card>
      )}

      {/* Contact Support */}
      <Card className="mt-8">
        <CardContent className="p-6 text-center">
          <MessageSquare className="h-8 w-8 text-primary mx-auto mb-3" />
          <h3 className="text-lg font-semibold mb-2">Non hai trovato quello che cercavi?</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Il nostro team di supporto è sempre pronto ad aiutarti. Contattaci per ricevere assistenza personalizzata.
          </p>
          <Button>
            Contatta il Supporto
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default FAQ;