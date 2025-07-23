import React, { useState, useRef } from "react";
import { useSupabase } from "@/hooks/use-supabase";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, X, Image as ImageIcon, Upload } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

// Schema di validazione per il form
const questionSchema = z.object({
  text: z.string().min(3, { message: "Il testo della domanda deve avere almeno 3 caratteri" }),
  section_id: z.coerce.number({
    required_error: "Seleziona una sezione",
  }),
  options: z.record(z.string().min(1, "L'opzione non può essere vuota")),
  correct_answer: z.string().min(1, "Seleziona la risposta corretta"),
  explanation: z.string().optional(),
  difficulty: z.string().optional(),
  is_premium: z.boolean().default(false),
  image_alt_text: z.string().optional(),
});

type QuestionFormValues = z.infer<typeof questionSchema>;

interface TOLCQuestionFormProps {
  examTypeId?: number;
  questionId?: number;
  onSuccess?: () => void;
  sections?: Array<{ id: number; name: string }>;
}

const TOLCQuestionForm: React.FC<TOLCQuestionFormProps> = ({
  examTypeId,
  questionId,
  onSuccess,
  sections = []
}) => {
  const supabase = useSupabase();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State for image handling
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);

  // Form
  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      text: "",
      section_id: undefined,
      options: { "A": "", "B": "", "C": "", "D": "", "E": "" },
      correct_answer: "",
      explanation: "",
      difficulty: "medium",
      is_premium: false,
      image_alt_text: "",
    },
  });

  // Load question data if editing
  React.useEffect(() => {
    const loadQuestion = async () => {
      if (!questionId) return;
      
      try {
        const { data, error } = await supabase
          .from('questions_unified')
          .select('*')
          .eq('id', questionId)
          .single();
          
        if (error) throw error;
        
        if (data) {
          form.reset({
            text: data.text,
            section_id: data.section_id,
            options: data.options,
            correct_answer: data.correct_answer,
            explanation: data.explanation || "",
            difficulty: data.difficulty || "medium",
            is_premium: data.is_premium,
            image_alt_text: data.image_alt_text || "",
          });
          
          if (data.image_url) {
            setCurrentImageUrl(data.image_url);
          }
        }
      } catch (error) {
        console.error('Error loading question:', error);
        toast({
          title: "Errore",
          description: "Impossibile caricare i dati della domanda",
          variant: "destructive",
        });
      }
    };
    
    loadQuestion();
  }, [questionId, supabase]);

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Formato non supportato",
        description: "Carica un'immagine in formato PNG, JPG o SVG",
        variant: "destructive",
      });
      return;
    }
    
    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File troppo grande",
        description: "L'immagine deve essere inferiore a 2 MB",
        variant: "destructive",
      });
      return;
    }
    
    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Clear selected image
  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Remove existing image
  const removeExistingImage = () => {
    setCurrentImageUrl(null);
  };

  // Upload image to Supabase Storage
  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;
    
    try {
      setUploadingImage(true);
      
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `questions/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('question-images')
        .upload(filePath, imageFile);
        
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data } = supabase.storage
        .from('question-images')
        .getPublicUrl(filePath);
        
      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare l'immagine",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  // Submit handler
  const onSubmit = async (data: QuestionFormValues) => {
    try {
      // Upload image if selected
      let imageUrl = currentImageUrl;
      if (imageFile) {
        imageUrl = await uploadImage();
        if (!imageUrl) return; // Stop if image upload failed
      }
      
      const questionData = {
        ...data,
        image_url: imageUrl,
        active: true,
      };
      
      if (questionId) {
        // Update existing question
        const { error } = await supabase
          .from('questions_unified')
          .update(questionData)
          .eq('id', questionId);
          
        if (error) throw error;
        
        toast({
          title: "Domanda aggiornata",
          description: "La domanda è stata aggiornata con successo",
        });
      } else {
        // Create new question
        const { error } = await supabase
          .from('questions_unified')
          .insert(questionData);
          
        if (error) throw error;
        
        toast({
          title: "Domanda creata",
          description: "La domanda è stata creata con successo",
        });
        
        // Reset form
        form.reset();
        clearImage();
        setCurrentImageUrl(null);
      }
      
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error saving question:', error);
      toast({
        title: "Errore",
        description: "Impossibile salvare la domanda",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="section_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sezione</FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  defaultValue={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona una sezione" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {sections.map((section) => (
                      <SelectItem key={section.id} value={section.id.toString()}>
                        {section.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="text"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Testo della domanda</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Inserisci il testo della domanda"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Image upload section */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="image">Immagine (opzionale)</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Aggiungi un'immagine alla domanda (PNG, JPG, SVG, max 2MB)
              </p>
            </div>

            {/* Preview current image */}
            {currentImageUrl && !imagePreview && (
              <Card className="overflow-hidden">
                <CardContent className="p-2 relative">
                  <div className="absolute top-2 right-2 z-10">
                    <Button 
                      type="button" 
                      variant="destructive" 
                      size="icon" 
                      onClick={removeExistingImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <img 
                    src={currentImageUrl} 
                    alt="Immagine attuale della domanda" 
                    className="max-h-[200px] w-auto mx-auto rounded-md"
                  />
                </CardContent>
              </Card>
            )}

            {/* Preview new image */}
            {imagePreview && (
              <Card className="overflow-hidden">
                <CardContent className="p-2 relative">
                  <div className="absolute top-2 right-2 z-10">
                    <Button 
                      type="button" 
                      variant="destructive" 
                      size="icon" 
                      onClick={clearImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <img 
                    src={imagePreview} 
                    alt="Anteprima immagine" 
                    className="max-h-[200px] w-auto mx-auto rounded-md"
                  />
                </CardContent>
              </Card>
            )}

            {/* Image upload button */}
            {!imagePreview && !currentImageUrl && (
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="image-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <ImageIcon className="w-8 h-8 mb-3 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold">Clicca per caricare</span> o trascina un file
                    </p>
                    <p className="text-xs text-muted-foreground">PNG, JPG o SVG (max 2MB)</p>
                  </div>
                  <input
                    id="image-upload"
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
            )}

            {/* Image alt text */}
            <FormField
              control={form.control}
              name="image_alt_text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Testo alternativo per l'immagine</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descrivi l'immagine per gli utenti con screen reader"
                      className="min-h-[60px]"
                      {...field}
                      value={field.value || ""}
                      disabled={!imagePreview && !currentImageUrl}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Options */}
          <div className="space-y-4">
            <Label>Opzioni di risposta</Label>
            {['A', 'B', 'C', 'D', 'E'].map((key) => (
              <div key={key} className="flex gap-2 items-start">
                <div className="shrink-0 mt-2">
                  <span className="inline-flex items-center justify-center rounded-full bg-muted min-w-7 h-7 text-sm font-medium">
                    {key}
                  </span>
                </div>
                <FormField
                  control={form.control}
                  name={`options.${key}` as any}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Textarea
                          placeholder={`Opzione ${key}`}
                          className="min-h-[60px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}
          </div>

          {/* Correct answer */}
          <FormField
            control={form.control}
            name="correct_answer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Risposta corretta</FormLabel>
                <Select 
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona la risposta corretta" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {['A', 'B', 'C', 'D', 'E'].map((key) => (
                      <SelectItem key={key} value={key}>
                        Opzione {key}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Explanation */}
          <FormField
            control={form.control}
            name="explanation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Spiegazione (opzionale)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Inserisci una spiegazione della risposta corretta"
                    className="min-h-[80px]"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Difficulty */}
          <FormField
            control={form.control}
            name="difficulty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Difficoltà</FormLabel>
                <Select 
                  onValueChange={field.onChange}
                  defaultValue={field.value || "medium"}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona il livello di difficoltà" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="easy">Facile</SelectItem>
                    <SelectItem value="medium">Media</SelectItem>
                    <SelectItem value="hard">Difficile</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Premium */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_premium"
              {...form.register("is_premium")}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="is_premium">Domanda premium</Label>
          </div>

          {/* Submit button */}
          <Button 
            type="submit" 
            className="w-full md:w-auto"
            disabled={uploadingImage}
          >
            {uploadingImage && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {questionId ? "Aggiorna domanda" : "Crea domanda"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default TOLCQuestionForm;