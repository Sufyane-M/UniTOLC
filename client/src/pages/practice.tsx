import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Timer, ExternalLink, ArrowRight, HelpCircle, Target, Zap, BarChart3, Trophy, Clock, Brain, Sparkles, CheckCircle2, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Practice = () => {
  const [, setLocation] = useLocation();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);


  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <TooltipProvider>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Breadcrumb className="mb-6">
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
        </motion.div>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-10"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4"
            >
              <Sparkles className="h-4 w-4" />
              Area di Pratica TOLC
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4 text-foreground">
              Preparati al meglio per il TOLC
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Preparati in modo efficace per i test TOLC con percorsi personalizzati e simulazioni realistiche.
              <br className="hidden sm:block" />
              Scegli la modalità che preferisci e inizia subito il tuo allenamento.
            </p>
          </div>


        </motion.div>

        {/* Study Modes Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="grid lg:grid-cols-2 gap-8 mb-12"
        >
          {/* Topic-based Study Mode */}
          <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            onHoverStart={() => setHoveredCard('topic')}
            onHoverEnd={() => setHoveredCard(null)}
          >
            <Card className="relative overflow-hidden border-2 hover:border-primary/30 transition-all duration-300 bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-900 dark:to-blue-950/20 h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 hover:opacity-100 transition-opacity duration-300" />
              
              <CardHeader className="relative z-10 pb-4">
                <div className="flex items-start justify-between mb-4">
                  <motion.div
                    animate={{
                      scale: hoveredCard === 'topic' ? 1.1 : 1,
                      rotate: hoveredCard === 'topic' ? 5 : 0
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg"
                  >
                    <BookOpen className="h-8 w-8 text-white" />
                  </motion.div>
                  <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-0">
                    Raccomandato
                  </Badge>
                </div>
                <CardTitle className="text-2xl font-heading mb-2">Studio per Argomenti</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Esercitati su argomenti specifici con spiegazioni dettagliate e feedback personalizzato per un apprendimento mirato.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="relative z-10 space-y-4">
                <div className="grid gap-3">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800"
                  >
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-green-900 dark:text-green-100">Personalizzazione completa</p>
                      <p className="text-sm text-green-700 dark:text-green-300">Scegli argomento, difficoltà e numero di domande</p>
                    </div>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800"
                  >
                    <Brain className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-blue-900 dark:text-blue-100">Spiegazioni dettagliate</p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">Feedback immediato dopo ogni risposta</p>
                    </div>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.0 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800"
                  >
                    <Zap className="h-5 w-5 text-amber-600 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-amber-900 dark:text-amber-100">Modalità flessibile</p>
                      <p className="text-sm text-amber-700 dark:text-amber-300">Timer opzionale per allenare la velocità</p>
                    </div>
                  </motion.div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    💡 <strong>Perfetto per:</strong> Consolidare conoscenze specifiche e migliorare nelle aree più deboli
                  </p>
                </div>
              </CardContent>
              
              <CardFooter className="relative z-10 flex flex-col sm:flex-row gap-3 pt-6">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2 flex-1 sm:flex-none">
                      <HelpCircle className="h-4 w-4" /> Guida
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Scopri come funziona lo studio per argomenti</p>
                  </TooltipContent>
                </Tooltip>
                
                <Button 
                  className="gap-2 flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg" 
                  onClick={() => setLocation("/topic-study")}
                >
                  <Play className="h-4 w-4" />
                  Inizia a studiare
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>

          {/* Simulation Mode */}
          <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            onHoverStart={() => setHoveredCard('simulation')}
            onHoverEnd={() => setHoveredCard(null)}
          >
            <Card className="relative overflow-hidden border-2 hover:border-primary/30 transition-all duration-300 bg-gradient-to-br from-white to-green-50/30 dark:from-gray-900 dark:to-green-950/20 h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 hover:opacity-100 transition-opacity duration-300" />
              
              <CardHeader className="relative z-10 pb-4">
                <div className="flex items-start justify-between mb-4">
                  <motion.div
                    animate={{
                      scale: hoveredCard === 'simulation' ? 1.1 : 1,
                      rotate: hoveredCard === 'simulation' ? -5 : 0
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg"
                  >
                    <Timer className="h-8 w-8 text-white" />
                  </motion.div>
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-0">
                    Ufficiale
                  </Badge>
                </div>
                <CardTitle className="text-2xl font-heading mb-2">Simulazione Completa</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Affronta una simulazione fedele dell'esame TOLC con tempistiche e regole ufficiali CISIA per testare la tua preparazione.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="relative z-10 space-y-4">
                <div className="grid gap-3">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.1 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800"
                  >
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-green-900 dark:text-green-100">Esperienza realistica</p>
                      <p className="text-sm text-green-700 dark:text-green-300">Struttura e durata identiche all'esame ufficiale</p>
                    </div>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.2 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800"
                  >
                    <BarChart3 className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-blue-900 dark:text-blue-100">Punteggio CISIA</p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">Sistema di valutazione ufficiale applicato</p>
                    </div>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.3 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800"
                  >
                    <Target className="h-5 w-5 text-purple-600 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-purple-900 dark:text-purple-100">Analisi completa</p>
                      <p className="text-sm text-purple-700 dark:text-purple-300">Report dettagliato con punti di forza e debolezza</p>
                    </div>
                  </motion.div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    🎯 <strong>Perfetto per:</strong> Valutare la preparazione complessiva e simulare l'esperienza d'esame
                  </p>
                </div>
              </CardContent>
              
              <CardFooter className="relative z-10 flex flex-col sm:flex-row gap-3 pt-6">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2 flex-1 sm:flex-none">
                      <HelpCircle className="h-4 w-4" /> Info TOLC
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Informazioni sui test TOLC ufficiali</p>
                  </TooltipContent>
                </Tooltip>
                
                <Button 
                  className="gap-2 flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg" 
                  onClick={() => setLocation("/full-simulation")}
                >
                  <Play className="h-4 w-4" />
                  Inizia simulazione
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </motion.div>

        {/* Quick Actions Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.8 }}
          className="mb-12"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-heading font-bold mb-2">Azioni Rapide</h2>
            <p className="text-muted-foreground">Accedi velocemente alle funzioni più utilizzate</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="cursor-pointer"
            >
              <Card className="p-4 text-center hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
                <div className="p-3 bg-blue-500 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-sm mb-1">Quiz Veloce</h3>
                <p className="text-xs text-muted-foreground">5 domande casuali</p>
              </Card>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="cursor-pointer"
            >
              <Card className="p-4 text-center hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20 border-green-200 dark:border-green-800">
                <div className="p-3 bg-green-500 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-sm mb-1">Aree Deboli</h3>
                <p className="text-xs text-muted-foreground">Migliora i punti critici</p>
              </Card>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="cursor-pointer"
            >
              <Card className="p-4 text-center hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20 border-purple-200 dark:border-purple-800">
                <div className="p-3 bg-purple-500 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-sm mb-1">Statistiche</h3>
                <p className="text-xs text-muted-foreground">Visualizza progressi</p>
              </Card>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="cursor-pointer"
            >
              <Card className="p-4 text-center hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20 border-amber-200 dark:border-amber-800">
                <div className="p-3 bg-amber-500 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-sm mb-1">Sfide</h3>
                <p className="text-xs text-muted-foreground">Sfide giornaliere</p>
              </Card>
            </motion.div>
          </div>
        </motion.div>

        {/* Enhanced Footer with useful links */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.0 }}
          className="border-t pt-8"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-heading font-bold mb-2">Risorse e Supporto</h2>
            <p className="text-muted-foreground">Tutto quello che ti serve per prepararti al meglio</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <motion.a 
              href="https://www.cisiaonline.it/area-tematica-tolc-cisia/regolamenti/" 
              target="_blank" 
              rel="noopener noreferrer"
              whileHover={{ y: -4 }}
              className="group block"
            >
              <Card className="p-6 h-full hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/30">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                    <ExternalLink className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">Regolamento Ufficiale TOLC</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Consulta le linee guida ufficiali CISIA per conoscere struttura, tempistiche e modalità d'esame.
                    </p>
                  </div>
                </div>
              </Card>
            </motion.a>
            
            <motion.a 
              href="/faq" 
              whileHover={{ y: -4 }}
              className="group block"
            >
              <Card className="p-6 h-full hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/30">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                    <HelpCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">FAQ e Domande Frequenti</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Trova risposte alle domande più comuni sui test TOLC e sull'utilizzo della piattaforma.
                    </p>
                  </div>
                </div>
              </Card>
            </motion.a>
            
            <motion.a 
              href="/support" 
              whileHover={{ y: -4 }}
              className="group block"
            >
              <Card className="p-6 h-full hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/30">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                    <ExternalLink className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">Supporto e Contatti</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Hai bisogno di aiuto? Contatta il nostro team di supporto per assistenza personalizzata.
                    </p>
                  </div>
                </div>
              </Card>
            </motion.a>
          </div>
          
          {/* Motivational Quote */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="text-center p-8 bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl border border-primary/20"
          >
            <div className="max-w-2xl mx-auto">
              <Sparkles className="h-8 w-8 text-primary mx-auto mb-4" />
              <blockquote className="text-lg font-medium text-foreground mb-2">
                "Il successo è la somma di piccoli sforzi ripetuti giorno dopo giorno."
              </blockquote>
              <cite className="text-sm text-muted-foreground">— Robert Collier</cite>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </TooltipProvider>
  );
};

export default Practice;