-- Supabase Dashboard SQL Editor'da çalıştırın
-- Gerçek testnet logoları ile güncelleme (yüksek kalite, güvenilir CDN'ler)

BEGIN;

-- Base (Coinbase L2)
UPDATE public.dewrk_testnets SET 
  logo_url = 'https://avatars.githubusercontent.com/u/108554348?s=200&v=4',
  hero_image_url = 'https://avatars.githubusercontent.com/u/108554348?s=400&v=4'
WHERE slug = 'base-sepolia';

-- Optimism
UPDATE public.dewrk_testnets SET 
  logo_url = 'https://avatars.githubusercontent.com/u/38230339?s=200&v=4',
  hero_image_url = 'https://avatars.githubusercontent.com/u/38230339?s=400&v=4'
WHERE slug = 'optimism-sepolia';

-- Arbitrum
UPDATE public.dewrk_testnets SET 
  logo_url = 'https://avatars.githubusercontent.com/u/23242917?s=200&v=4',
  hero_image_url = 'https://avatars.githubusercontent.com/u/23242917?s=400&v=4'
WHERE slug = 'arbitrum-stylus';

-- Scroll
UPDATE public.dewrk_testnets SET 
  logo_url = 'https://avatars.githubusercontent.com/u/101084565?s=200&v=4',
  hero_image_url = 'https://avatars.githubusercontent.com/u/101084565?s=400&v=4'
WHERE slug = 'scroll-sepolia';

-- Linea (Consensys)
UPDATE public.dewrk_testnets SET 
  logo_url = 'https://docs.linea.build/img/logoSpacedBlack.svg',
  hero_image_url = 'https://docs.linea.build/img/logoSpacedBlack.svg'
WHERE slug = 'linea-goerli';

-- Starknet
UPDATE public.dewrk_testnets SET 
  logo_url = 'https://avatars.githubusercontent.com/u/61302280?s=200&v=4',
  hero_image_url = 'https://avatars.githubusercontent.com/u/61302280?s=400&v=4'
WHERE slug = 'starknet-testnet';

-- zkSync
UPDATE public.dewrk_testnets SET 
  logo_url = 'https://avatars.githubusercontent.com/u/55765878?s=200&v=4',
  hero_image_url = 'https://avatars.githubusercontent.com/u/55765878?s=400&v=4'
WHERE slug = 'zksync-era-testnet';

-- Polygon zkEVM
UPDATE public.dewrk_testnets SET 
  logo_url = 'https://avatars.githubusercontent.com/u/90451011?s=200&v=4',
  hero_image_url = 'https://avatars.githubusercontent.com/u/90451011?s=400&v=4'
WHERE slug = 'polygon-zkevm-testnet';

-- Solana
UPDATE public.dewrk_testnets SET 
  logo_url = 'https://avatars.githubusercontent.com/u/35608259?s=200&v=4',
  hero_image_url = 'https://avatars.githubusercontent.com/u/35608259?s=400&v=4'
WHERE slug = 'solana-devnet';

-- Sui
UPDATE public.dewrk_testnets SET 
  logo_url = 'https://avatars.githubusercontent.com/u/101119606?s=200&v=4',
  hero_image_url = 'https://avatars.githubusercontent.com/u/101119606?s=400&v=4'
WHERE slug = 'sui-testnet';

-- Aptos
UPDATE public.dewrk_testnets SET 
  logo_url = 'https://avatars.githubusercontent.com/u/108958857?s=200&v=4',
  hero_image_url = 'https://avatars.githubusercontent.com/u/108958857?s=400&v=4'
WHERE slug = 'aptos-testnet';

-- Celestia
UPDATE public.dewrk_testnets SET 
  logo_url = 'https://avatars.githubusercontent.com/u/54859940?s=200&v=4',
  hero_image_url = 'https://avatars.githubusercontent.com/u/54859940?s=400&v=4'
WHERE slug = 'celestia-mocha';

-- Fuel
UPDATE public.dewrk_testnets SET 
  logo_url = 'https://avatars.githubusercontent.com/u/77732909?s=200&v=4',
  hero_image_url = 'https://avatars.githubusercontent.com/u/77732909?s=400&v=4'
WHERE slug = 'fuel-v2-testnet';

-- Mantle
UPDATE public.dewrk_testnets SET 
  logo_url = 'https://avatars.githubusercontent.com/u/104313587?s=200&v=4',
  hero_image_url = 'https://avatars.githubusercontent.com/u/104313587?s=400&v=4'
WHERE slug = 'mantle-sepolia';

-- Fraxchain (Frax Finance)
UPDATE public.dewrk_testnets SET 
  logo_url = 'https://avatars.githubusercontent.com/u/56005256?s=200&v=4',
  hero_image_url = 'https://avatars.githubusercontent.com/u/56005256?s=400&v=4'
WHERE slug = 'fraxchain-holesky';

COMMIT;

-- Kontrol: Tüm logoların güncellendiğini doğrulayın
SELECT 
  slug, 
  name, 
  CASE 
    WHEN logo_url LIKE '%github%' THEN '✅ GitHub'
    WHEN logo_url LIKE '%linea%' THEN '✅ Linea Docs'
    ELSE '❌ Eksik'
  END as logo_source
FROM public.dewrk_testnets 
ORDER BY slug;

