import {useEffect, useMemo, useState, type DragEvent} from 'react'
import {Box, Button, Card, Flex, Text} from '@sanity/ui'
import {useClient} from 'sanity'
import {applyRecordingOrder, publishedRecordings, recordingOrderId} from '../lib/recordingOrder'

type Recording = {_id: string; title: string}
type OrderDocument = {_rev: string; ids?: string[]}
type Snapshot = {recordings: Recording[]; order: OrderDocument | null}

const local = (import.meta as ImportMeta & {env: {DEV: boolean}}).env.DEV
const previewStorageKey = 'music-portfolio-recording-order-preview'
const query = `{
  "recordings": ${publishedRecordings}{_id, title},
  "order": *[_id == "${recordingOrderId}"][0]{_rev, ids}
}`

export function RecordingOrder() {
  const baseClient = useClient({apiVersion: '2025-01-01'})
  const client = useMemo(
    () => baseClient.withConfig({useCdn: false, perspective: 'published'}),
    [baseClient],
  )
  const [snapshot, setSnapshot] = useState<Snapshot>()
  const [ordered, setOrdered] = useState<Recording[]>([])
  const [source, setSource] = useState<string>()
  const [target, setTarget] = useState<string>()
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  const [reload, setReload] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    const {signal} = controller
    client.fetch<Snapshot>(query, {}, {signal}).then(
      (data) => {
        if (signal.aborted) return
        const preview = local ? window.localStorage.getItem(previewStorageKey) : null
        const ids = preview ? preview.split(',') : (data.order?.ids ?? [])
        setSnapshot(data)
        setMessage('')
        setOrdered(applyRecordingOrder(data.recordings, ids))
        setLoading(false)
      },
      () => {
        if (signal.aborted) return
        setMessage('Could not load the recording order. Try reloading the list.')
        setLoading(false)
      },
    )
    return () => controller.abort()
  }, [client, reload])

  function reorder(from: string, to: string) {
    setOrdered((current) => {
      const fromIndex = current.findIndex((recording) => recording._id === from)
      const toIndex = current.findIndex((recording) => recording._id === to)
      if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return current
      const next = [...current]
      const [recording] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, recording)
      return next
    })
    setSource(undefined)
    setTarget(undefined)
  }

  function drop(event: DragEvent, id: string) {
    event.preventDefault()
    if (source) reorder(source, id)
  }

  async function save() {
    if (!snapshot) return
    const ids = ordered.map((recording) => recording._id)
    setSaving(true)
    setMessage('')
    try {
      if (local) {
        window.localStorage.setItem(previewStorageKey, ids.join(','))
        setMessage('Local preview order saved.')
        return
      }
      if (snapshot.order) {
        const order = await client
          .patch(recordingOrderId)
          .ifRevisionId(snapshot.order._rev)
          .set({ids})
          .commit<OrderDocument>()
        setSnapshot({...snapshot, order})
      } else {
        const order = await client.create({_id: recordingOrderId, _type: 'recordingOrder', ids})
        setSnapshot({...snapshot, order})
      }
      setMessage('Recording order saved.')
    } catch {
      setMessage('Could not save the order. Reload the list before trying again.')
    } finally {
      setSaving(false)
    }
  }

  const previewUrl = new URL('http://localhost:5173/#listen')
  previewUrl.searchParams.set('tapeOrder', ordered.map((recording) => recording._id).join(','))

  return (
    <Box padding={4}>
      <Flex direction="column" gap={4}>
        <Text size={1} muted>
          Drag recordings or use the move buttons. Tape numbers follow the list position.
          {local && ' This local preview only changes the order in your browser.'}
        </Text>
        <Flex gap={2} wrap="wrap">
          <Button
            text={local ? 'Save local order' : 'Save recording order'}
            tone="primary"
            onClick={() => void save()}
            disabled={loading || saving || !ordered.length}
          />
          <Button
            text="Reload recordings"
            mode="ghost"
            onClick={() => {
              setLoading(true)
              setReload((value) => value + 1)
            }}
            disabled={loading || saving}
          />
          {local && Boolean(ordered.length) && (
            <Button
              as="a"
              href={previewUrl.toString()}
              target="_blank"
              rel="noreferrer"
              text="Preview on website"
              mode="ghost"
            />
          )}
        </Flex>
        {message && (
          <Text size={1} role="status">
            {message}
          </Text>
        )}
        {loading && <Text size={1}>Loading published recordings…</Text>}
        {!loading && snapshot && !ordered.length && (
          <Text size={1}>No published recordings with audio yet.</Text>
        )}
        <Flex as="ol" direction="column" gap={2} style={{listStyle: 'none', margin: 0, padding: 0}}>
          {ordered.map((recording, index) => (
            <Card
              as="li"
              key={recording._id}
              border
              radius={2}
              padding={2}
              tone={target === recording._id ? 'primary' : 'default'}
              draggable={!saving}
              onDragStart={(event) => {
                setSource(recording._id)
                event.dataTransfer.setData('text/plain', recording._id)
                event.dataTransfer.effectAllowed = 'move'
              }}
              onDragOver={(event) => {
                if (!source) return
                event.preventDefault()
                event.dataTransfer.dropEffect = 'move'
                setTarget(recording._id)
              }}
              onDrop={(event) => drop(event, recording._id)}
              onDragEnd={() => {
                setSource(undefined)
                setTarget(undefined)
              }}
            >
              <Flex align="center" gap={3} paddingLeft={2}>
                <Text size={1} muted>
                  Tape {String(index + 1).padStart(2, '0')}
                </Text>
                <Box flex={1}>
                  <Text size={1} weight="medium">
                    {recording.title}
                  </Text>
                </Box>
                <Button
                  mode="ghost"
                  text="↑"
                  aria-label={`Move ${recording.title} up`}
                  disabled={saving || index === 0}
                  onClick={() => reorder(recording._id, ordered[index - 1]._id)}
                />
                <Button
                  mode="ghost"
                  text="↓"
                  aria-label={`Move ${recording.title} down`}
                  disabled={saving || index === ordered.length - 1}
                  onClick={() => reorder(recording._id, ordered[index + 1]._id)}
                />
              </Flex>
            </Card>
          ))}
        </Flex>
      </Flex>
    </Box>
  )
}
