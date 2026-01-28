
# TestSprite AI Testing Report(MCP)

---

## 1️⃣ Document Metadata
- **Project Name:** clasedesurf.com
- **Date:** 2026-01-27
- **Prepared by:** TestSprite AI Team

---

## 2️⃣ Requirement Validation Summary

#### Test TC001 User Registration with JWT Token Issuance
- **Test Code:** [TC001_User_Registration_with_JWT_Token_Issuance.py](./TC001_User_Registration_with_JWT_Token_Issuance.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/97f2cf4a-5280-4ddf-8405-feaec9f49c19/a75cc080-f712-40d6-950e-bb41a150555b
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC002 User Login with JWT Token Refresh Flow
- **Test Code:** [TC002_User_Login_with_JWT_Token_Refresh_Flow.py](./TC002_User_Login_with_JWT_Token_Refresh_Flow.py)
- **Test Error:** Login with provided credentials failed due to invalid credentials error. Cannot proceed with login and JWT token refresh testing. Please verify credentials or fix authentication issue before retrying.
Browser Console Logs:
[WARNING] Image with src "/uploads/classes/mancora-1.jpg" was detected as the Largest Contentful Paint (LCP). Please add the "priority" property if this image is above the fold.
Read more: https://nextjs.org/docs/api-reference/next/image#priority (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/shared/lib/utils/warn-once.js:15:20)
[WARNING] Detected `scroll-behavior: smooth` on the `<html>` element. In a future version, Next.js will no longer automatically disable smooth scrolling during route transitions. To prepare for this change, add `data-scroll-behavior="smooth"` to your <html> element. Learn more: https://nextjs.org/docs/messages/missing-data-scroll-behavior (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/shared/lib/utils/warn-once.js:15:20)
[ERROR] Failed to load resource: the server responded with a status of 401 (Unauthorized) (at http://localhost:3000/api/auth/callback/credentials:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/97f2cf4a-5280-4ddf-8405-feaec9f49c19/56a78a8b-94ae-451a-8509-396554f2d3df
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC003 Guest Checkout Account Creation and Notification
- **Test Code:** [TC003_Guest_Checkout_Account_Creation_and_Notification.py](./TC003_Guest_Checkout_Account_Creation_and_Notification.py)
- **Test Error:** The guest checkout flow reached the booking form modal where user details including full name, email, age, and participants can be entered. The participant count is preselected to 1. The email input field is visible and ready for input. However, the booking has not been completed yet, so the creation of a new user with generated credentials, sending of welcome email, and returning of an authentication token could not be fully verified. Further steps would require filling the form with an unused email, submitting the booking, and verifying backend responses. Task is not fully finished.
Browser Console Logs:
[WARNING] Image with src "/uploads/classes/mancora-1.jpg" was detected as the Largest Contentful Paint (LCP). Please add the "priority" property if this image is above the fold.
Read more: https://nextjs.org/docs/api-reference/next/image#priority (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/shared/lib/utils/warn-once.js:15:20)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/97f2cf4a-5280-4ddf-8405-feaec9f49c19/39969f7b-7740-4b7b-b958-be74519d0fca
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC004 Guest Checkout with Existing Email Error
- **Test Code:** [TC004_Guest_Checkout_with_Existing_Email_Error.py](./TC004_Guest_Checkout_with_Existing_Email_Error.py)
- **Test Error:** Tested guest checkout flow on /classes/3 with an existing registered email admin@test.com. The form was submitted successfully through all steps without any error message indicating the email already exists. This indicates the system does not properly handle or display errors for guest checkout attempts using an existing user email. The expected error response for duplicate email was not returned.
Browser Console Logs:
[WARNING] Image with src "/uploads/classes/mancora-1.jpg" was detected as the Largest Contentful Paint (LCP). Please add the "priority" property if this image is above the fold.
Read more: https://nextjs.org/docs/api-reference/next/image#priority (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/shared/lib/utils/warn-once.js:15:20)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/97f2cf4a-5280-4ddf-8405-feaec9f49c19/81876f5a-0e40-4168-ab51-d6097ee3f717
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC005 Class Browsing and Detailed Session Selection
- **Test Code:** [TC005_Class_Browsing_and_Detailed_Session_Selection.py](./TC005_Class_Browsing_and_Detailed_Session_Selection.py)
- **Test Error:** Tested browsing classes and selecting sessions with accurate details including dates and times. Attempted guest checkout flow by filling participant details and experience customization forms. Encountered a blocking issue where the booking process does not proceed beyond the 'Personaliza tu experiencia' step after clicking 'Siguiente'. Reservation as guest could not be completed. Reporting this issue and stopping further testing.
Browser Console Logs:
[WARNING] Image with src "/uploads/classes/mancora-1.jpg" was detected as the Largest Contentful Paint (LCP). Please add the "priority" property if this image is above the fold.
Read more: https://nextjs.org/docs/api-reference/next/image#priority (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/shared/lib/utils/warn-once.js:15:20)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/97f2cf4a-5280-4ddf-8405-feaec9f49c19/29cd82ec-9f5d-43ee-abc0-c3c2ef6f0975
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC006 Multi-step Booking Flow with Participant Management
- **Test Code:** [TC006_Multi_step_Booking_Flow_with_Participant_Management.py](./TC006_Multi_step_Booking_Flow_with_Participant_Management.py)
- **Test Error:** Tested the booking modal workflow up to the 'Personaliza tu experiencia' step. Participant details and experience customization were entered successfully. However, the booking modal did not proceed to the next step after clicking 'Siguiente', indicating a blocking issue. Stopping further testing until this is resolved.
Browser Console Logs:
[WARNING] Image with src "/uploads/classes/mancora-1.jpg" was detected as the Largest Contentful Paint (LCP). Please add the "priority" property if this image is above the fold.
Read more: https://nextjs.org/docs/api-reference/next/image#priority (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/shared/lib/utils/warn-once.js:15:20)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/97f2cf4a-5280-4ddf-8405-feaec9f49c19/e3075c23-bbda-482d-bab0-d44b5c085e6c
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC007 Booking State Preservation Across Navigation
- **Test Code:** [TC007_Booking_State_Preservation_Across_Navigation.py](./TC007_Booking_State_Preservation_Across_Navigation.py)
- **Test Error:** Booking form validation errors prevent completing the booking process. 'Nombre completo' and 'Edad' fields show errors despite valid inputs, and email field is highlighted in red. Cannot proceed to verify booking data preservation after login or complete reservation. Stopping test.
Browser Console Logs:
[WARNING] Image with src "/uploads/classes/mancora-1.jpg" was detected as the Largest Contentful Paint (LCP). Please add the "priority" property if this image is above the fold.
Read more: https://nextjs.org/docs/api-reference/next/image#priority (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/shared/lib/utils/warn-once.js:15:20)
[WARNING] %c%s%c  [33m[1m⚠[22m[39m metadataBase property in metadata export is not set for resolving social open graph or twitter images, using "http://localhost:3000". See https://nextjs.org/docs/app/api-reference/functions/generate-metadata#metadatabase background: #e6e6e6;background: light-dark(rgba(0,0,0,0.1), rgba(255,255,255,0.25));color: #000000;color: light-dark(#000000, #ffffff);border-radius: 2px  Server   (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-server-dom-webpack/cjs/react-server-dom-webpack-client.browser.development.js:3465:21)
[WARNING] Detected `scroll-behavior: smooth` on the `<html>` element. In a future version, Next.js will no longer automatically disable smooth scrolling during route transitions. To prepare for this change, add `data-scroll-behavior="smooth"` to your <html> element. Learn more: https://nextjs.org/docs/messages/missing-data-scroll-behavior (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/shared/lib/utils/warn-once.js:15:20)
[ERROR] Failed to load resource: the server responded with a status of 404 (Not Found) (at http://localhost:3000/uploads/classes/surf-class-3.jpg:0:0)
[ERROR] Failed to load resource: the server responded with a status of 404 () (at https://images.unsplash.com/photo-1518774786638-7f551c96a77d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80:0:0)
[ERROR] Failed to load resource: the server responded with a status of 404 () (at https://images.unsplash.com/photo-1544473344-f8644e5902bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80:0:0)
[ERROR] Failed to load resource: the server responded with a status of 404 () (at https://images.unsplash.com/photo-1481190566236-40742a785e05?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80:0:0)
[ERROR] Failed to load resource: the server responded with a status of 404 () (at https://images.unsplash.com/photo-1416331108676-a22edb5be43c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80:0:0)
[ERROR] Failed to load resource: the server responded with a status of 404 () (at https://images.unsplash.com/photo-1522055620701-081699709db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80:0:0)
[ERROR] Failed to load resource: the server responded with a status of 404 () (at https://images.unsplash.com/photo-1505566089201-72f3e8f5223c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80:0:0)
[ERROR] Failed to load resource: the server responded with a status of 404 (Not Found) (at http://localhost:3000/api/schools/reviews/featured:0:0)
[ERROR] Failed to load resource: the server responded with a status of 404 (Not Found) (at http://localhost:3000/api/schools/reviews/featured:0:0)
[ERROR] Failed to load resource: the server responded with a status of 404 (Not Found) (at http://localhost:3000/uploads/classes/surf-class-3.jpg:0:0)
[ERROR] Failed to load resource: the server responded with a status of 404 (Not Found) (at http://localhost:3000/uploads/classes/surf-class-3.jpg:0:0)
[ERROR] Failed to load resource: the server responded with a status of 404 (Not Found) (at http://localhost:3000/uploads/classes/surf-class-3.jpg:0:0)
[WARNING] %c%s%c  [33m[1m⚠[22m[39m metadataBase property in metadata export is not set for resolving social open graph or twitter images, using "http://localhost:3000". See https://nextjs.org/docs/app/api-reference/functions/generate-metadata#metadatabase background: #e6e6e6;background: light-dark(rgba(0,0,0,0.1), rgba(255,255,255,0.25));color: #000000;color: light-dark(#000000, #ffffff);border-radius: 2px  Server   (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-server-dom-webpack/cjs/react-server-dom-webpack-client.browser.development.js:3465:21)
[ERROR] Failed to load resource: the server responded with a status of 404 () (at https://images.unsplash.com/photo-1518774786638-7f551c96a77d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80:0:0)
[ERROR] Failed to load resource: the server responded with a status of 404 () (at https://images.unsplash.com/photo-1544473344-f8644e5902bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80:0:0)
[ERROR] Failed to load resource: the server responded with a status of 404 () (at https://images.unsplash.com/photo-1505566089201-72f3e8f5223c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80:0:0)
[ERROR] Failed to load resource: the server responded with a status of 404 () (at https://images.unsplash.com/photo-1522055620701-081699709db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/97f2cf4a-5280-4ddf-8405-feaec9f49c19/eb63410b-41de-48eb-9648-c9e449db5a01
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC008 Reservation Management - Create, Update and Cancel
- **Test Code:** [TC008_Reservation_Management___Create_Update_and_Cancel.py](./TC008_Reservation_Management___Create_Update_and_Cancel.py)
- **Test Error:** Reservation creation failed due to persistent validation error on the 'Edad' field in the confirmation form. Unable to finalize reservation as guest. Reporting the issue and stopping further testing.
Browser Console Logs:
[WARNING] Image with src "/uploads/classes/mancora-1.jpg" was detected as the Largest Contentful Paint (LCP). Please add the "priority" property if this image is above the fold.
Read more: https://nextjs.org/docs/api-reference/next/image#priority (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/shared/lib/utils/warn-once.js:15:20)
[WARNING] Detected `scroll-behavior: smooth` on the `<html>` element. In a future version, Next.js will no longer automatically disable smooth scrolling during route transitions. To prepare for this change, add `data-scroll-behavior="smooth"` to your <html> element. Learn more: https://nextjs.org/docs/messages/missing-data-scroll-behavior (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/shared/lib/utils/warn-once.js:15:20)
[WARNING] Image with src "http://localhost:3000/uploads/classes/mancora-1.jpg" has "fill" and parent element with invalid "position". Provided "static" should be one of absolute,fixed,relative. (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/shared/lib/utils/warn-once.js:15:20)
[ERROR] Failed to load resource: the server responded with a status of 400 (Bad Request) (at http://localhost:3000/api/reservations:0:0)
[ERROR] Error: Guest details required (name and email)
    at handleCreateReservation (webpack-internal:///(app-pages-browser)/./src/app/reservations/confirmation/page.tsx:286:23) (at :66:34)
[ERROR] Failed to load resource: the server responded with a status of 400 (Bad Request) (at http://localhost:3000/api/reservations:0:0)
[ERROR] Error: Guest details required (name and email)
    at handleCreateReservation (webpack-internal:///(app-pages-browser)/./src/app/reservations/confirmation/page.tsx:286:23) (at :66:34)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/97f2cf4a-5280-4ddf-8405-feaec9f49c19/a177ac56-6a09-4bf1-ab28-ac2bb1d20413
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC009 Payment Voucher Upload and Admin Verification
- **Test Code:** [TC009_Payment_Voucher_Upload_and_Admin_Verification.py](./TC009_Payment_Voucher_Upload_and_Admin_Verification.py)
- **Test Error:** Reported the issue with the reservation form stuck on 'Detalles' section. Further testing cannot proceed until this is fixed. Stopping the test here.
Browser Console Logs:
[WARNING] Image with src "/uploads/classes/mancora-1.jpg" was detected as the Largest Contentful Paint (LCP). Please add the "priority" property if this image is above the fold.
Read more: https://nextjs.org/docs/api-reference/next/image#priority (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/shared/lib/utils/warn-once.js:15:20)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/97f2cf4a-5280-4ddf-8405-feaec9f49c19/40453b69-784d-4a78-a970-4f43d6dea14b
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC010 Application of Discount Codes During Payment
- **Test Code:** [TC010_Application_of_Discount_Codes_During_Payment.py](./TC010_Application_of_Discount_Codes_During_Payment.py)
- **Test Error:** Stopped testing because the booking modal required for guest checkout does not open after clicking 'Reservar ahora' button on the class page. This blocks further testing of discount code application during payment. Please fix the modal issue to continue testing.
Browser Console Logs:
[WARNING] Image with src "/uploads/classes/mancora-1.jpg" was detected as the Largest Contentful Paint (LCP). Please add the "priority" property if this image is above the fold.
Read more: https://nextjs.org/docs/api-reference/next/image#priority (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/shared/lib/utils/warn-once.js:15:20)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/97f2cf4a-5280-4ddf-8405-feaec9f49c19/80e07bd3-02ff-431c-89dd-f4fe65876caa
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC011 Role-based Access Control in Dashboards
- **Test Code:** [TC011_Role_based_Access_Control_in_Dashboards.py](./TC011_Role_based_Access_Control_in_Dashboards.py)
- **Test Error:** All login attempts for student, instructor, school admin, and super admin roles failed due to invalid credentials. Google OAuth login also failed due to redirect URI mismatch. Unable to verify role-based access controls. Guest checkout flow was tested but reservation form submission is stuck and does not complete. Recommend fixing login credentials and reservation form submission issues.
Browser Console Logs:
[WARNING] Image with src "/uploads/classes/mancora-1.jpg" was detected as the Largest Contentful Paint (LCP). Please add the "priority" property if this image is above the fold.
Read more: https://nextjs.org/docs/api-reference/next/image#priority (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/shared/lib/utils/warn-once.js:15:20)
[WARNING] Detected `scroll-behavior: smooth` on the `<html>` element. In a future version, Next.js will no longer automatically disable smooth scrolling during route transitions. To prepare for this change, add `data-scroll-behavior="smooth"` to your <html> element. Learn more: https://nextjs.org/docs/messages/missing-data-scroll-behavior (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/shared/lib/utils/warn-once.js:15:20)
[ERROR] Failed to load resource: the server responded with a status of 401 (Unauthorized) (at http://localhost:3000/api/auth/callback/credentials:0:0)
[ERROR] Failed to load resource: the server responded with a status of 401 (Unauthorized) (at http://localhost:3000/api/auth/callback/credentials:0:0)
[ERROR] Failed to load resource: the server responded with a status of 401 (Unauthorized) (at http://localhost:3000/api/auth/callback/credentials:0:0)
[ERROR] Failed to load resource: the server responded with a status of 401 (Unauthorized) (at http://localhost:3000/api/auth/callback/credentials:0:0)
[ERROR] Failed to load resource: the server responded with a status of 401 (Unauthorized) (at http://localhost:3000/api/auth/callback/credentials:0:0)
[WARNING] Image with src "/uploads/classes/mancora-1.jpg" was detected as the Largest Contentful Paint (LCP). Please add the "priority" property if this image is above the fold.
Read more: https://nextjs.org/docs/api-reference/next/image#priority (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/shared/lib/utils/warn-once.js:15:20)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/97f2cf4a-5280-4ddf-8405-feaec9f49c19/13707062-e647-4071-84f9-2f3371cc298e
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC012 Multi-tenant Data Isolation Verification
- **Test Code:** [TC012_Multi_tenant_Data_Isolation_Verification.py](./TC012_Multi_tenant_Data_Isolation_Verification.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/97f2cf4a-5280-4ddf-8405-feaec9f49c19/34e7db75-622b-4b36-816e-a6ce43beff16
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC013 Email Notifications Triggered on Key User Actions
- **Test Code:** [TC013_Email_Notifications_Triggered_on_Key_User_Actions.py](./TC013_Email_Notifications_Triggered_on_Key_User_Actions.py)
- **Test Error:** Reservation creation failed during guest checkout flow on /classes/3. The page does not proceed after selecting participants and clicking 'Reservar ahora'. Cannot continue testing email notifications until this issue is resolved.
Browser Console Logs:
[WARNING] Image with src "/uploads/classes/mancora-1.jpg" was detected as the Largest Contentful Paint (LCP). Please add the "priority" property if this image is above the fold.
Read more: https://nextjs.org/docs/api-reference/next/image#priority (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/shared/lib/utils/warn-once.js:15:20)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/97f2cf4a-5280-4ddf-8405-feaec9f49c19/58961e64-c2b5-4ebe-8b0f-bbcdd29bfc78
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC014 In-App Real-Time Notifications Functionality
- **Test Code:** [TC014_In_App_Real_Time_Notifications_Functionality.py](./TC014_In_App_Real_Time_Notifications_Functionality.py)
- **Test Error:** Testing stopped due to reservation form progression issue blocking completion of guest checkout flow and notification verification. Issue reported for developer investigation.
Browser Console Logs:
[WARNING] Image with src "/uploads/classes/mancora-1.jpg" was detected as the Largest Contentful Paint (LCP). Please add the "priority" property if this image is above the fold.
Read more: https://nextjs.org/docs/api-reference/next/image#priority (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/shared/lib/utils/warn-once.js:15:20)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/97f2cf4a-5280-4ddf-8405-feaec9f49c19/789feeeb-2d24-4374-9e01-1ad16d7c9be2
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC015 Admin Management of Classes, Instructors, and Users
- **Test Code:** [TC015_Admin_Management_of_Classes_Instructors_and_Users.py](./TC015_Admin_Management_of_Classes_Instructors_and_Users.py)
- **Test Error:** Stopped testing due to booking modal not opening on class detail page, blocking guest checkout flow. Issue reported for developer investigation.
Browser Console Logs:
[WARNING] Image with src "/uploads/classes/mancora-1.jpg" was detected as the Largest Contentful Paint (LCP). Please add the "priority" property if this image is above the fold.
Read more: https://nextjs.org/docs/api-reference/next/image#priority (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/shared/lib/utils/warn-once.js:15:20)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/97f2cf4a-5280-4ddf-8405-feaec9f49c19/799062e8-817b-4151-94a1-5aacc6909c4f
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC016 Product and Beach/Location Management
- **Test Code:** [TC016_Product_and_BeachLocation_Management.py](./TC016_Product_and_BeachLocation_Management.py)
- **Test Error:** The booking form on the surf class page is stuck on the 'Personaliza tu experiencia' step and does not proceed after clicking the 'Siguiente' button. This blocks the guest checkout flow and prevents completing the reservation. Further testing cannot continue until this issue is resolved.
Browser Console Logs:
[WARNING] Image with src "/uploads/classes/mancora-1.jpg" was detected as the Largest Contentful Paint (LCP). Please add the "priority" property if this image is above the fold.
Read more: https://nextjs.org/docs/api-reference/next/image#priority (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/shared/lib/utils/warn-once.js:15:20)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/97f2cf4a-5280-4ddf-8405-feaec9f49c19/f61dfa0b-bc5a-4bac-8762-8c9f18070c99
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC017 Image Upload with Cloudinary and Fallback
- **Test Code:** [TC017_Image_Upload_with_Cloudinary_and_Fallback.py](./TC017_Image_Upload_with_Cloudinary_and_Fallback.py)
- **Test Error:** The guest checkout flow could not be completed because the 'Reservar ahora' button is not reliably clickable. This blocks further testing of image upload to Cloudinary and fallback handling. Please fix the UI issue to enable reliable automation of the booking process.
Browser Console Logs:
[WARNING] Image with src "/uploads/classes/mancora-1.jpg" was detected as the Largest Contentful Paint (LCP). Please add the "priority" property if this image is above the fold.
Read more: https://nextjs.org/docs/api-reference/next/image#priority (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/shared/lib/utils/warn-once.js:15:20)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/97f2cf4a-5280-4ddf-8405-feaec9f49c19/e64a97f0-0cac-4571-8380-6045addfed87
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC018 Statistics Dashboard Data Accuracy
- **Test Code:** [TC018_Statistics_Dashboard_Data_Accuracy.py](./TC018_Statistics_Dashboard_Data_Accuracy.py)
- **Test Error:** Guest checkout flow testing completed up to the reservation confirmation step. The process is blocked by a persistent validation error on the age input field that prevents finalizing the reservation. Height and weight fields are valid but the form does not proceed. This issue should be reported to the development team for resolution.
Browser Console Logs:
[WARNING] Image with src "/uploads/classes/mancora-1.jpg" was detected as the Largest Contentful Paint (LCP). Please add the "priority" property if this image is above the fold.
Read more: https://nextjs.org/docs/api-reference/next/image#priority (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/shared/lib/utils/warn-once.js:15:20)
[WARNING] Detected `scroll-behavior: smooth` on the `<html>` element. In a future version, Next.js will no longer automatically disable smooth scrolling during route transitions. To prepare for this change, add `data-scroll-behavior="smooth"` to your <html> element. Learn more: https://nextjs.org/docs/messages/missing-data-scroll-behavior (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/shared/lib/utils/warn-once.js:15:20)
[WARNING] Image with src "http://localhost:3000/uploads/classes/mancora-1.jpg" has "fill" and parent element with invalid "position". Provided "static" should be one of absolute,fixed,relative. (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/shared/lib/utils/warn-once.js:15:20)
[ERROR] Failed to load resource: the server responded with a status of 500 (Internal Server Error) (at http://localhost:3000/api/reservations:0:0)
[ERROR] Error: Internal server error
    at handleCreateReservation (webpack-internal:///(app-pages-browser)/./src/app/reservations/confirmation/page.tsx:286:23) (at :66:34)
[ERROR] Failed to load resource: the server responded with a status of 500 (Internal Server Error) (at http://localhost:3000/api/reservations:0:0)
[ERROR] Error: Internal server error
    at handleCreateReservation (webpack-internal:///(app-pages-browser)/./src/app/reservations/confirmation/page.tsx:286:23) (at :66:34)
[ERROR] Failed to load resource: the server responded with a status of 400 (Bad Request) (at http://localhost:3000/api/reservations:0:0)
[ERROR] Error: Guest details required (name and email)
    at handleCreateReservation (webpack-internal:///(app-pages-browser)/./src/app/reservations/confirmation/page.tsx:286:23) (at :66:34)
[ERROR] Failed to load resource: the server responded with a status of 400 (Bad Request) (at http://localhost:3000/api/reservations:0:0)
[ERROR] Error: Guest details required (name and email)
    at handleCreateReservation (webpack-internal:///(app-pages-browser)/./src/app/reservations/confirmation/page.tsx:286:23) (at :66:34)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/97f2cf4a-5280-4ddf-8405-feaec9f49c19/e52ba816-7ed4-43f2-92d1-cb55bda07f3f
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC019 Reservation Cancellation Email and Notification
- **Test Code:** [TC019_Reservation_Cancellation_Email_and_Notification.py](./TC019_Reservation_Cancellation_Email_and_Notification.py)
- **Test Error:** Reported the issue with participant details form input fields blocking guest checkout flow. Cannot proceed with reservation creation as guest. Stopping further testing on this path.
Browser Console Logs:
[WARNING] Image with src "/uploads/classes/mancora-1.jpg" was detected as the Largest Contentful Paint (LCP). Please add the "priority" property if this image is above the fold.
Read more: https://nextjs.org/docs/api-reference/next/image#priority (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/shared/lib/utils/warn-once.js:15:20)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/97f2cf4a-5280-4ddf-8405-feaec9f49c19/abf6f5f9-17d2-467a-9649-fa1c4d1a39df
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---


## 3️⃣ Coverage & Matching Metrics

- **10.53** of tests passed

| Requirement        | Total Tests | ✅ Passed | ❌ Failed  |
|--------------------|-------------|-----------|------------|
| ...                | ...         | ...       | ...        |
---


## 4️⃣ Key Gaps / Risks
{AI_GNERATED_KET_GAPS_AND_RISKS}
---