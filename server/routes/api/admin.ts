import express from 'express';
import { supabase } from '../../db';
import { z } from 'zod';

export const adminRouter = express.Router();

// Endpoint per ottenere le materie con il numero di domande
adminRouter.get('/subjects-questions', async (req, res) => {
  try {
    const { data, error } = await supabase
      .rpc('get_subjects_with_question_counts');

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error('subjects-questions failed', err);
    res.status(500).json({ message: 'Cannot load subjects with question counts', error: String(err) });
  }
});

// Schema di validazione per le domande TOLC
const QuestionSchema = z.object({
  text: z.string().min(3, { message: 'Question text must be at least 3 characters long' }),
  topicId: z.number().nullable().optional(),
  sectionId: z.number().optional(),
  difficulty: z.enum(['facile', 'media', 'difficile']).optional(),
  options: z.array(z.object({
    text: z.string().min(1, { message: 'Option text cannot be empty' }),
    isCorrect: z.boolean()
  })).min(2, { message: 'At least 2 options are required' }),
  correctAnswer: z.string().min(1, { message: 'Correct answer cannot be empty' }),
  explanation: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')).transform(val => val === '' ? undefined : val),
  imageAltText: z.string().optional(),
  isPremium: z.boolean().optional(),
  active: z.boolean().optional()
});

// TypeScript interface for question payload
export interface QuestionPayload {
  text: string;
  topicId?: number | null;
  sectionId?: number;
  difficulty?: 'facile' | 'media' | 'difficile';
  options: Array<{
    text: string;
    isCorrect: boolean;
  }>;
  correctAnswer: string;
  explanation?: string;
  imageUrl?: string;
  imageAltText?: string;
  isPremium?: boolean;
  active?: boolean;
}

adminRouter.get('/tolc-questions', async (req, res) => {
  const pageSize = Number(req.query.pageSize ?? 20);
  const page = Number(req.query.page ?? 1);      // 1-based
  const searchQuery = req.query.q as string | undefined;
  const subject = req.query.subject as string | undefined;

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;                // inclusive

  try {
    let query = supabase
      .from('questions_unified')
      .select('*, topics(id, name)', { count: 'exact' });

    // Apply search filter if provided
    if (searchQuery && searchQuery.trim() !== '') {
      query = query.ilike('text', `%${searchQuery}%`);
    }

    // Apply subject filter if provided
    if (subject && subject !== 'null') {
      // Assuming there's a subject column or we're mapping from section_id
      query = query.eq('section_id', subject);
    }

    // Apply pagination and ordering
    const { data, count, error } = await query
      .order('id', { ascending: true })
      .range(from, to);

    if (error) throw error;

    res.json({
      data,
      total: count,            // Total number of records
      page,
      pageSize
    });
  } catch (err) {
    console.error('tolc-questions list failed', err);
    res.status(500).json({ message: 'Cannot load questions', error: String(err) });
  }
});

// Endpoint per aggiungere una nuova domanda TOLC
adminRouter.post('/tolc-questions', async (req, res) => {
  // Debug logging
  console.log('Received payload:', JSON.stringify(req.body, null, 2));
  
  // 1. Validazione
  const parse = QuestionSchema.safeParse(req.body);
  if (!parse.success) {
    console.error('Validation failed:', parse.error.issues);
    return res.status(400).json({ message: 'Bad payload', issues: parse.error.issues });
  }
  const payload = parse.data;
  
  // Additional validation
  if (!payload.sectionId) {
    return res.status(400).json({ error: 'Section ID is required.' });
  }
  if (!payload.text || payload.text.trim().length === 0) {
    return res.status(400).json({ error: 'Question text cannot be empty.' });
  }
  
  if (!payload.options || payload.options.length < 2) {
    return res.status(400).json({ error: 'At least 2 options must be provided.' });
  }
  
  const hasCorrectAnswer = payload.options.some(option => option.isCorrect);
  if (!hasCorrectAnswer) {
    return res.status(400).json({ error: 'At least one option must be marked as correct.' });
  }
  
  console.log('Validated payload:', JSON.stringify(payload, null, 2));

  // 2. Transform camelCase to snake_case for database
  const dbPayload = {
    text: payload.text,
    // Enforce constraint: if section_id is present, topic_id must be null
    topic_id: payload.sectionId ? null : payload.topicId,
    section_id: payload.sectionId, // This is now guaranteed to exist by the check above
    difficulty: payload.difficulty,
    options: payload.options,
    correct_answer: payload.correctAnswer,
    explanation: payload.explanation,
    image_url: payload.imageUrl,
    image_alt_text: payload.imageAltText,
    is_premium: payload.isPremium ?? false,
    active: payload.active ?? true
  };

  console.log('Database payload:', JSON.stringify(dbPayload, null, 2));

  try {
    // 3. Inserimento usando la chiave service-role per evitare blocchi RLS
    const { data, error } = await supabase
      .from('questions_unified')  // Tabella corretta
      .insert([dbPayload])        // Use transformed payload
      .select()                   // Ottieni la riga inserita
      .single();

    if (error) throw error;

    // 4. Restituisci 201 Created con la nuova riga
    return res.status(201).json(data);
  } catch (err) {
    console.error('Insert failed:', err);
    return res.status(500).json({ message: 'Unable to add question', error: String(err) });
  }
});

