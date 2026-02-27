# Mandati Operativi Gemini

Questo file contiene istruzioni fondamentali che prendono la precedenza sul workflow generale di Gemini CLI per questo specifico progetto.

## Stack e Convenzioni
- **Prisma**: Utilizzare Prisma v6 con SQLite (`file:./dev.db`).
- **Styling**: Utilizzare esclusivamente DaisyUI e classi Tailwind. Non scrivere CSS personalizzato a meno che non sia strettamente necessario (es. `@media print`).
- **Database**: 
  - La tabella `Ingredient` deve contenere nomi in minuscolo per facilitare il matching.
  - Il campo `Recipe.tags` è una stringa separata da virgole per semplicità di ricerca in SQLite.
- **Server Actions**: Tutte le logiche di modifica stato (pantry, recipes, plan) devono trovarsi in `src/app/actions/`.

## Regole Tecniche
- **Build**: Il processo di build richiede `NODE_ENV=production` per gestire correttamente i Server Components con Prisma.
- **Scraping**: Quando si aggiorna lo scraper in `src/app/actions/recipes.ts`, assicurarsi di mantenere sia il parser JSON-LD che il fallback basato su selettori DOM per GialloZafferano.
- **Ingredienti**: Utilizzare sempre le utility in `src/lib/ingredients.ts` per calcoli e formattazione delle quantità per garantire coerenza tra Lista Spesa e Ispirazione.

## Validazione
- Ogni modifica alla logica di calcolo delle quantità deve essere validata verificando che il matching "Kg/g" funzioni ancora correttamente nella pagina `/shopping-list`.
