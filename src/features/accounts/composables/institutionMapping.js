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
