import { useEffect, useState } from 'react'
import { fetchDashboard, type DashboardData } from '../lib/kopis'

interface State {
  data: DashboardData | null
  loading: boolean
  error: string | null
}

// 30분마다 자동 갱신. 최초 1회만 로딩 화면을 보여주고, 이후 주기 갱신은 백그라운드에서만 처리.
const REFRESH_MS = 30 * 60 * 1000 // 30분

// 외부 스토어(getSnapshot이 매번 새 객체)에는 useSyncExternalStore 대신 useState+useEffect 사용.
export function useDashboardData(): State {
  const [state, setState] = useState<State>({ data: null, loading: true, error: null })

  useEffect(() => {
    let active = true
    let controller = new AbortController()

    // background=true 면 로딩/에러 화면을 띄우지 않고 기존 데이터를 유지한 채 조용히 갱신
    const load = (background: boolean) => {
      controller.abort()
      controller = new AbortController()
      if (!background) setState((s) => ({ ...s, loading: true, error: null }))
      fetchDashboard(controller.signal)
        .then((data) => {
          if (active) setState({ data, loading: false, error: null })
        })
        .catch((err) => {
          if (!active || err?.name === 'AbortError') return
          // 백그라운드 갱신 실패 시엔 직전 데이터를 그대로 유지(화면 깜빡임/에러 표시 없음)
          if (!background) setState({ data: null, loading: false, error: String(err?.message || err) })
        })
    }

    load(false) // 최초 1회: 로딩 화면 표시
    const id = setInterval(() => load(true), REFRESH_MS) // 30분마다 백그라운드 갱신

    return () => {
      active = false
      controller.abort()
      clearInterval(id)
    }
  }, [])

  return state
}
