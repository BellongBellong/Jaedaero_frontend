const HTML_TAG_PATTERN = /<[^>]*>/g

function collectTextValues(data) {
  if (typeof data === 'string') return [data]
  if (!data || typeof data !== 'object') return []

  const values = ['code', 'errorCode', 'error', 'message', 'detail', 'title', 'reason']
    .map((key) => data[key])
    .filter((value) => typeof value === 'string')

  if (Array.isArray(data.errors)) {
    values.push(
      ...data.errors.flatMap((item) => {
        if (typeof item === 'string') return [item]
        if (!item || typeof item !== 'object') return []
        return [item.code, item.message, item.defaultMessage].filter(
          (value) => typeof value === 'string',
        )
      }),
    )
  }

  if (data.errors && typeof data.errors === 'object' && !Array.isArray(data.errors)) {
    values.push(
      ...Object.values(data.errors).flatMap((value) => {
        if (typeof value === 'string') return [value]
        if (Array.isArray(value)) return value.filter((item) => typeof item === 'string')
        return []
      }),
    )
  }

  return values
}

function cleanMessage(value) {
  if (typeof value !== 'string') return ''

  const message = value.replace(HTML_TAG_PATTERN, '').trim()
  return message && message.length <= 200 ? message : ''
}

export function getApiErrorMessage(
  error,
  fallback = '요청을 처리하지 못했어요.',
  context = 'general',
) {
  const data = error?.response?.data
  const values = collectTextValues(data)
    .map((value) => cleanMessage(value))
    .filter(Boolean)
  const searchableText = values.join(' ').toLowerCase()
  const status = error?.response?.status
  const hasPasswordError = /password|passwd|passcode|비밀번호|pw[_ -]?invalid|invalid[_ -]?pw/.test(
    searchableText,
  )
  const hasLoginIdError =
    /login[_ -]?(id|name)|username|user[_ -]?id|아이디|로그인[_ ]?정보|id[_ -]?invalid/.test(
      searchableText,
    )
  const hasCredentialError =
    /credential|authentication|auth[_ -]?fail|login[_ -]?fail|invalid[_ -]?login\b|codef/.test(
      searchableText,
    )

  if (context === 'account' && ((hasPasswordError && hasLoginIdError) || hasCredentialError)) {
    return '아이디 또는 비밀번호가 올바르지 않습니다. 금융기관 인터넷뱅킹 정보를 확인해 주세요.'
  }

  if (hasPasswordError) {
    return '비밀번호가 올바르지 않습니다. 입력한 비밀번호를 확인해 주세요.'
  }

  if (hasLoginIdError) {
    return '아이디가 올바르지 않습니다. 입력한 아이디를 확인해 주세요.'
  }

  if (
    context === 'military' &&
    /enlist|enlistment|입대일|입대 날짜|입대일자/.test(searchableText)
  ) {
    return '입대일이 올바르지 않습니다. 실제 입대한 날짜를 확인해 주세요.'
  }

  if (/birth|birthday|생년월일/.test(searchableText)) {
    return '생년월일이 올바르지 않아요. 주민등록번호 앞 6자리를 확인해 주세요.'
  }

  if (/duplicate|already[_ -]?exists|중복|이미 사용/.test(searchableText)) {
    if (context === 'nickname') return '이미 사용 중인 닉네임이에요. 다른 닉네임을 입력해 주세요.'
    if (context === 'account') return '이미 연결된 금융기관이에요. 다른 금융기관을 선택해 주세요.'
    return '이미 처리된 정보예요. 입력 내용을 확인해 주세요.'
  }

  const message = values.find((value) => !/^(error|bad request|request failed)$/i.test(value))
  if (message && !message.includes('<!doctype')) return message

  if (!error?.response) {
    if (context === 'account') {
      return '금융기관 서버에 연결하지 못했어요. 인터넷 연결을 확인하고 다시 시도해 주세요.'
    }
    return '네트워크가 불안정해요. 연결 상태를 확인하고 다시 시도해 주세요.'
  }
  if (status === 400) {
    if (context === 'account') {
      return '입력한 금융기관 정보를 확인해 주세요. 인터넷뱅킹 아이디와 비밀번호를 입력해야 해요.'
    }
    if (context === 'nickname')
      return '닉네임 형식을 확인해 주세요. 한글·영문·숫자 2~12자로 입력해 주세요.'
    if (context === 'military') return '군종, 계급, 입대일을 확인해 주세요.'
    if (context === 'preference') return '투자 성향과 목표 금액을 확인해 주세요.'
    if (context === 'terms') return '필수 약관에 모두 동의했는지 확인해 주세요.'
    return '입력 정보를 확인해 주세요.'
  }
  if (status === 401 && context === 'account') {
    return '아이디 또는 비밀번호가 올바르지 않습니다. 금융기관 인터넷뱅킹 정보를 확인해 주세요.'
  }
  if (status === 401) return '로그인 정보가 만료되었어요. 다시 로그인해 주세요.'
  if (status === 403 && context === 'account') {
    return '금융기관 인증이 거절됐어요. 인터넷뱅킹 로그인 정보를 확인해 주세요.'
  }
  if (status === 404 && context === 'account')
    return '선택한 금융기관을 찾지 못했어요. 다시 선택해 주세요.'
  if (status === 409 && context === 'account') return '이미 연결된 금융기관이에요.'
  if (status === 408 || error?.code === 'ECONNABORTED') {
    return '금융기관 응답이 지연되고 있어요. 잠시 후 다시 시도해 주세요.'
  }
  if (status >= 500) return '서버에 문제가 발생했어요. 잠시 후 다시 시도해 주세요.'

  return fallback
}
