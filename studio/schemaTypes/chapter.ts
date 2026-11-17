import {defineArrayMember, defineField, defineType} from 'sanity'
import {BookIcon} from '@sanity/icons/Book'

/** One chapter of the Journey section. */
export const chapter = defineType({
  name: 'chapter',
  title: 'Journey chapter',
  type: 'document',
  icon: BookIcon,
  fields: [
    defineField({
      name: 'number',
      title: 'Chapter number',
      type: 'number',
      validation: (rule) => rule.required().integer().min(1),
    }),
    defineField({
      name: 'title',
      type: 'string',
      description: 'e.g. "Six strings, sore fingers"',
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: 'instrument',
      title: 'Tag',
      type: 'string',
      options: {
        list: [
          {title: 'Piano', value: 'piano'},
          {title: 'Guitar', value: 'guitar'},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'piano',
    }),
    defineField({
      name: 'body',
      title: 'Story',
      type: 'array',
      description: 'Use italics for emphasis. Keep it to a few short paragraphs.',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [{title: 'Paragraph', value: 'normal'}],
          lists: [],
          marks: {
            decorators: [{title: 'Italic', value: 'em'}],
            annotations: [],
          },
        }),
      ],
      validation: (rule) => rule.required(),
    }),
  ],
  orderings: [
    {
      title: 'Chapter number',
      name: 'numberAsc',
      by: [{field: 'number', direction: 'asc'}],
    },
  ],
  preview: {
    select: {title: 'title', number: 'number', instrument: 'instrument'},
    prepare({title, number, instrument}) {
      return {
        title,
        subtitle: [number ? `Ch. ${String(number).padStart(2, '0')}` : null, instrument]
          .filter(Boolean)
          .join(' · '),
      }
    },
  },
})
