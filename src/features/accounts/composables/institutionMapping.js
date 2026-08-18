const institutionAliases = {
  '0003': ['기업은행', 'ibk기업은행'],
  '0004': ['국민은행', 'kb국민은행'],
  '0007': ['수협은행'],
  '0011': ['농협은행', 'nh농협은행'],
  '0020': ['우리은행'],
  '0023': ['sc제일은행'],
  '0031': ['im뱅크', '대구은행'],
  '0032': ['부산은행'],
  '0034': ['광주은행'],
  '0035': ['제주은행'],
  '0037': ['전북은행'],
  '0039': ['경남은행'],
  '0045': ['새마을금고'],
  '0071': ['우체국'],
  '0088': ['신한은행'],
  '0089': ['케이뱅크'],
  '0090': ['카카오뱅크'],
  '0111': ['지역농협'],
  '0209': ['유안타증권'],
  '0218': ['KB증권'],
  '0225': ['IBK투자증권'],
  '0238': ['미래에셋증권'],
  '0240': ['삼성증권'],
  '0243': ['한국투자증권'],
  '0247': ['NH투자증권'],
  '0261': ['교보증권'],
  '0264': ['키움증권'],
  '0266': ['SK증권'],
  '0267': ['대신증권'],
  '0269': ['한화투자증권'],
  '0270': ['하나금융투자'],
  '0278': ['신한금융투자'],
  '0279': ['DB금융투자'],
  '0280': ['유진투자증권'],
  '0287': ['메리츠증권'],
}

const institutionNamesByCode = {
  '0003': 'IBK\uAE30\uC5C5\uC740\uD589',
  '0004': 'KB\uAD6D\uBBFC\uC740\uD589',
  '0007': '\uC218\uD611\uC740\uD589',
  '0011': 'NH\uB18D\uD611\uC740\uD589',
  '0020': '\uC6B0\uB9AC\uC740\uD589',
  '0023': 'SC\uC81C\uC77C\uC740\uD589',
  '0031': 'iM\uB565\uD06C',
  '0032': '\uBD80\uC0B0\uC740\uD589',
  '0034': '\uAD11\uC8FC\uC740\uD589',
  '0035': '\uC81C\uC8FC\uC740\uD589',
  '0037': '\uC804\uBD81\uC740\uD589',
  '0039': '\uACBD\uB0A8\uC740\uD589',
  '0045': '\uC0C8\uB9C8\uC744\uAE08\uACE0',
  '0071': '\uC6B0\uCCB4\uAD6D',
  '0088': '\uC2E0\uD55C\uC740\uD589',
  '0089': '\uCF00\uC774\uB465\uD06C',
  '0090': '\uCE74\uCE74\uC624\uB465\uD06C',
  '0111': '\uC9C0\uC5ED\uB18D\uCD95\uD611',
  '0209': '\uC720\uC548\uD0C0\uC99D\uAD8C',
  '0218': 'KB\uC99D\uAD8C',
  '0225': 'IBK\uD22C\uC790\uC99D\uAD8C',
  '0238': '\uBBF8\uB798\uC5D0\uC14B\uC99D\uAD8C',
  '0240': '\uC0BC\uC131\uC99D\uAD8C',
  '0243': '\uD55C\uAD6D\uD22C\uC790\uC99D\uAD8C',
  '0247': 'NH\uD22C\uC790\uC99D\uAD8C',
  '0261': '\uAD50\uBCF4\uC99D\uAD8C',
  '0264': '\uD0A4\uC6C0\uC99D\uAD8C',
  '0266': 'SK\uC99D\uAD8C',
  '0267': '\uB300\uC2E0\uC99D\uAD8C',
  '0269': '\uD55C\uD654\uD22C\uC790\uC99D\uAD8C',
  '0270': '\uD558\uB098\uAE08\uC735\uD22C\uC790',
  '0278': '\uC2E0\uD55C\uAE08\uC735\uD22C\uC790',
  '0279': 'DB\uAE08\uC735\uD22C\uC790',
  '0280': '\uC720\uC9C4\uD22C\uC790\uC99D\uAD8C',
  '0287': '\uBA54\uB9AC\uCE20\uC99D\uAD8C',
}

