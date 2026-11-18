import {defineField, defineType} from 'sanity'
import {CogIcon} from '@sanity/icons/Cog'

/** Single document for page text and links. Edited in place, never duplicated. */
export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site text & links',
  type: 'document',
  icon: CogIcon,
  groups: [
    {name: 'text', title: 'Page text', default: true},
    {name: 'links', title: 'Links'},
    {name: 'photos', title: 'Hero photos'},
  ],
  fields: [
    defineField({
      name: 'heroPhotoDusk',
      title: 'Hero photo · Dusk (dark theme)',
      type: 'image',
      group: 'photos',
      description:
        'Optional. Leave empty to use the built-in photo. After uploading, click "Edit" and drag the circle onto the part that matters (e.g. the keys); every screen size crops around it.',
      options: {hotspot: true},
    }),
    defineField({
      name: 'heroPhotoDaylight',
      title: 'Hero photo · Daylight (light theme)',
      type: 'image',
      group: 'photos',
      description:
        'Optional. Pick a warm photo without large white areas. Use "Edit" to set the focal point.',
      options: {hotspot: true},
    }),
    defineField({
      name: 'heroIntro',
      title: 'Hero intro',
      type: 'text',
      rows: 3,
      group: 'text',
      description: 'The line under "Every song needs a piano version."',
    }),
    defineField({
      name: 'journeyIntro',
      title: 'Journey intro',
      type: 'text',
      rows: 2,
      group: 'text',
    }),
    defineField({
      name: 'videosIntro',
      title: 'Videos intro',
      type: 'string',
      group: 'text',
      initialValue: 'Hand-picked from the channel',
    }),
    defineField({
      name: 'listenIntro',
      title: 'Listen intro',
      type: 'text',
      rows: 2,
      group: 'text',
    }),
    defineField({
      name: 'connectIntro',
      title: 'Connect intro',
      type: 'text',
      rows: 2,
      group: 'text',
    }),
    defineField({
      name: 'youtubeChannelUrl',
      title: 'YouTube channel URL',
      type: 'url',
      group: 'links',
    }),
    defineField({
      name: 'youtubePlaylistId',
      title: 'Featured videos playlist ID',
      type: 'string',
      group: 'links',
      description:
        'The site shows the videos in this YouTube playlist, in its order. The ID is the part after "list=" in the playlist URL.',
    }),
    defineField({
      name: 'instagramUrl',
      title: 'Instagram URL',
      type: 'url',
      group: 'links',
    }),
    defineField({
      name: 'email',
      title: 'Contact email',
      type: 'email',
      group: 'links',
    }),
  ],
  preview: {
    prepare: () => ({title: 'Site text & links'}),
  },
})
