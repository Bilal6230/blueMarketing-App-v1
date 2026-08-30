# Prototype Screens

## Login foundation

Route:

- `/(auth)/login`

Behaviour:

- Premium layout is visible
- Sign-in button is disabled
- Inline copy states authentication is not connected
- No external placeholder links are opened

## Login preview

Route:

- `/(preview)/login`

Behaviour:

- Button may show loading
- Loading resolves to visible "no request sent" copy
- No credentials are stored

## Staff and admin homes

Routes:

- `/(preview)/staff-home`
- `/(preview)/admin-home`

Behaviour:

- Both use `AppTabScaffold`
- Staff emphasizes current actions and lead activity
- Admin emphasizes metrics and portfolio attention areas
- Prototype-only actions surface inline notices

## CRM and attendance

Routes:

- `/(preview)/crm`
- `/(preview)/lead-detail`
- `/(preview)/attendance`

Behaviour:

- CRM supports explicit UI review states: loaded, loading, empty, filtered empty, offline, and error
- Lead detail uses a back action instead of bottom navigation
- Attendance prevents incorrect second check-in from the checked-out state
