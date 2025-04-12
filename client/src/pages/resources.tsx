import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  BookOpen, 
  File, 
  Video, 
  FileText, 
  Link as LinkIcon, 
  Lock, 
  Search, 
  Crown 
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// Tipi per le risorse
interface Resource {
  id: number;
  title: string;
  description: string;
  type: "pdf" | "video" | "link" | "text";
  url?: string;
  content?: string;
  isPremium: boolean;
  topicId: number;
  topic?: {
    name: string;
    subject?: {
      name: string;
    }
  }
}

// FAQ per la sezione FAQ
const faqs = [
  {
    question: "Cosa sono gli esami TOLC?",
    answer: "I TOLC (Test Online CISIA) sono i test di ammissione utilizzati da molte università italiane per l'accesso ai corsi di laurea. Esistono diverse tipologie in base all'area di studio: TOLC-I per Ingegneria, TOLC-E per Economia, TOLC-F per Farmacia, TOLC-S per Scienze e ENGLISH-TOLC interamente in lingua inglese."
  },
  {
    question: "Come si svolge l'esame TOLC?",
    answer: "Il TOLC è un test informatizzato che si svolge presso le sedi universitarie in date prestabilite. Il test è composto da diverse sezioni con domande a risposta multipla su vari argomenti (matematica, logica, comprensione del testo, scienze, etc.). Ogni sezione ha un tempo limite e un numero specifico di domande."
  },
  {
    question: "Come posso prepararmi al meglio per il TOLC?",
    answer: "La preparazione ideale include: studio dei concetti teorici, esercitazione con simulazioni di test, focus sulle aree in cui si incontrano maggiori difficoltà, e gestione del tempo. TolcPrep offre materiali di studio, quiz mirati e simulazioni complete per aiutarti in ogni fase della preparazione."
  },
  {
    question: "Quanto tempo prima dovrei iniziare a studiare?",
    answer: "Si consiglia di iniziare la preparazione almeno 2-3 mesi prima della data dell'esame. Questo ti permetterà di coprire tutti gli argomenti necessari e di avere tempo sufficiente per esercitarti con simulazioni e quiz."
  },
  {
    question: "Come viene calcolato il punteggio del TOLC?",
    answer: "Il punteggio viene calcolato assegnando 1 punto per ogni risposta corretta, 0 punti per ogni risposta non data e una penalità (solitamente -0,25 punti) per ogni risposta errata. Ogni università stabilisce poi soglie minime di punteggio per l'ammissione o per l'assegnazione di eventuali OFA (Obblighi Formativi Aggiuntivi)."
  }
];

// Blog posts per la sezione Blog
const blogPosts = [
  {
    id: 1,
    title: "5 strategie efficaci per superare il TOLC-I",
    excerpt: "Scopri le migliori strategie per affrontare con successo il test di ammissione per Ingegneria...",
    date: "10 giugno 2024",
    author: "Marco Bianchi",
    category: "Strategie di studio"
  },
  {
    id: 2,
    title: "Gestire l'ansia da esame: consigli pratici",
    excerpt: "L'ansia da esame può compromettere le tue performance. Ecco alcuni consigli pratici per gestirla efficacemente...",
    date: "2 giugno 2024",
    author: "Laura Verdi",
    category: "Benessere"
  },
  {
    id: 3,
    title: "Novità nei TOLC 2024: cosa è cambiato",
    excerpt: "Il CISIA ha introdotto alcune modifiche nei test TOLC a partire dal 2024. Ecco tutto quello che devi sapere...",
    date: "25 maggio 2024",
    author: "Alessandro Neri",
    category: "News"
  }
];

// Icon per il tipo di risorsa
const getResourceIcon = (type: string) => {
  switch (type) {
    case 'pdf':
      return <File className="h-5 w-5 text-red-500" />;
    case 'video':
      return <Video className="h-5 w-5 text-blue-500" />;
    case 'link':
      return <LinkIcon className="h-5 w-5 text-green-500" />;
    case 'text':
      return <FileText className="h-5 w-5 text-amber-500" />;
    default:
      return <BookOpen className="h-5 w-5 text-primary" />;
  }
};

