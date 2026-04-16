import React from 'react'
import { DefaultTemplate } from '@payloadcms/next/templates'
import { getVisibleEntities } from '@payloadcms/ui/shared'
import type { AdminViewServerProps } from 'payload'
import ApiEndpointsViewClient from './ApiEndpointsViewClient'

const ApiEndpointsView: React.FC<AdminViewServerProps> = (props) => {
  const { initPageResult } = props
  const visibleEntities = getVisibleEntities({ req: initPageResult.req })

  return (
    <DefaultTemplate
      i18n={props.i18n}
      locale={initPageResult.locale}
      params={props.params}
      payload={props.payload}
      permissions={initPageResult.permissions}
      searchParams={props.searchParams}
      user={initPageResult.req.user ?? undefined}
      visibleEntities={visibleEntities}
    >
      <ApiEndpointsViewClient />
    </DefaultTemplate>
  )
}

export default ApiEndpointsView
