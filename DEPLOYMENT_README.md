# 🚀 Instrukcje wdrożenia formularza na serwer

## 📋 Wymagania systemowe

### **Serwer**
- **OS**: Linux (Ubuntu 20.04+ / CentOS 8+)
- **RAM**: Minimum 2GB
- **CPU**: 2 vCPU
- **Dysk**: 20GB+

### **Baza danych**
- **PostgreSQL**: 13+ (zalecane 15+)
- **Port**: 5432 (domyślny)
- **Uprawnienia**: Użytkownik z prawami do tworzenia tabel

## 🗄️ **Krok 1: Instalacja PostgreSQL na serwerze**

### **Ubuntu/Debian:**
```bash
# Aktualizacja systemu
sudo apt update && sudo apt upgrade -y

# Instalacja PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Uruchomienie serwisu
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Sprawdzenie statusu
sudo systemctl status postgresql
```

### **CentOS/RHEL:**
```bash
# Instalacja PostgreSQL
sudo dnf install postgresql-server postgresql-contrib -y

# Inicjalizacja bazy
sudo postgresql-setup --initdb

# Uruchomienie serwisu
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

## 🔐 **Krok 2: Konfiguracja bazy danych**

### **Utworzenie użytkownika i bazy:**
```bash
# Przejście do użytkownika postgres
sudo -u postgres psql

# Utworzenie bazy danych
CREATE DATABASE evapremium_leads;

# Utworzenie użytkownika
CREATE USER leaduser WITH PASSWORD 'twoje_haslo_123';

# Nadanie uprawnień
GRANT ALL PRIVILEGES ON DATABASE evapremium_leads TO leaduser;

# Wyjście
\q
```

### **Konfiguracja dostępu:**
```bash
# Edycja pliku pg_hba.conf
sudo nano /etc/postgresql/15/main/pg_hba.conf

# Dodaj linię (zastąp 15 swoją wersją):
host    evapremium_leads    leaduser    0.0.0.0/0    md5

# Restart PostgreSQL
sudo systemctl restart postgresql
```

## 🌐 **Krok 3: Konfiguracja zmiennych środowiskowych**

### **Na serwerze stwórz plik `.env`:**
```bash
# Przejdź do katalogu projektu
cd /var/www/lead_capture_page

# Stwórz plik .env
nano .env
```

### **Zawartość pliku `.env`:**
```env
# Production Environment
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://twoja-domena.pl
NEXT_PUBLIC_API_URL=https://twoja-domena.pl/api

# Database - PostgreSQL
DATABASE_URL="postgresql://leaduser:twoje_haslo_123@localhost:5432/evapremium_leads?schema=public"

# Prisma
PRISMA_GENERATE_DATAPROXY=false

# Next.js
NEXTAUTH_SECRET="twoj-tajny-klucz-123"
NEXTAUTH_URL="https://twoja-domena.pl"
```

## 🔧 **Krok 4: Wdrożenie aplikacji**

### **Instalacja zależności:**
```bash
# Instalacja Node.js (jeśli nie ma)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalacja PM2 (process manager)
sudo npm install -g pm2

# Instalacja zależności projektu
npm install

# Generowanie Prisma Client
npx prisma generate

# Uruchomienie migracji
npx prisma migrate deploy
```

### **Build aplikacji:**
```bash
# Build produkcyjny
npm run build

# Uruchomienie przez PM2
pm2 start npm --name "lead-capture" -- start
pm2 save
pm2 startup
```

## 🔍 **Krok 5: Weryfikacja**

### **Sprawdzenie połączenia z bazą:**
```bash
# Test połączenia
npx prisma db pull

# Otwarcie Prisma Studio (opcjonalnie)
npx prisma studio --hostname 0.0.0.0 --port 5555
```

### **Sprawdzenie logów:**
```bash
# Logi aplikacji
pm2 logs lead-capture

# Logi PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-15-main.log
```

## 🛡️ **Krok 6: Bezpieczeństwo**

### **Firewall:**
```bash
# UFW (Ubuntu)
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 5432/tcp  # PostgreSQL (tylko lokalnie)
sudo ufw enable
```

### **SSL/HTTPS:**
```bash
# Certbot (Let's Encrypt)
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d twoja-domena.pl
```

## 📊 **Krok 7: Monitoring**

### **PM2 Monitoring:**
```bash
# Status procesów
pm2 status

# Monitor w czasie rzeczywistym
pm2 monit

# Restart aplikacji
pm2 restart lead-capture
```

### **Logi bazy danych:**
```bash
# Sprawdzenie aktywnych połączeń
sudo -u postgres psql -c "SELECT * FROM pg_stat_activity;"

# Sprawdzenie rozmiaru bazy
sudo -u postgres psql -c "SELECT pg_size_pretty(pg_database_size('evapremium_leads'));"
```

## 🚨 **Rozwiązywanie problemów**

### **Błąd połączenia z bazą:**
```bash
# Sprawdzenie statusu PostgreSQL
sudo systemctl status postgresql

# Sprawdzenie logów
sudo tail -f /var/log/postgresql/postgresql-15-main.log

# Test połączenia
psql -h localhost -U leaduser -d evapremium_leads
```

### **Błąd uprawnień:**
```bash
# Sprawdzenie uprawnień użytkownika
sudo -u postgres psql -c "\du"

# Nadanie dodatkowych uprawnień
GRANT CREATE ON SCHEMA public TO leaduser;
```

## 📞 **Wsparcie**

W przypadku problemów:
1. Sprawdź logi aplikacji: `pm2 logs lead-capture`
2. Sprawdź logi bazy: `sudo tail -f /var/log/postgresql/postgresql-15-main.log`
3. Sprawdź status serwisów: `sudo systemctl status postgresql`

## ✅ **Lista kontrolna wdrożenia**

- [ ] PostgreSQL zainstalowany i uruchomiony
- [ ] Baza danych `evapremium_leads` utworzona
- [ ] Użytkownik `leaduser` utworzony z uprawnieniami
- [ ] Plik `.env` skonfigurowany z `DATABASE_URL`
- [ ] Prisma Client wygenerowany
- [ ] Migracje uruchomione
- [ ] Aplikacja zbudowana (`npm run build`)
- [ ] PM2 skonfigurowany i uruchomiony
- [ ] Firewall skonfigurowany
- [ ] SSL/HTTPS skonfigurowany
- [ ] Test połączenia z bazą udany
- [ ] Formularz działa na produkcji

---

**🎯 Po wykonaniu wszystkich kroków Twój formularz będzie działał na serwerze z bazą PostgreSQL!**
