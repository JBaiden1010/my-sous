# Supabase setup

Project: `my-sous` (ref `kgfijzevpcbcbdrcmszo`, Canada Central).

Tables (all with row-level security):

| Table | Who can read | Who can write |
|---|---|---|
| `user_store` | the owner only | the owner only (profile, kitchen, cookbook/history, shopping) |
| `profiles` | everyone (display name only, no email) | the owner |
| `community_docs` | everyone | the owner; moderators can edit anyone's |
| `post_reports` | moderators | any signed-in cook |
| `admins` | nobody through the API | dashboard / SQL only |

Function `delete_my_account()`: a signed-in person deletes their own account; their data, Community posts and profile are removed with it.

Storage bucket `tutorials`: public to watch, 20 MB video files, each cook uploads only into a folder named after their user id.

Make someone a moderator (after they have signed in once):

```sql
insert into public.admins (user_id)
select id from auth.users where email = 'you@example.com';
```
