# Admin Dashboard Testing Guide

Follow this step-by-step guide to verify that your Admin Dashboard is working correctly for all roles.

## Prerequisite: User Setup
Ensure you have created these 3 users in **Supabase Auth** and run the `setup_test_users.sql` script:
1.  `superadmin@stms.com` (Role: Superadmin)
2.  `manager@stms.com` (Role: Manager)
3.  `accountant@stms.com` (Role: Accountant)

---

## Test Scenario 1: Superadmin (Full Access)
**Goal:** Verify full control over the system.

1.  **Login**: Go to [/login](http://localhost:3000/login) and sign in as `superadmin@stms.com`.
2.  **Dashboard**: You should see the **Stats Overview** (Total Plots, Sold, etc.).
3.  **Plots**:
    *   Navigate to **Properties / Plots**.
    *   Click **"Add Plot"**.
    *   Create a plot (e.g., `Town: Downtown`, `No: Z-900`, `Size: 5`, `Price: 1000000`).
    *   **Verify**: The plot appears in the list as "Available".
4.  **Approvals**:
    *   Navigate to **Plot Requests**.
    *   If there is a Pending request, click the ✅ **Approve Button**.
    *   **Verify**: The status changes to "Approved".
5.  **Users**: Navigate to **Users**. You should see the list of all users.

---

## Test Scenario 2: Manager (Restricted Access)
**Goal:** Verify verified restrictions (No Approvals, No Users page).

1.  **Logout** and Sign in as `manager@stms.com`.
2.  **Sidebar Check**:
    *   ✅ Should see: **Overview**, **Properties / Plots**.
    *   ❌ Should **NOT** see: **Users**, **Plot Requests**, **Installments**, **Transfer**.
3.  **Plots**:
    *   Navigate to **Properties / Plots**.
    *   You **SHOULD** see the "Add Plot" button (Managers can add inventory).
4.  **Security Check**:
    *   Try manually typing in the URL: `http://localhost:3000/dashboard/users`.
    *   **Result**: You should be redirected or shown 404/Empty (depending on Middleware strictness).

---

## Test Scenario 3: Accountant (Financials)
**Goal:** Verify verified financial actions.

1.  **Logout** and Sign in as `accountant@stms.com`.
2.  **Sidebar Check**:
    *   ✅ Should see: **Overview**, **Installments**.
3.  **Installments**:
    *   Navigate to **Installments**.
    *   Find a "Pending" or "Overdue" installment.
    *   Click the **"Mark Paid"** button.
    *   **Verify**: The status changes to **"Paid"** and button disappears/changes.

---

---

## Test Scenario 4: The Full Cycle (Mobile + Admin)
**Goal:** Verify the complete business flow.

1.  **Mobile App (Client)**:
    *   Login as a Client (or Sign up).
    *   Tap **"Browse"** -> Select a Plot -> Tap **"Buy Now"**.
    *   Choose **"Installments (12 months)"** -> Confirm.
    *   **Result**: You see a success message "Request sent".

2.  **Web Dashboard (Superadmin)**:
    *   Login as `superadmin@stms.com`.
    *   Go to **Plot Requests**.
    *   You should see the new request from the client.
    *   Click ✅ **Approve**.

3.  **Web Dashboard (Accountant)**:
    *   Login as `accountant@stms.com`.
    *   Go to **Installments**.
    *   You will see 12 generated installment rows for that plot.
    *   Click **"Mark Paid"** on the first one.

4.  **Mobile App (Client)**:
    *   Go to **"My Dashboard"**.
    *   You should now see the Plot listed under "My Plots".
    *   The "Paid Amount" progress bar should have moved up.
    *   The first installment should show as "Paid".

---

## Troubleshooting
*   **Login Failed?** Run `e:/Town/supabase/setup_test_users.sql` again to reset roles.
*   **"Row Level Security" Error?** Run `e:/Town/supabase/fix_rls.sql` to ensure users can read their own profiles.
