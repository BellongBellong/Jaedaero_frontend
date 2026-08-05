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
  '0081': ['하나은행'],
  '0088': ['신한은행'],
  '0089': ['케이뱅크'],
  '0090': ['카카오뱅크'],
  '0092': ['토스뱅크'],
  '0111': ['지역농협'],
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
  '0081': '\uD558\uB098\uC740\uD589',
  '0088': '\uC2E0\uD55C\uC740\uD589',
  '0089': '\uCF00\uC774\uB465\uD06C',
  '0090': '\uCE74\uCE74\uC624\uB465\uD06C',
  '0092': '\uD1A0\uC2A4\uB465\uD06C',
  '0111': '\uC9C0\uC5ED\uB18D\uCD95\uD611',
}

export function normalizeOrganizationCode(code) {
  const value = String(code || '').trim()
  return /^\d{1,4}$/.test(value) ? value.padStart(4, '0') : value
}

export function normalizeInstitutionName(name) {
  return String(name || '')
    .replace(/(주식회사|은행|뱅크|증권|금융투자|투자증권|\s)/g, '')
    .toLowerCase()
}

export function accountOrganizationCode(account) {
  return normalizeOrganizationCode(
    account?.organizationCode ||
      account?.institutionCode ||
      account?.financialInstitutionCode ||
      account?.bankCode,
  )
}

export function accountInstitutionName(account) {
  const institutionName =
    account?.institutionName ||
    account?.organizationName ||
    account?.bankName ||
    account?.financialInstitutionName
  const organizationCode =
    accountOrganizationCode(account) || normalizeOrganizationCode(institutionName)

  if (institutionNamesByCode[organizationCode]) return institutionNamesByCode[organizationCode]

  return (
    account?.institutionName ||
    account?.organizationName ||
    account?.bankName ||
    account?.financialInstitutionName ||
    '연결 은행'
  )
}

export function accountInstitutionKey(account) {
  return (
    accountOrganizationCode(account) || normalizeInstitutionName(accountInstitutionName(account))
  )
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
