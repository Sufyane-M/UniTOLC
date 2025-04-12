import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage 
} from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Users, ThumbsUp, BookmarkPlus, Share2, Flag, Search, Send } from "lucide-react";

// Dati fittizi per il mock-up
const mockDiscussions = [
  {
    id: 1,
    title: "Come risolvere gli integrali per parti?",
    content: "Sto avendo problemi con gli integrali per parti, specialmente quando contengono funzioni logaritmiche. Qualcuno potrebbe condividere qualche esempio svolto?",
    author: {
      name: "Marco Rossi",
      avatar: "/avatars/marco.jpg"
    },
    date: "2 ore fa",
    category: "Matematica",
    replies: 8,
    likes: 12,
    viewed: 56
  },
  {
    id: 2,
    title: "Consigli per il TOLC-I al Politecnico di Milano",
    content: "Ciao a tutti! Devo sostenere il TOLC-I al Politecnico di Milano tra un mese. Qualcuno ha esperienza e può darmi qualche consiglio specifico sulla struttura del test?",
    author: {
      name: "Laura Bianchi",
      avatar: "/avatars/laura.jpg"
    },
    date: "ieri",
    category: "TOLC-I",
    replies: 15,
    likes: 24,
    viewed: 102
  },
  {
    id: 3,
    title: "Dubbio su legge di Coulomb",
    content: "Non riesco a capire come applicare la legge di Coulomb quando ci sono più di due cariche. Come si deve considerare il principio di sovrapposizione?",
    author: {
      name: "Davide Verdi",
      avatar: "/avatars/davide.jpg"
    },
    date: "3 giorni fa",
    category: "Fisica",
    replies: 6,
    likes: 9,
    viewed: 41
  }
];

const mockActiveUsers = [
  { id: 1, name: "Marco Rossi", status: "online", avatar: "/avatars/marco.jpg" },
  { id: 2, name: "Laura Bianchi", status: "online", avatar: "/avatars/laura.jpg" },
  { id: 3, name: "Davide Verdi", status: "online", avatar: "/avatars/davide.jpg" },
  { id: 4, name: "Sofia Neri", status: "online", avatar: "/avatars/sofia.jpg" },
  { id: 5, name: "Matteo Gialli", status: "online", avatar: "/avatars/matteo.jpg" }
];

const mockStudyGroups = [
  { id: 1, name: "TOLC-I Luglio 2024", members: 28, category: "TOLC-I" },
  { id: 2, name: "Matematica avanzata", members: 15, category: "Matematica" },
  { id: 3, name: "Fisica per ingegneria", members: 22, category: "Fisica" },
  { id: 4, name: "Gruppo Economia TOLC-E", members: 19, category: "TOLC-E" }
];

const DiscussionCard = ({ discussion }: { discussion: any }) => {
  return (
    <Card className="mb-4 hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <Badge variant="outline" className="bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
            {discussion.category}
          </Badge>
          <span className="text-sm text-muted-foreground">{discussion.date}</span>
        </div>
        <CardTitle className="text-lg mt-2">{discussion.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm line-clamp-2">{discussion.content}</p>
      </CardContent>
      <CardFooter className="flex justify-between pt-0">
        <div className="flex items-center">
          <Avatar className="h-6 w-6 mr-2">
            <AvatarImage src={discussion.author.avatar} alt={discussion.author.name} />
            <AvatarFallback>{discussion.author.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{discussion.author.name}</span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-muted-foreground text-sm">
            <MessageSquare className="h-4 w-4 mr-1" />
            <span>{discussion.replies}</span>
          </div>
          <div className="flex items-center text-muted-foreground text-sm">
            <ThumbsUp className="h-4 w-4 mr-1" />
            <span>{discussion.likes}</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

const Community = () => {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("discussions");
  const [searchQuery, setSearchQuery] = useState("");
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");

  const handleNewPost = () => {
    if (!isAuthenticated) {
      toast({
        title: "Accesso richiesto",
        description: "Devi accedere per pubblicare nella community",
        variant: "destructive"
      });
      return;
    }

    if (!newPostTitle.trim() || !newPostContent.trim()) {
      toast({
        title: "Campi obbligatori",
        description: "Titolo e contenuto sono obbligatori",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Post pubblicato",
      description: "Il tuo post è stato pubblicato con successo",
    });

    setNewPostTitle("");
    setNewPostContent("");
  };

  const filteredDiscussions = mockDiscussions.filter(
    discussion => discussion.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                  discussion.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  discussion.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-heading font-bold mb-6">Community</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
              <TabsList>
                <TabsTrigger value="discussions">Discussioni</TabsTrigger>
                <TabsTrigger value="study-groups">Gruppi di studio</TabsTrigger>
              </TabsList>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Cerca..." 
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <TabsContent value="discussions" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Crea una nuova discussione</CardTitle>
                  <CardDescription>
                    Condividi domande, dubbi o consigli con altri studenti
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input 
                    placeholder="Titolo della discussione" 
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                  />
                  <Textarea 
                    placeholder="Scrivi il contenuto del tuo post qui..."
                    className="min-h-32"
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                  />
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button onClick={handleNewPost}>Pubblica</Button>
                </CardFooter>
              </Card>

              <div>
                <h3 className="text-lg font-medium mb-4">Discussioni recenti</h3>
                {filteredDiscussions.length > 0 ? (
                  filteredDiscussions.map(discussion => (
                    <DiscussionCard key={discussion.id} discussion={discussion} />
                  ))
                ) : (
                  <Card className="p-6 text-center">
                    <p className="text-muted-foreground">Nessuna discussione trovata per la tua ricerca.</p>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="study-groups">
              <Card>
                <CardHeader>
                  <CardTitle>Gruppi di studio</CardTitle>
                  <CardDescription>
                    Unisciti a gruppi di studio su argomenti specifici
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockStudyGroups
                      .filter(group => group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                      group.category.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map(group => (
                        <div key={group.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h4 className="font-medium">{group.name}</h4>
                            <div className="flex items-center mt-1">
                              <Users className="h-4 w-4 text-muted-foreground mr-1" />
                              <span className="text-sm text-muted-foreground">{group.members} membri</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{group.category}</Badge>
                            <Button size="sm">Unisciti</Button>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">
                    Crea nuovo gruppo di studio
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Utenti online</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockActiveUsers.map(user => (
                  <div key={user.id} className="flex items-center">
                    <div className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-1 ring-white"></span>
                    </div>
                    <span className="ml-3 font-medium">{user.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Regole della community</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>1. Rispetta tutti i membri della community.</p>
              <p>2. Non condividere contenuti offensivi o inappropriati.</p>
              <p>3. Evita di copiare contenuti protetti da copyright.</p>
              <p>4. Mantieni le discussioni pertinenti agli argomenti di studio.</p>
              <p>5. Segnala qualsiasi comportamento che viola queste regole.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Chat di supporto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-3 rounded-lg mb-4">
                <p className="text-sm font-medium">Tutor TolcPrep</p>
                <p className="text-sm mt-1">Hai bisogno di aiuto con qualche argomento specifico?</p>
              </div>
              <div className="flex items-center space-x-2">
                <Input placeholder="Scrivi un messaggio..." />
                <Button size="icon" variant="secondary">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Community;