// Backend/CODEF uses four-digit organization codes, while account responses can
// also contain the three-digit financial institution code (`bankCode`). Keep the
// conversion explicit because local agricultural cooperatives are `012` in the
// common code system but `0111` in the CODEF organization code system.
export const bankOrganizationCodeByBankCode = Object.freeze({
  '003': '0003',
  '004': '0004',
  '007': '0007',
  '011': '0011',
  '012': '0111',
  '020': '0020',
  '023': '0023',
  '031': '0031',
  '032': '0032',
  '034': '0034',
  '035': '0035',
  '037': '0037',
  '039': '0039',
  '045': '0045',
  '071': '0071',
  '088': '0088',
  '089': '0089',
  '090': '0090',
})

export function normalizeOrganizationCode(code) {
  const value = String(code || '').trim()
  return /^\d{1,4}$/.test(value) ? value.padStart(4, '0') : value
}

export function normalizeBankCode(code) {
  const value = String(code || '').trim()
  return /^\d{1,3}$/.test(value) ? value.padStart(3, '0') : value
}

export function organizationCodeFromBankCode(bankCode) {
  const normalizedBankCode = normalizeBankCode(bankCode)
  return bankOrganizationCodeByBankCode[normalizedBankCode] || ''
}

export function normalizeInstitutionName(name) {
  return String(name || '')
    .replace(/(주식회사|은행|뱅크|증권|금융투자|투자증권|\s)/g, '')
    .toLowerCase()
}

export function accountOrganizationCode(account) {
  const nestedCode =
    account?.organization?.code || account?.institution?.code || account?.financialInstitution?.code

  const organizationCode = normalizeOrganizationCode(
    account?.organizationCode ||
      account?.institutionCode ||
      account?.financialInstitutionCode ||
      account?.codefOrganizationCode ||
      account?.orgCode ||
      account?.orgCd ||
      nestedCode,
  )

  if (organizationCode) return organizationCode

  return organizationCodeFromBankCode(account?.bankCode)
}

export function accountInstitutionName(account) {
  const institutionName =
    account?.institutionName ||
    account?.organizationName ||
    account?.bankName ||
    account?.financialInstitutionName ||
    account?.brokerName ||
    account?.securitiesName ||
    account?.institution?.name ||
    account?.organization?.name ||
    account?.financialInstitution?.name
  const organizationCode =
    accountOrganizationCode(account) || normalizeOrganizationCode(institutionName)

  if (institutionNamesByCode[organizationCode]) return institutionNamesByCode[organizationCode]

  return (
    account?.institutionName ||
    account?.organizationName ||
    account?.bankName ||
    account?.financialInstitutionName ||
    account?.brokerName ||
    account?.securitiesName ||
    account?.institution?.name ||
    account?.organization?.name ||
    account?.financialInstitution?.name ||
    '연결 은행'
  )
}

export function accountInstitutionKey(account) {
  return (
    accountOrganizationCode(account) || normalizeInstitutionName(accountInstitutionName(account))
  )
}

export function accountConnectionStatus(account) {
  const status = String(
    account?.accountStatus || account?.connectionStatus || account?.status || '',
  ).toLowerCase()

  if (['disconnected', 'inactive'].includes(status) || account?.isActive === false) {
    return 'disconnected'
  }

  return 'active'
}

export function accountConnectionStatusLabel(account) {
  return accountConnectionStatus(account) === 'disconnected' ? '연동 해제됨' : '연동됨'
}

export function matchesAccountInstitution(account, institution) {
  const selectedCode = normalizeOrganizationCode(institution?.organizationCode)
  const matchedCode = accountOrganizationCode(account)

  if (selectedCode && matchedCode) return selectedCode === matchedCode

  const accountName = normalizeInstitutionName(accountInstitutionName(account))
  const candidateNames = [institution?.displayName, ...(institutionAliases[selectedCode] || [])]
    .map(normalizeInstitutionName)
    .filter(Boolean)

  return candidateNames.some(
    (candidateName) =>
      accountName === candidateName ||
      accountName.includes(candidateName) ||
      candidateName.includes(accountName),
  )
}
