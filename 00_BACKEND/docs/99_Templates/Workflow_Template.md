# Workflow: <Nama Workflow>

## Purpose

<1-2 kalimat: hasil akhir alur ini & mengapa lintas-modul.>

## Modules Involved

- [<Modul A>](../02_Modules/<Modul A>/00_Index.md) — <peran di alur ini>.
- [<Modul B>](../02_Modules/<Modul B>/00_Index.md) — <peran>.

## Trigger

<Aksi/event yang memulai alur, mis. user submit form atau event Appwrite.>

## Step-by-step Flow

1. **<Modul>** — <langkah>.
2. **<Modul>** — <langkah>.
3. **Event `<collection.event>`** memicu `<function>`.
<!-- Tandai modul pemilik tiap langkah; sebutkan perubahan status status_lama → status_baru. -->

## Events / Functions

- `<trigger event>` → `<function name>`
- Lihat: [`../02_Modules/<Modul>/90_Events.md`](../02_Modules/<Modul>/90_Events.md).

## Edge Cases

- <kegagalan / kondisi batas / jalur alternatif>.

## Links

- [<Modul A>](../02_Modules/<Modul A>/00_Index.md)
- [<Workflow terkait>](<file>.md)
