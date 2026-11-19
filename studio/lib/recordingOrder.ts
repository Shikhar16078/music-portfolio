export const recordingOrderId = 'recordingOrder'

/** Legacy tape numbers seed the order. Unnumbered recordings follow the existing list. */
export const publishedRecordings =
  '*[_type == "recording" && defined(audio.asset) && !(_id in path("drafts.**")) && !(_id in path("versions.**"))] | order(coalesce(tapeNumber, 2147483647) asc, _createdAt asc, _id asc)'

export function applyRecordingOrder<T extends {_id: string}>(recordings: T[], ids: string[]) {
  const remaining = new Map(recordings.map((recording) => [recording._id, recording]))
  const ordered: T[] = []
  for (const id of ids) {
    const recording = remaining.get(id)
    if (!recording) continue
    ordered.push(recording)
    remaining.delete(id)
  }
  return ordered.concat([...remaining.values()])
}