// Endpoint per aggiornare una domanda TOLC esistente
adminRouter.put('/tolc-questions/:id', async (req, res) => {
  const questionId = parseInt(req.params.id);
  
  if (isNaN(questionId)) {
    return res.status(400).json({ message: 'Invalid question ID' });
  }
  
  // Debug logging
  console.log('Update request for question ID:', questionId);
  console.log('Received payload:', JSON.stringify(req.body, null, 2));
  
  // 1. Validazione
  const parse = QuestionSchema.safeParse(req.body);
  if (!parse.success) {
    console.error('Validation failed:', parse.error.issues);
    return res.status(400).json({ message: 'Bad payload', issues: parse.error.issues });
  }
  const payload = parse.data;
  
  // Additional validation
  if (!payload.sectionId) {
    return res.status(400).json({ error: 'Section ID is required.' });
  }
  if (!payload.text || payload.text.trim().length === 0) {
    return res.status(400).json({ error: 'Question text cannot be empty.' });
  }
  
  if (!payload.options || payload.options.length < 2) {
    return res.status(400).json({ error: 'At least 2 options must be provided.' });
  }
  
  const hasCorrectAnswer = payload.options.some(option => option.isCorrect);
  if (!hasCorrectAnswer) {
    return res.status(400).json({ error: 'At least one option must be marked as correct.' });
  }
  
  console.log('Validated payload:', JSON.stringify(payload, null, 2));

  // 2. Transform camelCase to snake_case for database
  const dbPayload = {
    text: payload.text,
    topic_id: payload.sectionId ? null : payload.topicId, // Explicitly set to null if sectionId is present
    section_id: payload.sectionId, // This is now guaranteed to exist by the check above
    difficulty: payload.difficulty,
    options: payload.options,
    correct_answer: payload.correctAnswer,
    explanation: payload.explanation,
    image_url: payload.imageUrl,
    image_alt_text: payload.imageAltText,
    is_premium: payload.isPremium,
    active: payload.active
  };

  console.log('Database payload:', JSON.stringify(dbPayload, null, 2));

  try {
    // 3. Verifica che la domanda esista
    const { data: existingQuestionCheck, error: checkError } = await supabase
      .from('questions_unified')
      .select('id')
      .eq('id', questionId)
      .single();

    if (checkError || !existingQuestionCheck) {
      console.error('Error checking question existence or question not found:', checkError);
      return res.status(404).json({ message: 'Question not found' });
    }

    // 4. Aggiorna la domanda nel database
    const { data, error: updateError } = await supabase
      .from('questions_unified')
      .update(dbPayload)
      .eq('id', questionId)
      .select()
      .single();

    if (updateError) throw updateError;

    // 5. Restituisci 200 OK con la riga aggiornata
    return res.status(200).json(data);
  } catch (err) {
    // Log dell'errore dettagliato
    console.error('Update failed for question ID:', questionId, JSON.stringify(err, null, 2));
    // Restituisci un errore 500 con un messaggio e l'errore stringato
    return res.status(500).json({
      message: 'Unable to update question',
      error: err.message || String(err) || 'Unknown error'
    });
  }
});

// Endpoint per eliminare una domanda TOLC
adminRouter.delete('/tolc-questions/:id', async (req, res) => {
  const questionId = parseInt(req.params.id);
  if (isNaN(questionId)) {
    return res.status(400).json({ message: 'Invalid question ID' });
  }

  try {
    // Verifica che la domanda esista
    const { data: existingQuestionCheck, error: checkError } = await supabase
      .from('questions_unified')
      .select('id')
      .eq('id', questionId)
      .single();

    if (checkError || !existingQuestionCheck) {
      console.error('Error checking question existence or question not found for delete:', checkError);
      return res.status(404).json({ message: 'Question not found' });
    }

    // Elimina la domanda
    const { error: deleteError } = await supabase
      .from('questions_unified')
      .delete()
      .eq('id', questionId);

    if (deleteError) throw deleteError;

    return res.status(200).json({ message: 'Question deleted successfully' });
  } catch (err) {
    console.error('Delete failed for question ID:', questionId, JSON.stringify(err, null, 2));
    return res.status(500).json({
      message: 'Unable to delete question',
      error: err.message || String(err) || 'Unknown error'
    });
  }
});

