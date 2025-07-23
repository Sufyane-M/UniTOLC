import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { toast } from '@/components/ui/use-toast';
import TolcQuestionsPage from '../TolcQuestionsPage';

// Mock the toast function
jest.mock('@/components/ui/use-toast', () => ({
  toast: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

const mockToast = toast as jest.MockedFunction<typeof toast>;

// Test wrapper with QueryClient
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

// Mock question data
const mockQuestion = {
  id: 1,
  text: 'What is 2 + 2?',
  section_id: 1,
  difficulty: 'facile',
  options: [
    { text: '3', isCorrect: false },
    { text: '4', isCorrect: true },
    { text: '5', isCorrect: false },
  ],
  correct_answer: '4',
  explanation: 'Basic arithmetic',
  image_url: '',
};

const mockQuestionsResponse = {
  data: [mockQuestion],
  count: 1,
};

describe('TolcQuestionsPage Edit Workflow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
      ok: true,
      json: async () => mockQuestionsResponse,
    } as Response);
  });

  it('should pre-select the correct answer when editing a question', async () => {
    render(
      <TestWrapper>
        <TolcQuestionsPage />
      </TestWrapper>
    );

    // Wait for questions to load
    await waitFor(() => {
      expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument();
    });

    // Click on the actions menu (three dots)
    const actionsButton = screen.getByRole('button', { name: /azioni/i });
    fireEvent.click(actionsButton);

    // Click on "modifica" (edit)
    const editButton = screen.getByText('Modifica');
    fireEvent.click(editButton);

    // Wait for the edit form to open
    await waitFor(() => {
      expect(screen.getByDisplayValue('What is 2 + 2?')).toBeInTheDocument();
    });

    // Check that the correct answer (option with text '4') is pre-selected
    const option4Input = screen.getByDisplayValue('4');
    const option4Container = option4Input.closest('.flex');
    const radioButton = option4Container?.querySelector('input[type="radio"]') as HTMLInputElement;
    
    expect(radioButton).toBeChecked();
  });

  it('should update the correct answer when user selects a different option', async () => {
    render(
      <TestWrapper>
        <TolcQuestionsPage />
      </TestWrapper>
    );

    // Wait for questions to load and open edit form
    await waitFor(() => {
      expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument();
    });

    const actionsButton = screen.getByRole('button', { name: /azioni/i });
    fireEvent.click(actionsButton);
    
    const editButton = screen.getByText('Modifica');
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByDisplayValue('What is 2 + 2?')).toBeInTheDocument();
    });

    // Find and click on a different radio button (option with text '3')
    const option3Input = screen.getByDisplayValue('3');
    const option3Container = option3Input.closest('.flex');
    const option3RadioButton = option3Container?.querySelector('input[type="radio"]') as HTMLInputElement;
    
    fireEvent.click(option3RadioButton);

    // Verify the new option is selected
    expect(option3RadioButton).toBeChecked();

    // Mock successful update response
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ...mockQuestion, correct_answer: '3' }),
    } as Response);

    // Submit the form
    const saveButton = screen.getByText('Salva domanda');
    fireEvent.click(saveButton);

    // Wait for the request to be made
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/admin/tolc-questions/1',
        expect.objectContaining({
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('"correctAnswer":"3"'),
        })
      );
    });
  });

  it('should display error toast when backend returns 400 error', async () => {
    render(
      <TestWrapper>
        <TolcQuestionsPage />
      </TestWrapper>
    );

    // Wait for questions to load and open edit form
    await waitFor(() => {
      expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument();
    });

    const actionsButton = screen.getByRole('button', { name: /azioni/i });
    fireEvent.click(actionsButton);
    
    const editButton = screen.getByText('Modifica');
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByDisplayValue('What is 2 + 2?')).toBeInTheDocument();
    });

    // Mock backend error response
    const errorMessage = 'At least one option must be marked as correct.';
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ error: errorMessage }),
    } as Response);

    // Submit the form
    const saveButton = screen.getByText('Salva domanda');
    fireEvent.click(saveButton);

    // Wait for error handling
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Errore',
        description: errorMessage,
        variant: 'destructive',
      });
    });
  });

  it('should display fallback error message for unexpected errors', async () => {
    render(
      <TestWrapper>
        <TolcQuestionsPage />
      </TestWrapper>
    );

    // Wait for questions to load and open edit form
    await waitFor(() => {
      expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument();
    });

    const actionsButton = screen.getByRole('button', { name: /azioni/i });
    fireEvent.click(actionsButton);
    
    const editButton = screen.getByText('Modifica');
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByDisplayValue('What is 2 + 2?')).toBeInTheDocument();
    });

    // Mock network error
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
      new Error('Network error')
    );

    // Submit the form
    const saveButton = screen.getByText('Salva domanda');
    fireEvent.click(saveButton);

    // Wait for error handling
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Errore',
        description: 'Network error',
        variant: 'destructive',
      });
    });
  });

  it('should validate that at least 2 options are present', async () => {
    render(
      <TestWrapper>
        <TolcQuestionsPage />
      </TestWrapper>
    );

    // Wait for questions to load and open edit form
    await waitFor(() => {
      expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument();
    });

    const actionsButton = screen.getByRole('button', { name: /azioni/i });
    fireEvent.click(actionsButton);
    
    const editButton = screen.getByText('Modifica');
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByDisplayValue('What is 2 + 2?')).toBeInTheDocument();
    });

    // Try to remove options until only 1 remains
    const removeButtons = screen.getAllByRole('button', { name: '' }); // Trash icons
    const trashButtons = removeButtons.filter(button => 
      button.querySelector('.h-4.w-4') // Trash2 icon
    );

    // Click remove button twice (should only remove one due to validation)
    fireEvent.click(trashButtons[0]);
    fireEvent.click(trashButtons[1]);

    // Should show validation message
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Attenzione',
        description: 'Devi avere almeno 2 opzioni',
        variant: 'destructive',
      });
    });
  });
});