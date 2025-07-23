import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Timer, ExternalLink, ArrowRight, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const Practice = () => {
  const [, setLocation] = useLocation();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Pratica</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Hero Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold mb-3">Area di Pratica TOLC</h1>
        <p className="text-lg text-muted-foreground max-w-3xl">
          Preparati in modo efficace per i test TOLC. Scegli tra la modalità di studio per argomenti 
          o le simulazioni complete secondo le linee guida ufficiali CISIA.
        </p>
      </div>

      {/* Study Modes Cards */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Topic-based Study Mode */}
        <Card className="border hover:border-primary/50 transition-all">
          <CardHeader>
            <div className="flex items-center mb-2">
              <div className="p-3 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">Studio per Argomenti</CardTitle>
            </div>
            <CardDescription className="text-base">
              Esercitati su argomenti specifici con spiegazioni dettagliate e feedback personalizzato.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 mb-4">
              <li className="flex items-center">
                <Badge variant="outline" className="mr-2 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-0">
                  Personalizzato
                </Badge>
                Scegli l'argomento, il livello di difficoltà e il numero di domande
              </li>
              <li className="flex items-center">
                <Badge variant="outline" className="mr-2 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-0">
                  Dettagliato
                </Badge>
                Ricevi spiegazioni passo-passo dopo ogni domanda
              </li>
              <li className="flex items-center">
                <Badge variant="outline" className="mr-2 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-0">
                  Flessibile
                </Badge>
                Timer opzionale per migliorare la tua velocità
              </li>
            </ul>
            <p className="text-sm text-muted-foreground mb-2">
              Perfetto per concentrarsi sulle aree che richiedono più attenzione e consolidare le tue conoscenze.
            </p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" size="sm" className="gap-1">
              <HelpCircle className="h-4 w-4" /> Guida
            </Button>
            <Button className="gap-2" onClick={() => setLocation("/topic-study")}>
              Inizia a studiare <ArrowRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>

        {/* Simulation Mode */}
        <Card className="border hover:border-primary/50 transition-all">
          <CardHeader>
            <div className="flex items-center mb-2">
              <div className="p-3 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                <Timer className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">Simulazione Completa</CardTitle>
            </div>
            <CardDescription className="text-base">
              Affronta una simulazione fedele dell'esame TOLC con tempistiche e regole ufficiali CISIA.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 mb-4">
              <li className="flex items-center">
                <Badge variant="outline" className="mr-2 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-0">
                  Realistico
                </Badge>
                Riproduce esattamente la struttura e la durata dell'esame ufficiale
              </li>
              <li className="flex items-center">
                <Badge variant="outline" className="mr-2 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-0">
                  Completo
                </Badge>
                Include tutte le sezioni del test e applica il sistema di punteggio CISIA
              </li>
              <li className="flex items-center">
                <Badge variant="outline" className="mr-2 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-0">
                  Analitico
                </Badge>
                Report dettagliato finale con analisi dei punti di forza e di debolezza
              </li>
            </ul>
            <p className="text-sm text-muted-foreground mb-2">
              Ideale per testare la tua preparazione complessiva e abituarti alle condizioni reali d'esame.
            </p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" size="sm" className="gap-1">
              <HelpCircle className="h-4 w-4" /> Info TOLC
            </Button>
            <Button className="gap-2" onClick={() => setLocation("/full-simulation")}>
              Inizia simulazione <ArrowRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Footer with useful links */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Risorse utili</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <a 
            href="https://www.cisiaonline.it/area-tematica-tolc-cisia/regolamenti/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ExternalLink className="h-5 w-5 mr-2 text-primary" />
            <span>Regolamento ufficiale TOLC</span>
          </a>
          <a 
            href="/faq" 
            className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <HelpCircle className="h-5 w-5 mr-2 text-primary" />
            <span>FAQ sul TOLC</span>
          </a>
          <a 
            href="/support" 
            className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ExternalLink className="h-5 w-5 mr-2 text-primary" />
            <span>Supporto e contatti</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Practice; 