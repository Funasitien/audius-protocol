import knex from 'knex'

const trigger = `
CREATE OR REPLACE FUNCTION public.on_verified_activity()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
  owner_is_verified BOOLEAN;
BEGIN
  CASE TG_TABLE_NAME
    WHEN 'tracks' THEN
      BEGIN
        SELECT is_verified into owner_is_verified FROM users WHERE user_id = new.owner_id LIMIT 1;
        IF NOT owner_is_verified AND new.updated_at = new.created_at THEN
          PERFORM pg_notify('verified_activity', json_build_object('entity', TG_TABLE_NAME, 'created_at', new.created_at, 'updated_at', new.updated_at, 'track_id', new.track_id, 'user_id', new.owner_id)::text);
        END IF;
      END;
    WHEN 'users' THEN
      PERFORM pg_notify('verified_activity', json_build_object('old', json_build_object('is_verified', old.is_verified, 'updated_at', old.updated_at, 'user_id', old.user_id), 'entity', TG_TABLE_NAME, 'new', json_build_object('is_verified', new.is_verified, 'updated_at', new.updated_at, 'user_id', new.user_id))::text);
    ELSE
      RETURN NULL;
  END CASE;
  RETURN NULL;
END;
$function$
`

const createTracksTrigger = `
  CREATE TRIGGER tracks_create_trigger
  AFTER INSERT
  ON public.tracks
  FOR EACH ROW
  EXECUTE FUNCTION public.on_verified_activity();
`

const deleteTracksTrigger = `
  CREATE TRIGGER tracks_delete_trigger
  AFTER DELETE
  ON public.tracks
  FOR EACH ROW
  EXECUTE FUNCTION public.on_verified_activity();
`

const deleteUsersTrigger = `
  CREATE TRIGGER users_delete_trigger
  AFTER DELETE
  ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.on_verified_activity();
`

const createUsersTrigger = `
  CREATE TRIGGER users_create_trigger
  AFTER INSERT
  ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.on_verified_activity();
`

const main = async () => {
  const db = knex({
    client: 'pg',
    connection:
      'postgresql://postgres:postgres@localhost:5432/discovery_provider_1'
  })

  await db.raw(trigger)

  await Promise.all([
    db.raw('drop trigger if exists users_delete_trigger on users;'),
    db.raw('drop trigger if exists tracks_delete_trigger on tracks;'),
    db.raw('drop trigger if exists users_create_trigger on users;'),
    db.raw('drop trigger if exists tracks_create_trigger on tracks;')
  ])

  await Promise.all([
    db.raw(createUsersTrigger),
    db.raw(createTracksTrigger),
    db.raw(deleteTracksTrigger),
    db.raw(deleteUsersTrigger)
  ])

  const connection = await db.client.acquireConnection()
  connection.query('LISTEN verified_activity')
  connection.on('notification', (msg) => {
    console.log('got ' + msg.channel + ' payload ' + msg.payload)
  })

  await new Promise(() => {})
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

// for tracks, just send "new" and compare the created_at and the updated_at. if they are the same it's an uploaded track