const Resources = () => {
  const { isAuthenticated, user } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [activeTab, setActiveTab] = useState("materials");
  
  // Query per ottenere le risorse
  const { data: resources, isLoading } = useQuery<Resource[]>({
    queryKey: ['/api/learning-resources'],
    enabled: isAuthenticated,
  });
  
  // Filtra le risorse in base ai criteri di ricerca
  const filteredResources = resources?.filter(resource => {
    // Filtra per query di ricerca
    const matchesSearch = searchQuery === "" || 
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (resource.description?.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Filtra per materia
    const matchesSubject = selectedSubject === "all" || 
      resource.topic?.subject?.name.toLowerCase() === selectedSubject.toLowerCase();
    
    // Filtra per tipo
    const matchesType = selectedType === "all" || 
      resource.type === selectedType;
    
    return matchesSearch && matchesSubject && matchesType;
  });
  
  // Risorse di esempio
  const mockResources: Resource[] = [
    {
      id: 1,
      title: "Fondamenti di calcolo integrale",
      description: "Guida completa agli integrali definiti e indefiniti con esercizi risolti",
      type: "pdf",
      url: "#",
      isPremium: false,
      topicId: 1,
      topic: {
        name: "Calcolo integrale",
        subject: {
          name: "Matematica"
        }
      }
    },
    {
      id: 2,
      title: "Lezione: Sistemi lineari",
      description: "Video lezione sui metodi di risoluzione dei sistemi lineari",
      type: "video",
      url: "#",
      isPremium: true,
      topicId: 2,
      topic: {
        name: "Sistemi lineari",
        subject: {
          name: "Matematica"
        }
      }
    },
    {
      id: 3,
      title: "Esercizi di fisica meccanica",
      description: "Raccolta di problemi svolti sui principali concetti di meccanica",
      type: "pdf",
      url: "#",
      isPremium: false,
      topicId: 3,
      topic: {
        name: "Meccanica",
        subject: {
          name: "Fisica"
        }
      }
    },
    {
      id: 4,
      title: "Riassunto: Logica proposizionale",
      description: "Riassunto completo sulla logica proposizionale con esempi pratici",
      type: "text",
      content: "La logica proposizionale è un ramo della logica che studia le proposizioni e le relazioni tra esse...",
      isPremium: true,
      topicId: 4,
      topic: {
        name: "Logica proposizionale",
        subject: {
          name: "Logica"
        }
      }
    }
  ];
  
  const displayResources = filteredResources || mockResources;
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-heading font-bold mb-6">Risorse di studio</h1>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="mb-4">
          <TabsTrigger value="materials">Materiali</TabsTrigger>
          <TabsTrigger value="blog">Blog</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
        </TabsList>
        
        {/* Materials Tab */}
        <TabsContent value="materials">
          <div className="space-y-6">
            {/* Filtri e ricerca */}
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Cerca risorse..."
                      className="pl-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filtra per materia" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tutte le materie</SelectItem>
                      <SelectItem value="matematica">Matematica</SelectItem>
                      <SelectItem value="fisica">Fisica</SelectItem>
                      <SelectItem value="logica">Logica</SelectItem>
                      <SelectItem value="chimica">Chimica</SelectItem>
                      <SelectItem value="comprensione_verbale">Comprensione verbale</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filtra per tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tutti i tipi</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="text">Testo</SelectItem>
                      <SelectItem value="link">Link</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
            
            {/* Lista risorse */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isAuthenticated ? (
                displayResources.map(resource => (
                  <Card key={resource.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-2">
                          {getResourceIcon(resource.type)}
                          <Badge variant="outline" className="text-xs">
                            {resource.topic?.subject?.name}
                          </Badge>
                        </div>
                        {resource.isPremium && (
                          <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
                            <Crown className="h-3 w-3 mr-1" /> Premium
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg mt-2">{resource.title}</CardTitle>
                      <CardDescription className="line-clamp-2">{resource.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">{resource.topic?.name}</span>
                        {resource.isPremium && !user?.isPremium ? (
                          <Button size="sm" variant="outline" className="text-amber-600 hover:text-amber-700" onClick={() => setLocation("/settings?tab=premium")}>
                            <Lock className="h-3.5 w-3.5 mr-1.5" /> Sblocca
                          </Button>
                        ) : (
                          <Button size="sm">
                            {resource.type === 'video' ? 'Guarda' : 'Accedi'}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="col-span-1 md:col-span-2 lg:col-span-3">
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="bg-primary-100 dark:bg-primary-900/30 rounded-full p-4 mb-6">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-2xl font-heading font-semibold mb-3">
                      Accedi per visualizzare le risorse di studio
                    </h2>
                    <p className="text-muted-foreground max-w-xl mb-6">
                      Sblocca centinaia di risorse di studio, organizzate per argomento e livello di difficoltà, per prepararti al meglio per il tuo esame TOLC.
                    </p>
                    <Button onClick={() => setLocation("/?auth=login")}>
                      Accedi ora
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
        
        {/* Blog Tab */}
        <TabsContent value="blog">
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cerca nel blog..."
                    className="pl-9"
                  />
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogPosts.map(post => (
                <Card key={post.id} className="overflow-hidden">
                  <div className="h-40 bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
                    <BookOpen className="h-12 w-12 text-primary-300" />
                  </div>
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {post.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{post.date}</span>
                    </div>
                    <CardTitle className="text-lg">{post.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{post.excerpt}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Di {post.author}</span>
                      <Button size="sm">Leggi di più</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
        
        {/* FAQ Tab */}
        <TabsContent value="faq">
          <Card>
            <CardHeader>
              <CardTitle>Domande frequenti sul TOLC</CardTitle>
              <CardDescription>
                Risposte alle domande più comuni sugli esami TOLC
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-muted-foreground">{faq.answer}</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Resources;
