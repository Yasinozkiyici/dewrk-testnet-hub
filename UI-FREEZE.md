# UI-FREEZE: Değişmez Prensipler

Bu dokümantasyon, projenin UI-Freeze prensiplerini ve uygulanan kuralları açıklar.

## 🚨 Değişmez Prensipler

### 1. Design Tokens & Layout Kilidi
- **tailwind.config.js**: Tüm design tokens dondurulmuş
- **tokens.css**: CSS custom properties değiştirilemez
- **Container genişlikleri**: `container-x` (72rem), `container-wide` (84rem)
- **Gradient/mesh**: Landing page gradient'leri sabit
- **Font ölçekleri**: 11px-40px arası sabit ölçek
- **Kart gölgeleri**: `shadow-card`, `shadow-dew-*` sabit

### 2. DOM/Class Sözleşmesi Sabit
- **Mevcut component class'ları**: Header, TestnetCard, Footer değiştirilemez
- **DOM hiyerarşisi**: Component yapısı korunur
- **Yalnızca ek props**: Eski davranış aynen kalır
- **data-frozen-component**: Tüm component'larda tanımlı

### 3. Görsel Regresyon ve Kontrast Testi
- **Playwright pixel-diff**: Görsel değişiklikler otomatik tespit
- **axe-core kontrast**: Metin ≥ 4.5:1, başlık ≥ 3:1 zorunlu
- **Erişilebilirlik**: WCAG 2.1 AA uyumluluğu
- **Performans**: CLS ≤ 0.02, LCP ≤ 2.5s

### 4. Feature Flag Sistemi
- **Yeni backend özellikleri**: UI'da flag ile açılır
- **Default kapalı**: Tüm yeni özellikler başlangıçta kapalı
- **Mevcut UI korunur**: Header, TestnetCard, Footer etkilenmez
- **Admin paneli**: Feature flag yönetimi

### 5. Performans Bütçeleri
- **CLS**: ≤ 0.02 (Cumulative Layout Shift)
- **LCP**: ≤ 2.5s (Largest Contentful Paint)
- **Yeni JS**: ≤ +30KB (gzipped)
- **Bundle analizi**: Otomatik boyut kontrolü

### 6. Metin Dili
- **Tüm copy İngilizce**: Dil değiştirilemez
- **İçerik CMS/JSON'dan**: Content management sistemi
- **Tipografi ölçeği sabit**: Sadece içerik değişebilir
- **Content validation**: Otomatik dil kontrolü

## 📁 Dosya Yapısı

```
src/lib/
├── design-tokens.ts      # Dondurulmuş design tokens
├── dom-contract.ts       # DOM sözleşmesi sistemi
├── visual-regression.ts  # Görsel regresyon testleri
├── feature-flags.ts      # Feature flag yönetimi
├── performance-budgets.ts # Performans bütçeleri
└── content-management.ts # İçerik yönetim sistemi

src/components/
├── Header.tsx            # Dondurulmuş header component
├── TestnetCard.tsx       # Dondurulmuş testnet card
├── admin/
│   └── FeatureFlagPanel.tsx # Feature flag admin paneli
└── ...

tests/e2e/
└── visual-regression.spec.ts # Görsel regresyon testleri
```

## 🔧 Kullanım

### Design Tokens
```typescript
import { FROZEN_TOKENS } from './src/lib/design-tokens';

// Dondurulmuş renkler
const primaryColor = FROZEN_TOKENS.colors.dew.mint;

// Dondurulmuş gölgeler
const cardShadow = FROZEN_TOKENS.shadows.card;
```

### DOM Contract
```typescript
import { validateComponentContract } from './src/lib/dom-contract';

// Component contract kontrolü
const isValid = validateComponentContract('Header', element);
```

### Feature Flags
```typescript
import { useFeatureFlag } from './src/lib/feature-flags';

function MyComponent() {
  const isNewFeatureEnabled = useFeatureFlag('new-feature');
  
  if (isNewFeatureEnabled) {
    return <NewFeatureComponent />;
  }
  
  return <ExistingComponent />;
}
```

### Content Management
```typescript
import { useContent } from './src/lib/content-management';

function Header() {
  const content = useContent('Header');
  
  return (
    <header>
      <h1>{content.getText('brand-name')}</h1>
      <button>{content.getButtonText('submit-testnet')}</button>
    </header>
  );
}
```

### Performance Monitoring
```typescript
import { usePerformanceMonitor } from './src/lib/performance-budgets';

function PerformanceDashboard() {
  const { metrics, violations, hasViolations } = usePerformanceMonitor();
  
  if (hasViolations) {
    console.warn('Performance budget violations:', violations);
  }
}
```

## 🧪 Test Komutları

```bash
# Görsel regresyon testleri
pnpm test:e2e visual-regression.spec.ts

# Kontrast testleri
pnpm test:e2e --grep "contrast"

# Erişilebilirlik testleri
pnpm test:e2e --grep "accessibility"

# Performans testleri
pnpm test:e2e --grep "performance"
```

## ⚠️ Uyarılar

### Design Tokens Değiştirilemez
- `tailwind.config.js` dosyası dondurulmuş
- Yeni renk, font, gölge eklenemez
- Mevcut değerler değiştirilemez

### DOM Yapısı Korunmalı
- Component class'ları değiştirilemez
- DOM hiyerarşisi korunmalı
- Sadece ek props eklenebilir

### Performance Budgets Zorunlu
- CLS, LCP, JS boyutu kontrol edilir
- Budget ihlalleri build'i durdurur
- Bundle analizi otomatik çalışır

### Content Sadece İngilizce
- Tüm metin içeriği İngilizce olmalı
- Content management sistemi kullanılmalı
- Tipografi ölçeği değiştirilemez

## 🚀 Geliştirme Rehberi

### Yeni Özellik Ekleme
1. Feature flag oluştur (default kapalı)
2. Backend özelliğini geliştir
3. UI'da flag kontrolü ekle
4. Test et ve flag'i aç

### Component Değiştirme
1. Mevcut component'i değiştirme
2. Yeni component oluştur
3. Feature flag ile kontrol et
4. Eski component'i koru

### İçerik Değiştirme
1. Content management sistemini kullan
2. JSON dosyasını güncelle
3. Component'da content hook'u kullan
4. İngilizce dil kontrolü yap

## 📊 Monitoring

### Görsel Regresyon
- Her değişiklik otomatik test edilir
- Baseline'lar korunur
- Pixel farkları raporlanır

### Performans
- Real-time monitoring
- Budget ihlalleri uyarılır
- Bundle analizi otomatik

### Erişilebilirlik
- Kontrast oranları kontrol edilir
- WCAG uyumluluğu test edilir
- Keyboard navigation kontrol edilir

## 🔒 Güvenlik

### UI-Freeze Violations
- Design token değişiklikleri uyarılır
- DOM contract ihlalleri tespit edilir
- Performance budget aşımları engellenir

### Content Validation
- İngilizce dil kontrolü
- Missing content uyarıları
- Tipografi ölçeği koruması

---

**Not**: Bu prensipler değiştirilemez ve tüm geliştirme süreçlerinde uygulanmalıdır.