// Endpoint per ottenere tutti i tipi di esame TOLC
adminRouter.get('/tolc-exam-types', async (req, res) => {
  try {
    const { data, error } = await supabase
      .rpc('get_tolc_exam_types_with_sections');

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error('tolc-exam-types failed', err);
    res.status(500).json({ message: 'Cannot load TOLC exam types', error: String(err) });
  }
});

// Endpoint per ottenere le sezioni di un tipo di esame TOLC con il conteggio delle domande
adminRouter.get('/tolc-exam-sections/:examTypeId', async (req, res) => {
  const examTypeId = parseInt(req.params.examTypeId);
  
  if (isNaN(examTypeId)) {
    return res.status(400).json({ message: 'Invalid exam type ID' });
  }
  
  try {
    const { data, error } = await supabase
      .rpc('get_tolc_sections_with_question_counts', { p_exam_type_id: examTypeId });

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error(`tolc-exam-sections/${examTypeId} failed`, err);
    res.status(500).json({ message: 'Cannot load TOLC exam sections', error: String(err) });
  }
});

// Endpoint per ottenere le domande di una materia specifica
adminRouter.get('/subjects/:subjectId/questions', async (req, res) => {
  const subjectId = parseInt(req.params.subjectId);
  const pageSize = Number(req.query.pageSize ?? 20);
  const page = Number(req.query.page ?? 1);
  const searchQuery = req.query.q as string | undefined;
  
  if (isNaN(subjectId)) {
    return res.status(400).json({ message: 'Invalid subject ID' });
  }
  
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  
  try {
    // Prima otteniamo tutti i topic_id per questa materia
    const { data: topics, error: topicsError } = await supabase
      .from('topics')
      .select('id')
      .eq('subject_id', subjectId);
    
    if (topicsError) throw topicsError;
    
    const topicIds = topics.map(topic => topic.id);
    
    if (topicIds.length === 0) {
      return res.json({
        data: [],
        total: 0,
        page,
        pageSize
      });
    }
    
    // Ora otteniamo le domande per questi topic
    let query = supabase
      .from('questions_unified')
      .select('*, topics(id, name, subject_id, subjects(name))', { count: 'exact' })
      .in('topic_id', topicIds);
    
    // Applica filtro di ricerca se fornito
    if (searchQuery && searchQuery.trim() !== '') {
      query = query.ilike('text', `%${searchQuery}%`);
    }
    
    // Applica paginazione e ordinamento
    const { data, count, error } = await query
      .order('id', { ascending: true })
      .range(from, to);
    
    if (error) throw error;
    
    res.json({
      data,
      total: count,
      page,
      pageSize
    });
  } catch (err) {
    console.error(`subjects/${subjectId}/questions failed`, err);
    res.status(500).json({ message: 'Cannot load questions for subject', error: String(err) });
  }
});

// Schema di validazione per le materie
const SubjectSchema = z.object({
  name: z.string().min(1, { message: 'Subject name cannot be empty' }),
  description: z.string().optional(),
  exam_type: z.string().min(1, { message: 'Exam type is required' })
});

// Endpoint per ottenere una materia specifica
adminRouter.get('/subjects/:subjectId', async (req, res) => {
  const subjectId = parseInt(req.params.subjectId);
  
  if (isNaN(subjectId)) {
    return res.status(400).json({ message: 'Invalid subject ID' });
  }
  
  try {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('id', subjectId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ message: 'Subject not found' });
      }
      throw error;
    }
    
    res.json(data);
  } catch (err) {
    console.error(`subjects/${subjectId} failed`, err);
    res.status(500).json({ message: 'Cannot load subject', error: String(err) });
  }
});

// Endpoint per modificare una materia
adminRouter.put('/subjects/:subjectId', async (req, res) => {
  const subjectId = parseInt(req.params.subjectId);
  
  if (isNaN(subjectId)) {
    return res.status(400).json({ message: 'Invalid subject ID' });
  }
  
  // Validazione
  const parse = SubjectSchema.safeParse(req.body);
  if (!parse.success) {
    console.error('Validation failed:', parse.error.issues);
    return res.status(400).json({ message: 'Bad payload', issues: parse.error.issues });
  }
  const payload = parse.data;
  
  try {
    // Verifica che la materia esista
    const { data: existingSubject, error: checkError } = await supabase
      .from('subjects')
      .select('id')
      .eq('id', subjectId)
      .single();
    
    if (checkError || !existingSubject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    
    // Aggiorna la materia
    const { data, error } = await supabase
      .from('subjects')
      .update({
        name: payload.name,
        description: payload.description,
        exam_type: payload.exam_type
      })
      .eq('id', subjectId)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json(data);
  } catch (err) {
    console.error(`subjects/${subjectId} update failed`, err);
    res.status(500).json({ message: 'Cannot update subject', error: String(err) });
  }
});