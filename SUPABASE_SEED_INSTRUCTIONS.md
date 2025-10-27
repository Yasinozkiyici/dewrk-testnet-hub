# Supabase Seed Instructions

## 🎯 Amacımız
Supabase veritabanına 15 adet testnet kaydı eklemek.

## ✅ Adımlar

### 1. Supabase Dashboard'a Git
```
https://supabase.com/dashboard/project/wtfigakgzhaqexuivjhr
```

### 2. SQL Editor'ü Aç
- Sol menüden **SQL Editor** seç
- **New query** butonuna tıkla

### 3. Seed SQL'i Çalıştır
- `supabase/seed/seed.sql` dosyasının içeriğini kopyala
- SQL Editor'e yapıştır
- **Run** butonuna bas

### 4. Kontrol Et
SQL Editor'de şu sorguyu çalıştır:
```sql
SELECT count(*), min(slug), max(slug) FROM public.dewrk_testnets;
```

**Beklenen sonuç**: `count(*)` = 15 (veya daha fazla)

## 📋 Seed Sonrası

1. **Local app'i yeniden başlat** (zaten çalışıyor: `localhost:4000`)
2. **Endpoint'i test et**: `http://localhost:4000/api/testnets`
3. **Ana sayfada 15 kayıt görmelisiniz**

## ⚠️ Not
- DNS hatası nedeniyle local terminalden çalıştıramıyoruz
- Supabase Dashboard'dan çalıştırmak daha güvenli

