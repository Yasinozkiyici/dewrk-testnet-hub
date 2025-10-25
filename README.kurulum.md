# Dewrk Projesi Kurulum Rehberi

## Hızlı Başlangıç

### Çalıştır
```bash
docker compose -p dewrk up -d --build
```

### Logları İzle
```bash
docker compose -p dewrk logs -f web
```

### Durdur ve Temizle
```bash
docker compose -p dewrk down -v
```

## Port Kontrolü

### Hangi Port Kim Tarafından Kullanılıyor
```bash
lsof -i :3301
```

### Benzersizlik Kontrolü
```bash
# Network kontrolü
docker network ls | grep dewrk_net

# Volume kontrolü
docker volume ls | grep dewrk_db_data
```

## Proje Sabitleri

- **PROJECT_SLUG**: dewrk
- **BASE_PORT**: 3300
- **APP_PORT**: 3301 (Host'ta erişim)
- **API_PORT**: 3302 (Gelecekte kullanım için)
- **REDIS_PORT**: 3303 (Opsiyonel)
- **DB_HOST**: db (Container içi)
- **DB_PORT_INT**: 5432 (Container içi)
- **DB_NAME**: dewrk
- **DB_USER**: dewrk
- **DB_PASS**: secret

## Erişim

- **Uygulama**: http://localhost:3301
- **Admin Panel**: http://localhost:3301/admin
- **Database**: Sadece container içi erişim (güvenlik)

## Veritabanı Bağlantısı

Uygulama container içinden şu URL ile bağlanır:
```
postgres://dewrk:secret@db:5432/dewrk
```

## Güvenlik

- Database host'a açık değil
- Sadece uygulama portu (3301) dışarı açık
- Tüm container'lar izole network'te
- Benzersiz volume ve network isimleri

## Geliştirme

### Yerel Geliştirme
```bash
# Database'i başlat
docker compose -p dewrk up -d db

# Uygulamayı yerel çalıştır
pnpm dev
```

### Production Build
```bash
docker compose -p dewrk up -d --build
```

## Sorun Giderme

### Port Çakışması
```bash
# Port 3301'i kim kullanıyor?
lsof -i :3301

# Eğer başka bir uygulama kullanıyorsa, .env'de APP_PORT'u değiştir
```

### Container Sorunları
```bash
# Container'ları yeniden başlat
docker compose -p dewrk restart

# Logları kontrol et
docker compose -p dewrk logs web
```

### Database Sorunları
```bash
# Database'i sıfırla
docker compose -p dewrk down -v
docker compose -p dewrk up -d --build
```

