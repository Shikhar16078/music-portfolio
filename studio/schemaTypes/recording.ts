import {defineField, defineType} from 'sanity'
import {PlayIcon} from '@sanity/icons/Play'

const NOTES = ['C', 'C♯ / D♭', 'D', 'E♭', 'E', 'F', 'F♯ / G♭', 'G', 'A♭', 'A', 'B♭', 'B']
const KEYS = NOTES.flatMap((n) => [`${n} major`, `${n} minor`])

/** One practice tape: the audio file plus everything the Listen section shows. */
export const recording = defineType({
  name: 'recording',
  title: 'Recording',
  type: 'document',
  icon: PlayIcon,
  fields: [
    defineField({
      name: 'audio',
      title: 'Audio file',
      type: 'file',
      description: 'MP3 (or M4A). Length is read automatically by the site.',
      options: {accept: 'audio/*'},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'title',
      type: 'string',
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: 'tapeNumber',
      title: 'Tape number',
      type: 'number',
      description: 'Legacy ordering. Manage tape positions from Recording order.',
      hidden: true,
      readOnly: true,
    }),
    defineField({
      name: 'kind',
      title: 'Type',
      type: 'string',
      options: {
        list: [
          {title: 'Original', value: 'original'},
          {title: 'Cover', value: 'cover'},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'original',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'originalArtist',
      title: 'Original artist',
      type: 'string',
      description: 'Who wrote or first performed it, e.g. "Ludovico Einaudi".',
      hidden: ({parent}) => parent?.kind !== 'cover',
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      description: 'Used by the recording filters on the website.',
      options: {list: ['Hindi', 'English', 'Classical']},
    }),
    defineField({
      name: 'key',
      title: 'Key',
      type: 'string',
      options: {list: KEYS},
    }),
    defineField({
      name: 'note',
      title: 'Note',
      type: 'text',
      rows: 3,
      description: 'A line or two about the recording. Shown on the featured card.',
      validation: (rule) => rule.max(240),
    }),
    defineField({
      name: 'recordedOn',
      title: 'Recorded on',
      type: 'date',
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      description: 'Show this one in the big "now playing" card. Keep only one on.',
      initialValue: false,
    }),
    defineField({
      name: 'cover',
      title: 'Cover image',
      type: 'image',
      description: 'Optional. Without one, the site draws waveform artwork from the audio.',
      options: {hotspot: true},
    }),
  ],
  preview: {
    select: {
      title: 'title',
      kind: 'kind',
      key: 'key',
      featured: 'featured',
      media: 'cover',
    },
    prepare({title, kind, key, featured, media}) {
      const parts = [
        kind === 'cover' ? 'Cover' : 'Original',
        key,
        featured ? '★ Featured' : null,
      ].filter(Boolean)
      return {title, subtitle: parts.join(' · '), media: media ?? PlayIcon}
    },
  },
})
