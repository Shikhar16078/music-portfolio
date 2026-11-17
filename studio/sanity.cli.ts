import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 't1hamr9e',
    dataset: 'production',
  },
  deployment: {
    appId: 'h6kktz552wjmis4ryqb1yr40',
    /**
     * Enable auto-updates for studios.
     * Learn more at https://www.sanity.io/docs/studio/latest-version-of-sanity#k47faf43faf56
     */
    autoUpdates: true,
  },
})
