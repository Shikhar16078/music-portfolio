import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { PlayerContext, type Player, type RepeatMode } from '@/lib/player-context'
import { kindLabel, tapeLabel, trackTitle } from '@/lib/format'
import type { Recording } from '@/lib/sanity'

function shuffled<T>(items: T[]): T[] {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Ignore the Space shortcut while the user is typing or on a control that uses Space itself. */
function isInteractive(target: EventTarget | null) {
  return (
    target instanceof Element &&
    Boolean(
      target.closest('input, textarea, select, button, a, [role="slider"], [contenteditable]'),
    )
  )
}

/** One shared <audio> element for the whole site, plus the play queue. */
export function PlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const graphRef = useRef<{ ctx: AudioContext; analyser: AnalyserNode } | null>(null)
  const lastVolume = useRef(0.8)
  const onEnded = useRef<() => void>(() => {})

  const [list, setList] = useState<Recording[]>([])
  const [order, setOrder] = useState<string[]>([])
  const [currentId, setCurrentId] = useState<string>()
  const [playing, setPlaying] = useState(false)
  const [buffering, setBuffering] = useState(false)
  const [error, setError] = useState(false)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [buffered, setBuffered] = useState(0)
  const [volume, setVolumeState] = useState(0.8)
  const [shuffle, setShuffle] = useState(false)
  const [repeat, setRepeat] = useState<RepeatMode>('off')
  const [expanded, setExpanded] = useState(false)

  const getAudio = useCallback(() => {
    if (!audioRef.current) {
      const audio = new Audio()
      // Needed for the visualizer to read the audio (Sanity's CDN allows it)
      audio.crossOrigin = 'anonymous'
      audio.preload = 'metadata'
      audio.volume = 0.8
      audioRef.current = audio
    }
    return audioRef.current
  }, [])

  const current = list.find((r) => r._id === currentId)

  const load = useCallback(
    (track: Recording) => {
      const audio = getAudio()
      setCurrentId(track._id)
      setError(false)
      setTime(0)
      setDuration(0)
      setBuffered(0)
      audio.src = track.audioUrl
      // Real load failures surface through the `error` event
      audio.play().catch(() => {})
    },
    [getAudio],
  )

  const step = useCallback(
    (dir: 1 | -1, auto = false) => {
      if (!currentId || !order.length) return
      const audio = getAudio()
      let j = order.indexOf(currentId) + dir
      if (j >= order.length) {
        if (repeat !== 'all') {
          if (auto) {
            audio.pause()
            audio.currentTime = 0
          }
          return
        }
        j = 0
      }
      if (j < 0) {
        if (repeat !== 'all') {
          audio.currentTime = 0
          return
        }
        j = order.length - 1
      }
      const track = list.find((r) => r._id === order[j])
      if (track) load(track)
    },
    [currentId, order, repeat, list, load, getAudio],
  )

  useEffect(() => {
    onEnded.current = () => {
      if (repeat === 'one') {
        const audio = getAudio()
        audio.currentTime = 0
        audio.play().catch(() => {})
      } else step(1, true)
    }
  }, [repeat, step, getAudio])

  // Mirror the <audio> element's state into React
  useEffect(() => {
    const audio = getAudio()
    const on = {
      play: () => {
        setPlaying(true)
        void graphRef.current?.ctx.resume()
      },
      pause: () => setPlaying(false),
      waiting: () => setBuffering(true),
      playing: () => setBuffering(false),
      canplay: () => setBuffering(false),
      timeupdate: () => setTime(audio.currentTime),
      durationchange: () => setDuration(Number.isFinite(audio.duration) ? audio.duration : 0),
      progress: () => {
        const b = audio.buffered
        if (b.length) setBuffered(b.end(b.length - 1))
      },
      ended: () => onEnded.current(),
      error: () => {
        if (!audio.getAttribute('src')) return
        setError(true)
        setPlaying(false)
        setBuffering(false)
      },
    }
    const entries = Object.entries(on) as [keyof HTMLMediaElementEventMap, () => void][]
    entries.forEach(([event, fn]) => audio.addEventListener(event, fn))
    return () => entries.forEach(([event, fn]) => audio.removeEventListener(event, fn))
  }, [getAudio])

  const playTrack = useCallback(
    (track: Recording, queue?: Recording[]) => {
      const audio = getAudio()
      if (track._id === currentId && !error) {
        if (audio.paused) audio.play().catch(() => {})
        else audio.pause()
        return
      }
      const source = queue ?? list
      const ids = source.map((r) => r._id)
      setList(source)
      setOrder(shuffle ? [track._id, ...shuffled(ids.filter((id) => id !== track._id))] : ids)
      load(track)
    },
    [currentId, error, list, shuffle, load, getAudio],
  )

  const shufflePlay = useCallback(
    (queue: Recording[]) => {
      if (!queue.length) return
      const ids = shuffled(queue.map((r) => r._id))
      setShuffle(true)
      setList(queue)
      setOrder(ids)
      load(queue.find((r) => r._id === ids[0])!)
    },
    [load],
  )

  const toggleShuffle = useCallback(() => {
    const on = !shuffle
    const ids = list.map((r) => r._id)
    setShuffle(on)
    if (!on) setOrder(ids)
    else if (currentId) setOrder([currentId, ...shuffled(ids.filter((id) => id !== currentId))])
    else setOrder(shuffled(ids))
  }, [shuffle, list, currentId])

  const toggle = useCallback(() => {
    const audio = getAudio()
    if (!currentId) return
    if (audio.paused) audio.play().catch(() => {})
    else audio.pause()
  }, [currentId, getAudio])

  const setVolume = useCallback(
    (v: number) => {
      const audio = getAudio()
      audio.volume = v
      if (v > 0) lastVolume.current = v
      setVolumeState(v)
    },
    [getAudio],
  )

  const getAnalyser = useCallback(() => {
    if (!graphRef.current) {
      try {
        const ctx = new AudioContext()
        const source = ctx.createMediaElementSource(getAudio())
        const analyser = ctx.createAnalyser()
        analyser.fftSize = 128
        analyser.smoothingTimeConstant = 0.82
        source.connect(analyser)
        analyser.connect(ctx.destination)
        graphRef.current = { ctx, analyser }
      } catch {
        return null
      }
    }
    void graphRef.current.ctx.resume()
    return graphRef.current.analyser
  }, [getAudio])

  // Space toggles play/pause anywhere on the page
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || !currentId || isInteractive(e.target)) return
      e.preventDefault()
      toggle()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [currentId, toggle])

  // Lock-screen / headphone controls
  useEffect(() => {
    if (!current || !('mediaSession' in navigator)) return
    navigator.mediaSession.metadata = new MediaMetadata({
      title: trackTitle(current),
      artist: 'Shikhar Kumar',
      album: `Practice tapes · ${tapeLabel(current)} · ${kindLabel(current)}`,
    })
    const handlers: [MediaSessionAction, MediaSessionActionHandler][] = [
      [
        'play',
        () =>
          getAudio()
            .play()
            .catch(() => {}),
      ],
      ['pause', () => getAudio().pause()],
      ['nexttrack', () => step(1)],
      ['previoustrack', () => step(-1)],
      ['seekto', (d) => d.seekTime !== undefined && (getAudio().currentTime = d.seekTime)],
    ]
    handlers.forEach(([action, fn]) => {
      try {
        navigator.mediaSession.setActionHandler(action, fn)
      } catch {
        // action not supported by this browser
      }
    })
  }, [current, step, getAudio])

  const upNext = useMemo(() => {
    const i = currentId ? order.indexOf(currentId) : -1
    return order
      .slice(i + 1)
      .map((id) => list.find((r) => r._id === id))
      .filter((r): r is Recording => Boolean(r))
  }, [order, currentId, list])

  const value: Player = {
    current,
    upNext,
    playing,
    buffering,
    error,
    time,
    duration,
    buffered,
    volume,
    shuffle,
    repeat,
    expanded,
    playTrack,
    shufflePlay,
    toggle,
    pause: () => getAudio().pause(),
    next: () => step(1),
    prev: () => {
      const audio = getAudio()
      if (audio.currentTime > 3) audio.currentTime = 0
      else step(-1)
    },
    seek: (seconds) => {
      getAudio().currentTime = seconds
      setTime(seconds)
    },
    setVolume,
    toggleMute: () => setVolume(volume > 0 ? 0 : lastVolume.current),
    toggleShuffle,
    cycleRepeat: () => setRepeat((r) => (r === 'off' ? 'all' : r === 'all' ? 'one' : 'off')),
    retry: () => {
      if (current) load(current)
    },
    setExpanded,
    getAnalyser,
  }

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
}
