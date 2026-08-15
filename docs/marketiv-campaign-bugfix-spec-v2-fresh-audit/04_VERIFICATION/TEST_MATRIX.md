# Test Matrix

## Config
- missing Admin Appwrite env → fail closed;
- explicit staging → staging;
- explicit production → production;
- missing Admin origin → no silent staging production fallback.

## Admin auth
| State | Result |
|---|---|
| anonymous | no protected data |
| UMKM | deny |
| Creator | deny |
| suspended Admin | deny |
| active Admin | allow |
| Appwrite error | fail closed |

## Admin reads
success, empty, 401, 403, 500, malformed DTO.

## Admin review
approve/reject success, 401, 403, 409, 500, malformed response, no direct DB write, no local success on failure, authoritative refresh.

## Claim
single claim, no client counter increment, non-expired duplicate blocked, expired previous allowed, slot concurrency.

## Unclaim
owner success, wrong owner, submitted denial, missing claim, counter failure no false success, retry behavior.

## Login
correct UMKM/Creator, both mismatches, Admin, same-role next, cross-role next, arbitrary external next.

## Creator detail
claimed/no proof visible; submitted/terminal hidden; cancel/success/failure/double-click.

## E2E
UMKM → Creator → Admin → backend outcome; rejection; refresh/deep-link; UMKM remains observer.
