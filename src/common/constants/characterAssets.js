import airForce from '@/assets/character/airForce.webp'
import army from '@/assets/character/army.webp'
import marineCorps from '@/assets/character/marineCorps.webp'
import navy from '@/assets/character/navy.webp'

export const characterAssets = Object.freeze({
  ARMY: army,
  NAVY: navy,
  AIRFORCE: airForce,
  MARINE: marineCorps,
})

export const characterProfileOptions = Object.freeze([
  { name: 'profile-army.png', source: characterAssets.ARMY },
  { name: 'profile-marine.png', source: characterAssets.MARINE },
  { name: 'profile-airforce.png', source: characterAssets.AIRFORCE },
  { name: 'profile-navy.png', source: characterAssets.NAVY },
])

const characterAliases = Object.freeze({
  ...characterAssets,
  AIR_FORCE: characterAssets.AIRFORCE,
  MARINE_CORPS: characterAssets.MARINE,
  PROFILE_ARMY_PNG: characterAssets.ARMY,
  PROFILE_AIRFORCE_PNG: characterAssets.AIRFORCE,
  PROFILE_NAVY_PNG: characterAssets.NAVY,
  PROFILE_MARINE_PNG: characterAssets.MARINE,
})

export const characterAssetsByProfileName = Object.freeze(
  Object.fromEntries(characterProfileOptions.map(({ name, source }) => [name, source])),
)

export function getCharacterAsset(value, fallback = characterAssets.ARMY) {
  const rawValue = String(value || '').trim()
  if (/^(https?:|data:|\/)/i.test(rawValue)) return value

  const normalized = rawValue.toUpperCase().replace(/[.\s-]+/g, '_')
  return characterAliases[normalized] || fallback
}
