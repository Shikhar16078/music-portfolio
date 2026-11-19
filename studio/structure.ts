import type {StructureResolver} from 'sanity/structure'
import {BookIcon} from '@sanity/icons/Book'
import {CogIcon} from '@sanity/icons/Cog'
import {RecordingOrder} from './components/RecordingOrder'
import {PlayIcon} from '@sanity/icons/Play'

/** Sidebar: Recordings and Journey sorted by number, Site text as a single page. */
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Recordings')
        .icon(PlayIcon)
        .child(
          S.documentTypeList('recording')
            .title('Recordings')
            .defaultOrdering([{field: 'title', direction: 'asc'}]),
        ),
      S.listItem()
        .id('recording-order')
        .title('Recording order')
        .icon(PlayIcon)
        .child(
          S.component()
            .id('recording-order-view')
            .title('Recording order')
            .component(RecordingOrder),
        ),
      S.listItem()
        .title('Journey chapters')
        .icon(BookIcon)
        .child(
          S.documentTypeList('chapter')
            .title('Journey chapters')
            .defaultOrdering([{field: 'number', direction: 'asc'}]),
        ),
      S.divider(),
      S.listItem()
        .title('Site text & links')
        .icon(CogIcon)
        .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
    ])
