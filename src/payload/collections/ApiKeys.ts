import type { CollectionConfig } from 'payload'

export const ApiKeys: CollectionConfig = {
  slug: 'api-keys',
  labels: {
    singular: 'API Key',
    plural: 'API Keys',
  },
  admin: {
    useAsTitle: 'label',
    defaultColumns: ['label', 'keyPrefix', 'createdBy', 'createdAt'],
    hidden: true,
  },
  access: {
    read: ({ req }) => !!req.user,
    create: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
    update: () => false,
  },
  fields: [
    {
      name: 'label',
      type: 'text',
      required: true,
    },
    {
      name: 'keyHash',
      type: 'text',
      required: true,
      index: true,
      admin: {
        hidden: true,
        readOnly: true,
      },
    },
    {
      name: 'keyPrefix',
      type: 'text',
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        readOnly: true,
      },
    },
  ],
  timestamps: true,
}
