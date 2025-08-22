import { Server } from 'socket.io'

import Articles from '../../../models/Articles/Articles'

export async function updateDelayedPublish(io: Server) {
  const now = new Date().valueOf()

  try {
    const ids = await Articles.find(
      {
        publishAt: {
          $exists: true,
          $ne: null,
          $lt: now,
        },
      },
      { _id: 1 }
    )

    const query = await Articles.updateMany(
      {
        _id: { $in: ids },
      },
      {
        $set: { isPublished: true, updatedAt: now },
        $unset: { publishAt: '' },
      }
    )

    console.log(`Cron: Articles updated : ${query.modifiedCount}`)

    // send ids using `io`
  } catch (error) {
    console.log(`Cron: Error updating Articles: ${(error as any).toSting()}`)
  }
}
