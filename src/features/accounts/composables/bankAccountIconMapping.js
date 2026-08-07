import bankBusan from '@/assets/icons/bank-account-lcon/account-list/Busan.png'
import bankGyeongnam from '@/assets/icons/bank-account-lcon/account-list/Gyeonnam.png'
import bankHana from '@/assets/icons/bank-account-lcon/account-list/Hana.png'
import bankIbk from '@/assets/icons/bank-account-lcon/account-list/IBK.png'
import bankJeju from '@/assets/icons/bank-account-lcon/account-list/Jeju.png'
import bankJeonbuk from '@/assets/icons/bank-account-lcon/account-list/Jeonbook.png'
import bankKb from '@/assets/icons/bank-account-lcon/account-list/KB.png'
import bankGwangju from '@/assets/icons/bank-account-lcon/account-list/KJB.png'
import bankKbank from '@/assets/icons/bank-account-lcon/account-list/Kbank.png'
import bankMg from '@/assets/icons/bank-account-lcon/account-list/MG.png'
import bankNh from '@/assets/icons/bank-account-lcon/account-list/NH.png'
import bankNhLocal from '@/assets/icons/bank-account-lcon/account-list/NHlocal.png'
import bankSc from '@/assets/icons/bank-account-lcon/account-list/SC.png'
import bankSh from '@/assets/icons/bank-account-lcon/account-list/SH.png'
import bankShinhan from '@/assets/icons/bank-account-lcon/account-list/Shinhan.png'
import bankPost from '@/assets/icons/bank-account-lcon/account-list/Wochekook.png'
import bankWoori from '@/assets/icons/bank-account-lcon/account-list/Woori.png'
import bankIm from '@/assets/icons/bank-account-lcon/account-list/iM.png'
import bankFallback from '@/assets/onboarding/icons/bank-building.png'
import {
  accountInstitutionName,
  accountOrganizationCode,
  normalizeInstitutionName,
} from '@/features/accounts/composables/institutionMapping'

const iconsByCode = {
  '0003': bankIbk,
  '0004': bankKb,
  '0007': bankSh,
  '0011': bankNh,
  '0020': bankWoori,
  '0023': bankSc,
  '0031': bankIm,
  '0032': bankBusan,
  '0034': bankGwangju,
  '0035': bankJeju,
  '0037': bankJeonbuk,
  '0039': bankGyeongnam,
  '0045': bankMg,
  '0071': bankPost,
  '0081': bankHana,
  '0088': bankShinhan,
  '0089': bankKbank,
  '0111': bankNhLocal,
}

const iconsByName = {
  ibk기업: bankIbk,
  기업: bankIbk,
  kb국민: bankKb,
  국민: bankKb,
  수협: bankSh,
  nh농협: bankNh,
  농협: bankNh,
  지역농축협: bankNhLocal,
  지역농협: bankNhLocal,
  우리: bankWoori,
  sc제일: bankSc,
  im: bankIm,
  대구: bankIm,
  부산: bankBusan,
  광주: bankGwangju,
  제주: bankJeju,
  전북: bankJeonbuk,
  경남: bankGyeongnam,
  새마을금고: bankMg,
  우체국: bankPost,
  하나: bankHana,
  신한: bankShinhan,
  케이: bankKbank,
}

export function bankAccountIcon(account) {
  const code = accountOrganizationCode(account)
  if (iconsByCode[code]) return iconsByCode[code]

  const normalizedName = normalizeInstitutionName(accountInstitutionName(account))
  const matchedName = Object.keys(iconsByName).find((name) => normalizedName.includes(name))
  return iconsByName[matchedName] || bankFallback
}
