# Test Matrix

| ID | Initial state | Action | Expected Main | Expected Admin |
|---|---|---|---|---|
| T01 | both logged out | Main email/password login | logged in | logged out |
| T02 | Main logged in | Admin valid login | stays logged in | logged in |
| T03 | Admin logged in | Main valid login | logged in | stays logged in |
| T04 | both logged in | refresh Main | stays logged in | unchanged |
| T05 | both logged in | refresh Admin | unchanged | stays logged in |
| T06 | both logged in | Main logout | logged out | stays logged in |
| T07 | both logged in | Admin logout | stays logged in | logged out |
| T08 | Main logged in | Admin wrong password | stays logged in | rejected |
| T09 | Main logged in | Admin login with UMKM/Creator account | stays logged in | forbidden |
| T10 | both logged out | Admin suspended account | logged out | rejected |
| T11 | both logged in | close/reopen tabs | session according to Appwrite lifetime | session according to Appwrite lifetime |
| T12 | Google OAuth enabled | Main Google login then Admin login | stays logged in | logged in |
| T13 | both logged in | Admin protected Function call | unaffected | authorized as Admin |
| T14 | both logged in | Main normal Appwrite call | authorized as Main user | unaffected |

For every T02–T09, inspect Network requests and confirm correct API hostname.
