import {defineArrayMember, defineField, defineType} from 'sanity'

export const recordingOrder = defineType({
  name: 'recordingOrder',
  title: 'Recording order',
  type: 'document',
  fields: [
    defineField({
      name: 'ids',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      validation: (rule) => rule.unique(),
    }),
  ],
})
