import bankBusan from '../../../assets/institutions/banks/Busan.svg'
import bankGyeongnam from '../../../assets/institutions/banks/Kyeongnam.svg'
import bankHana from '../../../assets/institutions/banks/Hana.svg'
import bankIbk from '../../../assets/institutions/banks/IBK.svg'
import bankJeju from '../../../assets/institutions/banks/Jeju.svg'
import bankJeonbuk from '../../../assets/institutions/banks/JeonBok.svg'
import bankKb from '../../../assets/institutions/banks/KB.svg'
import bankGwangju from '../../../assets/institutions/banks/KJB.svg'
import bankKbank from '../../../assets/institutions/banks/Kbank.svg'
import bankMg from '../../../assets/institutions/banks/MG.svg'
import bankNh from '../../../assets/institutions/banks/NH.svg'
import bankNhLocal from '../../../assets/institutions/banks/NHlocal.svg'
import bankSc from '../../../assets/institutions/banks/SC.svg'
import bankSh from '../../../assets/institutions/banks/SH.svg'
import bankShinhan from '../../../assets/institutions/banks/Shinhan.svg'
import bankPost from '../../../assets/institutions/banks/Wochekook.svg'
import bankWoori from '../../../assets/institutions/banks/Woori.svg'
import bankFallback from '../../../assets/features/onboarding/icons/bank-building.png'
import bankIm from '../../../assets/institutions/banks/iM.svg'
import bankBlockBusan from '../../../assets/institutions/banks/block/Busan.png'
import bankBlockGyeongnam from '../../../assets/institutions/banks/block/Gyeonnam.png'
import bankBlockIbk from '../../../assets/institutions/banks/block/IBK.png'
import bankBlockJeju from '../../../assets/institutions/banks/block/Jeju.png'
import bankBlockJeonbuk from '../../../assets/institutions/banks/block/Jeonbook.png'
import bankBlockKb from '../../../assets/institutions/banks/block/KB.png'
import bankBlockGwangju from '../../../assets/institutions/banks/block/KJB.png'
import bankBlockKbank from '../../../assets/institutions/banks/block/Kbank.png'
import bankBlockMg from '../../../assets/institutions/banks/block/MG.png'
import bankBlockNh from '../../../assets/institutions/banks/block/NH.png'
import bankBlockNhLocal from '../../../assets/institutions/banks/block/NHlocal.png'
import bankBlockSc from '../../../assets/institutions/banks/block/SC.png'
import bankBlockSh from '../../../assets/institutions/banks/block/SH.png'
import bankBlockShinhan from '../../../assets/institutions/banks/block/Shinhan.png'
import bankBlockPost from '../../../assets/institutions/banks/block/Wochekook.png'
import bankBlockWoori from '../../../assets/institutions/banks/block/Woori.png'
import bankBlockIm from '../../../assets/institutions/banks/block/iM.png'
import {
  accountInstitutionName,
  accountOrganizationCode,
  isSecuritiesAccount,
  normalizeInstitutionName,
} from '@/features/accounts/composables/institutionMapping'

const securityAssets = import.meta.glob(
  '@/assets/features/onboarding/institutions/security-*.svg',
  {
    eager: true,
    import: 'default',
    query: '?url',
  },
)

const securityLogoIndexByCode = {
  '0238': 0,
  '0243': 1,
  '0218': 2,
  '0240': 3,
  '0247': 4,
  '0261': 5,
  '0264': 6,
  '0266': 7,
  '0209': 8,
  '0267': 9,
  '0269': 10,
  '0270': 11,
  '0278': 12,
  '0279': 13,
  '0280': 14,
  '0287': 15,
  '0225': 16,
}

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
  케이뱅크: bankKbank,
}

const blockIconsByCode = {
  '0003': bankBlockIbk,
  '0004': bankBlockKb,
  '0007': bankBlockSh,
  '0011': bankBlockNh,
  '0020': bankBlockWoori,
  '0023': bankBlockSc,
  '0031': bankBlockIm,
  '0032': bankBlockBusan,
  '0034': bankBlockGwangju,
  '0035': bankBlockJeju,
  '0037': bankBlockJeonbuk,
  '0039': bankBlockGyeongnam,
  '0045': bankBlockMg,
  '0071': bankBlockPost,
  '0088': bankBlockShinhan,
  '0089': bankBlockKbank,
  '0111': bankBlockNhLocal,
}

const blockIconsByName = {
  ibk기업: bankBlockIbk,
  기업: bankBlockIbk,
  kb국민: bankBlockKb,
  국민: bankBlockKb,
  수협: bankBlockSh,
  nh농협: bankBlockNh,
  농협: bankBlockNh,
  지역농축협: bankBlockNhLocal,
  지역농협: bankBlockNhLocal,
  우리: bankBlockWoori,
  sc제일: bankBlockSc,
  대구: bankBlockIm,
  im: bankBlockIm,
  부산: bankBlockBusan,
  광주: bankBlockGwangju,
  제주: bankBlockJeju,
  전북: bankBlockJeonbuk,
  경남: bankBlockGyeongnam,
  새마을금고: bankBlockMg,
  우체국: bankBlockPost,
  신한: bankBlockShinhan,
  케이뱅크: bankBlockKbank,
}

export function bankAccountIcon(account) {
  if (isSecuritiesAccount(account)) {
    const logoIndex = securityLogoIndexByCode[accountOrganizationCode(account)] ?? 0
    const iconPath = Object.keys(securityAssets).find((path) =>
      path.endsWith(`/security-${logoIndex}.svg`),
    )

    return securityAssets[iconPath] || bankFallback
  }

  const code = accountOrganizationCode(account)
  if (iconsByCode[code]) return iconsByCode[code]

  const normalizedName = normalizeInstitutionName(accountInstitutionName(account))
  const matchedName = Object.keys(iconsByName).find((name) => normalizedName.includes(name))
  return iconsByName[matchedName] || bankFallback
}

export function bankAccountBlockIcon(account) {
  const code = accountOrganizationCode(account)
  if (blockIconsByCode[code]) return blockIconsByCode[code]

  const normalizedName = normalizeInstitutionName(accountInstitutionName(account))
  const matchedName = Object.keys(blockIconsByName).find((name) => normalizedName.includes(name))
  return blockIconsByName[matchedName] || bankBlockKb
}
