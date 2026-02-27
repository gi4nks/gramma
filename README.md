# Gramma 🥬

**Gramma** è un'applicazione intelligente per la gestione del menu settimanale e la riduzione degli sprechi alimentari. Ti aiuta a decidere cosa cucinare in base a quello che hai già in frigo, importando ricette dal web e generando automaticamente la lista della spesa.

## 🚀 Stack Tecnologico

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Linguaggio**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [SQLite](https://www.sqlite.org/) tramite [Prisma ORM](https://www.prisma.io/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [DaisyUI](https://daisyui.com/)
- **Icone**: [Lucide React](https://lucide.dev/)
- **Scraping**: [Cheerio](https://cheerio.js.org/) per l'importazione automatica di ricette tramite JSON-LD.

## ✨ Funzionalità

- **Gestione Dispensa**: Inventario in tempo reale degli ingredienti con quantità e unità di misura.
- **Importazione Ricette**: Incolla un URL (GialloZafferano, Cookist, etc.) e importa istantaneamente ingredienti e tag.
- **Piano Settimanale**: Griglia flessibile per pianificare più portate per ogni pasto (Colazione, Pranzo, Cena).
- **Algoritmo Ispirazione**: Suggerisce ricette basandosi sulla disponibilità reale e sulla quantità di ingredienti in dispensa.
- **Lista Spesa Intelligente**: Sottrae le tue scorte dal fabbisogno settimanale, convertendo automaticamente le unità (es. g <-> kg).
- **Ricerca Globale**: Trova ricette per nome o per singolo ingrediente contenuto.

## 🛠️ Installazione Rapida

È presente un `Makefile` per semplificare le operazioni:

```bash
# Setup completo (installazione + database)
make setup

# Avvio in modalità sviluppo
make dev

# Apertura interfaccia database (Prisma Studio)
make db-studio
```

## 📄 Licenza
Progetto creato a scopo educativo.
