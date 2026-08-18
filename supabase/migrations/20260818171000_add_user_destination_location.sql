alter table public.users
  add column if not exists destination_latitude double precision,
  add column if not exists destination_longitude double precision,
  add column if not exists location_accuracy double precision,
  add column if not exists location_captured_at timestamptz;

alter table public.users
  add constraint users_destination_latitude_range
    check (destination_latitude is null or destination_latitude between -90 and 90),
  add constraint users_destination_longitude_range
    check (destination_longitude is null or destination_longitude between -180 and 180),
  add constraint users_location_accuracy_nonnegative
    check (location_accuracy is null or location_accuracy >= 0);
