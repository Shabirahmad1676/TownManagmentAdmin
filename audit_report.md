# Audit Report: Gap Analysis & Security Review

## 1. The Approval Loop (Superadmin)
*   **Back-End (Logic):** ✅ **PASS**
    *   The database function `approve_purchase` exists and correctly handles:
        *   Marking plot as 'Sold'.
        *   Assigning owner.
        *   Generating 6 or 12 installment rows.
*   **Front-End (UI):** ❌ **FAIL**
    *   `src/app/dashboard/requests/page.tsx` lists the requests but **misses the "Approve" button**.
    *   There is no connection to the `approve_purchase` RPC function.
    *   **Risk**: Superadmins cannot actually approve requests from the Dashboard.

## 2. The Manager Role (Restricted Access)
*   **Sidebar Visibility:** ⚠️ **WARNING**
    *   Current Logic: Managers **CAN** see "Users" and "Plot Requests".
    *   Requirement: "I SHOULD NOT see Approvals or Users".
    *   **Fix**: Update `src/lib/auth-types.ts` to remove 'manager' from these items.
*   **Database Security (RLS):** ✅ **PASS**
    *   Managers have `INSERT` and `UPDATE` policies on `plots`.
    *   There is **NO DELETE policy** for Managers, so they cannot delete plots (Secure).
*   **URL Protection:** ⚠️ **WARNING**
    *   `middleware.ts` only checks if a user is logged in. It does not block a Manager from manually typing `/dashboard/settings`.

## 3. The Accountant Role (Financials)
*   **Visibility:** ✅ **PASS**
    *   Accountants can see the Installments page.
*   **Actionability:** ❌ **FAIL**
    *   `src/app/dashboard/installments/page.tsx` displays data but **has no "Mark as Paid" button**.
    *   Accountants cannot perform their verified job function.

## Summary of Missing Features
1.  **"Approve" Button** on Requests Page (Needs to call `approve_purchase`).
2.  **"Mark Paid" Button** on Installments Page.
3.  **Strict Sidebar Rules**: Remove "Users" and "Requests" for Managers.

## Action Plan
1.  **Run SQL**: Execute `e:/Town/supabase/setup_test_users.sql` to create test accounts.
2.  **Fix Sidebar**: Edit `auth-types.ts`.
3.  **Implement Approval**: Add button and Server Action for approvals.
4.  **Implement Payment**: Add button and Server Action for payments.
