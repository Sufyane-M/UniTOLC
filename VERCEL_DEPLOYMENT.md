# 🚀 Guida al Deployment su Vercel

## 📋 Prerequisiti

1. Account Vercel attivo
2. Repository GitHub/GitLab collegato
3. Progetto Supabase configurato

## 🔧 Configurazione Variabili d'Ambiente

Nel dashboard di Vercel, aggiungi le seguenti variabili d'ambiente:

### Variabili Backend (Server)
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_PROJECT_ID=your-project-id
NODE_ENV=production
SESSION_SECRET=your-secure-session-secret
```

### Variabili Frontend (Client)
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=https://your-vercel-app.vercel.app
```

## 📦 Processo di Deployment

### 1. Preparazione del Progetto
```bash
# Verifica che il build funzioni localmente
npm run build

# Esegui i test
npm run test:run

# Verifica TypeScript
npm run check
```

### 2. Configurazione Vercel

1. **Importa il progetto** nel dashboard Vercel
2. **Framework Preset**: Vite
3. **Build Command**: `npm run vercel-build`
4. **Output Directory**: `dist/public`
5. **Install Command**: `npm install`

### 3. Configurazione Database

Assicurati che Supabase sia configurato per accettare connessioni dal dominio Vercel:

1. Vai su Supabase Dashboard → Settings → API
2. Aggiungi il dominio Vercel agli **Allowed Origins**
3. Verifica che le **Row Level Security (RLS)** policies siano configurate

## 🔒 Sicurezza

### Autenticazione
- Le sessioni sono gestite con cookie sicuri in produzione
- HTTPS è obbligatorio per l'autenticazione
- Le route protette sono validate lato server

### Variabili d'Ambiente
- Mai committare file `.env` con dati sensibili
- Usa `SESSION_SECRET` forte e unico per la produzione
- Le chiavi Supabase devono essere specifiche per l'ambiente

## 🚀 Ottimizzazioni Implementate

### Frontend
- **Code Splitting**: Chunks separati per vendor, UI, charts
- **Tree Shaking**: Rimozione codice non utilizzato
- **Minificazione**: Terser per compressione ottimale
- **Source Maps**: Solo in development
- **Console Removal**: Log rimossi in produzione

### Backend
- **Serverless Functions**: API ottimizzate per Vercel
- **Session Management**: Configurato per ambiente serverless
- **Error Handling**: Gestione errori centralizzata

## 🔍 Monitoraggio

### Health Checks
- `/api/health/supabase` - Verifica connessione database

### Logs
- Usa Vercel Dashboard per monitorare i logs
- Considera l'integrazione con Sentry per error tracking

## 🐛 Troubleshooting

### Errori Comuni

1. **Build Failure**
   ```bash
   # Verifica localmente
   npm run build
   npm run check
   ```

2. **Supabase Connection Error**
   - Verifica le variabili d'ambiente
   - Controlla gli Allowed Origins
   - Verifica le RLS policies

3. **Session Issues**
   - Assicurati che `SESSION_SECRET` sia impostato
   - Verifica che i cookie siano configurati per HTTPS

4. **API Routes Not Working**
   - Controlla che `vercel.json` sia configurato correttamente
   - Verifica che le route inizino con `/api/`

### Debug
```bash
# Test build locale
npm run build

# Serve build locale
npx serve dist/public

# Test API locale
curl http://localhost:3000/api/health/supabase
```

## 📚 Risorse Utili

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)