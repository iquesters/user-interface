# Track B — Backend generic entity security regression contract

No React/React Native UI, navigation, auth manager or B05 screen is implemented here. This companion change updates PHP backend tests for the shared Foundation policy: ordinary users cannot turn global entity grants into unscoped tenant administration, and raw users mutations cannot bypass the controlled password/revocation unit of work. Authorized platform operations on other registered entities keep their tests. Test users declare the existing active account state explicitly; the new test-only fixture does not alter deployed migrations.

## Validation

29 focused backend entity/route tests pass (128 assertions). Six optional User Management configuration/view failures reproduce on the untouched UI + Foundation baseline in the combined audit harness; detailed evidence is in Util. No frontend production source changed.

## Review and release gates

This branch is for review only. [Architecture and API contract](https://github.com/iquesters/chatbot-util/blob/feature/knorai-rbac-account-management/docs/security/TRACK_B_SECURITY_FOUNDATION.md), [complete source inventory](https://github.com/iquesters/chatbot-util/blob/feature/knorai-rbac-account-management/docs/security/LARAVEL_MIGRATION_INVENTORY.md), and [test evidence](https://github.com/iquesters/chatbot-util/blob/feature/knorai-rbac-account-management/docs/security/TEST_EVIDENCE.md).

Track C (chatbot-util #137) owns additive schema/revision IDs. No new Alembic head, historical SQL edit, live migration, production role grant, merge or deployment is included. Coordinate schema verification, tenant assignments, all Util caller service credentials and the host dependency lock before release. Do not merge schema-dependent changes before the reviewed C contract is agreed. PHP remains transitional; final backend parity moves to Python.
