-- Supabase Dashboard'da çalıştırın
-- Gerçek testnet logoları ile güncelleme

UPDATE public.dewrk_testnets SET 
  logo_url = 'https://cryptologos.cc/logos/base-base-logo.svg?v=029'
WHERE slug = 'base-sepolia';

UPDATE public.dewrk_testnets SET 
  logo_url = 'https://cryptologos.cc/logos/optimism-ethereum-op-logo.svg?v=029'
WHERE slug = 'optimism-sepolia';

UPDATE public.dewrk_testnets SET 
  logo_url = 'https://cryptologos.cc/logos/arbitrum-arb-logo.svg?v=029'
WHERE slug = 'arbitrum-stylus';

UPDATE public.dewrk_testnets SET 
  logo_url = 'https://cryptologos.cc/logos/scroll-scr-logo.svg?v=029'
WHERE slug = 'scroll-sepolia';

UPDATE public.dewrk_testnets SET 
  logo_url = 'https://cryptologos.cc/logos/linea-linea-logo.svg?v=029'
WHERE slug = 'linea-goerli';

UPDATE public.dewrk_testnets SET 
  logo_url = 'https://cryptologos.cc/logos/starknet-token-strk-logo.svg?v=029'
WHERE slug = 'starknet-testnet';

UPDATE public.dewrk_testnets SET 
  logo_url = 'https://cryptologos.cc/logos/zksync-zk-logo.svg?v=029'
WHERE slug = 'zksync-era-testnet';

UPDATE public.dewrk_testnets SET 
  logo_url = 'https://cryptologos.cc/logos/polygon-matic-logo.svg?v=029'
WHERE slug = 'polygon-zkevm-testnet';

UPDATE public.dewrk_testnets SET 
  logo_url = 'https://cryptologos.cc/logos/solana-sol-logo.svg?v=029'
WHERE slug = 'solana-devnet';

UPDATE public.dewrk_testnets SET 
  logo_url = 'https://cryptologos.cc/logos/sui-sui-logo.svg?v=029'
WHERE slug = 'sui-testnet';

UPDATE public.dewrk_testnets SET 
  logo_url = 'https://cryptologos.cc/logos/aptos-apt-logo.svg?v=029'
WHERE slug = 'aptos-testnet';

UPDATE public.dewrk_testnets SET 
  logo_url = 'https://cryptologos.cc/logos/celestia-tia-logo.svg?v=029'
WHERE slug = 'celestia-mocha';

UPDATE public.dewrk_testnets SET 
  logo_url = 'https://fuel.mirror.xyz/_next/image?url=https%3A%2F%2Fimages.mirror-media.xyz%2Fpublication-images%2FH3V5SsLfFzkD5fUQKBz8y.png&w=3840&q=75'
WHERE slug = 'fuel-v2-testnet';

UPDATE public.dewrk_testnets SET 
  logo_url = 'https://cryptologos.cc/logos/mantle-mnt-logo.svg?v=029'
WHERE slug = 'mantle-sepolia';

UPDATE public.dewrk_testnets SET 
  logo_url = 'https://cryptologos.cc/logos/frax-share-fxs-logo.svg?v=029'
WHERE slug = 'fraxchain-holesky';

-- Kontrol
SELECT slug, name, logo_url FROM public.dewrk_testnets ORDER BY slug;

