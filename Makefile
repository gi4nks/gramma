.PHONY: install setup dev build start db-migrate db-generate db-studio clean help

# Colore per i messaggi
BLUE=\033[0;34m
NC=\033[0m # No Color

help:
	@echo "$(BLUE)Gramma - Gestione Menu Settimanale$(NC)"
	@echo "Comandi disponibili:"
	@echo "  make install      - Installa le dipendenze npm"
	@echo "  make setup        - Configurazione completa (install + db setup)"
	@echo "  make dev          - Avvia il server di sviluppo"
	@echo "  make build        - Crea la build di produzione"
	@echo "  make start        - Avvia il server di produzione"
	@echo "  make db-migrate   - Crea/Applica le migrazioni del database"
	@echo "  make db-generate  - Rigenera il client Prisma"
	@echo "  make db-studio    - Apre l'interfaccia browser per il database"
	@echo "  make docker-build - Crea l'immagine Docker"
	@echo "  make docker-up    - Avvia i container in background"
	@echo "  make docker-down  - Ferma e rimuove i container"
	@echo "  make clean        - Rimuove node_modules e build artifacts"

install:
	@echo "$(BLUE)Installazione dipendenze...$(NC)"
	npm install

db-generate:
	@echo "$(BLUE)Generazione client Prisma...$(NC)"
	npx prisma generate

db-migrate:
	@echo "$(BLUE)Esecuzione migrazioni SQLite...$(NC)"
	npx prisma migrate dev

db-studio:
	@echo "$(BLUE)Apertura Prisma Studio...$(NC)"
	npx prisma studio

setup: install db-generate db-migrate
	@echo "$(BLUE)Setup completato con successo!$(NC)"

dev:
	npm run dev

build:
	npm run build

start:
	npm run start

clean:
	@echo "$(BLUE)Pulizia progetto...$(NC)"
	rm -rf node_modules .next dist prisma/dev.db*

docker-build:
	@echo "$(BLUE)Creazione immagine Docker...$(NC)"
	docker compose build

docker-up:
	@echo "$(BLUE)Avvio container...$(NC)"
	docker compose up -d

docker-down:
	@echo "$(BLUE)Arresto container...$(NC)"
	docker compose down

docker-logs:
	@echo "$(BLUE)Visualizzazione log...$(NC)"
	docker compose logs -f
