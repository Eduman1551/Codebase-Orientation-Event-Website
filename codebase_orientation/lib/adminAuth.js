import { cookies } from 'next/headers'

export async function verifyAdmin(req, body = null) {
  const expectedPasskey = process.env.ADMIN_PASSKEY

  // Check headers (Works for standard Request / NextRequest)
  if (req && req.headers) {
    const getHeader = name => {
      if (typeof req.headers.get === 'function') {
        return req.headers.get(name)
      }
      return req.headers[name] || req.headers[name.toLowerCase()]
    }

    const headerKey = getHeader('x-admin-passkey') || getHeader('x-passkey')
    if (headerKey && headerKey === expectedPasskey) {
      return true
    }

    const authHeader = getHeader('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7).trim()
      if (token === expectedPasskey) {
        return true
      }
    }
  }

  // Check cookies
  try {
    const cookieStore = await cookies()
    const adminPasskey = cookieStore.get('admin_passkey')?.value
    if (adminPasskey && adminPasskey === expectedPasskey) {
      return true
    }
    const adminSession = cookieStore.get('admin_session')?.value
    if (adminSession) {
      return true
    }
  } catch {
    // In case cookies() context is not available (e.g. mock test)
    if (req && req.cookies) {
      const cookieVal =
        typeof req.cookies.get === 'function'
          ? req.cookies.get('admin_passkey')?.value
          : req.cookies.admin_passkey
      if (cookieVal === expectedPasskey) {
        return true
      }
    }
  }

  // Check body payload
  if (body && body.passkey && body.passkey === expectedPasskey) {
    return true
  }

  return false
}
