import assetIcon from '@/assets/icons/Category/assetIconSmall.png'
import etcIcon from '@/assets/icons/Category/etcIconSmall.png'
import foodIcon from '@/assets/icons/Category/foodIconSmall.png'
import leisureIcon from '@/assets/icons/Category/leisureIconSmall.png'
import medicalIcon from '@/assets/icons/Category/medicalIconSmall.png'
import pxIcon from '@/assets/icons/Category/PXIconSmall.png'
import salaryIcon from '@/assets/icons/Category/salaryIconSmall.png'
import shoppingIcon from '@/assets/icons/Category/shoppingIconSmall.png'
import transportIcon from '@/assets/icons/Category/transportIconSmall.png'

const CATEGORY_ICON_MAP = {
  SALARY: salaryIcon,
  OTHER_INCOME: salaryIcon,
  INCOME: salaryIcon,
  FOOD: foodIcon,
  PX: pxIcon,
  TRANSPORT: transportIcon,
  SHOPPING: shoppingIcon,
  LEISURE: leisureIcon,
  CULTURE: leisureIcon,
  MEDICAL: medicalIcon,
  HEALTH: medicalIcon,
  SAVINGS: assetIcon,
  INVESTMENT: assetIcon,
  ASSET: assetIcon,
  ASSET_TRANSFER: assetIcon,
  ETC: etcIcon,
  UNCLASSIFIED: etcIcon,
}

export const transactionCategoryOptions = [
  { value: 'SALARY', label: '급여' },
  { value: 'ASSET', label: '자산' },
  { value: 'PX', label: 'PX·편의점' },
  { value: 'FOOD', label: '식비' },
  { value: 'SHOPPING', label: '쇼핑' },
  { value: 'TRANSPORT', label: '교통' },
  { value: 'LEISURE', label: '여가' },
  { value: 'MEDICAL', label: '의료' },
  { value: 'ETC', label: '기타' },
]

export function transactionCategoryIcon(category) {
  return CATEGORY_ICON_MAP[String(category || '').toUpperCase()] || etcIcon
}

export function transactionCategoryLabel(category) {
  const normalized = String(category || '').toUpperCase()
  if (normalized === 'UNCLASSIFIED') return '기타'
  return transactionCategoryOptions.find(({ value }) => value === normalized)?.label || '기타'
}
